import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { Plus, Trash, CheckCircle, Clock, PlayCircle, Users } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { useIndividualTasks } from '@/hooks/useIndividualTasks';
import { useAssignableMembers } from '@/hooks/useUserRoles';
import ImageUpload from '@/components/ImageUpload';

interface IndividualTaskManagerProps {
  phaseId: string;
  projectId: string;
}

const IndividualTaskManager: React.FC<IndividualTaskManagerProps> = ({
  phaseId,
  projectId
}) => {
  const { user, userRole } = useAuth();
  const { tasks, createTask, updateTaskStatus, deleteTask } = useIndividualTasks(phaseId);
  const { data: teamMembers } = useAssignableMembers();
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [newTask, setNewTask] = useState({
    task_title: '',
    task_description: '',
    assigned_to: ''
  });
  const [taskImages, setTaskImages] = useState<{ [taskId: string]: string[] }>({});

  const canManageTasks = userRole === 'owner' || userRole === 'designer' || userRole === 'manager';

  const handleCreateTask = async () => {
    if (!newTask.task_title || !newTask.assigned_to) return;

    try {
      await createTask.mutateAsync({
        phase_id: phaseId,
        ...newTask
      });
      
      setNewTask({ task_title: '', task_description: '', assigned_to: '' });
      setIsCreateDialogOpen(false);
    } catch (error) {
      console.error('Failed to create task:', error);
    }
  };

  const handleStatusUpdate = async (taskId: string, status: 'todo' | 'started' | 'in_progress' | 'completed') => {
    const images = taskImages[taskId] || [];
    await updateTaskStatus.mutateAsync({ taskId, status, images });
  };

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

  // Get assigned member name from task
  const getAssignedMemberName = (assignedTo: string) => {
    const member = teamMembers?.find(m => m.id === assignedTo);
    return member ? `${member.full_name || member.email} (${member.role})` : 'Unknown';
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <Users className="h-5 w-5" />
          <h3 className="text-lg font-medium">Individual Tasks</h3>
        </div>
        
        {canManageTasks && (
          <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
            <DialogTrigger asChild>
              <Button size="sm">
                <Plus className="h-4 w-4 mr-2" />
                Add Task
              </Button>
            </DialogTrigger>
            <DialogContent aria-describedby="create-task-description">
              <DialogHeader>
                <DialogTitle>Create New Task</DialogTitle>
              </DialogHeader>
              <p id="create-task-description" className="sr-only">
                Create a new individual task and assign it to a team member
              </p>
              
              <div className="space-y-4">
                <div>
                  <Label htmlFor="task_title">Task Title</Label>
                  <Input
                    id="task_title"
                    value={newTask.task_title}
                    onChange={(e) => setNewTask(prev => ({ ...prev, task_title: e.target.value }))}
                    placeholder="Enter task title"
                  />
                </div>
                
                <div>
                  <Label htmlFor="task_description">Description (Optional)</Label>
                  <Textarea
                    id="task_description"
                    value={newTask.task_description}
                    onChange={(e) => setNewTask(prev => ({ ...prev, task_description: e.target.value }))}
                    placeholder="Enter task description"
                    rows={3}
                  />
                </div>
                
                <div>
                  <Label htmlFor="assigned_to">Assign To</Label>
                  <Select value={newTask.assigned_to} onValueChange={(value) => setNewTask(prev => ({ ...prev, assigned_to: value }))}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select team member" />
                    </SelectTrigger>
                    <SelectContent>
                      {teamMembers?.map((member) => (
                        <SelectItem key={member.id} value={member.id}>
                          {member.full_name || member.email} ({member.role})
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                
                <Button 
                  onClick={handleCreateTask}
                  disabled={!newTask.task_title || !newTask.assigned_to || createTask.isPending}
                  className="w-full"
                >
                  {createTask.isPending ? 'Creating...' : 'Create Task'}
                </Button>
              </div>
            </DialogContent>
          </Dialog>
        )}
      </div>

      {tasks.length === 0 ? (
        <p className="text-gray-500 text-center py-4">No individual tasks assigned</p>
      ) : (
        <div className="space-y-3">
          {tasks.map((task) => {
            const isAssigned = task.assigned_to === user?.id;
            const canUpdate = canManageTasks || isAssigned;
            
            return (
              <Card key={task.id}>
                <CardContent className="p-4">
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex-1">
                      <div className="flex items-center space-x-2 mb-1">
                        <h4 className="font-medium">{task.task_title}</h4>
                        <Badge className={getStatusColor(task.status)}>
                          {getStatusIcon(task.status)}
                          <span className="ml-1">{task.status.replace('_', ' ').toUpperCase()}</span>
                        </Badge>
                      </div>
                      
                      {task.task_description && (
                        <p className="text-sm text-gray-600 mb-2">{task.task_description}</p>
                      )}
                      
                      <div className="text-xs text-gray-500">
                        Assigned to: {getAssignedMemberName(task.assigned_to)}
                      </div>
                    </div>
                    
                    {canManageTasks && (
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => deleteTask.mutate(task.id)}
                      >
                        <Trash className="h-4 w-4 text-red-500" />
                      </Button>
                    )}
                  </div>

                  {canUpdate && (
                    <div className="space-y-3">
                      <div className="flex space-x-2">
                        <Button
                          size="sm"
                          variant={task.status === 'todo' ? 'default' : 'outline'}
                          onClick={() => handleStatusUpdate(task.id, 'todo')}
                        >
                          Todo
                        </Button>
                        <Button
                          size="sm"
                          variant={task.status === 'started' ? 'default' : 'outline'}
                          onClick={() => handleStatusUpdate(task.id, 'started')}
                        >
                          Started
                        </Button>
                        <Button
                          size="sm"
                          variant={task.status === 'in_progress' ? 'default' : 'outline'}
                          onClick={() => handleStatusUpdate(task.id, 'in_progress')}
                        >
                          In Progress
                        </Button>
                        <Button
                          size="sm"
                          variant={task.status === 'completed' ? 'default' : 'outline'}
                          onClick={() => handleStatusUpdate(task.id, 'completed')}
                          className="bg-green-600 hover:bg-green-700"
                        >
                          Completed
                        </Button>
                      </div>

                      <ImageUpload
                        label="Upload Progress Photos"
                        images={taskImages[task.id] || task.images || []}
                        onImagesChange={(images) => setTaskImages(prev => ({ ...prev, [task.id]: images }))}
                        maxImages={5}
                      />
                    </div>
                  )}

                  {task.images && task.images.length > 0 && (
                    <div className="mt-3">
                      <Label className="text-sm font-medium">Progress Photos:</Label>
                      <div className="grid grid-cols-3 gap-2 mt-2">
                        {task.images.map((imageUrl, index) => (
                          <img
                            key={index}
                            src={imageUrl}
                            alt={`Progress ${index + 1}`}
                            className="w-full h-20 object-cover rounded border"
                          />
                        ))}
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default IndividualTaskManager;
