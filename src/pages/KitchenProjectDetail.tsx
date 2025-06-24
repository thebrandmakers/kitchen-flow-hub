
import React from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { ArrowLeft, ChefHat } from 'lucide-react';
import PhaseTaskTracker from '@/components/PhaseTaskTracker';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

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
          kitchen_clients(name, email)
        `)
        .eq('id', id)
        .single();
      
      if (error) throw error;
      return data;
    },
    enabled: !!id
  });

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
            <div className="text-right">
              <div className="text-sm text-gray-500">Budget: {project.budget_bracket}</div>
              <div className="text-sm text-gray-500">Phase: {project.current_phase}/6</div>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <PhaseTaskTracker projectId={id!} />
      </div>
    </div>
  );
};

export default KitchenProjectDetail;
