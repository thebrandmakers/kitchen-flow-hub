import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { CheckCircle, Clock, PlayCircle, AlertCircle } from 'lucide-react';
import { format } from 'date-fns';

interface PhaseProgressIndicatorProps {
  phases: Array<{
    id: string;
    phase_name: string;
    phase_number: number;
    status: 'todo' | 'in_progress' | 'done';
    completed_at?: string;
    started_at?: string;
    assigned_to?: string;
    profiles?: {
      full_name: string;
      email: string;
    } | null;
  }>;
}

const PhaseProgressIndicator: React.FC<PhaseProgressIndicatorProps> = ({ phases }) => {
  const getPhaseIcon = (status: string) => {
    switch (status) {
      case 'done': return <CheckCircle className="h-5 w-5 text-green-600" />;
      case 'in_progress': return <PlayCircle className="h-5 w-5 text-blue-600" />;
      case 'todo': return <Clock className="h-5 w-5 text-gray-400" />;
      default: return <AlertCircle className="h-5 w-5 text-yellow-600" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'done': return 'bg-green-100 text-green-800';
      case 'in_progress': return 'bg-blue-100 text-blue-800';
      case 'todo': return 'bg-gray-100 text-gray-800';
      default: return 'bg-yellow-100 text-yellow-800';
    }
  };

  const formatPhaseName = (phaseName: string) => {
    return phaseName.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase());
  };

  const completedPhases = phases.filter(p => p.status === 'done').length;
  const totalPhases = phases.length;
  const progressPercentage = (completedPhases / totalPhases) * 100;

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <span>Phase Progress</span>
          <span className="text-sm font-normal text-gray-500">
            {completedPhases}/{totalPhases} Complete
          </span>
        </CardTitle>
        <div className="w-full bg-gray-200 rounded-full h-2">
          <div 
            className="bg-green-600 h-2 rounded-full transition-all duration-300"
            style={{ width: `${progressPercentage}%` }}
          />
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {phases.map((phase) => (
            <div key={phase.id} className="flex items-center justify-between p-3 border rounded-lg">
              <div className="flex items-center space-x-3">
                {getPhaseIcon(phase.status)}
                <div>
                  <h4 className="font-medium text-sm">
                    Phase {phase.phase_number}: {formatPhaseName(phase.phase_name)}
                  </h4>
                  {phase.profiles && (
                    <p className="text-xs text-gray-500">
                      Assigned to: {phase.profiles.full_name || phase.profiles.email}
                    </p>
                  )}
                  {phase.completed_at && (
                    <p className="text-xs text-green-600">
                      Completed: {format(new Date(phase.completed_at), 'MMM dd, yyyy HH:mm')}
                    </p>
                  )}
                  {phase.started_at && !phase.completed_at && (
                    <p className="text-xs text-blue-600">
                      Started: {format(new Date(phase.started_at), 'MMM dd, yyyy HH:mm')}
                    </p>
                  )}
                </div>
              </div>
              <Badge className={getStatusColor(phase.status)}>
                {phase.status === 'in_progress' ? 'In Progress' : 
                 phase.status === 'done' ? 'Completed' : 'To Do'}
              </Badge>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
};

export default PhaseProgressIndicator;