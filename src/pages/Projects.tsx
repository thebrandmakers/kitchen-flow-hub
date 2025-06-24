
import React from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Building2, ArrowLeft, Plus, Eye, ChefHat } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { format } from 'date-fns';

const Projects = () => {
  const navigate = useNavigate();

  const { data: projects, isLoading } = useQuery({
    queryKey: ['kitchen-projects'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('kitchen_projects')
        .select(`
          *,
          kitchen_clients(name, email)
        `)
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      return data;
    }
  });

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'intake': return 'bg-blue-100 text-blue-800';
      case 'design': return 'bg-purple-100 text-purple-800';
      case 'confirmation': return 'bg-yellow-100 text-yellow-800';
      case 'production_prep': return 'bg-orange-100 text-orange-800';
      case 'factory': return 'bg-indigo-100 text-indigo-800';
      case 'installation': return 'bg-green-100 text-green-800';
      case 'closure': return 'bg-gray-100 text-gray-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const formatStatus = (status: string) => {
    return status.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase());
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading projects...</p>
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
                <h1 className="text-2xl font-bold text-gray-900">Kitchen Projects</h1>
                <p className="text-sm text-gray-500">Manage your modular kitchen projects</p>
              </div>
            </div>
            <Button onClick={() => navigate('/kitchen-projects/new')}>
              <Plus className="h-4 w-4 mr-2" />
              New Kitchen Project
            </Button>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {projects && projects.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {projects.map((project) => (
              <Card key={project.id} className="cursor-pointer hover:shadow-md transition-shadow">
                <CardHeader>
                  <div className="flex justify-between items-start">
                    <div className="flex-1">
                      <CardTitle className="text-lg flex items-center">
                        <ChefHat className="h-5 w-5 mr-2 text-orange-600" />
                        {project.project_reference}
                      </CardTitle>
                      <CardDescription className="mt-1">
                        {project.kitchen_clients?.name || 'Unknown Client'}
                      </CardDescription>
                    </div>
                    <Badge className={getStatusColor(project.status || 'intake')}>
                      {formatStatus(project.status || 'intake')}
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-500">Shape:</span>
                      <span className="font-medium">{project.kitchen_shape}</span>
                    </div>
                    
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-500">Budget:</span>
                      <span className="font-medium">
                        {project.budget_bracket.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase())}
                      </span>
                    </div>
                    
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-500">Materials:</span>
                      <span className="font-medium text-right">
                        {project.materials?.slice(0, 2).join(', ')}
                        {project.materials?.length > 2 && ` +${project.materials.length - 2} more`}
                      </span>
                    </div>
                    
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-500">Created:</span>
                      <span className="font-medium">
                        {format(new Date(project.created_at), 'MMM dd, yyyy')}
                      </span>
                    </div>
                    
                    <div className="pt-2 flex space-x-2">
                      <Button 
                        variant="outline" 
                        size="sm" 
                        className="flex-1"
                        onClick={() => navigate(`/kitchen-projects/${project.id}`)}
                      >
                        <Eye className="h-4 w-4 mr-1" />
                        View Details
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        ) : (
          <div className="text-center py-12">
            <ChefHat className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No Kitchen Projects Found</h3>
            <p className="text-gray-500 mb-6">Get started by creating your first modular kitchen project.</p>
            <Button onClick={() => navigate('/kitchen-projects/new')}>
              <Plus className="h-4 w-4 mr-2" />
              Create Kitchen Project
            </Button>
          </div>
        )}
      </div>
    </div>
  );
};

export default Projects;
