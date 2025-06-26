
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { ArrowLeft, ChefHat, Save } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from '@/hooks/use-toast';

const NewKitchenProject = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  const [formData, setFormData] = useState({
    clientName: '',
    clientEmail: '',
    clientPhone: '',
    clientAddress: '',
    kitchenShape: '',
    budgetBracket: '',
    materials: [] as string[]
  });

  const kitchenShapes = ['L-shape', 'U-shape', 'Parallel', 'Island', 'Straight'];
  const budgetBrackets = ['3-5 lakhs', '5-8 lakhs', '8-10+ lakhs'];
  const materialOptions = ['Plywood', 'MDF', 'HDHMR', 'Acrylic', 'Laminate'];

  const handleMaterialChange = (material: string, checked: boolean) => {
    if (checked) {
      setFormData(prev => ({
        ...prev,
        materials: [...prev.materials, material]
      }));
    } else {
      setFormData(prev => ({
        ...prev,
        materials: prev.materials.filter(m => m !== material)
      }));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!user) {
      toast({
        title: "Error",
        description: "You must be logged in to create a project",
        variant: "destructive"
      });
      return;
    }

    if (!formData.kitchenShape || !formData.budgetBracket || formData.materials.length === 0) {
      toast({
        title: "Error",
        description: "Please fill in all required fields",
        variant: "destructive"
      });
      return;
    }

    setIsSubmitting(true);

    try {
      // First create the kitchen client
      const { data: clientData, error: clientError } = await supabase
        .from('kitchen_clients')
        .insert({
          name: formData.clientName,
          email: formData.clientEmail,
          phone: formData.clientPhone,
          address: formData.clientAddress,
          client_id: `CLIENT-${Date.now()}`
        })
        .select()
        .single();

      if (clientError) {
        console.error('Client creation error:', clientError);
        throw clientError;
      }

      // Generate project reference using the database function
      const { data: referenceData, error: referenceError } = await supabase
        .rpc('generate_project_reference');

      if (referenceError) {
        console.error('Project reference generation error:', referenceError);
        throw referenceError;
      }

      // Then create the kitchen project
      const { data: projectData, error: projectError } = await supabase
        .from('kitchen_projects')
        .insert({
          client_id: clientData.id,
          kitchen_shape: formData.kitchenShape as "L-shape" | "U-shape" | "Parallel" | "Island" | "Straight",
          budget_bracket: formData.budgetBracket as "3-5 lakhs" | "5-8 lakhs" | "8-10+ lakhs",
          materials: formData.materials as ("Plywood" | "MDF" | "HDHMR" | "Acrylic" | "Laminate")[],
          project_reference: referenceData,
          status: 'intake'
        })
        .select()
        .single();

      if (projectError) {
        console.error('Project creation error:', projectError);
        throw projectError;
      }

      toast({
        title: "Success",
        description: "Kitchen project created successfully!",
      });

      // Redirect to projects page
      navigate('/projects');
      
    } catch (error: any) {
      console.error('Error creating kitchen project:', error);
      toast({
        title: "Error",
        description: error.message || "Failed to create kitchen project",
        variant: "destructive"
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <div className="flex items-center space-x-3">
              <Button variant="ghost" onClick={() => navigate('/projects')}>
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

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <form onSubmit={handleSubmit}>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Client Information</CardTitle>
                <CardDescription>Enter the client's contact details</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label htmlFor="clientName">Client Name *</Label>
                  <Input
                    id="clientName"
                    value={formData.clientName}
                    onChange={(e) => setFormData(prev => ({...prev, clientName: e.target.value}))}
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="clientEmail">Email *</Label>
                  <Input
                    id="clientEmail"
                    type="email"
                    value={formData.clientEmail}
                    onChange={(e) => setFormData(prev => ({...prev, clientEmail: e.target.value}))}
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="clientPhone">Phone *</Label>
                  <Input
                    id="clientPhone"
                    value={formData.clientPhone}
                    onChange={(e) => setFormData(prev => ({...prev, clientPhone: e.target.value}))}
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="clientAddress">Address *</Label>
                  <Input
                    id="clientAddress"
                    value={formData.clientAddress}
                    onChange={(e) => setFormData(prev => ({...prev, clientAddress: e.target.value}))}
                    required
                  />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Project Details</CardTitle>
                <CardDescription>Configure the kitchen project specifications</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label htmlFor="kitchenShape">Kitchen Shape *</Label>
                  <Select value={formData.kitchenShape} onValueChange={(value) => setFormData(prev => ({...prev, kitchenShape: value}))}>
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
                  <Select value={formData.budgetBracket} onValueChange={(value) => setFormData(prev => ({...prev, budgetBracket: value}))}>
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
