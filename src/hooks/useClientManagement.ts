import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

export const useClientManagement = () => {
  return useQuery({
    queryKey: ['client-management'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('profiles')
        .select(`
          *,
          kitchen_clients(
            id,
            name,
            email,
            phone,
            address,
            created_at
          )
        `)
        .eq('role', 'client')
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      return data;
    }
  });
};