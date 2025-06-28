
-- Create storage bucket for kitchen images
INSERT INTO storage.buckets (id, name, public)
VALUES ('kitchen-images', 'kitchen-images', true);

-- Create storage policies for kitchen images
CREATE POLICY "Anyone can view kitchen images" ON storage.objects
FOR SELECT USING (bucket_id = 'kitchen-images');

CREATE POLICY "Authenticated users can upload kitchen images" ON storage.objects
FOR INSERT WITH CHECK (bucket_id = 'kitchen-images' AND auth.role() = 'authenticated');

CREATE POLICY "Users can update their own kitchen images" ON storage.objects
FOR UPDATE USING (bucket_id = 'kitchen-images' AND auth.role() = 'authenticated');

CREATE POLICY "Users can delete their own kitchen images" ON storage.objects
FOR DELETE USING (bucket_id = 'kitchen-images' AND auth.role() = 'authenticated');

-- Add image columns to kitchen_projects table
ALTER TABLE public.kitchen_projects 
ADD COLUMN existing_kitchen_images text[] DEFAULT '{}',
ADD COLUMN reference_images text[] DEFAULT '{}';

-- Create a table for project assignments
CREATE TABLE public.kitchen_project_assignments (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  project_id UUID REFERENCES public.kitchen_projects(id) ON DELETE CASCADE,
  phase_id UUID REFERENCES public.kitchen_project_phases(id) ON DELETE CASCADE,
  assigned_to UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  assigned_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  assigned_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Enable RLS on assignments table
ALTER TABLE public.kitchen_project_assignments ENABLE ROW LEVEL SECURITY;

-- Create policies for assignments
CREATE POLICY "Users can view assignments based on role" ON public.kitchen_project_assignments
FOR SELECT TO authenticated USING (
  public.has_role(auth.uid(), 'owner') OR 
  public.has_role(auth.uid(), 'designer') OR
  assigned_to = auth.uid() OR
  assigned_by = auth.uid()
);

CREATE POLICY "Owners and designers can create assignments" ON public.kitchen_project_assignments
FOR INSERT TO authenticated WITH CHECK (
  public.has_role(auth.uid(), 'owner') OR 
  public.has_role(auth.uid(), 'designer')
);

CREATE POLICY "Owners and designers can update assignments" ON public.kitchen_project_assignments
FOR UPDATE TO authenticated USING (
  public.has_role(auth.uid(), 'owner') OR 
  public.has_role(auth.uid(), 'designer')
);

-- Update kitchen_project_phases to support assignments
ALTER TABLE public.kitchen_project_phases 
ADD COLUMN assigned_to UUID REFERENCES auth.users(id) ON DELETE SET NULL,
ADD COLUMN assigned_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
ADD COLUMN assigned_at TIMESTAMP WITH TIME ZONE;

-- Fix the task assignment in kitchen_project_tasks to ensure it works properly
ALTER TABLE public.kitchen_project_tasks 
ADD COLUMN assigned_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
ADD COLUMN assigned_at TIMESTAMP WITH TIME ZONE;
