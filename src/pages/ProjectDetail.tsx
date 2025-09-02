import React from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { format } from 'date-fns';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Separator } from '@/components/ui/separator';
import { ArrowLeft, Calendar, FileText, Users, CheckCircle, Clock, AlertCircle, Download } from 'lucide-react';

const ProjectDetail = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  const { data: project, isLoading } = useQuery({
    queryKey: ['project-detail', id],
    queryFn: async () => {
      if (!id) throw new Error('Project ID is required');
      
      const { data, error } = await supabase
        .from('projects')
        .select(`
          *,
          tasks(*),
          files(*),
          reports(*)
        `)
        .eq('id', id)
        .single();
      
      if (error) throw error;
      return data;
    },
    enabled: !!id
  });

  const getStageColor = (stage: string) => {
    switch (stage) {
      case 'quotation': return 'bg-blue-100 text-blue-800';
      case 'design': return 'bg-purple-100 text-purple-800';
      case 'production': return 'bg-orange-100 text-orange-800';
      case 'installation': return 'bg-green-100 text-green-800';
      case 'completed': return 'bg-gray-100 text-gray-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getTaskStatusColor = (status: string) => {
    switch (status) {
      case 'todo': return 'bg-gray-100 text-gray-800';
      case 'in_progress': return 'bg-blue-100 text-blue-800';
      case 'done': return 'bg-green-100 text-green-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getProgressPercentage = () => {
    if (!project?.tasks?.length) return 0;
    const completedTasks = project.tasks.filter(task => task.status === 'done').length;
    return Math.round((completedTasks / project.tasks.length) * 100);
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary mx-auto"></div>
          <p className="mt-4 text-muted-foreground">Loading project details...</p>
        </div>
      </div>
    );
  }

  if (!project) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-foreground mb-2">Project Not Found</h2>
          <p className="text-muted-foreground mb-4">The project you're looking for doesn't exist.</p>
          <Button onClick={() => navigate('/projects')}>
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Projects
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
              <Button variant="ghost" onClick={() => navigate('/projects')}>
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back to Projects
              </Button>
              <div>
                <h1 className="text-2xl font-bold text-foreground">{project.name}</h1>
                <p className="text-sm text-muted-foreground">Project Details</p>
              </div>
            </div>
            <Badge className={getStageColor(project.stage)}>
              {project.stage.charAt(0).toUpperCase() + project.stage.slice(1)}
            </Badge>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            {/* Project Overview */}
            <Card>
              <CardHeader>
                <CardTitle>Project Overview</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <h3 className="font-medium text-foreground mb-2">Description</h3>
                  <p className="text-muted-foreground">{project.description || 'No description provided'}</p>
                </div>
                
                <Separator />
                
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm text-muted-foreground">Start Date</p>
                    <p className="font-medium">
                      {project.start_date ? format(new Date(project.start_date), 'MMM dd, yyyy') : 'Not set'}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">End Date</p>
                    <p className="font-medium">
                      {project.end_date ? format(new Date(project.end_date), 'MMM dd, yyyy') : 'Not set'}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Budget</p>
                    <p className="font-medium">{project.budget ? `$${project.budget.toLocaleString()}` : 'Not set'}</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Current Stage</p>
                    <Badge className={getStageColor(project.stage)}>
                      {project.stage.charAt(0).toUpperCase() + project.stage.slice(1)}
                    </Badge>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Progress */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <CheckCircle className="h-5 w-5 mr-2" />
                  Project Progress
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span>Completion</span>
                    <span>{getProgressPercentage()}%</span>
                  </div>
                  <Progress value={getProgressPercentage()} className="w-full" />
                  <p className="text-xs text-muted-foreground">
                    {project.tasks?.filter(task => task.status === 'done').length || 0} of {project.tasks?.length || 0} tasks completed
                  </p>
                </div>
              </CardContent>
            </Card>

            {/* Tasks */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Clock className="h-5 w-5 mr-2" />
                  Tasks ({project.tasks?.length || 0})
                </CardTitle>
              </CardHeader>
              <CardContent>
                {project.tasks && project.tasks.length > 0 ? (
                  <div className="space-y-3">
                    {project.tasks.map((task) => (
                      <div 
                        key={task.id} 
                        className="flex items-center justify-between p-3 border rounded-lg cursor-pointer hover:bg-accent/50 transition-colors"
                        onClick={() => navigate(`/tasks/${task.id}`)}
                      >
                        <div className="flex-1">
                          <h4 className="font-medium text-foreground">{task.title}</h4>
                          <p className="text-sm text-muted-foreground">{task.description}</p>
                          {task.due_date && (
                            <p className="text-xs text-muted-foreground mt-1">
                              Due: {format(new Date(task.due_date), 'MMM dd, yyyy')}
                            </p>
                          )}
                        </div>
                        <Badge className={getTaskStatusColor(task.status)}>
                          {task.status.replace('_', ' ').toUpperCase()}
                        </Badge>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-muted-foreground text-center py-4">No tasks assigned to this project</p>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Project Files */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <FileText className="h-5 w-5 mr-2" />
                  Files ({project.files?.length || 0})
                </CardTitle>
              </CardHeader>
              <CardContent>
                {project.files && project.files.length > 0 ? (
                  <div className="space-y-2">
                    {project.files.map((file) => (
                      <div key={file.id} className="flex items-center justify-between p-2 border rounded">
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium text-foreground truncate">{file.name}</p>
                          <p className="text-xs text-muted-foreground">
                            {file.file_size ? `${(file.file_size / 1024).toFixed(1)} KB` : 'Unknown size'}
                          </p>
                        </div>
                        <Button variant="ghost" size="sm" asChild>
                          <a href={file.file_url} download>
                            <Download className="h-4 w-4" />
                          </a>
                        </Button>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-muted-foreground text-center py-4">No files uploaded</p>
                )}
              </CardContent>
            </Card>

            {/* Reports */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Users className="h-5 w-5 mr-2" />
                  Reports ({project.reports?.length || 0})
                </CardTitle>
              </CardHeader>
              <CardContent>
                {project.reports && project.reports.length > 0 ? (
                  <div className="space-y-3">
                    {project.reports.map((report) => (
                      <div key={report.id} className="p-3 border rounded-lg">
                        <h4 className="font-medium text-foreground">{report.title}</h4>
                        <p className="text-sm text-muted-foreground mt-1">{report.description}</p>
                        <p className="text-xs text-muted-foreground mt-2">
                          {format(new Date(report.created_at), 'MMM dd, yyyy')}
                        </p>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-muted-foreground text-center py-4">No reports available</p>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProjectDetail;