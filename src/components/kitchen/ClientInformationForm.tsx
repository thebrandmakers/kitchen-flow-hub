
import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

interface ClientFormData {
  clientName: string;
  clientEmail: string;
  clientPhone: string;
  clientAddress: string;
}

interface ClientInformationFormProps {
  formData: ClientFormData;
  onFormDataChange: (updates: Partial<ClientFormData>) => void;
}

const ClientInformationForm: React.FC<ClientInformationFormProps> = ({
  formData,
  onFormDataChange
}) => {
  const handleInputChange = (field: keyof ClientFormData, value: string) => {
    onFormDataChange({ [field]: value });
  };

  return (
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
            onChange={(e) => handleInputChange('clientName', e.target.value)}
            required
          />
        </div>
        <div>
          <Label htmlFor="clientEmail">Email *</Label>
          <Input
            id="clientEmail"
            type="email"
            value={formData.clientEmail}
            onChange={(e) => handleInputChange('clientEmail', e.target.value)}
            required
          />
        </div>
        <div>
          <Label htmlFor="clientPhone">Phone *</Label>
          <Input
            id="clientPhone"
            value={formData.clientPhone}
            onChange={(e) => handleInputChange('clientPhone', e.target.value)}
            required
          />
        </div>
        <div>
          <Label htmlFor="clientAddress">Address *</Label>
          <Input
            id="clientAddress"
            value={formData.clientAddress}
            onChange={(e) => handleInputChange('clientAddress', e.target.value)}
            required
          />
        </div>
      </CardContent>
    </Card>
  );
};

export default ClientInformationForm;
