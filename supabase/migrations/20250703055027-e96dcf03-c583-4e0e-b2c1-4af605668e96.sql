-- Create task_updates table for tracking task progress updates
CREATE TABLE public.task_updates (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  task_id UUID REFERENCES public.kitchen_project_tasks(id) ON DELETE CASCADE,
  user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
  message TEXT NOT NULL,
  images TEXT[] DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Enable RLS on task_updates
ALTER TABLE public.task_updates ENABLE ROW LEVEL SECURITY;

-- Task updates policies - project members can view and assigned users can create
CREATE POLICY "Task updates visible to project members" ON public.task_updates
FOR SELECT USING (
  EXISTS (
    SELECT 1 FROM public.kitchen_project_tasks kpt
    JOIN public.kitchen_project_phases kpp ON kpt.phase_id = kpp.id
    JOIN public.kitchen_projects kp ON kpp.project_id = kp.id
    WHERE kpt.id = task_updates.task_id
    AND (
      has_role(auth.uid(), 'owner'::user_role) OR
      has_role(auth.uid(), 'designer'::user_role) OR
      kp.client_id = auth.uid() OR
      kpt.assigned_to = auth.uid()
    )
  )
);

CREATE POLICY "Assigned users can create task updates" ON public.task_updates
FOR INSERT WITH CHECK (
  EXISTS (
    SELECT 1 FROM public.kitchen_project_tasks kpt
    WHERE kpt.id = task_updates.task_id
    AND (
      has_role(auth.uid(), 'owner'::user_role) OR
      has_role(auth.uid(), 'designer'::user_role) OR
      kpt.assigned_to = auth.uid()
    )
  ) AND user_id = auth.uid()
);

CREATE POLICY "Users can update their own task updates" ON public.task_updates
FOR UPDATE USING (user_id = auth.uid());

-- Create trigger for updated_at
CREATE TRIGGER update_task_updates_updated_at
BEFORE UPDATE ON public.task_updates
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- Enable realtime for task updates
ALTER PUBLICATION supabase_realtime ADD TABLE public.task_updates;