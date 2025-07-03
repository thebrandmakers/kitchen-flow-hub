import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';

export const useAssignedProjects = () => {
  const { user } = useAuth();

  return useQuery({
    queryKey: ['assigned-projects', user?.id],
    queryFn: async () => {
      if (!user?.id) return [];
      
      const { data, error } = await supabase
        .from('kitchen_project_phases')
        .select(`
          *,
          kitchen_projects(
            id,
            project_reference,
            status,
            current_phase,
            kitchen_clients(name, email)
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