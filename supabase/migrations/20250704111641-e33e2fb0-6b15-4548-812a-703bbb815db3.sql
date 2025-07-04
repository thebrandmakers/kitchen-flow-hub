-- Fix notifications table RLS policies
-- Drop existing restrictive policies and create proper ones
DROP POLICY IF EXISTS "Users can view their own notifications" ON public.notifications;
DROP POLICY IF EXISTS "Users can update their own notifications" ON public.notifications;

-- Allow system/admin users to create notifications
CREATE POLICY "System can create notifications" 
ON public.notifications 
FOR INSERT 
WITH CHECK (true);

-- Users can view their own notifications
CREATE POLICY "Users can view their own notifications" 
ON public.notifications 
FOR SELECT 
USING (auth.uid() = user_id);

-- Users can update their own notifications
CREATE POLICY "Users can update their own notifications" 
ON public.notifications 
FOR UPDATE 
USING (auth.uid() = user_id);

-- Fix task_updates RLS policy to allow phase completion records
DROP POLICY IF EXISTS "Assigned users can create task updates" ON public.task_updates;

CREATE POLICY "Users can create task updates" 
ON public.task_updates 
FOR INSERT 
WITH CHECK (
  (user_id = auth.uid()) AND (
    (task_id IS NULL) OR -- Allow phase completion records (no task_id)
    (EXISTS ( -- Allow task updates for assigned tasks
      SELECT 1
      FROM kitchen_project_tasks kpt
      WHERE kpt.id = task_updates.task_id 
      AND (has_role(auth.uid(), 'owner'::user_role) OR has_role(auth.uid(), 'designer'::user_role) OR kpt.assigned_to = auth.uid())
    ))
  )
);

-- Fix kitchen_projects RLS policy
DROP POLICY IF EXISTS "Authenticated users can create kitchen projects" ON public.kitchen_projects;

CREATE POLICY "Users can create kitchen projects" 
ON public.kitchen_projects 
FOR INSERT 
WITH CHECK (has_role(auth.uid(), 'owner'::user_role) OR has_role(auth.uid(), 'designer'::user_role) OR has_role(auth.uid(), 'manager'::user_role));