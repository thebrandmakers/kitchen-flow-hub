
import React from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Building2, ArrowLeft, Plus, CheckSquare } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { format } from 'date-fns';

const Tasks = () => {
  const navigate = useNavigate();

  const { data: tasks, isLoading } = useQuery({
    queryKey: ['tasks'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('tasks')
        .select(`
          *,
          projects(name),
          profiles!tasks_assigned_to_fkey(full_name)
        `)
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      return data;
    }
  });

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'todo': return 'bg-gray-100 text-gray-800';
      case 'in_progress': return 'bg-blue-100 text-blue-800';
      case 'done': return 'bg-green-100 text-green-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusLabel = (status: string) => {
    switch (status) {
      case 'todo': return 'Pending';
      case 'in_progress': return 'In Progress';
      case 'done': return 'Done';
      default: return status;
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary mx-auto"></div>
          <p className="mt-4 text-muted-foreground">Loading tasks...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="bg-card shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <div className="flex items-center space-x-3">
              <Button variant="ghost" onClick={() => navigate('/dashboard')}>
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back to Dashboard
              </Button>
              <Building2 className="h-8 w-8 text-primary" />
              <div>
                <h1 className="text-2xl font-bold text-foreground">Tasks</h1>
                <p className="text-sm text-muted-foreground">Manage project tasks</p>
              </div>
            </div>
            <Button>
              <Plus className="h-4 w-4 mr-2" />
              New Task
            </Button>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {tasks && tasks.length > 0 ? (
          <div className="space-y-4">
            {tasks.map((task) => (
              <Card 
                key={task.id} 
                className="cursor-pointer hover:shadow-md transition-shadow"
                onClick={() => navigate(`/tasks/${task.id}`)}
              >
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-4">
                      <CheckSquare className="h-5 w-5 text-muted-foreground" />
                      <div className="flex-1">
                        <h3 className="text-lg font-medium text-foreground">{task.title}</h3>
                        <p className="text-sm text-muted-foreground">
                          {task.projects?.name || 'No project assigned'}
                        </p>
                        {task.profiles?.full_name && (
                          <p className="text-xs text-muted-foreground mt-1">
                            Assigned to: {task.profiles.full_name}
                          </p>
                        )}
                      </div>
                    </div>
                    <div className="flex items-center space-x-4">
                      <div className="text-right">
                        <p className="text-sm text-muted-foreground">Due Date</p>
                        <p className="text-sm font-medium">
                          {task.due_date ? format(new Date(task.due_date), 'MMM dd, yyyy') : 'No due date'}
                        </p>
                      </div>
                      <Badge className={getStatusColor(task.status)}>
                        {getStatusLabel(task.status)}
                      </Badge>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        ) : (
          <div className="text-center py-12">
            <CheckSquare className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-lg font-medium text-foreground mb-2">No Tasks Found</h3>
            <p className="text-muted-foreground mb-6">Tasks will appear here once they are created.</p>
            <Button>
              <Plus className="h-4 w-4 mr-2" />
              Create Task
            </Button>
          </div>
        )}
      </div>
    </div>
  );
};

export default Tasks;
