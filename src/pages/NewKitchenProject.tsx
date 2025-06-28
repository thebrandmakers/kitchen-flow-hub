
import React from 'react';
import { Button } from '@/components/ui/button';
import { ArrowLeft, ChefHat, Save } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useKitchenProjectForm } from '@/hooks/useKitchenProjectForm';
import ClientInformationForm from '@/components/kitchen/ClientInformationForm';
import ProjectDetailsForm from '@/components/kitchen/ProjectDetailsForm';
import ImageUploadSection from '@/components/kitchen/ImageUploadSection';

const NewKitchenProject = () => {
  const navigate = useNavigate();
  const { formData, updateFormData, handleSubmit, isSubmitting } = useKitchenProjectForm();

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <div className="flex items-center space-x-3">
              <Button variant="ghost" onClick={() => navigate('/kitchen-projects')}>
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back to Projects
              </Button>
              <ChefHat className="h-8 w-8 text-orange-600" />
              <div>
                <h1 className="text-2xl font-bold text-gray-900">New Kitchen Project</h1>
                <p className="text-sm text-gray-500">Create a new modular kitchen project</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <form onSubmit={handleSubmit}>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <ClientInformationForm
              formData={{
                clientName: formData.clientName,
                clientEmail: formData.clientEmail,
                clientPhone: formData.clientPhone,
                clientAddress: formData.clientAddress
              }}
              onFormDataChange={updateFormData}
            />

            <ProjectDetailsForm
              formData={{
                kitchenShape: formData.kitchenShape,
                budgetBracket: formData.budgetBracket,
                materials: formData.materials
              }}
              onFormDataChange={updateFormData}
            />

            <ImageUploadSection
              existingKitchenImages={formData.existingKitchenImages}
              referenceImages={formData.referenceImages}
              onExistingImagesChange={(images) => updateFormData({ existingKitchenImages: images })}
              onReferenceImagesChange={(images) => updateFormData({ referenceImages: images })}
            />
          </div>

          <div className="mt-6 flex justify-end">
            <Button type="submit" disabled={isSubmitting} size="lg">
              <Save className="h-4 w-4 mr-2" />
              {isSubmitting ? 'Creating Project...' : 'Create Kitchen Project'}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default NewKitchenProject;
