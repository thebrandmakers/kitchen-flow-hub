
-- Fix RLS policies for kitchen_clients table
DROP POLICY IF EXISTS "Authenticated users can view kitchen clients" ON public.kitchen_clients;
DROP POLICY IF EXISTS "Authenticated users can create kitchen clients" ON public.kitchen_clients;
DROP POLICY IF EXISTS "Users can update their own kitchen client data" ON public.kitchen_clients;

-- Create comprehensive policies for kitchen_clients
CREATE POLICY "Users can view kitchen clients based on role" ON public.kitchen_clients
  FOR SELECT TO authenticated USING (
    public.has_role(auth.uid(), 'owner') OR 
    public.has_role(auth.uid(), 'designer') OR
    id = auth.uid()
  );

CREATE POLICY "Authenticated users can create kitchen clients" ON public.kitchen_clients
  FOR INSERT TO authenticated WITH CHECK (true);

CREATE POLICY "Users can update kitchen clients based on role" ON public.kitchen_clients
  FOR UPDATE TO authenticated USING (
    public.has_role(auth.uid(), 'owner') OR 
    public.has_role(auth.uid(), 'designer') OR
    id = auth.uid()
  );

-- Fix RLS policies for kitchen_projects table
DROP POLICY IF EXISTS "Users can view kitchen projects they own or are assigned to" ON public.kitchen_projects;
DROP POLICY IF EXISTS "Users can create kitchen projects" ON public.kitchen_projects;
DROP POLICY IF EXISTS "Users can update kitchen projects they own" ON public.kitchen_projects;

-- Create new comprehensive policies for kitchen_projects
CREATE POLICY "Users can view kitchen projects based on role" ON public.kitchen_projects
  FOR SELECT TO authenticated USING (
    public.has_role(auth.uid(), 'owner') OR 
    public.has_role(auth.uid(), 'designer') OR
    EXISTS (
      SELECT 1 FROM public.kitchen_clients 
      WHERE kitchen_clients.id = kitchen_projects.client_id 
      AND kitchen_clients.id = auth.uid()
    )
  );

CREATE POLICY "Users can create kitchen projects based on role" ON public.kitchen_projects
  FOR INSERT TO authenticated WITH CHECK (
    public.has_role(auth.uid(), 'owner') OR 
    public.has_role(auth.uid(), 'designer')
  );

CREATE POLICY "Users can update kitchen projects based on role" ON public.kitchen_projects
  FOR UPDATE TO authenticated USING (
    public.has_role(auth.uid(), 'owner') OR 
    public.has_role(auth.uid(), 'designer')
  );

-- Add RLS policies for kitchen_project_phases table
ALTER TABLE public.kitchen_project_phases ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view project phases based on project access" ON public.kitchen_project_phases
  FOR SELECT TO authenticated USING (
    EXISTS (
      SELECT 1 FROM public.kitchen_projects 
      WHERE kitchen_projects.id = kitchen_project_phases.project_id
      AND (
        public.has_role(auth.uid(), 'owner') OR 
        public.has_role(auth.uid(), 'designer') OR
        EXISTS (
          SELECT 1 FROM public.kitchen_clients 
          WHERE kitchen_clients.id = kitchen_projects.client_id 
          AND kitchen_clients.id = auth.uid()
        )
      )
    )
  );

CREATE POLICY "Users can update project phases based on role" ON public.kitchen_project_phases
  FOR UPDATE TO authenticated USING (
    public.has_role(auth.uid(), 'owner') OR 
    public.has_role(auth.uid(), 'designer')
  );

-- Add RLS policies for kitchen_project_tasks table
ALTER TABLE public.kitchen_project_tasks ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view project tasks based on access" ON public.kitchen_project_tasks
  FOR SELECT TO authenticated USING (
    EXISTS (
      SELECT 1 FROM public.kitchen_project_phases 
      JOIN public.kitchen_projects ON kitchen_projects.id = kitchen_project_phases.project_id
      WHERE kitchen_project_phases.id = kitchen_project_tasks.phase_id
      AND (
        public.has_role(auth.uid(), 'owner') OR 
        public.has_role(auth.uid(), 'designer') OR
        kitchen_project_tasks.assigned_to = auth.uid() OR
        EXISTS (
          SELECT 1 FROM public.kitchen_clients 
          WHERE kitchen_clients.id = kitchen_projects.client_id 
          AND kitchen_clients.id = auth.uid()
        )
      )
    )
  );

CREATE POLICY "Users can create project tasks based on role" ON public.kitchen_project_tasks
  FOR INSERT TO authenticated WITH CHECK (
    public.has_role(auth.uid(), 'owner') OR 
    public.has_role(auth.uid(), 'designer')
  );

CREATE POLICY "Users can update project tasks based on role" ON public.kitchen_project_tasks
  FOR UPDATE TO authenticated USING (
    public.has_role(auth.uid(), 'owner') OR 
    public.has_role(auth.uid(), 'designer') OR
    assigned_to = auth.uid()
  );

CREATE POLICY "Users can delete project tasks based on role" ON public.kitchen_project_tasks
  FOR DELETE TO authenticated USING (
    public.has_role(auth.uid(), 'owner') OR 
    public.has_role(auth.uid(), 'designer')
  );
