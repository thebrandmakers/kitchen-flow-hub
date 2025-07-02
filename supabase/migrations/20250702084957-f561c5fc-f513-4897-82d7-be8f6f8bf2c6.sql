-- Enable realtime for notifications table
ALTER PUBLICATION supabase_realtime ADD TABLE public.notifications;

-- Create chat messages table for live chat
CREATE TABLE public.chat_messages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id UUID REFERENCES public.kitchen_projects(id) ON DELETE CASCADE,
  sender_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
  message TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Enable RLS on chat_messages
ALTER TABLE public.chat_messages ENABLE ROW LEVEL SECURITY;

-- Chat messages policies
CREATE POLICY "Project members can view chat messages" ON public.chat_messages
FOR SELECT USING (
  EXISTS (
    SELECT 1 FROM public.kitchen_projects kp
    WHERE kp.id = chat_messages.project_id
    AND (
      has_role(auth.uid(), 'owner'::user_role) OR
      has_role(auth.uid(), 'designer'::user_role) OR
      kp.client_id = auth.uid() OR
      EXISTS (
        SELECT 1 FROM public.kitchen_project_phases kpp
        JOIN public.kitchen_project_tasks kpt ON kpt.phase_id = kpp.id
        WHERE kpp.project_id = kp.id AND kpt.assigned_to = auth.uid()
      )
    )
  )
);

CREATE POLICY "Project members can create chat messages" ON public.chat_messages
FOR INSERT WITH CHECK (
  EXISTS (
    SELECT 1 FROM public.kitchen_projects kp
    WHERE kp.id = chat_messages.project_id
    AND (
      has_role(auth.uid(), 'owner'::user_role) OR
      has_role(auth.uid(), 'designer'::user_role) OR
      kp.client_id = auth.uid() OR
      EXISTS (
        SELECT 1 FROM public.kitchen_project_phases kpp
        JOIN public.kitchen_project_tasks kpt ON kpt.phase_id = kpp.id
        WHERE kpp.project_id = kp.id AND kpt.assigned_to = auth.uid()
      )
    )
  ) AND sender_id = auth.uid()
);

-- Enable realtime for chat messages
ALTER PUBLICATION supabase_realtime ADD TABLE public.chat_messages;