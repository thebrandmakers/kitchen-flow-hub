
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { ArrowLeft, ChefHat } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

type KitchenMaterial = 'Plywood' | 'MDF' | 'HDHMR' | 'Acrylic' | 'Laminate';
type KitchenShape = 'L-shape' | 'U-shape' | 'Parallel' | 'Island' | 'Straight';
type BudgetBracket = '3-5 lakhs' | '5-8 lakhs' | '8-10+ lakhs';

const NewKitchenProject = () => {
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(false);
  
  // Form state
  const [clientName, setClientName] = useState('');
  const [clientEmail, setClientEmail] = useState('');
  const [clientPhone, setClientPhone] = useState('');
  const [clientAddress, setClientAddress] = useState('');
  const [kitchenShape, setKitchenShape] = useState<KitchenShape | ''>('');
  const [materials, setMaterials] = useState<KitchenMaterial[]>([]);
  const [budgetBracket, setBudgetBracket] = useState<BudgetBracket | ''>('');

  const kitchenShapes: KitchenShape[] = ['L-shape', 'U-shape', 'Parallel', 'Island', 'Straight'];
  const kitchenMaterials: KitchenMaterial[] = ['Plywood', 'MDF', 'HDHMR', 'Acrylic', 'Laminate'];
  const budgetBrackets: BudgetBracket[] = ['3-5 lakhs', '5-8 lakhs', '8-10+ lakhs'];

  const handleMaterialChange = (material: KitchenMaterial, checked: boolean) => {
    if (checked) {
      setMaterials(prev => [...prev, material]);
    } else {
      setMaterials(prev => prev.filter(m => m !== material));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!clientName || !clientEmail || !clientPhone || !clientAddress || !kitchenShape || materials.length === 0 || !budgetBracket) {
      toast.error('Please fill in all required fields');
      return;
    }

    setIsLoading(true);

    try {
      // First, create or get the client
      const clientId = `CLIENT-${Date.now()}`;
      
      const { data: clientData, error: clientError } = await supabase
        .from('kitchen_clients')
        .insert({
          client_id: clientId,
          name: clientName,
          email: clientEmail,
          phone: clientPhone,
          address: clientAddress,
        })
        .select()
        .single();

      if (clientError) throw clientError;

      // Generate project reference
      const projectReference = `KIT-${new Date().getFullYear()}-${Math.floor(Math.random() * 10000).toString().padStart(4, '0')}`;

      // Create the kitchen project
      const { data: projectData, error: projectError } = await supabase
        .from('kitchen_projects')
        .insert({
          client_id: clientData.id,
          project_reference: projectReference,
          kitchen_shape: kitchenShape as KitchenShape,
          materials: materials,
          budget_bracket: budgetBracket as BudgetBracket,
          status: 'intake' as const,
          current_phase: 1,
        })
        .select()
        .single();

      if (projectError) throw projectError;

      toast.success('Kitchen project created successfully!');
      navigate('/kitchen-projects');
      
    } catch (error) {
      console.error('Error creating kitchen project:', error);
      toast.error('Failed to create kitchen project. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <div className="flex items-center space-x-3">
              <Button variant="ghost" onClick={() => navigate('/kitchen-projects')}>
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back to Kitchen Projects
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
        <form onSubmit={handleSubmit} className="space-y-8">
          {/* Client Information */}
          <Card>
            <CardHeader>
              <CardTitle>Client Information</CardTitle>
              <CardDescription>Enter the client's contact details</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="clientName">Full Name *</Label>
                  <Input
                    id="clientName"
                    type="text"
                    value={clientName}
                    onChange={(e) => setClientName(e.target.value)}
                    placeholder="Enter client's full name"
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="clientEmail">Email *</Label>
                  <Input
                    id="clientEmail"
                    type="email"
                    value={clientEmail}
                    onChange={(e) => setClientEmail(e.target.value)}
                    placeholder="Enter client's email"
                    required
                  />
                </div>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="clientPhone">Phone Number *</Label>
                  <Input
                    id="clientPhone"
                    type="tel"
                    value={clientPhone}
                    onChange={(e) => setClientPhone(e.target.value)}
                    placeholder="Enter client's phone number"
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="clientAddress">Address *</Label>
                  <Input
                    id="clientAddress"
                    type="text"
                    value={clientAddress}
                    onChange={(e) => setClientAddress(e.target.value)}
                    placeholder="Enter client's address"
                    required
                  />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Kitchen Project Details */}
          <Card>
            <CardHeader>
              <CardTitle>Kitchen Project Details</CardTitle>
              <CardDescription>Specify the kitchen requirements and preferences</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div>
                <Label htmlFor="kitchenShape">Kitchen Shape *</Label>
                <Select value={kitchenShape} onValueChange={(value) => setKitchenShape(value as KitchenShape)}>
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
                <Label>Materials * (Select at least one)</Label>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-3 mt-2">
                  {kitchenMaterials.map((material) => (
                    <div key={material} className="flex items-center space-x-2">
                      <Checkbox
                        id={material}
                        checked={materials.includes(material)}
                        onCheckedChange={(checked) => handleMaterialChange(material, checked as boolean)}
                      />
                      <Label htmlFor={material} className="text-sm font-normal">
                        {material}
                      </Label>
                    </div>
                  ))}
                </div>
              </div>

              <div>
                <Label htmlFor="budgetBracket">Budget Bracket *</Label>
                <Select value={budgetBracket} onValueChange={(value) => setBudgetBracket(value as BudgetBracket)}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select budget bracket" />
                  </SelectTrigger>
                  <SelectContent>
                    {budgetBrackets.map((bracket) => (
                      <SelectItem key={bracket} value={bracket}>
                        ₹{bracket}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </CardContent>
          </Card>

          <div className="flex justify-end space-x-4">
            <Button
              type="button"
              variant="outline"
              onClick={() => navigate('/kitchen-projects')}
              disabled={isLoading}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={isLoading}>
              {isLoading ? 'Creating...' : 'Create Kitchen Project'}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default NewKitchenProject;
