
-- Create enum types for the kitchen project system (skip if already exists)
DO $$ BEGIN
    CREATE TYPE kitchen_shape AS ENUM ('L-shape', 'U-shape', 'Parallel', 'Island', 'Straight');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    CREATE TYPE kitchen_material AS ENUM ('Plywood', 'MDF', 'HDHMR', 'Acrylic', 'Laminate');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    CREATE TYPE budget_bracket AS ENUM ('3-5 lakhs', '5-8 lakhs', '8-10+ lakhs');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    CREATE TYPE project_status AS ENUM ('intake', 'design', 'confirmation', 'production_prep', 'factory', 'installation', 'closure');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    CREATE TYPE project_phase_name AS ENUM ('design_quotation', 'confirmation_payment', 'production_prep', 'factory_production', 'site_installation', 'closure_feedback');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

-- Create clients table for kitchen project clients
CREATE TABLE public.kitchen_clients (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  client_id TEXT UNIQUE NOT NULL,
  name TEXT NOT NULL,
  email TEXT UNIQUE NOT NULL,
  phone TEXT NOT NULL,
  address TEXT NOT NULL,
  password_hash TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create kitchen projects table
CREATE TABLE public.kitchen_projects (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  client_id UUID REFERENCES public.kitchen_clients(id) ON DELETE CASCADE,
  project_reference TEXT UNIQUE NOT NULL,
  kitchen_shape kitchen_shape NOT NULL,
  materials kitchen_material[] NOT NULL,
  budget_bracket budget_bracket NOT NULL,
  status project_status DEFAULT 'intake',
  current_phase INTEGER DEFAULT 1,
  intake_pdf_url TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create project phases table
CREATE TABLE public.kitchen_project_phases (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id UUID REFERENCES public.kitchen_projects(id) ON DELETE CASCADE,
  phase_name project_phase_name NOT NULL,
  phase_number INTEGER NOT NULL,
  status task_status DEFAULT 'todo',
  started_at TIMESTAMP WITH TIME ZONE,
  completed_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(project_id, phase_number)
);

-- Create project tasks table
CREATE TABLE public.kitchen_project_tasks (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  phase_id UUID REFERENCES public.kitchen_project_phases(id) ON DELETE CASCADE,
  task_name TEXT NOT NULL,
  status task_status DEFAULT 'todo',
  assigned_to UUID REFERENCES public.profiles(id),
  notes TEXT,
  due_date DATE,
  completed_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create project files table
CREATE TABLE public.kitchen_project_files (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id UUID REFERENCES public.kitchen_projects(id) ON DELETE CASCADE,
  task_id UUID REFERENCES public.kitchen_project_tasks(id) ON DELETE CASCADE,
  file_name TEXT NOT NULL,
  file_url TEXT NOT NULL,
  file_type TEXT NOT NULL,
  file_size INTEGER,
  uploaded_by UUID REFERENCES public.profiles(id),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable RLS on all tables
ALTER TABLE public.kitchen_clients ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.kitchen_projects ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.kitchen_project_phases ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.kitchen_project_tasks ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.kitchen_project_files ENABLE ROW LEVEL SECURITY;

-- RLS Policies for kitchen_clients
CREATE POLICY "Owners can manage all kitchen clients" ON public.kitchen_clients
  FOR ALL TO authenticated USING (public.has_role(auth.uid(), 'owner'));

CREATE POLICY "Clients can view their own data" ON public.kitchen_clients
  FOR SELECT TO authenticated USING (id = auth.uid());

CREATE POLICY "Clients can update their own data" ON public.kitchen_clients
  FOR UPDATE TO authenticated USING (id = auth.uid());

-- RLS Policies for kitchen_projects
CREATE POLICY "Owners can manage all kitchen projects" ON public.kitchen_projects
  FOR ALL TO authenticated USING (public.has_role(auth.uid(), 'owner'));

CREATE POLICY "Designers can view all kitchen projects" ON public.kitchen_projects
  FOR SELECT TO authenticated USING (
    public.has_role(auth.uid(), 'owner') OR 
    public.has_role(auth.uid(), 'designer')
  );

CREATE POLICY "Clients can view their own kitchen projects" ON public.kitchen_projects
  FOR SELECT TO authenticated USING (
    public.has_role(auth.uid(), 'owner') OR 
    public.has_role(auth.uid(), 'designer') OR
    client_id = auth.uid()
  );

-- RLS Policies for kitchen_project_phases
CREATE POLICY "Kitchen project phase access based on project access" ON public.kitchen_project_phases
  FOR ALL TO authenticated USING (
    public.has_role(auth.uid(), 'owner') OR 
    public.has_role(auth.uid(), 'designer') OR
    EXISTS (SELECT 1 FROM public.kitchen_projects WHERE id = project_id AND client_id = auth.uid())
  );

-- RLS Policies for kitchen_project_tasks
CREATE POLICY "Kitchen project task access based on project access" ON public.kitchen_project_tasks
  FOR ALL TO authenticated USING (
    public.has_role(auth.uid(), 'owner') OR 
    public.has_role(auth.uid(), 'designer') OR
    assigned_to = auth.uid() OR
    EXISTS (
      SELECT 1 FROM public.kitchen_project_phases kpp
      JOIN public.kitchen_projects kp ON kpp.project_id = kp.id
      WHERE kpp.id = phase_id AND kp.client_id = auth.uid()
    )
  );

-- RLS Policies for kitchen_project_files
CREATE POLICY "Kitchen project file access based on project access" ON public.kitchen_project_files
  FOR ALL TO authenticated USING (
    public.has_role(auth.uid(), 'owner') OR 
    public.has_role(auth.uid(), 'designer') OR
    EXISTS (SELECT 1 FROM public.kitchen_projects WHERE id = project_id AND client_id = auth.uid())
  );

-- Create storage bucket for kitchen project files
INSERT INTO storage.buckets (id, name, public) 
VALUES ('kitchen-projects', 'kitchen-projects', false)
ON CONFLICT (id) DO NOTHING;

-- Storage policies for kitchen project files
CREATE POLICY "Authenticated users can upload kitchen project files" ON storage.objects
  FOR INSERT TO authenticated WITH CHECK (bucket_id = 'kitchen-projects');

CREATE POLICY "Authenticated users can view kitchen project files" ON storage.objects
  FOR SELECT TO authenticated USING (bucket_id = 'kitchen-projects');

CREATE POLICY "Users can update kitchen project files" ON storage.objects
  FOR UPDATE TO authenticated USING (bucket_id = 'kitchen-projects');

CREATE POLICY "Users can delete kitchen project files" ON storage.objects
  FOR DELETE TO authenticated USING (bucket_id = 'kitchen-projects');

-- Function to generate unique project reference
CREATE OR REPLACE FUNCTION generate_project_reference()
RETURNS TEXT
LANGUAGE plpgsql
AS $$
DECLARE
  ref TEXT;
BEGIN
  ref := 'KIT-' || TO_CHAR(NOW(), 'YYYY') || '-' || LPAD(FLOOR(RANDOM() * 10000)::TEXT, 4, '0');
  RETURN ref;
END;
$$;

-- Function to initialize project phases when a project is created
CREATE OR REPLACE FUNCTION initialize_kitchen_project_phases()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
BEGIN
  -- Insert all 6 phases for the new project
  INSERT INTO public.kitchen_project_phases (project_id, phase_name, phase_number) VALUES
    (NEW.id, 'design_quotation', 1),
    (NEW.id, 'confirmation_payment', 2),
    (NEW.id, 'production_prep', 3),
    (NEW.id, 'factory_production', 4),
    (NEW.id, 'site_installation', 5),
    (NEW.id, 'closure_feedback', 6);
  
  RETURN NEW;
END;
$$;

-- Trigger to initialize phases when a kitchen project is created
CREATE TRIGGER initialize_kitchen_phases_trigger
  AFTER INSERT ON public.kitchen_projects
  FOR EACH ROW
  EXECUTE FUNCTION initialize_kitchen_project_phases();
