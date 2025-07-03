import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { MessageSquare, Upload, CheckCircle } from 'lucide-react';
import { useTaskUpdates } from '@/hooks/useTaskUpdates';
import ImageUpload from '@/components/ImageUpload';
import { format } from 'date-fns';

interface TaskUpdateDialogProps {
  taskId: string;
  taskName: string;
  onTaskComplete?: () => void;
  canUpdate: boolean;
}

const TaskUpdateDialog: React.FC<TaskUpdateDialogProps> = ({
  taskId,
  taskName,
  onTaskComplete,
  canUpdate
}) => {
  const [message, setMessage] = useState('');
  const [images, setImages] = useState<string[]>([]);
  const [open, setOpen] = useState(false);
  
  const { updates, isLoading, addUpdate } = useTaskUpdates(taskId);

  const handleSubmitUpdate = async () => {
    if (!message.trim()) return;

    try {
      await addUpdate.mutateAsync({ message, images });
      setMessage('');
      setImages([]);
    } catch (error) {
      console.error('Failed to submit update:', error);
    }
  };

  const handleCompleteTask = () => {
    onTaskComplete?.();
    setOpen(false);
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm">
          <MessageSquare className="h-4 w-4 mr-2" />
          Updates ({updates.length})
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <MessageSquare className="h-5 w-5" />
            Task Updates: {taskName}
          </DialogTitle>
        </DialogHeader>
        
        <div className="space-y-6">
          {/* Add Update Section */}
          {canUpdate && (
            <div className="space-y-4 p-4 border rounded-lg bg-gray-50">
              <div className="flex items-center justify-between">
                <Label className="text-sm font-medium">Share Update</Label>
                <Button 
                  onClick={handleCompleteTask}
                  className="bg-green-600 hover:bg-green-700"
                  size="sm"
                >
                  <CheckCircle className="h-4 w-4 mr-2" />
                  Mark as Done
                </Button>
              </div>
              
              <div>
                <Label htmlFor="update-message">Update Message</Label>
                <Textarea
                  id="update-message"
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  placeholder="Share your progress, challenges, or completion status..."
                  rows={3}
                />
              </div>

              <ImageUpload
                label="Attach Images"
                images={images}
                onImagesChange={setImages}
                maxImages={3}
              />

              <Button 
                onClick={handleSubmitUpdate}
                disabled={!message.trim() || addUpdate.isPending}
                className="w-full"
              >
                <Upload className="h-4 w-4 mr-2" />
                {addUpdate.isPending ? 'Sharing...' : 'Share Update'}
              </Button>
            </div>
          )}

          {/* Updates List */}
          <div className="space-y-4">
            <Label className="text-sm font-medium">All Updates</Label>
            
            {isLoading ? (
              <div className="text-center py-4">
                <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600 mx-auto"></div>
                <p className="mt-2 text-sm text-gray-600">Loading updates...</p>
              </div>
            ) : updates.length > 0 ? (
              <div className="space-y-3 max-h-96 overflow-y-auto">
                {updates.map((update) => (
                  <div key={update.id} className="p-4 border rounded-lg bg-white">
                    <div className="flex items-start gap-3">
                      <Avatar className="h-8 w-8">
                        <AvatarImage src={update.profiles.avatar_url || ''} />
                        <AvatarFallback>
                          {update.profiles.full_name
                            ? update.profiles.full_name.split(' ').map(n => n[0]).join('').toUpperCase()
                            : 'U'
                          }
                        </AvatarFallback>
                      </Avatar>
                      
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                          <span className="font-medium text-sm">
                            {update.profiles.full_name}
                          </span>
                          <Badge variant="outline" className="text-xs">
                            {format(new Date(update.created_at), 'MMM dd, HH:mm')}
                          </Badge>
                        </div>
                        
                        <p className="text-sm text-gray-700 mb-3">{update.message}</p>
                        
                        {update.images && update.images.length > 0 && (
                          <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                            {update.images.map((imageUrl, index) => (
                              <img
                                key={index}
                                src={imageUrl}
                                alt={`Update image ${index + 1}`}
                                className="w-full h-20 object-cover rounded border"
                              />
                            ))}
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8 text-gray-500">
                <MessageSquare className="h-8 w-8 mx-auto mb-2 opacity-50" />
                <p>No updates yet</p>
              </div>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default TaskUpdateDialog;