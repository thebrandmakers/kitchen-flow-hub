
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { ArrowLeft, ChefHat, Upload } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { Checkbox } from '@/components/ui/checkbox';

const NewKitchenProject = () => {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  
  const [formData, setFormData] = useState({
    clientName: '',
    clientEmail: '',
    clientPhone: '',
    clientAddress: '',
    kitchenShape: '',
    materials: [] as string[],
    budgetBracket: '',
    intakePdf: null as File | null
  });

  const kitchenShapes = ['L-shape', 'U-shape', 'Parallel', 'Island', 'Straight'];
  const materials = ['Plywood', 'MDF', 'HDHMR', 'Acrylic', 'Laminate'];
  const budgetBrackets = ['3-5 lakhs', '5-8 lakhs', '8-10+ lakhs'];

  const createProject = useMutation({
    mutationFn: async (data: typeof formData) => {
      // First create or find the client
      let clientId;
      
      // Check if client already exists
      const { data: existingClient } = await supabase
        .from('kitchen_clients')
        .select('id')
        .eq('email', data.clientEmail)
        .single();

      if (existingClient) {
        clientId = existingClient.id;
      } else {
        // Generate client_id
        const clientIdStr = `KC-${Date.now()}`;
        
        // Create new client
        const { data: newClient, error: clientError } = await supabase
          .from('kitchen_clients')
          .insert({
            client_id: clientIdStr,
            name: data.clientName,
            email: data.clientEmail,
            phone: data.clientPhone,
            address: data.clientAddress
          })
          .select('id')
          .single();
        
        if (clientError) throw clientError;
        clientId = newClient.id;
      }

      // Generate project reference
      const projectRef = `KIT-${new Date().getFullYear()}-${Math.floor(Math.random() * 10000).toString().padStart(4, '0')}`;

      // Upload intake PDF if provided
      let intakePdfUrl = null;
      if (data.intakePdf) {
        const fileExt = data.intakePdf.name.split('.').pop();
        const fileName = `${projectRef}/intake.${fileExt}`;
        
        const { data: uploadData, error: uploadError } = await supabase.storage
          .from('kitchen-projects')
          .upload(fileName, data.intakePdf);
        
        if (uploadError) throw uploadError;
        
        const { data: urlData } = supabase.storage
          .from('kitchen-projects')
          .getPublicUrl(fileName);
        
        intakePdfUrl = urlData.publicUrl;
      }

      // Create the project
      const { data: project, error: projectError } = await supabase
        .from('kitchen_projects')
        .insert({
          client_id: clientId,
          project_reference: projectRef,
          kitchen_shape: data.kitchenShape as any,
          materials: data.materials,
          budget_bracket: data.budgetBracket as any,
          intake_pdf_url: intakePdfUrl
        })
        .select()
        .single();

      if (projectError) throw projectError;
      return project;
    },
    onSuccess: () => {
      toast.success('Kitchen project created successfully!');
      queryClient.invalidateQueries({ queryKey: ['kitchen-projects'] });
      navigate('/kitchen-projects');
    },
    onError: (error) => {
      console.error('Error creating project:', error);
      toast.error('Failed to create project. Please try again.');
    }
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.clientName || !formData.clientEmail || !formData.clientPhone || 
        !formData.clientAddress || !formData.kitchenShape || !formData.budgetBracket ||
        formData.materials.length === 0) {
      toast.error('Please fill in all required fields');
      return;
    }

    createProject.mutate(formData);
  };

  const handleMaterialChange = (material: string, checked: boolean) => {
    setFormData(prev => ({
      ...prev,
      materials: checked
        ? [...prev.materials, material]
        : prev.materials.filter(m => m !== material)
    }));
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file && file.type === 'application/pdf') {
      setFormData(prev => ({ ...prev, intakePdf: file }));
    } else {
      toast.error('Please select a PDF file');
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center py-4">
            <Button variant="ghost" onClick={() => navigate('/kitchen-projects')}>
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Kitchen Projects
            </Button>
            <ChefHat className="h-8 w-8 text-orange-600 ml-4 mr-3" />
            <div>
              <h1 className="text-2xl font-bold text-gray-900">New Kitchen Project</h1>
              <p className="text-sm text-gray-500">Create a new modular kitchen project</p>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <form onSubmit={handleSubmit}>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Client Information */}
            <Card>
              <CardHeader>
                <CardTitle>Client Information</CardTitle>
                <CardDescription>Enter the client's details</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label htmlFor="clientName">Full Name *</Label>
                  <Input
                    id="clientName"
                    value={formData.clientName}
                    onChange={(e) => setFormData(prev => ({ ...prev, clientName: e.target.value }))}
                    placeholder="Enter client's full name"
                    required
                  />
                </div>
                
                <div>
                  <Label htmlFor="clientEmail">Email Address *</Label>
                  <Input
                    id="clientEmail"
                    type="email"
                    value={formData.clientEmail}
                    onChange={(e) => setFormData(prev => ({ ...prev, clientEmail: e.target.value }))}
                    placeholder="Enter client's email"
                    required
                  />
                </div>
                
                <div>
                  <Label htmlFor="clientPhone">Phone Number *</Label>
                  <Input
                    id="clientPhone"
                    value={formData.clientPhone}
                    onChange={(e) => setFormData(prev => ({ ...prev, clientPhone: e.target.value }))}
                    placeholder="Enter client's phone number"
                    required
                  />
                </div>
                
                <div>
                  <Label htmlFor="clientAddress">Address *</Label>
                  <Textarea
                    id="clientAddress"
                    value={formData.clientAddress}
                    onChange={(e) => setFormData(prev => ({ ...prev, clientAddress: e.target.value }))}
                    placeholder="Enter client's address"
                    required
                  />
                </div>
              </CardContent>
            </Card>

            {/* Project Details */}
            <Card>
              <CardHeader>
                <CardTitle>Project Details</CardTitle>
                <CardDescription>Specify kitchen requirements</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label htmlFor="kitchenShape">Kitchen Shape *</Label>
                  <Select value={formData.kitchenShape} onValueChange={(value) => setFormData(prev => ({ ...prev, kitchenShape: value }))}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select kitchen shape" />
                    </SelectTrigger>
                    <SelectContent>
                      {kitchenShapes.map(shape => (
                        <SelectItem key={shape} value={shape}>{shape}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label>Materials * (Select at least one)</Label>
                  <div className="grid grid-cols-2 gap-2 mt-2">
                    {materials.map(material => (
                      <div key={material} className="flex items-center space-x-2">
                        <Checkbox
                          id={material}
                          checked={formData.materials.includes(material)}
                          onCheckedChange={(checked) => handleMaterialChange(material, checked as boolean)}
                        />
                        <Label htmlFor={material} className="text-sm font-normal">{material}</Label>
                      </div>
                    ))}
                  </div>
                </div>

                <div>
                  <Label htmlFor="budgetBracket">Budget Bracket *</Label>
                  <Select value={formData.budgetBracket} onValueChange={(value) => setFormData(prev => ({ ...prev, budgetBracket: value }))}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select budget range" />
                    </SelectTrigger>
                    <SelectContent>
                      {budgetBrackets.map(bracket => (
                        <SelectItem key={bracket} value={bracket}>{bracket}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label htmlFor="intakePdf">Intake Form PDF (Optional)</Label>
                  <div className="mt-2">
                    <Input
                      id="intakePdf"
                      type="file"
                      accept=".pdf"
                      onChange={handleFileChange}
                      className="file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
                    />
                    {formData.intakePdf && (
                      <p className="text-sm text-green-600 mt-1">
                        Selected: {formData.intakePdf.name}
                      </p>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          <div className="mt-8 flex justify-end space-x-4">
            <Button type="button" variant="outline" onClick={() => navigate('/kitchen-projects')}>
              Cancel
            </Button>
            <Button type="submit" disabled={createProject.isPending}>
              {createProject.isPending ? 'Creating...' : 'Create Project'}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default NewKitchenProject;
