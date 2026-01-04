import React from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { UserRole } from '@/config/rolePermissions';

interface RoleGuardProps {
  children: React.ReactNode;
  allowedRoles: UserRole[] | 'all';
  fallback?: React.ReactNode;
}

/**
 * RoleGuard component - conditionally renders children based on user role
 * 
 * Usage:
 * <RoleGuard allowedRoles={['owner', 'manager']}>
 *   <AdminOnlyContent />
 * </RoleGuard>
 */
const RoleGuard: React.FC<RoleGuardProps> = ({ 
  children, 
  allowedRoles, 
  fallback = null 
}) => {
  const { userRole } = useAuth();

  if (!userRole) {
    return <>{fallback}</>;
  }

  if (allowedRoles === 'all') {
    return <>{children}</>;
  }

  if (allowedRoles.includes(userRole as UserRole)) {
    return <>{children}</>;
  }

  return <>{fallback}</>;
};

export default RoleGuard;
