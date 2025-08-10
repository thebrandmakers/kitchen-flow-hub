-- Fix critical RLS and data consistency issues

-- First, fix the client_id data type inconsistency in kitchen_clients table
-- Change client_id from TEXT to UUID to match profiles.id
ALTER TABLE kitchen_clients ALTER COLUMN client_id TYPE UUID USING client_id::UUID;

-- Add RLS policies for tables that have RLS enabled but no policies

-- kitchen_project_assignments policies
CREATE POLICY "Project members can view assignments" 
ON kitchen_project_assignments FOR SELECT 
USING (
  auth.uid() IN (
    SELECT DISTINCT unnest(array[kp.owner_id, kpp.assigned_to, kpp.assigned_by]) 
    FROM kitchen_projects kp
    JOIN kitchen_project_phases kpp ON kpp.project_id = kp.id
    WHERE kp.id = kitchen_project_assignments.project_id
  )
  OR 
  get_user_role(auth.uid()) IN ('owner', 'manager', 'designer')
);

CREATE POLICY "Owners and managers can insert assignments" 
ON kitchen_project_assignments FOR INSERT 
WITH CHECK (
  get_user_role(auth.uid()) IN ('owner', 'manager', 'designer')
);

CREATE POLICY "Owners and managers can update assignments" 
ON kitchen_project_assignments FOR UPDATE 
USING (
  get_user_role(auth.uid()) IN ('owner', 'manager', 'designer')
);

-- kitchen_project_phases policies
CREATE POLICY "Project members can view phases" 
ON kitchen_project_phases FOR SELECT 
USING (
  auth.uid() IN (
    SELECT DISTINCT unnest(array[kp.owner_id, kitchen_project_phases.assigned_to, kitchen_project_phases.assigned_by]) 
    FROM kitchen_projects kp
    WHERE kp.id = kitchen_project_phases.project_id
  )
  OR 
  get_user_role(auth.uid()) IN ('owner', 'manager', 'designer')
);

CREATE POLICY "Owners and managers can update phases" 
ON kitchen_project_phases FOR UPDATE 
USING (
  get_user_role(auth.uid()) IN ('owner', 'manager', 'designer')
  OR 
  auth.uid() = assigned_to
);

-- kitchen_clients policies (improve existing ones to be more restrictive)
DROP POLICY IF EXISTS "Authenticated users can view kitchen clients" ON kitchen_clients;
DROP POLICY IF EXISTS "Users can update kitchen clients based on role" ON kitchen_clients;

CREATE POLICY "Owner and managers can view kitchen clients" 
ON kitchen_clients FOR SELECT 
USING (
  get_user_role(auth.uid()) IN ('owner', 'manager') 
  OR auth.uid()::text = client_id::text
);

CREATE POLICY "Clients can update their own data" 
ON kitchen_clients FOR UPDATE 
USING (auth.uid()::text = client_id::text);

CREATE POLICY "Owner and managers can insert kitchen clients" 
ON kitchen_clients FOR INSERT 
WITH CHECK (get_user_role(auth.uid()) IN ('owner', 'manager'));

-- Fix function security issues by adding search_path to existing functions
CREATE OR REPLACE FUNCTION public.generate_project_reference()
RETURNS text
LANGUAGE plpgsql
SECURITY DEFINER SET search_path = ''
AS $function$
DECLARE
  ref TEXT;
BEGIN
  ref := 'KIT-' || TO_CHAR(NOW(), 'YYYY') || '-' || LPAD(FLOOR(RANDOM() * 10000)::TEXT, 4, '0');
  RETURN ref;
END;
$function$;

CREATE OR REPLACE FUNCTION public.get_user_role(_user_id uuid)
RETURNS user_role
LANGUAGE sql
STABLE SECURITY DEFINER SET search_path = ''
AS $function$
  SELECT role
  FROM public.profiles
  WHERE id = _user_id
$function$;

CREATE OR REPLACE FUNCTION public.has_role(_user_id uuid, _role user_role)
RETURNS boolean
LANGUAGE sql
STABLE SECURITY DEFINER SET search_path = ''
AS $function$
  SELECT EXISTS (
    SELECT 1
    FROM public.profiles
    WHERE id = _user_id AND role = _role
  )
$function$;

CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER SET search_path = ''
AS $function$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$function$;