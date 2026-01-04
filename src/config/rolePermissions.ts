import { 
  Building2, 
  ChefHat, 
  ClipboardList, 
  Users, 
  BarChart3, 
  Plus, 
  Settings, 
  UserPlus,
  Home,
  FolderKanban,
  type LucideIcon
} from 'lucide-react';

export type UserRole = 'owner' | 'designer' | 'client' | 'worker' | 'manager' | 'factory' | 'installer' | 'sales';

export interface NavItem {
  label: string;
  path: string;
  icon: LucideIcon;
  roles: UserRole[] | 'all';
  description?: string;
}

export interface RolePermissions {
  canCreateProjects: boolean;
  canEditProjects: boolean;
  canDeleteProjects: boolean;
  canManageTeam: boolean;
  canManageClients: boolean;
  canViewReports: boolean;
  canAssignTasks: boolean;
  canViewAllProjects: boolean;
  canRegisterUsers: boolean;
}

// Define permissions for each role
export const rolePermissions: Record<UserRole, RolePermissions> = {
  owner: {
    canCreateProjects: true,
    canEditProjects: true,
    canDeleteProjects: true,
    canManageTeam: true,
    canManageClients: true,
    canViewReports: true,
    canAssignTasks: true,
    canViewAllProjects: true,
    canRegisterUsers: true,
  },
  manager: {
    canCreateProjects: true,
    canEditProjects: true,
    canDeleteProjects: false,
    canManageTeam: true,
    canManageClients: true,
    canViewReports: true,
    canAssignTasks: true,
    canViewAllProjects: true,
    canRegisterUsers: true,
  },
  designer: {
    canCreateProjects: true,
    canEditProjects: true,
    canDeleteProjects: false,
    canManageTeam: false,
    canManageClients: false,
    canViewReports: true,
    canAssignTasks: true,
    canViewAllProjects: true,
    canRegisterUsers: false,
  },
  sales: {
    canCreateProjects: true,
    canEditProjects: false,
    canDeleteProjects: false,
    canManageTeam: false,
    canManageClients: true,
    canViewReports: false,
    canAssignTasks: false,
    canViewAllProjects: true,
    canRegisterUsers: false,
  },
  factory: {
    canCreateProjects: false,
    canEditProjects: false,
    canDeleteProjects: false,
    canManageTeam: false,
    canManageClients: false,
    canViewReports: false,
    canAssignTasks: false,
    canViewAllProjects: false,
    canRegisterUsers: false,
  },
  installer: {
    canCreateProjects: false,
    canEditProjects: false,
    canDeleteProjects: false,
    canManageTeam: false,
    canManageClients: false,
    canViewReports: false,
    canAssignTasks: false,
    canViewAllProjects: false,
    canRegisterUsers: false,
  },
  worker: {
    canCreateProjects: false,
    canEditProjects: false,
    canDeleteProjects: false,
    canManageTeam: false,
    canManageClients: false,
    canViewReports: false,
    canAssignTasks: false,
    canViewAllProjects: false,
    canRegisterUsers: false,
  },
  client: {
    canCreateProjects: false,
    canEditProjects: false,
    canDeleteProjects: false,
    canManageTeam: false,
    canManageClients: false,
    canViewReports: false,
    canAssignTasks: false,
    canViewAllProjects: false,
    canRegisterUsers: false,
  },
};

// Navigation items with role-based access
export const navigationItems: NavItem[] = [
  {
    label: 'Dashboard',
    path: '/dashboard',
    icon: Home,
    roles: 'all',
    description: 'Overview and quick actions',
  },
  {
    label: 'Kitchen Projects',
    path: '/kitchen-projects',
    icon: ChefHat,
    roles: 'all',
    description: 'View and manage kitchen projects',
  },
  {
    label: 'New Project',
    path: '/kitchen-projects/new',
    icon: Plus,
    roles: ['owner', 'manager', 'designer', 'sales'],
    description: 'Create a new kitchen project',
  },
  {
    label: 'My Tasks',
    path: '/my-tasks',
    icon: ClipboardList,
    roles: 'all',
    description: 'View your assigned tasks',
  },
  {
    label: 'All Tasks',
    path: '/tasks',
    icon: FolderKanban,
    roles: ['owner', 'manager', 'designer'],
    description: 'Manage all project tasks',
  },
  {
    label: 'Team',
    path: '/team',
    icon: Users,
    roles: 'all',
    description: 'View team and assignments',
  },
  {
    label: 'Reports',
    path: '/reports',
    icon: BarChart3,
    roles: ['owner', 'manager', 'designer'],
    description: 'View project reports',
  },
  {
    label: 'Clients',
    path: '/clients',
    icon: Building2,
    roles: ['owner', 'manager'],
    description: 'Manage client information',
  },
  {
    label: 'Register Users',
    path: '/admin/register',
    icon: UserPlus,
    roles: ['owner', 'manager'],
    description: 'Register new team members',
  },
];

// Helper function to get role-specific navigation items
export const getNavigationForRole = (role: UserRole | null): NavItem[] => {
  if (!role) return [];
  
  return navigationItems.filter(item => {
    if (item.roles === 'all') return true;
    return item.roles.includes(role);
  });
};

// Helper function to check if user has permission
export const hasPermission = (
  role: UserRole | null,
  permission: keyof RolePermissions
): boolean => {
  if (!role) return false;
  return rolePermissions[role]?.[permission] ?? false;
};

// Helper function to check if user can access a route
export const canAccessRoute = (role: UserRole | null, path: string): boolean => {
  if (!role) return false;
  
  const navItem = navigationItems.find(item => 
    path === item.path || path.startsWith(item.path + '/')
  );
  
  if (!navItem) return true; // Allow access to routes not in navigation
  if (navItem.roles === 'all') return true;
  
  return navItem.roles.includes(role);
};

// Role display configuration
export const roleConfig: Record<UserRole, { label: string; color: string; bgColor: string }> = {
  owner: { label: 'Owner', color: 'text-purple-700', bgColor: 'bg-purple-100' },
  manager: { label: 'Manager', color: 'text-indigo-700', bgColor: 'bg-indigo-100' },
  designer: { label: 'Designer', color: 'text-blue-700', bgColor: 'bg-blue-100' },
  sales: { label: 'Sales', color: 'text-pink-700', bgColor: 'bg-pink-100' },
  factory: { label: 'Factory', color: 'text-orange-700', bgColor: 'bg-orange-100' },
  installer: { label: 'Installer', color: 'text-green-700', bgColor: 'bg-green-100' },
  worker: { label: 'Worker', color: 'text-yellow-700', bgColor: 'bg-yellow-100' },
  client: { label: 'Client', color: 'text-gray-700', bgColor: 'bg-gray-100' },
};
