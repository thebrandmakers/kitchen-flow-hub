import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';

export const useClientProjects = () => {
  const { user } = useAuth();

  return useQuery({
    queryKey: ['client-projects', user?.id],
    queryFn: async () => {
      if (!user?.id) return [];
      
      const { data, error } = await supabase
        .from('kitchen_projects')
        .select(`
          *,
          kitchen_clients!inner(name, email),
          kitchen_project_phases(
            id,
            phase_name,
            phase_number,
            status,
            assigned_to,
            profiles(full_name, email, role)
          )
        `)
        .eq('kitchen_clients.client_id', user.id)
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      return data;
    },
    enabled: !!user?.id
  });
};