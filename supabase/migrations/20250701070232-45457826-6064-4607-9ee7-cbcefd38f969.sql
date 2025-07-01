
-- Second migration: Add remaining enum values
ALTER TYPE public.user_role ADD VALUE IF NOT EXISTS 'factory';
ALTER TYPE public.user_role ADD VALUE IF NOT EXISTS 'installer';
ALTER TYPE public.user_role ADD VALUE IF NOT EXISTS 'sales';

-- Create a team_members table for better team management
CREATE TABLE IF NOT EXISTS public.team_members (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  added_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  department TEXT,
  phone TEXT,
  status TEXT DEFAULT 'active',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Enable RLS on team_members
ALTER TABLE public.team_members ENABLE ROW LEVEL SECURITY;

-- Create policies for team_members
CREATE POLICY "Owners and managers can view all team members" ON public.team_members
  FOR SELECT TO authenticated USING (
    public.has_role(auth.uid(), 'owner') OR 
    public.has_role(auth.uid(), 'manager')
  );

CREATE POLICY "Owners and managers can manage team members" ON public.team_members
  FOR ALL TO authenticated USING (
    public.has_role(auth.uid(), 'owner') OR 
    public.has_role(auth.uid(), 'manager')
  );

-- Create notifications table for task assignments
CREATE TABLE IF NOT EXISTS public.notifications (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  message TEXT NOT NULL,
  type TEXT DEFAULT 'task_assignment',
  project_id UUID REFERENCES public.kitchen_projects(id) ON DELETE CASCADE,
  task_id UUID REFERENCES public.kitchen_project_tasks(id) ON DELETE CASCADE,
  read BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Enable RLS on notifications
ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;

-- Create policies for notifications
CREATE POLICY "Users can view their own notifications" ON public.notifications
  FOR SELECT TO authenticated USING (auth.uid() = user_id);

CREATE POLICY "Users can update their own notifications" ON public.notifications
  FOR UPDATE TO authenticated USING (auth.uid() = user_id);
