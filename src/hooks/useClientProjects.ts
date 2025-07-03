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
            assigned_to
          )
        `)
        .eq('kitchen_clients.client_id', user.id)
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      
      // Fetch profile data for assigned team members
      if (data && data.length > 0) {
        for (const project of data) {
          if (project.kitchen_project_phases) {
            for (const phase of project.kitchen_project_phases) {
              if (phase.assigned_to) {
                const { data: profile } = await supabase
                  .from('profiles')
                  .select('full_name, email, role')
                  .eq('id', phase.assigned_to)
                  .single();
                
                if (profile) {
                  (phase as any).profile = profile;
                }
              }
            }
          }
        }
      }
      
      if (error) throw error;
      return data;
    },
    enabled: !!user?.id
  });
};