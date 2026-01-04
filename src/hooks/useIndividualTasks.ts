import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from '@/hooks/use-toast';

interface IndividualTask {
  id: string;
  phase_id: string;
  assigned_to: string;
  assigned_by: string;
  task_title: string;
  task_description?: string;
  status: 'todo' | 'started' | 'in_progress' | 'completed';
  images: string[];
  created_at: string;
  updated_at: string;
  completed_at?: string;
}

export const useIndividualTasks = (phaseId?: string) => {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  // Fetch individual tasks for a phase
  const { data: tasks, isLoading } = useQuery({
    queryKey: ['individual-tasks', phaseId],
    queryFn: async () => {
      if (!phaseId) return [];
      
      const { data, error } = await supabase
        .from('individual_tasks')
        .select('*')
        .eq('phase_id', phaseId)
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      return (data || []) as IndividualTask[];
    },
    enabled: !!phaseId
  });

  // Create individual task
  const createTask = useMutation({
    mutationFn: async (taskData: {
      phase_id: string;
      assigned_to: string;
      task_title: string;
      task_description?: string;
    }) => {
      if (!user?.id) throw new Error('User not authenticated');
      
      const { error } = await supabase
        .from('individual_tasks')
        .insert({
          ...taskData,
          assigned_by: user.id
        });
      
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['individual-tasks'] });
      toast({
        title: "Success",
        description: "Task created and assigned successfully",
      });
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: "Failed to create task",
        variant: "destructive"
      });
    }
  });

  // Update task status
  const updateTaskStatus = useMutation({
    mutationFn: async ({ taskId, status, images }: { 
      taskId: string; 
      status: 'todo' | 'started' | 'in_progress' | 'completed';
      images?: string[];
    }) => {
      const updateData: any = { 
        status,
        updated_at: new Date().toISOString()
      };
      
      if (status === 'completed') {
        updateData.completed_at = new Date().toISOString();
      }
      
      if (images) {
        updateData.images = images;
      }
      
      const { error } = await supabase
        .from('individual_tasks')
        .update(updateData)
        .eq('id', taskId);
      
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['individual-tasks'] });
      toast({
        title: "Success",
        description: "Task status updated successfully",
      });
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: "Failed to update task status",
        variant: "destructive"
      });
    }
  });

  // Delete task
  const deleteTask = useMutation({
    mutationFn: async (taskId: string) => {
      const { error } = await supabase
        .from('individual_tasks')
        .delete()
        .eq('id', taskId);
      
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['individual-tasks'] });
      toast({
        title: "Success",
        description: "Task deleted successfully",
      });
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: "Failed to delete task",
        variant: "destructive"
      });
    }
  });

  return {
    tasks: tasks || [],
    isLoading,
    createTask,
    updateTaskStatus,
    deleteTask
  };
};

// Hook for getting user's assigned tasks across all projects
export const useUserAssignedTasks = () => {
  const { user } = useAuth();

  return useQuery({
    queryKey: ['user-assigned-tasks', user?.id],
    queryFn: async () => {
      if (!user?.id) return [];
      
      const { data, error } = await supabase
        .from('individual_tasks')
        .select(`
          *,
          kitchen_project_phases!inner(
            phase_name,
            phase_number,
            kitchen_projects!inner(
              project_reference,
              id
            )
          )
        `)
        .eq('assigned_to', user.id)
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      return data;
    },
    enabled: !!user?.id
  });
};
