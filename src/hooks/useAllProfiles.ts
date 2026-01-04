import { useProfilesWithRoles, UserRole } from '@/hooks/useUserRoles';

// This hook now wraps useProfilesWithRoles to get all profiles with their roles
export const useAllProfiles = () => {
  return useProfilesWithRoles();
};
