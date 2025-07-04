import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { CheckCircle, Upload } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from '@/hooks/use-toast';
import ImageUpload from '@/components/ImageUpload';

interface PhaseCompletionButtonProps {
  phaseId: string;
  phaseName: string;
  isCompleted: boolean;
  onPhaseComplete?: () => void;
  canComplete: boolean;
}

const PhaseCompletionButton: React.FC<PhaseCompletionButtonProps> = ({
  phaseId,
  phaseName,
  isCompleted,
  onPhaseComplete,
  canComplete
}) => {
  const { user } = useAuth();
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [completionNotes, setCompletionNotes] = useState('');
  const [completionImages, setCompletionImages] = useState<string[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmitCompletion = async () => {
    if (!user) return;

    setIsSubmitting(true);
    try {
      // Update phase status to completed
      const { error: phaseError } = await supabase
        .from('kitchen_project_phases')
        .update({
          status: 'done',
          completed_at: new Date().toISOString()
        })
        .eq('id', phaseId);

      if (phaseError) throw phaseError;

      // Create a completion record (using task_updates table for now)
      const { error: updateError } = await supabase
        .from('task_updates')
        .insert({
          task_id: null, // We'll use this for phase completion tracking
          user_id: user.id,
          message: `Phase "${phaseName}" marked as completed. ${completionNotes || ''}`,
          images: completionImages
        });

      if (updateError) {
        console.warn('Failed to create completion record:', updateError);
      }

      toast({
        title: "Success",
        description: `Phase "${phaseName}" has been marked as completed`,
      });

      setIsDialogOpen(false);
      setCompletionNotes('');
      setCompletionImages([]);
      onPhaseComplete?.();
    } catch (error) {
      console.error('Failed to complete phase:', error);
      toast({
        title: "Error",
        description: "Failed to mark phase as completed",
        variant: "destructive"
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isCompleted) {
    return (
      <Button variant="outline" disabled className="bg-green-50 border-green-200 text-green-700">
        <CheckCircle className="h-4 w-4 mr-2" />
        Phase Completed
      </Button>
    );
  }

  if (!canComplete) {
    return null;
  }

  return (
    <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
      <DialogTrigger asChild>
        <Button className="bg-green-600 hover:bg-green-700">
          <CheckCircle className="h-4 w-4 mr-2" />
          Mark Phase Complete
        </Button>
      </DialogTrigger>
      <DialogContent aria-describedby="phase-completion-description">
        <DialogHeader>
          <DialogTitle>Complete Phase: {phaseName}</DialogTitle>
        </DialogHeader>
        <p id="phase-completion-description" className="sr-only">
          Mark this phase as completed with optional notes and photos
        </p>
        
        <div className="space-y-4">
          <p className="text-sm text-gray-600">
            You are about to mark this phase as completed. This action will update the project status and notify relevant team members.
          </p>
          
          <div>
            <Label htmlFor="completion-notes">Completion Notes (Optional)</Label>
            <Textarea
              id="completion-notes"
              value={completionNotes}
              onChange={(e) => setCompletionNotes(e.target.value)}
              placeholder="Add any final notes about the phase completion..."
              rows={3}
            />
          </div>

          <ImageUpload
            label="Final Photos"
            images={completionImages}
            onImagesChange={setCompletionImages}
            maxImages={5}
          />

          <div className="flex space-x-2">
            <Button 
              onClick={handleSubmitCompletion}
              disabled={isSubmitting}
              className="flex-1 bg-green-600 hover:bg-green-700"
            >
              <Upload className="h-4 w-4 mr-2" />
              {isSubmitting ? 'Submitting...' : 'Submit Completion'}
            </Button>
            <Button 
              variant="outline" 
              onClick={() => setIsDialogOpen(false)}
              className="flex-1"
            >
              Cancel
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default PhaseCompletionButton;