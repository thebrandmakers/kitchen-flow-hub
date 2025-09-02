import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { format } from 'date-fns';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Separator } from '@/components/ui/separator';
import { ArrowLeft, Calendar, User, AlertCircle, CheckCircle2, Clock, Play } from 'lucide-react';
import { toast } from '@/hooks/use-toast';

const TaskDetail = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [isUpdating, setIsUpdating] = useState(false);

  const { data: task, isLoading } = useQuery({
    queryKey: ['task-detail', id],
    queryFn: async () => {
      if (!id) throw new Error('Task ID is required');
      
      const { data, error } = await supabase
        .from('tasks')
        .select(`
          *,
          projects(name),
          profiles!tasks_assigned_to_fkey(full_name, email)
        `)
        .eq('id', id)
        .single();
      
      if (error) throw error;
      return data;
    },
    enabled: !!id
  });

  const updateTaskMutation = useMutation({
    mutationFn: async (newStatus: 'todo' | 'in_progress' | 'done') => {
      if (!id) throw new Error('Task ID is required');
      
      const { error } = await supabase
        .from('tasks')
        .update({ 
          status: newStatus,
          updated_at: new Date().toISOString()
        })
        .eq('id', id);
      
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['task-detail', id] });
      toast({
        title: "Success",
        description: "Task status updated successfully",
      });
      setIsUpdating(false);
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: "Failed to update task status",
        variant: "destructive"
      });
      setIsUpdating(false);
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

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'todo': return <AlertCircle className="h-4 w-4" />;
      case 'in_progress': return <Play className="h-4 w-4" />;
      case 'done': return <CheckCircle2 className="h-4 w-4" />;
      default: return <Clock className="h-4 w-4" />;
    }
  };

  const getNextStatus = (currentStatus: string) => {
    switch (currentStatus) {
      case 'todo': return 'in_progress';
      case 'in_progress': return 'done';
      default: return currentStatus;
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

  const handleStatusUpdate = (newStatus: string) => {
    if (newStatus === 'todo' || newStatus === 'in_progress' || newStatus === 'done') {
      setIsUpdating(true);
      updateTaskMutation.mutate(newStatus);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary mx-auto"></div>
          <p className="mt-4 text-muted-foreground">Loading task details...</p>
        </div>
      </div>
    );
  }

  if (!task) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-foreground mb-2">Task Not Found</h2>
          <p className="text-muted-foreground mb-4">The task you're looking for doesn't exist.</p>
          <Button onClick={() => navigate('/tasks')}>
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Tasks
          </Button>
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
              <Button variant="ghost" onClick={() => navigate('/tasks')}>
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back to Tasks
              </Button>
              <div>
                <h1 className="text-2xl font-bold text-foreground">{task.title}</h1>
                <p className="text-sm text-muted-foreground">Task Details</p>
              </div>
            </div>
            <Badge className={getStatusColor(task.status)}>
              {getStatusIcon(task.status)}
              <span className="ml-1">{getStatusLabel(task.status)}</span>
            </Badge>
          </div>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2">
            <Card>
              <CardHeader>
                <CardTitle>Task Information</CardTitle>
                <CardDescription>Detailed information about this task</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div>
                  <h3 className="font-medium text-foreground mb-2">Description</h3>
                  <p className="text-muted-foreground">
                    {task.description || 'No description provided for this task.'}
                  </p>
                </div>

                <Separator />

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-4">
                    <div className="flex items-center space-x-2">
                      <Calendar className="h-4 w-4 text-muted-foreground" />
                      <div>
                        <p className="text-sm font-medium text-foreground">Due Date</p>
                        <p className="text-sm text-muted-foreground">
                          {task.due_date ? format(new Date(task.due_date), 'EEEE, MMMM dd, yyyy') : 'No due date set'}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center space-x-2">
                      <User className="h-4 w-4 text-muted-foreground" />
                      <div>
                        <p className="text-sm font-medium text-foreground">Assigned To</p>
                        <p className="text-sm text-muted-foreground">
                          {task.profiles?.full_name || 'Unassigned'}
                        </p>
                      </div>
                    </div>
                  </div>

                  <div className="space-y-4">
                    <div>
                      <p className="text-sm font-medium text-foreground">Project</p>
                      <p className="text-sm text-muted-foreground">
                        {task.projects?.name || 'No project assigned'}
                      </p>
                    </div>

                    <div>
                      <p className="text-sm font-medium text-foreground">Created</p>
                      <p className="text-sm text-muted-foreground">
                        {format(new Date(task.created_at), 'MMM dd, yyyy')}
                      </p>
                    </div>

                    <div>
                      <p className="text-sm font-medium text-foreground">Last Updated</p>
                      <p className="text-sm text-muted-foreground">
                        {format(new Date(task.updated_at), 'MMM dd, yyyy')}
                      </p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Status Management */}
            <Card>
              <CardHeader>
                <CardTitle>Status Management</CardTitle>
                <CardDescription>Update the task status</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <p className="text-sm font-medium text-foreground mb-2">Current Status</p>
                  <Badge className={getStatusColor(task.status)}>
                    {getStatusIcon(task.status)}
                    <span className="ml-1">{getStatusLabel(task.status)}</span>
                  </Badge>
                </div>

                <Separator />

                <div>
                  <p className="text-sm font-medium text-foreground mb-2">Change Status</p>
                  <Select
                    value={task.status}
                    onValueChange={handleStatusUpdate}
                    disabled={isUpdating}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select status" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="todo">Pending</SelectItem>
                      <SelectItem value="in_progress">In Progress</SelectItem>
                      <SelectItem value="done">Done</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {task.status !== 'done' && (
                  <Button 
                    className="w-full" 
                    onClick={() => handleStatusUpdate(getNextStatus(task.status))}
                    disabled={isUpdating}
                  >
                    {isUpdating ? 'Updating...' : (
                      task.status === 'todo' ? 'Start Task' : 'Mark as Done'
                    )}
                  </Button>
                )}
              </CardContent>
            </Card>

            {/* Task Timeline */}
            <Card>
              <CardHeader>
                <CardTitle>Timeline</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="flex items-center space-x-2">
                    <div className="w-2 h-2 bg-primary rounded-full"></div>
                    <div>
                      <p className="text-sm font-medium">Task Created</p>
                      <p className="text-xs text-muted-foreground">
                        {format(new Date(task.created_at), 'MMM dd, yyyy • h:mm a')}
                      </p>
                    </div>
                  </div>
                  
                  <div className="flex items-center space-x-2">
                    <div className={`w-2 h-2 rounded-full ${task.status !== 'todo' ? 'bg-primary' : 'bg-muted'}`}></div>
                    <div>
                      <p className="text-sm font-medium">Task Started</p>
                      <p className="text-xs text-muted-foreground">
                        {task.status !== 'todo' ? format(new Date(task.updated_at), 'MMM dd, yyyy • h:mm a') : 'Not started yet'}
                      </p>
                    </div>
                  </div>
                  
                  <div className="flex items-center space-x-2">
                    <div className={`w-2 h-2 rounded-full ${task.status === 'done' ? 'bg-primary' : 'bg-muted'}`}></div>
                    <div>
                      <p className="text-sm font-medium">Task Completed</p>
                      <p className="text-xs text-muted-foreground">
                        {task.status === 'done' ? format(new Date(task.updated_at), 'MMM dd, yyyy • h:mm a') : 'Not completed yet'}
                      </p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TaskDetail;