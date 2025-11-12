-- Fix get_user_role to read from user_roles table instead of profiles
CREATE OR REPLACE FUNCTION public.get_user_role(_user_id uuid)
RETURNS user_role
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT role
  FROM public.user_roles
  WHERE user_id = _user_id
  LIMIT 1
$$;

-- Drop and recreate RLS policies on user_roles to fix recursion issues
DROP POLICY IF EXISTS "Owners can view all roles" ON public.user_roles;
DROP POLICY IF EXISTS "Owners can manage all roles" ON public.user_roles;

-- Only keep the simple self-access policy (no recursion)
-- Users can always view their own roles
-- Owners will use SECURITY DEFINER functions to manage other roles

-- Create a secure function for owners to view all roles
CREATE OR REPLACE FUNCTION public.get_all_user_roles()
RETURNS TABLE (
  id uuid,
  user_id uuid,
  role user_role,
  created_at timestamp with time zone,
  updated_at timestamp with time zone
)
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  -- Only allow owners to call this function
  SELECT ur.id, ur.user_id, ur.role, ur.created_at, ur.updated_at
  FROM public.user_roles ur
  WHERE EXISTS (
    SELECT 1 FROM public.user_roles
    WHERE user_id = auth.uid() AND role = 'owner'
  );
$$;

-- Create a secure function for owners to update roles
CREATE OR REPLACE FUNCTION public.update_user_role(
  target_user_id uuid,
  new_role user_role
)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  -- Check if caller is an owner
  IF NOT EXISTS (
    SELECT 1 FROM public.user_roles
    WHERE user_id = auth.uid() AND role = 'owner'
  ) THEN
    RAISE EXCEPTION 'Only owners can update user roles';
  END IF;
  
  -- Update or insert the role
  INSERT INTO public.user_roles (user_id, role)
  VALUES (target_user_id, new_role)
  ON CONFLICT (user_id, role) 
  DO UPDATE SET updated_at = now();
  
  -- Remove other roles for this user (each user should have only one role)
  DELETE FROM public.user_roles
  WHERE user_id = target_user_id AND role != new_role;
END;
$$;

-- Add policy for owners to insert roles (needed for update_user_role function)
CREATE POLICY "Owners can insert roles via function"
ON public.user_roles
FOR INSERT
WITH CHECK (
  EXISTS (
    SELECT 1 FROM public.user_roles
    WHERE user_id = auth.uid() AND role = 'owner'
  )
);

-- Add policy for owners to delete roles (needed for update_user_role function)
CREATE POLICY "Owners can delete roles via function"
ON public.user_roles
FOR DELETE
USING (
  EXISTS (
    SELECT 1 FROM public.user_roles
    WHERE user_id = auth.uid() AND role = 'owner'
  )
);

-- Add policy for owners to update roles
CREATE POLICY "Owners can update roles via function"
ON public.user_roles
FOR UPDATE
USING (
  EXISTS (
    SELECT 1 FROM public.user_roles
    WHERE user_id = auth.uid() AND role = 'owner'
  )
);

-- Drop the role column from profiles (no longer needed)
ALTER TABLE public.profiles DROP COLUMN IF EXISTS role;

-- Add comment
COMMENT ON FUNCTION public.get_user_role IS 'Returns the role for a given user ID. Uses SECURITY DEFINER to bypass RLS.';
COMMENT ON FUNCTION public.update_user_role IS 'Allows owners to update user roles. Only one role per user.';
COMMENT ON FUNCTION public.get_all_user_roles IS 'Allows owners to view all user roles. Returns empty for non-owners.';