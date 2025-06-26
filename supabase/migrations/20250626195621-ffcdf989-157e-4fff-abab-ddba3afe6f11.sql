
-- Fix the kitchen_clients insert policy to allow proper client creation
-- The current policy is too restrictive for inserts when creating new clients

-- Drop the existing restrictive insert policy
DROP POLICY IF EXISTS "Authenticated users can create kitchen clients" ON public.kitchen_clients;

-- Create a more permissive insert policy that allows authenticated users to create clients
-- This is needed because when creating a new kitchen project, we need to create a client record
CREATE POLICY "Allow authenticated users to insert kitchen clients" ON public.kitchen_clients
  FOR INSERT TO authenticated 
  WITH CHECK (true);

-- Also fix the kitchen_clients table to ensure the id column uses auth.uid() when needed
-- Update the view policy to be more permissive for project creation flow
DROP POLICY IF EXISTS "Users can view kitchen clients based on role" ON public.kitchen_clients;

CREATE POLICY "Users can view kitchen clients based on role" ON public.kitchen_clients
  FOR SELECT TO authenticated USING (
    public.has_role(auth.uid(), 'owner') OR 
    public.has_role(auth.uid(), 'designer') OR
    id = auth.uid()
  );

-- Fix kitchen_project_phases policies to ensure they work properly
DROP POLICY IF EXISTS "Users can create project phases based on role" ON public.kitchen_project_phases;

CREATE POLICY "Users can create project phases based on role" ON public.kitchen_project_phases
  FOR INSERT TO authenticated WITH CHECK (
    public.has_role(auth.uid(), 'owner') OR 
    public.has_role(auth.uid(), 'designer')
  );

-- Fix kitchen_project_files policies
ALTER TABLE public.kitchen_project_files ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can view project files based on access" ON public.kitchen_project_files;
DROP POLICY IF EXISTS "Users can create project files based on role" ON public.kitchen_project_files;
DROP POLICY IF EXISTS "Users can update project files based on role" ON public.kitchen_project_files;
DROP POLICY IF EXISTS "Users can delete project files based on role" ON public.kitchen_project_files;

CREATE POLICY "Users can view project files based on access" ON public.kitchen_project_files
  FOR SELECT TO authenticated USING (
    public.has_role(auth.uid(), 'owner') OR 
    public.has_role(auth.uid(), 'designer') OR
    uploaded_by = auth.uid() OR
    EXISTS (
      SELECT 1 FROM public.kitchen_projects 
      WHERE kitchen_projects.id = kitchen_project_files.project_id
      AND EXISTS (
        SELECT 1 FROM public.kitchen_clients 
        WHERE kitchen_clients.id = kitchen_projects.client_id 
        AND kitchen_clients.id = auth.uid()
      )
    )
  );

CREATE POLICY "Users can create project files based on role" ON public.kitchen_project_files
  FOR INSERT TO authenticated WITH CHECK (
    public.has_role(auth.uid(), 'owner') OR 
    public.has_role(auth.uid(), 'designer') OR
    uploaded_by = auth.uid()
  );

CREATE POLICY "Users can update project files based on role" ON public.kitchen_project_files
  FOR UPDATE TO authenticated USING (
    public.has_role(auth.uid(), 'owner') OR 
    public.has_role(auth.uid(), 'designer') OR
    uploaded_by = auth.uid()
  );

CREATE POLICY "Users can delete project files based on role" ON public.kitchen_project_files
  FOR DELETE TO authenticated USING (
    public.has_role(auth.uid(), 'owner') OR 
    public.has_role(auth.uid(), 'designer') OR
    uploaded_by = auth.uid()
  );

-- Fix profiles table RLS (this table needs proper policies)
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can view their own profile" ON public.profiles;
DROP POLICY IF EXISTS "Users can update their own profile" ON public.profiles;
DROP POLICY IF EXISTS "Allow authenticated users to insert profiles" ON public.profiles;

CREATE POLICY "Users can view profiles based on role" ON public.profiles
  FOR SELECT TO authenticated USING (
    id = auth.uid() OR
    public.has_role(auth.uid(), 'owner') OR 
    public.has_role(auth.uid(), 'designer')
  );

CREATE POLICY "Users can update their own profile" ON public.profiles
  FOR UPDATE TO authenticated USING (id = auth.uid());

CREATE POLICY "Allow authenticated users to insert profiles" ON public.profiles
  FOR INSERT TO authenticated WITH CHECK (id = auth.uid());

-- Fix other tables that might have similar issues
-- Fix projects table RLS
ALTER TABLE public.projects ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can view projects based on role" ON public.projects;
DROP POLICY IF EXISTS "Users can create projects based on role" ON public.projects;
DROP POLICY IF EXISTS "Users can update projects based on role" ON public.projects;

CREATE POLICY "Users can view projects based on role" ON public.projects
  FOR SELECT TO authenticated USING (
    public.has_role(auth.uid(), 'owner') OR 
    public.has_role(auth.uid(), 'designer') OR
    client_id = auth.uid() OR
    owner_id = auth.uid()
  );

CREATE POLICY "Users can create projects based on role" ON public.projects
  FOR INSERT TO authenticated WITH CHECK (
    public.has_role(auth.uid(), 'owner') OR 
    public.has_role(auth.uid(), 'designer')
  );

CREATE POLICY "Users can update projects based on role" ON public.projects
  FOR UPDATE TO authenticated USING (
    public.has_role(auth.uid(), 'owner') OR 
    public.has_role(auth.uid(), 'designer') OR
    owner_id = auth.uid()
  );

-- Fix tasks table RLS
ALTER TABLE public.tasks ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can view tasks based on role" ON public.tasks;
DROP POLICY IF EXISTS "Users can create tasks based on role" ON public.tasks;
DROP POLICY IF EXISTS "Users can update tasks based on role" ON public.tasks;

CREATE POLICY "Users can view tasks based on role" ON public.tasks
  FOR SELECT TO authenticated USING (
    public.has_role(auth.uid(), 'owner') OR 
    public.has_role(auth.uid(), 'designer') OR
    assigned_to = auth.uid() OR
    created_by = auth.uid()
  );

CREATE POLICY "Users can create tasks based on role" ON public.tasks
  FOR INSERT TO authenticated WITH CHECK (
    public.has_role(auth.uid(), 'owner') OR 
    public.has_role(auth.uid(), 'designer')
  );

CREATE POLICY "Users can update tasks based on role" ON public.tasks
  FOR UPDATE TO authenticated USING (
    public.has_role(auth.uid(), 'owner') OR 
    public.has_role(auth.uid(), 'designer') OR
    assigned_to = auth.uid()
  );

-- Fix reports table RLS
ALTER TABLE public.reports ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can view reports based on role" ON public.reports;
DROP POLICY IF EXISTS "Users can create reports based on role" ON public.reports;
DROP POLICY IF EXISTS "Users can update reports based on role" ON public.reports;

CREATE POLICY "Users can view reports based on role" ON public.reports
  FOR SELECT TO authenticated USING (
    public.has_role(auth.uid(), 'owner') OR 
    public.has_role(auth.uid(), 'designer') OR
    created_by = auth.uid()
  );

CREATE POLICY "Users can create reports based on role" ON public.reports
  FOR INSERT TO authenticated WITH CHECK (
    public.has_role(auth.uid(), 'owner') OR 
    public.has_role(auth.uid(), 'designer')
  );

CREATE POLICY "Users can update reports based on role" ON public.reports
  FOR UPDATE TO authenticated USING (
    public.has_role(auth.uid(), 'owner') OR 
    public.has_role(auth.uid(), 'designer') OR
    created_by = auth.uid()
  );

-- Fix files table RLS
ALTER TABLE public.files ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can view files based on role" ON public.files;
DROP POLICY IF EXISTS "Users can create files based on role" ON public.files;
DROP POLICY IF EXISTS "Users can update files based on role" ON public.files;

CREATE POLICY "Users can view files based on role" ON public.files
  FOR SELECT TO authenticated USING (
    public.has_role(auth.uid(), 'owner') OR 
    public.has_role(auth.uid(), 'designer') OR
    uploaded_by = auth.uid()
  );

CREATE POLICY "Users can create files based on role" ON public.files
  FOR INSERT TO authenticated WITH CHECK (
    public.has_role(auth.uid(), 'owner') OR 
    public.has_role(auth.uid(), 'designer') OR
    uploaded_by = auth.uid()
  );

CREATE POLICY "Users can update files based on role" ON public.files
  FOR UPDATE TO authenticated USING (
    public.has_role(auth.uid(), 'owner') OR 
    public.has_role(auth.uid(), 'designer') OR
    uploaded_by = auth.uid()
  );
