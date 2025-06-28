
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { UserPlus, Users } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from '@/hooks/use-toast';
import { useQuery } from '@tanstack/react-query';

interface TaskAssignmentProps {
  projectId: string;
  phaseId: string;
  currentAssignedTo?: string;
  onAssignmentChange?: () => void;
}

const TaskAssignment: React.FC<TaskAssignmentProps> = ({
  projectId,
  phaseId,
  currentAssignedTo,
  onAssignmentChange
}) => {
  const { user } = useAuth();
  const [isAssigning, setIsAssigning] = useState(false);
  const [selectedUser, setSelectedUser] = useState('');
  const [notes, setNotes] = useState('');

  // Fetch available team members
  const { data: teamMembers } = useQuery({
    queryKey: ['team-members'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('profiles')
        .select('id, full_name, email, role')
        .in('role', ['designer', 'worker'])
        .order('full_name');
      
      if (error) throw error;
      return data;
    }
  });

  const handleAssignment = async () => {
    if (!selectedUser || !user) return;

    setIsAssigning(true);
    try {
      // Update the phase assignment
      const { error: phaseError } = await supabase
        .from('kitchen_project_phases')
        .update({
          assigned_to: selectedUser,
          assigned_by: user.id,
          assigned_at: new Date().toISOString()
        })
        .eq('id', phaseId);

      if (phaseError) throw phaseError;

      // Create assignment record
      const { error: assignmentError } = await supabase
        .from('kitchen_project_assignments')
        .insert({
          project_id: projectId,
          phase_id: phaseId,
          assigned_to: selectedUser,
          assigned_by: user.id,
          notes: notes || null
        });

      if (assignmentError) throw assignmentError;

      toast({
        title: "Success",
        description: "Phase assigned successfully",
      });

      setSelectedUser('');
      setNotes('');
      onAssignmentChange?.();
    } catch (error) {
      console.error('Assignment error:', error);
      toast({
        title: "Error",
        description: "Failed to assign phase",
        variant: "destructive"
      });
    } finally {
      setIsAssigning(false);
    }
  };

  const assignedMember = teamMembers?.find(member => member.id === currentAssignedTo);

  return (
    <div className="space-y-4 p-4 border rounded-lg bg-gray-50">
      <div className="flex items-center space-x-2">
        <Users className="h-4 w-4" />
        <Label className="font-medium">Phase Assignment</Label>
      </div>

      {assignedMember ? (
        <div className="space-y-2">
          <div className="text-sm">
            <span className="text-gray-600">Assigned to: </span>
            <span className="font-medium">{assignedMember.full_name || assignedMember.email}</span>
          </div>
          <div className="text-xs text-gray-500">
            Role: {assignedMember.role}
          </div>
        </div>
      ) : (
        <div className="space-y-3">
          <div>
            <Label htmlFor="assignee">Assign to Team Member</Label>
            <Select value={selectedUser} onValueChange={setSelectedUser}>
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

          <div>
            <Label htmlFor="notes">Assignment Notes (Optional)</Label>
            <Textarea
              id="notes"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Add any specific instructions or notes for this assignment..."
              rows={3}
            />
          </div>

          <Button 
            onClick={handleAssignment}
            disabled={!selectedUser || isAssigning}
            size="sm"
            className="w-full"
          >
            <UserPlus className="h-4 w-4 mr-2" />
            {isAssigning ? 'Assigning...' : 'Assign Phase'}
          </Button>
        </div>
      )}
    </div>
  );
};

export default TaskAssignment;
