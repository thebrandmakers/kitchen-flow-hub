-- Create notification function for task assignments
CREATE OR REPLACE FUNCTION public.notify_task_assignment()
RETURNS TRIGGER AS $$
DECLARE
  project_ref TEXT;
  phase_name_formatted TEXT;
BEGIN
  -- Get project reference and phase name
  SELECT 
    kp.project_reference,
    kpp.phase_name
  INTO project_ref, phase_name_formatted
  FROM kitchen_projects kp
  JOIN kitchen_project_phases kpp ON kpp.project_id = kp.id
  WHERE kpp.id = NEW.phase_id;
  
  -- Format phase name
  phase_name_formatted := REPLACE(INITCAP(REPLACE(phase_name_formatted, '_', ' ')), '_', ' ');
  
  -- Create notification for assigned user
  IF NEW.assigned_to IS NOT NULL THEN
    INSERT INTO public.notifications (
      user_id,
      title,
      message,
      project_id,
      type
    ) VALUES (
      NEW.assigned_to,
      'New Phase Assignment',
      'You have been assigned to phase "' || phase_name_formatted || '" in project ' || project_ref,
      (SELECT project_id FROM kitchen_project_phases WHERE id = NEW.phase_id),
      'phase_assignment'
    );
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger for phase assignments
CREATE TRIGGER trigger_notify_task_assignment
  AFTER UPDATE OF assigned_to ON public.kitchen_project_phases
  FOR EACH ROW
  WHEN (OLD.assigned_to IS DISTINCT FROM NEW.assigned_to AND NEW.assigned_to IS NOT NULL)
  EXECUTE FUNCTION public.notify_task_assignment();

-- Create individual task management table for more granular task control
CREATE TABLE public.individual_tasks (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  phase_id UUID REFERENCES public.kitchen_project_phases(id) ON DELETE CASCADE,
  assigned_to UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
  assigned_by UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
  task_title TEXT NOT NULL,
  task_description TEXT,
  status TEXT DEFAULT 'todo' CHECK (status IN ('todo', 'started', 'in_progress', 'completed')),
  images TEXT[] DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  completed_at TIMESTAMP WITH TIME ZONE NULL
);

-- Enable RLS on individual_tasks
ALTER TABLE public.individual_tasks ENABLE ROW LEVEL SECURITY;

-- RLS policies for individual_tasks
CREATE POLICY "Individual tasks visible to project members" ON public.individual_tasks
FOR SELECT USING (
  EXISTS (
    SELECT 1 FROM public.kitchen_project_phases kpp
    JOIN public.kitchen_projects kp ON kpp.project_id = kp.id
    WHERE kpp.id = individual_tasks.phase_id
    AND (
      has_role(auth.uid(), 'owner'::user_role) OR
      has_role(auth.uid(), 'designer'::user_role) OR
      has_role(auth.uid(), 'manager'::user_role) OR
      kp.client_id = auth.uid() OR
      individual_tasks.assigned_to = auth.uid()
    )
  )
);

CREATE POLICY "Managers can create individual tasks" ON public.individual_tasks
FOR INSERT WITH CHECK (
  has_role(auth.uid(), 'owner'::user_role) OR
  has_role(auth.uid(), 'designer'::user_role) OR
  has_role(auth.uid(), 'manager'::user_role)
);

CREATE POLICY "Assigned users and managers can update individual tasks" ON public.individual_tasks
FOR UPDATE USING (
  has_role(auth.uid(), 'owner'::user_role) OR
  has_role(auth.uid(), 'designer'::user_role) OR
  has_role(auth.uid(), 'manager'::user_role) OR
  assigned_to = auth.uid()
);

CREATE POLICY "Managers can delete individual tasks" ON public.individual_tasks
FOR DELETE USING (
  has_role(auth.uid(), 'owner'::user_role) OR
  has_role(auth.uid(), 'designer'::user_role) OR
  has_role(auth.uid(), 'manager'::user_role)
);

-- Create trigger for updated_at on individual_tasks
CREATE TRIGGER update_individual_tasks_updated_at
BEFORE UPDATE ON public.individual_tasks
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- Function to notify on individual task assignments
CREATE OR REPLACE FUNCTION public.notify_individual_task_assignment()
RETURNS TRIGGER AS $$
DECLARE
  project_ref TEXT;
  assigner_name TEXT;
BEGIN
  -- Get project reference and assigner name
  SELECT 
    kp.project_reference,
    p.full_name
  INTO project_ref, assigner_name
  FROM kitchen_projects kp
  JOIN kitchen_project_phases kpp ON kpp.project_id = kp.id
  JOIN profiles p ON p.id = NEW.assigned_by
  WHERE kpp.id = NEW.phase_id;
  
  -- Create notification for assigned user
  INSERT INTO public.notifications (
    user_id,
    title,
    message,
    project_id,
    type
  ) VALUES (
    NEW.assigned_to,
    'New Task Assignment',
    assigner_name || ' assigned you task "' || NEW.task_title || '" in project ' || project_ref,
    (SELECT project_id FROM kitchen_project_phases WHERE id = NEW.phase_id),
    'task_assignment'
  );
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger for individual task assignments
CREATE TRIGGER trigger_notify_individual_task_assignment
  AFTER INSERT ON public.individual_tasks
  FOR EACH ROW
  EXECUTE FUNCTION public.notify_individual_task_assignment();

-- Enable realtime for individual_tasks
ALTER PUBLICATION supabase_realtime ADD TABLE public.individual_tasks;