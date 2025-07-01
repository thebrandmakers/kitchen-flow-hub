import React from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Building2, ChefHat, Users, ClipboardList, BarChart3, Plus, Eye, TrendingUp, Calendar, Bell } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import NotificationBell from '@/components/NotificationBell';

const Dashboard = () => {
  const navigate = useNavigate();
  const { user, userRole, signOut } = useAuth();

  const { data: projects, isLoading: isProjectsLoading } = useQuery({
    queryKey: ['kitchen-projects-dashboard'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('kitchen_projects')
        .select('*')
        .limit(5);

      if (error) {
        console.error('Error fetching kitchen projects:', error);
        return [];
      }
      return data;
    },
  });

  const { data: tasks, isLoading: isTasksLoading } = useQuery({
    queryKey: ['tasks-dashboard'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('kitchen_project_tasks')
        .select('*')
        .limit(5);

      if (error) {
        console.error('Error fetching tasks:', error);
        return [];
      }
      return data;
    },
  });

  const { data: teamMembers, isLoading: isTeamLoading } = useQuery({
    queryKey: ['team-members-dashboard'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('team_members')
        .select('*')
        .limit(5);

      if (error) {
        console.error('Error fetching team members:', error);
        return [];
      }
      return data;
    },
  });

  const { data: dashboardStats } = useQuery({
    queryKey: ['dashboard-stats'],
    queryFn: async () => {
      const [projectsResult, tasksResult, recentActivityResult] = await Promise.all([
        supabase.from('kitchen_projects').select('id, status, current_phase').limit(10),
        supabase.from('kitchen_project_tasks').select('id, status').limit(10),
        supabase.from('kitchen_projects').select('id, project_reference, created_at, status').order('created_at', { ascending: false }).limit(5)
      ]);

      const totalProjects = projectsResult.data?.length || 0;
      const activeProjects = projectsResult.data?.filter(p => p.status !== 'closure').length || 0;
      const completedProjects = projectsResult.data?.filter(p => p.status === 'closure').length || 0;
      
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

  const getRoleColor = (role: string) => {
    switch (role) {
      case 'owner': return 'bg-purple-100 text-purple-800';
      case 'manager': return 'bg-indigo-100 text-indigo-800';
      case 'designer': return 'bg-blue-100 text-blue-800';
      case 'factory': return 'bg-orange-100 text-orange-800';
      case 'installer': return 'bg-green-100 text-green-800';
      case 'sales': return 'bg-pink-100 text-pink-800';
      case 'worker': return 'bg-yellow-100 text-yellow-800';
      case 'client': return 'bg-gray-100 text-gray-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <div className="flex items-center space-x-3">
              <Building2 className="h-8 w-8 text-blue-600" />
              <div>
                <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
                <p className="text-sm text-gray-500">Welcome back, {user?.email}</p>
              </div>
            </div>
            <div className="flex items-center space-x-4">
              <NotificationBell />
              {userRole && (
                <Badge className={getRoleColor(userRole)}>
                  {userRole.charAt(0).toUpperCase() + userRole.slice(1)}
                </Badge>
              )}
              <Button variant="outline" onClick={signOut}>
                Logout
              </Button>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Projects</CardTitle>
              <ChefHat className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{dashboardStats?.totalProjects || 0}</div>
              <p className="text-xs text-muted-foreground">Kitchen projects managed</p>
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

        {/* Quick Actions */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <Button 
            onClick={() => navigate('/kitchen-projects/new')} 
            className="h-20 flex-col space-y-2"
          >
            <Plus className="h-6 w-6" />
            New Kitchen Project
          </Button>
          
          <Button 
            variant="outline" 
            onClick={() => navigate('/kitchen-projects')} 
            className="h-20 flex-col space-y-2"
          >
            <ChefHat className="h-6 w-6" />
            View Projects
          </Button>
          
          <Button 
            variant="outline" 
            onClick={() => navigate('/team')} 
            className="h-20 flex-col space-y-2"
          >
            <Users className="h-6 w-6" />
            Team Management
          </Button>
          
          <Button 
            variant="outline" 
            onClick={() => navigate('/reports')} 
            className="h-20 flex-col space-y-2"
          >
            <BarChart3 className="h-6 w-6" />
            Reports
          </Button>
        </div>

        {/* Recent Activity */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <Calendar className="h-5 w-5 mr-2" />
              Recent Activity
            </CardTitle>
            <CardDescription>Latest kitchen project updates</CardDescription>
          </CardHeader>
          <CardContent>
            {dashboardStats?.recentActivity && dashboardStats.recentActivity.length > 0 ? (
              <div className="space-y-3">
                {dashboardStats.recentActivity.map((project) => (
                  <div key={project.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                    <div className="flex items-center space-x-3">
                      <ChefHat className="h-5 w-5 text-orange-600" />
                      <div>
                        <p className="font-medium">{project.project_reference}</p>
                        <p className="text-sm text-gray-500">
                          Status: {project.status?.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase())}
                        </p>
                      </div>
                    </div>
                    <Button 
                      variant="ghost" 
                      size="sm"
                      onClick={() => navigate(`/kitchen-projects/${project.id}`)}
                    >
                      <Eye className="h-4 w-4 mr-1" />
                      View
                    </Button>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-gray-500 text-center py-4">No recent activity</p>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Dashboard;
