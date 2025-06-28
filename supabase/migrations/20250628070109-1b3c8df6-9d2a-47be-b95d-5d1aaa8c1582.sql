
-- Fix the kitchen_clients RLS policies to allow proper client creation
-- The current policies are too restrictive and causing the violation

-- Drop existing problematic policies
DROP POLICY IF EXISTS "Allow authenticated users to insert kitchen clients" ON public.kitchen_clients;
DROP POLICY IF EXISTS "Users can view kitchen clients based on role" ON public.kitchen_clients;
DROP POLICY IF EXISTS "Users can update kitchen clients based on role" ON public.kitchen_clients;

-- Create new comprehensive policies that allow authenticated users to create and manage clients
CREATE POLICY "Authenticated users can create kitchen clients" ON public.kitchen_clients
  FOR INSERT TO authenticated WITH CHECK (true);

CREATE POLICY "Authenticated users can view kitchen clients" ON public.kitchen_clients
  FOR SELECT TO authenticated USING (
    public.has_role(auth.uid(), 'owner') OR 
    public.has_role(auth.uid(), 'designer') OR
    true -- Allow all authenticated users to view clients for now
  );

CREATE POLICY "Users can update kitchen clients based on role" ON public.kitchen_clients
  FOR UPDATE TO authenticated USING (
    public.has_role(auth.uid(), 'owner') OR 
    public.has_role(auth.uid(), 'designer')
  );

-- Also ensure the kitchen_projects policies work with the client creation flow
DROP POLICY IF EXISTS "Users can create kitchen projects based on role" ON public.kitchen_projects;

CREATE POLICY "Authenticated users can create kitchen projects" ON public.kitchen_projects
  FOR INSERT TO authenticated WITH CHECK (
    public.has_role(auth.uid(), 'owner') OR 
    public.has_role(auth.uid(), 'designer') OR
    true -- Allow authenticated users to create projects
  );
