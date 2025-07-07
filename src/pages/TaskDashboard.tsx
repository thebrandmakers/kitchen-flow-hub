import React from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Building2, ArrowLeft, CheckSquare, Clock, PlayCircle, CheckCircle } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useUserAssignedTasks } from '@/hooks/useIndividualTasks';
import { useAuth } from '@/contexts/AuthContext';
import { format } from 'date-fns';

const TaskDashboard = () => {
  const navigate = useNavigate();
  const { userRole } = useAuth();
  const { data: assignedTasks, isLoading } = useUserAssignedTasks();

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed': return 'bg-green-100 text-green-800';
      case 'in_progress': return 'bg-blue-100 text-blue-800';
      case 'started': return 'bg-yellow-100 text-yellow-800';
      case 'todo': return 'bg-gray-100 text-gray-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'completed': return <CheckCircle className="h-4 w-4" />;
      case 'in_progress': return <Clock className="h-4 w-4" />;
      case 'started': return <PlayCircle className="h-4 w-4" />;
      default: return <Clock className="h-4 w-4" />;
    }
  };

  const completedTasks = assignedTasks?.filter(task => task.status === 'completed').length || 0;
  const pendingTasks = assignedTasks?.filter(task => task.status !== 'completed').length || 0;
  const totalTasks = assignedTasks?.length || 0;

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-2 text-gray-600">Loading your tasks...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <div className="flex items-center space-x-3">
              <Button variant="ghost" onClick={() => navigate('/dashboard')}>
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back to Dashboard
              </Button>
              <Building2 className="h-8 w-8 text-blue-600" />
              <div>
                <h1 className="text-2xl font-bold text-gray-900">My Tasks</h1>
                <p className="text-sm text-gray-500">Track your assigned tasks and progress</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Tasks</CardTitle>
              <CheckSquare className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{totalTasks}</div>
              <p className="text-xs text-muted-foreground">Assigned to you</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Completed</CardTitle>
              <CheckCircle className="h-4 w-4 text-green-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-600">{completedTasks}</div>
              <p className="text-xs text-muted-foreground">
                {totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0}% completion rate
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Pending</CardTitle>
              <Clock className="h-4 w-4 text-orange-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-orange-600">{pendingTasks}</div>
              <p className="text-xs text-muted-foreground">Tasks to complete</p>
            </CardContent>
          </Card>
        </div>

        {/* Tasks List */}
        <Card>
          <CardHeader>
            <CardTitle>Your Assigned Tasks</CardTitle>
            <CardDescription>All tasks assigned to you across different projects</CardDescription>
          </CardHeader>
          <CardContent>
            {assignedTasks && assignedTasks.length > 0 ? (
              <div className="space-y-4">
                {assignedTasks.map((task) => {
                  // Debug logging only if project ID is missing
                  if (!task.kitchen_project_phases?.kitchen_projects?.id) {
                    console.warn('Missing project ID for task:', task.id, task);
                  }
                  
                  return (
                    <div key={task.id} className="p-4 border rounded-lg bg-white hover:shadow-sm transition-shadow">
                      <div className="flex items-center justify-between mb-3">
                        <div className="flex items-start space-x-3">
                          {getStatusIcon(task.status)}
                          <div>
                            <h3 className="font-medium text-gray-900">{task.task_title}</h3>
                            <p className="text-sm text-gray-500 mt-1">{task.task_description}</p>
                            <div className="flex items-center space-x-4 mt-2 text-xs text-gray-500">
                              <span>
                                Project: {task.kitchen_project_phases?.kitchen_projects?.project_reference || 'N/A'}
                              </span>
                              <span>
                                Phase: {task.kitchen_project_phases?.phase_name?.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase()) || 'N/A'}
                              </span>
                              <span>
                                Assigned: {format(new Date(task.created_at), 'MMM dd, yyyy')}
                              </span>
                            </div>
                          </div>
                        </div>
                        <div className="flex items-center space-x-3">
                          <Badge className={getStatusColor(task.status)}>
                            {task.status.replace('_', ' ').toUpperCase()}
                          </Badge>
                          <Button 
                            variant="outline" 
                            size="sm"
                            onClick={() => {
                              const projectId = task.kitchen_project_phases?.kitchen_projects?.id;
                              if (projectId) {
                                navigate(`/kitchen-projects/${projectId}`);
                              } else {
                                console.error('Project ID not found in task data:', task);
                                alert('Unable to navigate to project - project information is missing');
                              }
                            }}
                          >
                            View Project
                          </Button>
                        </div>
                      </div>
                      
                      {task.images && task.images.length > 0 && (
                        <div className="mt-3">
                          <p className="text-sm font-medium text-gray-700 mb-2">Progress Photos:</p>
                          <div className="grid grid-cols-4 gap-2">
                            {task.images.slice(0, 4).map((imageUrl, index) => (
                              <img
                                key={index}
                                src={imageUrl}
                                alt={`Progress ${index + 1}`}
                                className="w-full h-16 object-cover rounded border cursor-pointer"
                                onClick={() => window.open(imageUrl, '_blank')}
                              />
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            ) : (
              <div className="text-center py-8 text-gray-500">
                <CheckSquare className="h-12 w-12 mx-auto mb-4 opacity-50" />
                <p className="text-lg font-medium">No tasks assigned</p>
                <p className="text-sm">You don't have any tasks assigned to you yet.</p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default TaskDashboard;