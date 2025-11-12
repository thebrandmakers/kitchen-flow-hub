-- Remove recursive RLS policies on user_roles that cause infinite loops
-- The SECURITY DEFINER functions bypass RLS anyway, so these policies are unnecessary
DROP POLICY IF EXISTS "Owners can insert roles via function" ON public.user_roles;
DROP POLICY IF EXISTS "Owners can delete roles via function" ON public.user_roles;
DROP POLICY IF EXISTS "Owners can update roles via function" ON public.user_roles;

-- The only policy needed is for users to view their own roles (non-recursive)
-- This policy already exists: "Users can view their own roles"
-- USING (auth.uid() = user_id)

-- Add comment explaining the RLS design
COMMENT ON TABLE public.user_roles IS 
'Stores user roles with minimal RLS policies to prevent recursion. 
Users can view their own roles. 
Owners manage roles through SECURITY DEFINER functions that bypass RLS.';