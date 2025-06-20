
import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Building2, Users, FileText, CheckSquare, ArrowRight } from 'lucide-react';

const Index = () => {
  const navigate = useNavigate();
  const { user } = useAuth();

  React.useEffect(() => {
    if (user) {
      navigate('/dashboard');
    }
  }, [user, navigate]);

  const features = [
    {
      icon: Building2,
      title: 'Project Management',
      description: 'Track projects from quotation to completion with stage-based workflows.'
    },
    {
      icon: Users,
      title: 'Team Collaboration',
      description: 'Manage teams with role-based access for owners, designers, clients, and workers.'
    },
    {
      icon: FileText,
      title: 'Document Management',
      description: 'Upload, organize, and share project files and documents securely.'
    },
    {
      icon: CheckSquare,
      title: 'Task Tracking',
      description: 'Assign tasks, set deadlines, and monitor progress across all projects.'
    }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      {/* Header */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <div className="flex justify-between items-center">
          <div className="flex items-center space-x-3">
            <Building2 className="h-8 w-8 text-blue-600" />
            <span className="text-2xl font-bold text-gray-900">InteriFlow</span>
          </div>
          <Button onClick={() => navigate('/auth')}>
            Get Started
            <ArrowRight className="ml-2 h-4 w-4" />
          </Button>
        </div>
      </div>

      {/* Hero Section */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 text-center">
        <h1 className="text-5xl font-bold text-gray-900 mb-6">
          Interior Design
          <span className="text-blue-600"> Project Management</span>
        </h1>
        <p className="text-xl text-gray-600 mb-12 max-w-3xl mx-auto">
          Streamline your interior design business with comprehensive project tracking, 
          team collaboration, and client management tools.
        </p>
        
        <div className="flex justify-center space-x-4">
          <Button size="lg" onClick={() => navigate('/auth')}>
            Start Free Trial
            <ArrowRight className="ml-2 h-5 w-5" />
          </Button>
          <Button variant="outline" size="lg">
            Watch Demo
          </Button>
        </div>
      </div>

      {/* Features Grid */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
        <div className="text-center mb-16">
          <h2 className="text-3xl font-bold text-gray-900 mb-4">
            Everything you need to manage interior design projects
          </h2>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            From initial quotation to project completion, InteriFlow provides all the tools 
            your interior design business needs to succeed.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {features.map((feature, index) => (
            <Card key={index} className="text-center border-0 shadow-lg bg-white/80 backdrop-blur-sm">
              <CardHeader>
                <div className="flex justify-center mb-4">
                  <div className="p-3 bg-blue-100 rounded-full">
                    <feature.icon className="h-8 w-8 text-blue-600" />
                  </div>
                </div>
                <CardTitle className="text-xl">{feature.title}</CardTitle>
              </CardHeader>
              <CardContent>
                <CardDescription className="text-base">
                  {feature.description}
                </CardDescription>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>

      {/* CTA Section */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
        <Card className="text-center border-0 shadow-xl bg-gradient-to-r from-blue-600 to-indigo-600 text-white">
          <CardContent className="py-16">
            <h3 className="text-3xl font-bold mb-4">
              Ready to transform your interior design business?
            </h3>
            <p className="text-xl mb-8 opacity-90">
              Join hundreds of interior designers who trust InteriFlow to manage their projects.
            </p>
            <Button 
              size="lg" 
              variant="secondary"
              onClick={() => navigate('/auth')}
              className="text-blue-600 hover:text-blue-700"
            >
              Get Started Now
              <ArrowRight className="ml-2 h-5 w-5" />
            </Button>
          </CardContent>
        </Card>
      </div>

      {/* Footer */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 border-t border-gray-200">
        <div className="flex justify-between items-center">
          <div className="flex items-center space-x-3">
            <Building2 className="h-6 w-6 text-blue-600" />
            <span className="text-lg font-semibold text-gray-900">InteriFlow</span>
          </div>
          <p className="text-gray-500">© 2024 InteriFlow. All rights reserved.</p>
        </div>
      </div>
    </div>
  );
};

export default Index;
