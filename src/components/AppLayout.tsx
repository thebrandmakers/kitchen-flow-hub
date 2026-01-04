import React, { useState } from 'react';
import { cn } from '@/lib/utils';
import AppSidebar from '@/components/AppSidebar';
import { Button } from '@/components/ui/button';
import { Menu } from 'lucide-react';

interface AppLayoutProps {
  children: React.ReactNode;
  title?: string;
  showHeader?: boolean;
}

const AppLayout: React.FC<AppLayoutProps> = ({ 
  children, 
  title,
  showHeader = true 
}) => {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <div className="min-h-screen bg-background">
      <AppSidebar isOpen={sidebarOpen} onToggle={() => setSidebarOpen(!sidebarOpen)} />
      
      {/* Main content */}
      <div className="lg:pl-64">
        {/* Mobile header */}
        {showHeader && (
          <header className="sticky top-0 z-30 flex items-center gap-4 border-b border-border bg-background/95 backdrop-blur px-4 py-3 lg:hidden">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setSidebarOpen(true)}
            >
              <Menu className="h-6 w-6" />
            </Button>
            {title && <h1 className="text-lg font-semibold">{title}</h1>}
          </header>
        )}

        {/* Page content */}
        <main className="min-h-screen">
          {children}
        </main>
      </div>
    </div>
  );
};

export default AppLayout;
