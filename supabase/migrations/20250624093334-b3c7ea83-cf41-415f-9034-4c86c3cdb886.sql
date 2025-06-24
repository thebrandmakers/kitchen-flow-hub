
-- Fix RLS policies for kitchen_projects to allow proper access
-- Remove existing policies that might be too restrictive
DROP POLICY IF EXISTS "Owners can manage all kitchen projects" ON public.kitchen_projects;
DROP POLICY IF EXISTS "Designers can view all kitchen projects" ON public.kitchen_projects;
DROP POLICY IF EXISTS "Clients can view their own kitchen projects" ON public.kitchen_projects;

-- Create new comprehensive policies for kitchen_projects
CREATE POLICY "Users can view kitchen projects they own or are assigned to" ON public.kitchen_projects
  FOR SELECT TO authenticated USING (
    public.has_role(auth.uid(), 'owner') OR 
    public.has_role(auth.uid(), 'designer') OR
    client_id = auth.uid()
  );

CREATE POLICY "Users can create kitchen projects" ON public.kitchen_projects
  FOR INSERT TO authenticated WITH CHECK (
    client_id = auth.uid() OR
    public.has_role(auth.uid(), 'owner') OR 
    public.has_role(auth.uid(), 'designer')
  );

CREATE POLICY "Users can update kitchen projects they own" ON public.kitchen_projects
  FOR UPDATE TO authenticated USING (
    client_id = auth.uid() OR
    public.has_role(auth.uid(), 'owner') OR 
    public.has_role(auth.uid(), 'designer')
  );

-- Fix RLS policies for kitchen_clients to allow proper access
DROP POLICY IF EXISTS "Owners can manage all kitchen clients" ON public.kitchen_clients;
DROP POLICY IF EXISTS "Clients can view their own data" ON public.kitchen_clients;
DROP POLICY IF EXISTS "Clients can update their own data" ON public.kitchen_clients;

-- Allow authenticated users to insert and view kitchen clients
CREATE POLICY "Authenticated users can view kitchen clients" ON public.kitchen_clients
  FOR SELECT TO authenticated USING (true);

CREATE POLICY "Authenticated users can create kitchen clients" ON public.kitchen_clients
  FOR INSERT TO authenticated WITH CHECK (true);

CREATE POLICY "Users can update their own kitchen client data" ON public.kitchen_clients
  FOR UPDATE TO authenticated USING (id = auth.uid());
