
import React from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ArrowLeft, ChefHat, User, Phone, Mail, MapPin, Calendar, DollarSign } from 'lucide-react';
import PhaseTaskTracker from '@/components/PhaseTaskTracker';
import PhaseProgressIndicator from '@/components/PhaseProgressIndicator';
import NotificationBell from '@/components/NotificationBell';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { format } from 'date-fns';

const KitchenProjectDetail = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  const { data: project, isLoading } = useQuery({
    queryKey: ['kitchen-project', id],
    queryFn: async () => {
      if (!id) throw new Error('Project ID is required');
      
      const { data, error } = await supabase
        .from('kitchen_projects')
        .select(`
          *,
          kitchen_clients(name, email, phone, address)
        `)
        .eq('id', id)
        .single();
      
      if (error) throw error;
      return data;
    },
    enabled: !!id
  });

  const { data: phases } = useQuery({
    queryKey: ['kitchen-project-phases', id],
    queryFn: async () => {
      if (!id) throw new Error('Project ID is required');
      
      const { data, error } = await supabase
        .from('kitchen_project_phases')
        .select(`
          *,
          assigned_profile:profiles!kitchen_project_phases_assigned_to_fkey(full_name, email)
        `)
        .eq('project_id', id)
        .order('phase_number');
      
      if (error) throw error;
      return data;
    },
    enabled: !!id
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
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-orange-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading kitchen project...</p>
        </div>
      </div>
    );
  }

  if (!project) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <ChefHat className="h-16 w-16 text-gray-400 mx-auto mb-4" />
          <h2 className="text-xl font-semibold text-gray-900 mb-2">Project Not Found</h2>
          <p className="text-gray-600 mb-6">The kitchen project you're looking for doesn't exist.</p>
          <Button onClick={() => navigate('/kitchen-projects')}>
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Kitchen Projects
          </Button>
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
              <Button variant="ghost" onClick={() => navigate('/kitchen-projects')}>
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back to Kitchen Projects
              </Button>
              <ChefHat className="h-8 w-8 text-orange-600" />
              <div>
                <h1 className="text-2xl font-bold text-gray-900">{project.project_reference}</h1>
                <p className="text-sm text-gray-500">
                  {project.kitchen_clients?.name || 'Kitchen Project'} - {project.kitchen_shape} Kitchen
                </p>
              </div>
            </div>
            <div className="flex items-center space-x-4">
              <NotificationBell />
              <div className="text-right">
                <Badge className={getStatusColor(project.status || 'intake')}>
                  {formatStatus(project.status || 'intake')}
                </Badge>
                <div className="text-sm text-gray-500 mt-1">Phase: {project.current_phase || 1}/6</div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
          {/* Client Information */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <User className="h-5 w-5 mr-2" />
                Client Information
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex items-center space-x-2">
                <User className="h-4 w-4 text-gray-400" />
                <span className="font-medium">{project.kitchen_clients?.name || 'N/A'}</span>
              </div>
              <div className="flex items-center space-x-2">
                <Mail className="h-4 w-4 text-gray-400" />
                <span className="text-sm">{project.kitchen_clients?.email || 'N/A'}</span>
              </div>
              <div className="flex items-center space-x-2">
                <Phone className="h-4 w-4 text-gray-400" />
                <span className="text-sm">{project.kitchen_clients?.phone || 'N/A'}</span>
              </div>
              <div className="flex items-start space-x-2">
                <MapPin className="h-4 w-4 text-gray-400 mt-0.5" />
                <span className="text-sm">{project.kitchen_clients?.address || 'N/A'}</span>
              </div>
            </CardContent>
          </Card>

          {/* Project Details */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <ChefHat className="h-5 w-5 mr-2" />
                Project Details
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div>
                <span className="text-sm text-gray-500">Kitchen Shape:</span>
                <p className="font-medium">{project.kitchen_shape}</p>
              </div>
              <div>
                <span className="text-sm text-gray-500">Budget Bracket:</span>
                <p className="font-medium">{project.budget_bracket}</p>
              </div>
              <div>
                <span className="text-sm text-gray-500">Materials:</span>
                <div className="flex flex-wrap gap-1 mt-1">
                  {project.materials?.map((material, index) => (
                    <Badge key={index} variant="outline" className="text-xs">
                      {material}
                    </Badge>
                  ))}
                </div>
              </div>
              <div>
                <span className="text-sm text-gray-500">Current Phase:</span>
                <p className="font-medium">{project.current_phase || 1} of 6</p>
              </div>
            </CardContent>
          </Card>

          {/* Timeline */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Calendar className="h-5 w-5 mr-2" />
                Timeline
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div>
                <span className="text-sm text-gray-500">Created:</span>
                <p className="font-medium">
                  {format(new Date(project.created_at), 'MMM dd, yyyy')}
                </p>
              </div>
              <div>
                <span className="text-sm text-gray-500">Last Updated:</span>
                <p className="font-medium">
                  {format(new Date(project.updated_at), 'MMM dd, yyyy')}
                </p>
              </div>
              <div>
                <span className="text-sm text-gray-500">Project Reference:</span>
                <p className="font-medium font-mono text-sm">{project.project_reference}</p>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Phase Progress */}
        {phases && <PhaseProgressIndicator phases={phases.map(phase => ({
          ...phase,
          profiles: Array.isArray(phase.assigned_profile) && phase.assigned_profile.length > 0 
            ? phase.assigned_profile[0] 
            : null
        }))} />}
        
        {/* Phase Task Tracker */}
        <div className="mt-6">
          <PhaseTaskTracker projectId={id!} />
        </div>
      </div>
    </div>
  );
};

export default KitchenProjectDetail;
