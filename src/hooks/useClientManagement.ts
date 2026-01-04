import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { UserRole } from '@/hooks/useUserRoles';

interface ClientProfile {
  id: string;
  email: string;
  full_name: string | null;
  avatar_url: string | null;
  created_at: string | null;
  updated_at: string | null;
  role: UserRole;
  kitchen_clients?: any;
}

export const useClientManagement = () => {
  return useQuery({
    queryKey: ['client-management'],
    queryFn: async (): Promise<ClientProfile[]> => {
      // First get all profiles
      const { data: profiles, error: profileError } = await supabase
        .from('profiles')
        .select('*')
        .order('created_at', { ascending: false });
      
      if (profileError) throw profileError;
      if (!profiles) return [];
      
      // Get roles for each profile and filter to clients only
      const profilesWithRoles = await Promise.all(
        profiles.map(async (profile) => {
          const { data: role } = await supabase.rpc('get_user_role', {
            _user_id: profile.id
          });
          
          return {
            ...profile,
            role: (role || 'client') as UserRole
          };
        })
      );
      
      // Filter to only clients
      const clientProfiles = profilesWithRoles.filter(p => p.role === 'client');
      
      // Then get kitchen_clients data for each client profile
      const clientsWithData = await Promise.all(
        clientProfiles.map(async (profile) => {
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
