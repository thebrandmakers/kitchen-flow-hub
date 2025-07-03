import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

export const useClientManagement = () => {
  return useQuery({
    queryKey: ['client-management'],
    queryFn: async () => {
      // First get all client profiles
      const { data: profiles, error: profileError } = await supabase
        .from('profiles')
        .select('*')
        .eq('role', 'client')
        .order('created_at', { ascending: false });
      
      if (profileError) throw profileError;
      
      // Then get kitchen_clients data for each profile
      const clientsWithData = await Promise.all(
        profiles.map(async (profile) => {
          const { data: clientData } = await supabase
            .from('kitchen_clients')
            .select('*')
            .eq('client_id', profile.id)
            .single();
          
          return {
            ...profile,
            kitchen_clients: clientData
          };
        })
      );
      
      return clientsWithData;
    }
  });
};