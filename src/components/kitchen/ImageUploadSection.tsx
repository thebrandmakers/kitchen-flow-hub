import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import ImageUpload from '@/components/ImageUpload';

interface ImageUploadSectionProps {
  existingKitchenImages: string[];
  referenceImages: string[];
  onExistingImagesChange: (images: string[]) => void;
  onReferenceImagesChange: (images: string[]) => void;
}

const ImageUploadSection: React.FC<ImageUploadSectionProps> = ({
  existingKitchenImages,
  referenceImages,
  onExistingImagesChange,
  onReferenceImagesChange
}) => {
  return (
    <>
      {/* Existing Kitchen Images */}
      <Card>
        <CardHeader>
          <CardTitle>Existing Kitchen Photos</CardTitle>
          <CardDescription>Upload photos of the current kitchen space</CardDescription>
        </CardHeader>
        <CardContent>
          <ImageUpload
            label="Current Kitchen Images"
            images={existingKitchenImages}
            onImagesChange={onExistingImagesChange}
            maxImages={8}
          />
        </CardContent>
      </Card>

      {/* Reference Images */}
      <Card>
        <CardHeader>
          <CardTitle>Reference Design Images</CardTitle>
          <CardDescription>Upload inspiration or reference images for the new kitchen design</CardDescription>
        </CardHeader>
        <CardContent>
          <ImageUpload
            label="Design Reference Images"
            images={referenceImages}
            onImagesChange={onReferenceImagesChange}
            maxImages={6}
          />
        </CardContent>
      </Card>
    </>
  );
};

export default ImageUploadSection;
