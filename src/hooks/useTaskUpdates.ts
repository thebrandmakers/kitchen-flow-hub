import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from '@/hooks/use-toast';

interface TaskUpdate {
  id: string;
  task_id: string;
  user_id: string;
  message: string;
  images: string[];
  created_at: string;
  profiles: {
    full_name: string;
    avatar_url: string;
  };
}

export const useTaskUpdates = (taskId: string) => {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  // Fetch task updates
  const { data: updates, isLoading } = useQuery({
    queryKey: ['task-updates', taskId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('task_updates')
        .select(`
          *,
          profiles(full_name, avatar_url)
        `)
        .eq('task_id', taskId)
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      return data as TaskUpdate[];
    },
    enabled: !!taskId
  });

  // Add task update mutation
  const addUpdate = useMutation({
    mutationFn: async ({ message, images }: { message: string; images: string[] }) => {
      if (!user?.id) throw new Error('User not authenticated');
      
      const { error } = await supabase
        .from('task_updates')
        .insert({
          task_id: taskId,
          user_id: user.id,
          message: message.trim(),
          images: images
        });
      
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['task-updates', taskId] });
      toast({
        title: "Success",
        description: "Task update added successfully",
      });
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: "Failed to add task update",
        variant: "destructive"
      });
    }
  });

  return {
    updates: updates || [],
    isLoading,
    addUpdate
  };
};