
-- Check existing policies and add only missing ones

-- First, let's add the missing RLS policies for projects table (seems to be missing based on schema)
-- Only add if they don't exist

DO $$ 
BEGIN
  -- Check and create policies for projects table
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE schemaname = 'public' AND tablename = 'projects' AND policyname = 'Owners can manage all projects'
  ) THEN
    EXECUTE 'CREATE POLICY "Owners can manage all projects" ON public.projects
      FOR ALL TO authenticated USING (public.has_role(auth.uid(), ''owner''))';
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE schemaname = 'public' AND tablename = 'projects' AND policyname = 'Designers can view all projects'
  ) THEN
    EXECUTE 'CREATE POLICY "Designers can view all projects" ON public.projects
      FOR SELECT TO authenticated USING (
        public.has_role(auth.uid(), ''owner'') OR 
        public.has_role(auth.uid(), ''designer'')
      )';
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE schemaname = 'public' AND tablename = 'projects' AND policyname = 'Clients can view their projects'
  ) THEN
    EXECUTE 'CREATE POLICY "Clients can view their projects" ON public.projects
      FOR SELECT TO authenticated USING (
        public.has_role(auth.uid(), ''owner'') OR 
        public.has_role(auth.uid(), ''designer'') OR
        client_id = auth.uid()
      )';
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE schemaname = 'public' AND tablename = 'projects' AND policyname = 'Workers can view assigned projects'
  ) THEN
    EXECUTE 'CREATE POLICY "Workers can view assigned projects" ON public.projects
      FOR SELECT TO authenticated USING (
        public.has_role(auth.uid(), ''owner'') OR 
        public.has_role(auth.uid(), ''designer'') OR
        client_id = auth.uid() OR
        EXISTS (SELECT 1 FROM public.tasks WHERE project_id = projects.id AND assigned_to = auth.uid())
      )';
  END IF;

  -- Check and create policies for tasks table
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE schemaname = 'public' AND tablename = 'tasks' AND policyname = 'Task access based on project access'
  ) THEN
    EXECUTE 'CREATE POLICY "Task access based on project access" ON public.tasks
      FOR ALL TO authenticated USING (
        public.has_role(auth.uid(), ''owner'') OR 
        public.has_role(auth.uid(), ''designer'') OR
        EXISTS (SELECT 1 FROM public.projects WHERE id = project_id AND client_id = auth.uid()) OR
        assigned_to = auth.uid()
      )';
  END IF;

  -- Check and create policies for files table
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE schemaname = 'public' AND tablename = 'files' AND policyname = 'File access based on project access'
  ) THEN
    EXECUTE 'CREATE POLICY "File access based on project access" ON public.files
      FOR ALL TO authenticated USING (
        public.has_role(auth.uid(), ''owner'') OR 
        public.has_role(auth.uid(), ''designer'') OR
        EXISTS (SELECT 1 FROM public.projects WHERE id = project_id AND client_id = auth.uid())
      )';
  END IF;

  -- Check and create policies for reports table
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE schemaname = 'public' AND tablename = 'reports' AND policyname = 'Report access based on project access'
  ) THEN
    EXECUTE 'CREATE POLICY "Report access based on project access" ON public.reports
      FOR ALL TO authenticated USING (
        public.has_role(auth.uid(), ''owner'') OR 
        public.has_role(auth.uid(), ''designer'') OR
        EXISTS (SELECT 1 FROM public.projects WHERE id = project_id AND client_id = auth.uid())
      )';
  END IF;

END $$;

-- Create storage bucket for secure file uploads (only if it doesn't exist)
INSERT INTO storage.buckets (id, name, public) 
VALUES ('project-files', 'project-files', false)
ON CONFLICT (id) DO NOTHING;

-- Add storage policies only if they don't exist
DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE schemaname = 'storage' AND tablename = 'objects' AND policyname = 'Authenticated users can upload files'
  ) THEN
    EXECUTE 'CREATE POLICY "Authenticated users can upload files" ON storage.objects
      FOR INSERT TO authenticated WITH CHECK (bucket_id = ''project-files'')';
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE schemaname = 'storage' AND tablename = 'objects' AND policyname = 'Authenticated users can view files'
  ) THEN
    EXECUTE 'CREATE POLICY "Authenticated users can view files" ON storage.objects
      FOR SELECT TO authenticated USING (bucket_id = ''project-files'')';
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE schemaname = 'storage' AND tablename = 'objects' AND policyname = 'Users can update own uploaded files'
  ) THEN
    EXECUTE 'CREATE POLICY "Users can update own uploaded files" ON storage.objects
      FOR UPDATE TO authenticated USING (bucket_id = ''project-files'' AND auth.uid()::text = (metadata->>''uploaded_by''))';
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE schemaname = 'storage' AND tablename = 'objects' AND policyname = 'Users can delete own uploaded files'
  ) THEN
    EXECUTE 'CREATE POLICY "Users can delete own uploaded files" ON storage.objects
      FOR DELETE TO authenticated USING (bucket_id = ''project-files'' AND auth.uid()::text = (metadata->>''uploaded_by''))';
  END IF;
END $$;
