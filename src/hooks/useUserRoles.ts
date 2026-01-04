import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

export type UserRole = 'owner' | 'designer' | 'client' | 'worker' | 'manager' | 'factory' | 'installer' | 'sales';

interface ProfileWithRole {
  id: string;
  email: string;
  full_name: string | null;
  avatar_url: string | null;
  created_at: string | null;
  updated_at: string | null;
  role: UserRole;
}

// Fetch profiles with roles using the get_user_role function
export const useProfilesWithRoles = (roleFilter?: UserRole[]) => {
  return useQuery({
    queryKey: ['profiles-with-roles', roleFilter],
    queryFn: async (): Promise<ProfileWithRole[]> => {
      // First get all profiles
      const { data: profiles, error: profileError } = await supabase
        .from('profiles')
        .select('*')
        .order('full_name');
      
      if (profileError) throw profileError;
      if (!profiles) return [];
      
      // Get roles for each profile using the RPC function
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
      
      // Filter by roles if specified
      if (roleFilter && roleFilter.length > 0) {
        return profilesWithRoles.filter(p => roleFilter.includes(p.role));
      }
      
      return profilesWithRoles;
    }
  });
};

// Fetch team members (non-client roles)
export const useTeamMemberProfiles = () => {
  return useProfilesWithRoles(['owner', 'manager', 'designer', 'factory', 'installer', 'worker', 'sales']);
};

// Fetch assignable team members
export const useAssignableMembers = () => {
  return useProfilesWithRoles(['designer', 'worker', 'factory', 'installer', 'manager']);
};

// Get single user's role
export const useUserRole = (userId?: string) => {
  return useQuery({
    queryKey: ['user-role', userId],
    queryFn: async (): Promise<UserRole | null> => {
      if (!userId) return null;
      
      const { data: role, error } = await supabase.rpc('get_user_role', {
        _user_id: userId
      });
      
      if (error) {
        console.error('Error fetching user role:', error);
        return 'client';
      }
      
      return (role || 'client') as UserRole;
    },
    enabled: !!userId
  });
};
