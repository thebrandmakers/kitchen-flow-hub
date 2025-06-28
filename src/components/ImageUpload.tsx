
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent } from '@/components/ui/card';
import { Upload, X, Image as ImageIcon } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/hooks/use-toast';

interface ImageUploadProps {
  label: string;
  images: string[];
  onImagesChange: (images: string[]) => void;
  maxImages?: number;
}

const ImageUpload: React.FC<ImageUploadProps> = ({
  label,
  images,
  onImagesChange,
  maxImages = 5
}) => {
  const [uploading, setUploading] = useState(false);

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (!files || files.length === 0) return;

    if (images.length + files.length > maxImages) {
      toast({
        title: "Error",
        description: `Maximum ${maxImages} images allowed`,
        variant: "destructive"
      });
      return;
    }

    setUploading(true);
    const uploadedUrls: string[] = [];

    try {
      for (const file of Array.from(files)) {
        if (!file.type.startsWith('image/')) {
          toast({
            title: "Error",
            description: "Please upload only image files",
            variant: "destructive"
          });
          continue;
        }

        const fileExt = file.name.split('.').pop();
        const fileName = `${Date.now()}-${Math.random().toString(36).substring(2)}.${fileExt}`;

        const { data, error } = await supabase.storage
          .from('kitchen-images')
          .upload(fileName, file);

        if (error) {
          console.error('Upload error:', error);
          toast({
            title: "Upload Error",
            description: `Failed to upload ${file.name}`,
            variant: "destructive"
          });
          continue;
        }

        // Get public URL
        const { data: urlData } = supabase.storage
          .from('kitchen-images')
          .getPublicUrl(fileName);

        if (urlData?.publicUrl) {
          uploadedUrls.push(urlData.publicUrl);
        }
      }

      if (uploadedUrls.length > 0) {
        onImagesChange([...images, ...uploadedUrls]);
        toast({
          title: "Success",
          description: `${uploadedUrls.length} image(s) uploaded successfully`,
        });
      }
    } catch (error) {
      console.error('Error uploading images:', error);
      toast({
        title: "Error",
        description: "Failed to upload images",
        variant: "destructive"
      });
    } finally {
      setUploading(false);
      // Reset input
      event.target.value = '';
    }
  };

  const removeImage = async (indexToRemove: number) => {
    const imageUrl = images[indexToRemove];
    
    try {
      // Extract filename from URL to delete from storage
      const urlParts = imageUrl.split('/');
      const fileName = urlParts[urlParts.length - 1];
      
      await supabase.storage
        .from('kitchen-images')
        .remove([fileName]);
    } catch (error) {
      console.error('Error deleting image:', error);
    }

    const updatedImages = images.filter((_, index) => index !== indexToRemove);
    onImagesChange(updatedImages);
  };

  return (
    <div className="space-y-4">
      <Label>{label}</Label>
      
      <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center">
        <Input
          type="file"
          accept="image/*"
          multiple
          onChange={handleFileUpload}
          disabled={uploading || images.length >= maxImages}
          className="hidden"
          id={`file-upload-${label.replace(/\s+/g, '-').toLowerCase()}`}
        />
        <Label
          htmlFor={`file-upload-${label.replace(/\s+/g, '-').toLowerCase()}`}
          className="cursor-pointer"
        >
          <div className="flex flex-col items-center space-y-2">
            <Upload className="h-8 w-8 text-gray-400" />
            <div className="text-sm text-gray-600">
              {uploading ? 'Uploading...' : `Click to upload images (max ${maxImages})`}
            </div>
            <div className="text-xs text-gray-500">
              PNG, JPG, GIF up to 10MB each
            </div>
          </div>
        </Label>
      </div>

      {images.length > 0 && (
        <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
          {images.map((imageUrl, index) => (
            <Card key={index} className="relative">
              <CardContent className="p-2">
                <div className="relative aspect-square">
                  <img
                    src={imageUrl}
                    alt={`Uploaded image ${index + 1}`}
                    className="w-full h-full object-cover rounded"
                  />
                  <Button
                    variant="destructive"
                    size="sm"
                    className="absolute -top-2 -right-2 rounded-full w-6 h-6 p-0"
                    onClick={() => removeImage(index)}
                  >
                    <X className="h-3 w-3" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
};

export default ImageUpload;
