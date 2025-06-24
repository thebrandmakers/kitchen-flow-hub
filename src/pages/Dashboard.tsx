import React, { useEffect, useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Building2, Users, FolderOpen, CheckSquare, FileText, LogOut, Plus } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";

const Dashboard = () => {
  const { user, userRole, signOut } = useAuth();
  const navigate = useNavigate();

  const handleSignOut = () => {
    signOut();
  };

  const handleNewProject = () => {
    navigate("/kitchen-projects/new");
  };

  const handleViewProjects = () => {
    navigate("/projects");
  };

  const handleViewTasks = () => {
    navigate("/tasks");
  };

  const handleViewReports = () => {
    navigate("/reports");
  };

  const handleInviteTeam = () => {
    navigate("/team");
  };

  const getRoleColor = (role: string) => {
    switch (role) {
      case "owner": return "text-purple-600";
      case "designer": return "text-blue-600";
      case "client": return "text-green-600";
      case "worker": return "text-orange-600";
      default: return "text-gray-600";
    }
  };

  const [projects, setProjects] = useState<any[]>([]);
  const [projectCount, setProjectCount] = useState(0);

  useEffect(() => {
    const fetchProjects = async () => {
      const { data, error } = await supabase
        .from("kitchen_projects")
        .select(`
          *,
          kitchen_clients(name, email)
        `)
        .order("created_at", { ascending: false })
        .limit(5);
      
      if (data) {
        setProjects(data);
        setProjectCount(data.length);
      }
      if (error) console.error("Error loading projects:", error);
    };
    fetchProjects();
  }, []);

  const stats = [
    {
      title: "Active Projects",
      value: projectCount.toString(),
      icon: FolderOpen,
      color: "text-blue-600",
      onClick: handleViewProjects
    },
    {
      title: "Team Members",
      value: "-",
      icon: Users,
      color: "text-green-600",
      onClick: handleInviteTeam
    },
    {
      title: "Pending Tasks",
      value: "-",
      icon: CheckSquare,
      color: "text-orange-600",
      onClick: handleViewTasks
    },
    {
      title: "Reports",
      value: "-",
      icon: FileText,
      color: "text-purple-600",
      onClick: handleViewReports
    }
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <div className="flex items-center space-x-3">
              <Building2 className="h-8 w-8 text-blue-600" />
              <div>
                <h1 className="text-2xl font-bold text-gray-900">InteriFlow</h1>
                <p className="text-sm text-gray-500">Interior Design Management</p>
              </div>
            </div>
            <div className="flex items-center space-x-4">
              <div className="text-right">
                <p className="text-sm font-medium text-gray-900">{user?.email}</p>
                <p className={`text-xs capitalize ${getRoleColor(userRole || "")}`}>
                  {userRole}
                </p>
              </div>
              <Button variant="outline" onClick={handleSignOut} size="sm">
                <LogOut className="h-4 w-4 mr-2" />
                Sign Out
              </Button>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h2 className="text-3xl font-bold text-gray-900 mb-2">Welcome back! 👋</h2>
          <p className="text-gray-600">Here's what's happening with your interior design projects today.</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {stats.map((stat, index) => (
            <Card key={index} className="cursor-pointer hover:shadow-md transition-shadow" onClick={stat.onClick}>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600 mb-1">{stat.title}</p>
                    <p className="text-3xl font-bold text-gray-900">{stat.value}</p>
                  </div>
                  <stat.icon className={`h-8 w-8 ${stat.color}`} />
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Card>
            <CardHeader>
              <CardTitle>Recent Kitchen Projects</CardTitle>
              <CardDescription>Your most recently created kitchen projects</CardDescription>
            </CardHeader>
            <CardContent>
              {projects.length === 0 ? (
                <p className="text-sm text-gray-500">No kitchen projects yet.</p>
              ) : (
                <div className="space-y-3">
                  {projects.map((project) => (
                    <div
                      key={project.id}
                      onClick={() => navigate(`/kitchen-projects/${project.id}`)}
                      className="flex items-center justify-between p-3 bg-gray-50 rounded-lg cursor-pointer hover:bg-gray-100 transition-colors"
                    >
                      <div>
                        <p className="font-medium text-gray-900">{project.project_reference}</p>
                        <p className="text-sm text-gray-500">
                          {project.kitchen_clients?.name} | {project.kitchen_shape} | {project.budget_bracket}
                        </p>
                      </div>
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                        {project.status}
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Quick Actions</CardTitle>
              <CardDescription>Common tasks and shortcuts</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 gap-3">
                <Button variant="outline" className="h-20 flex-col" onClick={handleNewProject}>
                  <Plus className="h-6 w-6 mb-2" />
                  New Kitchen Project
                </Button>
                <Button variant="outline" className="h-20 flex-col" onClick={handleViewTasks}>
                  <CheckSquare className="h-6 w-6 mb-2" />
                  View Tasks
                </Button>
                <Button variant="outline" className="h-20 flex-col" onClick={handleViewReports}>
                  <FileText className="h-6 w-6 mb-2" />
                  View Reports
                </Button>
                <Button variant="outline" className="h-20 flex-col" onClick={handleInviteTeam}>
                  <Users className="h-6 w-6 mb-2" />
                  Team Management
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
