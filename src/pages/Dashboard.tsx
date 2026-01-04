import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { ChefHat, ClipboardList, BarChart3, Plus, Eye, TrendingUp, Calendar } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { useAssignedProjects } from '@/hooks/useAssignedProjects';
import { useClientProjects } from '@/hooks/useClientProjects';
import { hasPermission, roleConfig, UserRole } from '@/config/rolePermissions';
import AppLayout from '@/components/AppLayout';
import RoleGuard from '@/components/RoleGuard';

const Dashboard = () => {
  const navigate = useNavigate();
  const { user, userRole } = useAuth();

  const { data: dashboardStats } = useQuery({
    queryKey: ['dashboard-stats'],
    queryFn: async () => {
      const [projectsResult, tasksResult, recentActivityResult] = await Promise.all([
        supabase.from('projects').select('id, stage, name, created_at').limit(10),
        supabase.from('tasks').select('id, status').limit(10),
        supabase.from('projects').select('id, name, created_at, stage').order('created_at', { ascending: false }).limit(5)
      ]);

      const totalProjects = projectsResult.data?.length || 0;
      const activeProjects = projectsResult.data?.filter(p => p.stage === 'quotation' || p.stage === 'design' || p.stage === 'factory').length || 0;
      const completedProjects = projectsResult.data?.filter(p => p.stage === 'site').length || 0;
      
      const totalTasks = tasksResult.data?.length || 0;
      const completedTasks = tasksResult.data?.filter(t => t.status === 'done').length || 0;
      const pendingTasks = tasksResult.data?.filter(t => t.status === 'todo').length || 0;

      return {
        totalProjects,
        activeProjects,
        completedProjects,
        totalTasks,
        completedTasks,
        pendingTasks,
        recentActivity: recentActivityResult.data || []
      };
    }
  });

  const { data: assignedProjects } = useAssignedProjects();
  const { data: clientProjects } = useClientProjects();

  const roleInfo = userRole ? roleConfig[userRole as UserRole] : null;

  return (
    <AppLayout title="Dashboard">
      <div className="p-6 lg:p-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-foreground">Welcome back!</h1>
              <p className="text-muted-foreground mt-1">{user?.email}</p>
            </div>
            {roleInfo && (
              <Badge className={`${roleInfo.bgColor} ${roleInfo.color}`}>
                {roleInfo.label}
              </Badge>
            )}
          </div>
        </div>

        {/* Stats Grid - Show for management roles */}
        <RoleGuard allowedRoles={['owner', 'manager', 'designer']}>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Total Projects</CardTitle>
                <ChefHat className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{dashboardStats?.totalProjects || 0}</div>
                <p className="text-xs text-muted-foreground">Projects managed</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Active Projects</CardTitle>
                <TrendingUp className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-blue-600">{dashboardStats?.activeProjects || 0}</div>
                <p className="text-xs text-muted-foreground">Currently in progress</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Tasks</CardTitle>
                <ClipboardList className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{dashboardStats?.totalTasks || 0}</div>
                <p className="text-xs text-muted-foreground">
                  {dashboardStats?.completedTasks || 0} completed, {dashboardStats?.pendingTasks || 0} pending
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Completion Rate</CardTitle>
                <BarChart3 className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-green-600">
                  {dashboardStats?.totalProjects ? 
                    Math.round((dashboardStats.completedProjects / dashboardStats.totalProjects) * 100) : 0}%
                </div>
                <p className="text-xs text-muted-foreground">Projects completed</p>
              </CardContent>
            </Card>
          </div>
        </RoleGuard>

        {/* Quick Actions */}
        <div className="mb-8">
          <h2 className="text-lg font-semibold mb-4">Quick Actions</h2>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            <RoleGuard allowedRoles={['owner', 'designer', 'manager', 'sales']}>
              <Button 
                onClick={() => navigate('/kitchen-projects/new')} 
                className="h-20 flex-col space-y-2"
              >
                <Plus className="h-6 w-6" />
                <span>New Project</span>
              </Button>
            </RoleGuard>
            
            <Button 
              variant="outline" 
              onClick={() => navigate('/kitchen-projects')} 
              className="h-20 flex-col space-y-2"
            >
              <ChefHat className="h-6 w-6" />
              <span>View Projects</span>
            </Button>
            
            <Button 
              variant="outline" 
              onClick={() => navigate('/my-tasks')} 
              className="h-20 flex-col space-y-2"
            >
              <ClipboardList className="h-6 w-6" />
              <span>My Tasks</span>
            </Button>
            
            <RoleGuard allowedRoles={['owner', 'designer', 'manager']}>
              <Button 
                variant="outline" 
                onClick={() => navigate('/reports')} 
                className="h-20 flex-col space-y-2"
              >
                <BarChart3 className="h-6 w-6" />
                <span>Reports</span>
              </Button>
            </RoleGuard>
          </div>
        </div>

        {/* Client Projects */}
        <RoleGuard allowedRoles={['client']}>
          {clientProjects && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <ChefHat className="h-5 w-5 mr-2" />
                  My Projects & Assigned Team
                </CardTitle>
                <CardDescription>Your kitchen projects and assigned team members</CardDescription>
              </CardHeader>
              <CardContent>
                {clientProjects.length > 0 ? (
                  <div className="space-y-4">
                    {clientProjects.map((project) => (
                      <div key={project.id} className="p-4 border rounded-lg">
                        <div className="flex items-center justify-between mb-3">
                          <div>
                            <h3 className="font-medium">{project.project_reference}</h3>
                            <p className="text-sm text-muted-foreground">
                              Status: {project.status?.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase())}
                            </p>
                          </div>
                          <Button 
                            variant="outline" 
                            size="sm"
                            onClick={() => navigate(`/kitchen-projects/${project.id}`)}
                          >
                            <Eye className="h-4 w-4 mr-1" />
                            View
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-muted-foreground text-center py-4">No projects assigned</p>
                )}
              </CardContent>
            </Card>
          )}
        </RoleGuard>

        {/* Worker Assignments */}
        <RoleGuard allowedRoles={['worker', 'factory', 'installer']}>
          {assignedProjects && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <ClipboardList className="h-5 w-5 mr-2" />
                  My Assigned Projects
                </CardTitle>
                <CardDescription>Projects and phases assigned to you</CardDescription>
              </CardHeader>
              <CardContent>
                {assignedProjects.length > 0 ? (
                  <div className="space-y-3">
                    {assignedProjects.map((assignment) => (
                      <div key={assignment.id} className="flex items-center justify-between p-3 bg-muted rounded-lg">
                        <div className="flex items-center space-x-3">
                          <ChefHat className="h-5 w-5 text-orange-600" />
                          <div>
                            <p className="font-medium">{assignment.kitchen_projects?.project_reference}</p>
                            <p className="text-sm text-muted-foreground">
                              Phase {assignment.phase_number}: {assignment.phase_name.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase())}
                            </p>
                            <p className="text-xs text-muted-foreground">
                              Client: {assignment.kitchen_projects?.kitchen_clients?.name}
                            </p>
                          </div>
                        </div>
                        <Button 
                          variant="ghost" 
                          size="sm"
                          onClick={() => {
                            const projectId = assignment.kitchen_projects?.id;
                            if (projectId) {
                              navigate(`/kitchen-projects/${projectId}`);
                            }
                          }}
                        >
                          <Eye className="h-4 w-4 mr-1" />
                          View
                        </Button>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-muted-foreground text-center py-4">No assignments yet</p>
                )}
              </CardContent>
            </Card>
          )}
        </RoleGuard>

        {/* Recent Activity - For management roles */}
        <RoleGuard allowedRoles={['owner', 'designer', 'manager']}>
          <Card className="mt-6">
            <CardHeader>
              <CardTitle className="flex items-center">
                <Calendar className="h-5 w-5 mr-2" />
                Recent Activity
              </CardTitle>
              <CardDescription>Latest project updates</CardDescription>
            </CardHeader>
            <CardContent>
              {dashboardStats?.recentActivity && dashboardStats.recentActivity.length > 0 ? (
                <div className="space-y-3">
                  {dashboardStats.recentActivity.map((project) => (
                    <div key={project.id} className="flex items-center justify-between p-3 bg-muted rounded-lg">
                      <div className="flex items-center space-x-3">
                        <ChefHat className="h-5 w-5 text-orange-600" />
                        <div>
                          <p className="font-medium">{project.name}</p>
                          <p className="text-sm text-muted-foreground">
                            Stage: {project.stage?.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase())}
                          </p>
                        </div>
                      </div>
                      <Button 
                        variant="ghost" 
                        size="sm"
                        onClick={() => navigate(`/projects/${project.id}`)}
                      >
                        <Eye className="h-4 w-4 mr-1" />
                        View
                      </Button>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-muted-foreground text-center py-4">No recent activity</p>
              )}
            </CardContent>
          </Card>
        </RoleGuard>
      </div>
    </AppLayout>
  );
};

export default Dashboard;
