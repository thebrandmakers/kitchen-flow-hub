
import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/hooks/use-toast';
import { useNavigate } from 'react-router-dom';

interface FormData {
  clientName: string;
  clientEmail: string;
  clientPhone: string;
  clientAddress: string;
  kitchenShape: string;
  budgetBracket: string;
  materials: string[];
  existingKitchenImages: string[];
  referenceImages: string[];
}

const initialFormData: FormData = {
  clientName: '',
  clientEmail: '',
  clientPhone: '',
  clientAddress: '',
  kitchenShape: '',
  budgetBracket: '',
  materials: [],
  existingKitchenImages: [],
  referenceImages: []
};

export const useKitchenProjectForm = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState<FormData>(initialFormData);

  // Load user profile data on component mount
  useEffect(() => {
    const loadUserProfile = async () => {
      if (!user) return;
      
      try {
        const { data: profile, error } = await supabase
          .from('profiles')
          .select('email, full_name')
          .eq('id', user.id)
          .single();

        if (error) {
          console.error('Error loading user profile:', error);
          return;
        }

        if (profile) {
          setFormData(prev => ({
            ...prev,
            clientEmail: profile.email || user.email || '',
            clientName: profile.full_name || ''
          }));
        }
      } catch (error) {
        console.error('Error fetching profile:', error);
      }
    };

    loadUserProfile();
  }, [user]);

  const updateFormData = (updates: Partial<FormData>) => {
    setFormData(prev => ({ ...prev, ...updates }));
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
      // First check if a client with this email already exists
      const { data: existingClient, error: checkError } = await supabase
        .from('kitchen_clients')
        .select('id, name, email, phone, address')
        .eq('email', formData.clientEmail)
        .maybeSingle();

      if (checkError) {
        console.error('Error checking existing client:', checkError);
        throw checkError;
      }

      let clientData;

      if (existingClient) {
        // Use existing client
        clientData = existingClient;
        console.log('Using existing client:', clientData);
        
        // Show a message that we're using existing client data
        toast({
          title: "Info",
          description: `Using existing client: ${existingClient.name}`,
        });
      } else {
        // Create new client only if one doesn't exist
        const { data: newClientData, error: clientError } = await supabase
          .from('kitchen_clients')
          .insert({
            name: formData.clientName,
            email: formData.clientEmail,
            phone: formData.clientPhone,
            address: formData.clientAddress,
            client_id: `CLIENT-${Date.now()}`
          })
          .select('id, name, email, phone, address')
          .single();

        if (clientError) {
          console.error('Client creation error:', clientError);
          
          // Handle specific duplicate email error
          if (clientError.code === '23505' && clientError.message.includes('kitchen_clients_email_key')) {
            toast({
              title: "Error",
              description: "A client with this email already exists. Please use a different email.",
              variant: "destructive"
            });
            return;
          }
          
          throw clientError;
        }

        clientData = newClientData;
        console.log('Created new client:', clientData);
      }

      // Generate project reference using the database function
      const { data: referenceData, error: referenceError } = await supabase
        .rpc('generate_project_reference');

      if (referenceError) {
        console.error('Project reference generation error:', referenceError);
        throw referenceError;
      }

      // Then create the kitchen project with images
      const { data: projectData, error: projectError } = await supabase
        .from('kitchen_projects')
        .insert({
          client_id: clientData.id,
          kitchen_shape: formData.kitchenShape as "L-shape" | "U-shape" | "Parallel" | "Island" | "Straight",
          budget_bracket: formData.budgetBracket as "3-5 lakhs" | "5-8 lakhs" | "8-10+ lakhs",
          materials: formData.materials as ("Plywood" | "MDF" | "HDHMR" | "Acrylic" | "Laminate")[],
          project_reference: referenceData,
          status: 'intake',
          existing_kitchen_images: formData.existingKitchenImages,
          reference_images: formData.referenceImages
        })
        .select()
        .single();

      if (projectError) {
        console.error('Project creation error:', projectError);
        throw projectError;
      }

      console.log('Created kitchen project:', projectData);

      toast({
        title: "Success",
        description: `Kitchen project ${referenceData} created successfully!`,
      });

      // Redirect to projects page
      navigate('/kitchen-projects');
      
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

  return {
    formData,
    updateFormData,
    handleSubmit,
    isSubmitting
  };
};
