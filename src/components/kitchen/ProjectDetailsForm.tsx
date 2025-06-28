
import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';

interface ProjectFormData {
  kitchenShape: string;
  budgetBracket: string;
  materials: string[];
}

interface ProjectDetailsFormProps {
  formData: ProjectFormData;
  onFormDataChange: (updates: Partial<ProjectFormData>) => void;
}

const ProjectDetailsForm: React.FC<ProjectDetailsFormProps> = ({
  formData,
  onFormDataChange
}) => {
  const kitchenShapes = ['L-shape', 'U-shape', 'Parallel', 'Island', 'Straight'];
  const budgetBrackets = ['3-5 lakhs', '5-8 lakhs', '8-10+ lakhs'];
  const materialOptions = ['Plywood', 'MDF', 'HDHMR', 'Acrylic', 'Laminate'];

  const handleMaterialChange = (material: string, checked: boolean) => {
    const updatedMaterials = checked
      ? [...formData.materials, material]
      : formData.materials.filter(m => m !== material);
    
    onFormDataChange({ materials: updatedMaterials });
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Project Details</CardTitle>
        <CardDescription>Configure the kitchen project specifications</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div>
          <Label htmlFor="kitchenShape">Kitchen Shape *</Label>
          <Select 
            value={formData.kitchenShape} 
            onValueChange={(value) => onFormDataChange({ kitchenShape: value })}
          >
            <SelectTrigger>
              <SelectValue placeholder="Select kitchen shape" />
            </SelectTrigger>
            <SelectContent>
              {kitchenShapes.map((shape) => (
                <SelectItem key={shape} value={shape}>
                  {shape}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div>
          <Label htmlFor="budgetBracket">Budget Bracket *</Label>
          <Select 
            value={formData.budgetBracket} 
            onValueChange={(value) => onFormDataChange({ budgetBracket: value })}
          >
            <SelectTrigger>
              <SelectValue placeholder="Select budget bracket" />
            </SelectTrigger>
            <SelectContent>
              {budgetBrackets.map((bracket) => (
                <SelectItem key={bracket} value={bracket}>
                  {bracket}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div>
          <Label>Materials * (Select at least one)</Label>
          <div className="grid grid-cols-2 gap-2 mt-2">
            {materialOptions.map((material) => (
              <div key={material} className="flex items-center space-x-2">
                <Checkbox
                  id={material}
                  checked={formData.materials.includes(material)}
                  onCheckedChange={(checked) => handleMaterialChange(material, checked as boolean)}
                />
                <Label htmlFor={material} className="text-sm">
                  {material}
                </Label>
              </div>
            ))}
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default ProjectDetailsForm;
