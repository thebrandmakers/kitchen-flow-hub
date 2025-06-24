import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";
import { jsPDF } from "jspdf";

interface PhaseTaskTrackerProps {
  projectId: string;
}

interface Phase {
  id: string;
  phase_name: string;
  phase_number: number;
  status: string;
}

interface Task {
  id: string;
  phase_id: string;
  task_name: string;
  status: "todo" | "in_progress" | "done";
  notes?: string;
  due_date?: string;
}

type TaskStatus = "todo" | "in_progress" | "done";

export default function PhaseTaskTracker({ projectId }: PhaseTaskTrackerProps) {
  const [phases, setPhases] = useState<Phase[]>([]);
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    fetchPhasesAndTasks();
  }, [projectId]);

  async function fetchPhasesAndTasks() {
    try {
      setLoading(true);
      const { data: phasesData, error: phasesError } = await supabase
        .from("kitchen_project_phases")
        .select("*")
        .eq("project_id", projectId)
        .order("phase_number", { ascending: true });

      if (phasesError) throw phasesError;

      const { data: tasksData, error: tasksError } = await supabase
        .from("kitchen_project_tasks")
        .select("*")
        .in(
          "phase_id",
          phasesData?.map((p) => p.id) || []
        );

      if (tasksError) throw tasksError;

      setPhases(phasesData || []);
      setTasks(tasksData || []);
    } catch (error) {
      console.error("Error fetching data:", error);
      toast({
        title: "Error",
        description: "Failed to load project data",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  }

  const handleStatusUpdate = async (taskId: string, newStatus: TaskStatus) => {
    try {
      const { error } = await supabase
        .from("kitchen_project_tasks")
        .update({ 
          status: newStatus,
          completed_at: newStatus === "done" ? new Date().toISOString() : null
        })
        .eq("id", taskId);

      if (error) throw error;

      // Update local state
      setTasks(prev => prev.map(task => 
        task.id === taskId 
          ? { ...task, status: newStatus }
          : task
      ));

      toast({
        title: "Success",
        description: "Task status updated successfully",
      });
    } catch (error) {
      console.error("Error updating task:", error);
      toast({
        title: "Error",
        description: "Failed to update task status",
        variant: "destructive",
      });
    }
  };

  const generateAndUploadPDF = async () => {
    try {
      const doc = new jsPDF();
      
      // Add title
      doc.setFontSize(20);
      doc.text("Kitchen Project Summary", 20, 20);
      
      // Add project ID
      doc.setFontSize(12);
      doc.text(`Project ID: ${projectId}`, 20, 35);
      doc.text(`Generated on: ${new Date().toLocaleDateString()}`, 20, 45);
      
      let yPosition = 60;
      
      phases.forEach((phase) => {
        const phaseTasks = tasks.filter((t) => t.phase_id === phase.id);
        
        // Phase header
        doc.setFontSize(14);
        doc.text(`Phase ${phase.phase_number}: ${phase.phase_name.replace("_", " ").toUpperCase()}`, 20, yPosition);
        yPosition += 10;
        
        // Tasks
        doc.setFontSize(10);
        phaseTasks.forEach((task) => {
          const statusEmoji = task.status === "done" ? "✅" : task.status === "in_progress" ? "🔄" : "⏳";
          doc.text(`  ${statusEmoji} ${task.task_name} - ${task.status.replace("_", " ").toUpperCase()}`, 25, yPosition);
          yPosition += 8;
          
          if (task.notes) {
            doc.text(`    Notes: ${task.notes}`, 30, yPosition);
            yPosition += 6;
          }
          
          if (task.due_date) {
            doc.text(`    Due: ${task.due_date}`, 30, yPosition);
            yPosition += 6;
          }
          
          yPosition += 2;
        });
        
        yPosition += 5;
      });

      const pdfBlob = doc.output("blob");
      const fileName = `kitchen-project-${projectId}-${Date.now()}.pdf`;
      
      const { data, error } = await supabase.storage
        .from("kitchen-projects")
        .upload(fileName, pdfBlob, {
          contentType: "application/pdf",
          upsert: true
        });

      if (error) throw error;

      toast({
        title: "Success",
        description: "PDF generated and uploaded successfully!",
      });

      // Get public URL for WhatsApp
      const { data: urlData } = supabase.storage
        .from("kitchen-projects")
        .getPublicUrl(fileName);

      if (urlData?.publicUrl) {
        await sendWhatsAppMessage(urlData.publicUrl);
      }
    } catch (error) {
      console.error("Error generating PDF:", error);
      toast({
        title: "Error",
        description: "Failed to generate PDF report",
        variant: "destructive",
      });
    }
  };

  const sendWhatsAppMessage = async (fileUrl: string) => {
    try {
      const message = `Hello 👋, your kitchen project update PDF is ready.\n\nProject ID: ${projectId}\nLink: ${fileUrl}`;
      
      // For now, we'll just copy to clipboard since actual WhatsApp API requires configuration
      await navigator.clipboard.writeText(message);
      
      toast({
        title: "WhatsApp Message Ready",
        description: "Message copied to clipboard. You can paste it in WhatsApp.",
      });

      // TODO: Replace with actual WhatsApp API integration
      // This would require WhatsApp Business API setup and credentials
      console.log("WhatsApp message would be sent:", message);
    } catch (error) {
      console.error("Error preparing WhatsApp message:", error);
      toast({
        title: "Info",
        description: "PDF is ready, but couldn't prepare WhatsApp message",
      });
    }
  };

  const formatPhaseName = (phaseName: string) => {
    return phaseName.replace(/_/g, " ").replace(/\b\w/g, l => l.toUpperCase());
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "done": return "text-green-600";
      case "in_progress": return "text-blue-600";
      case "todo": return "text-gray-600";
      default: return "text-gray-600";
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-2 text-gray-600">Loading project data...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold text-gray-900">Kitchen Project Tracker</h1>
        <Button onClick={generateAndUploadPDF} className="bg-orange-600 hover:bg-orange-700">
          📄 Generate & Send PDF
        </Button>
      </div>

      {phases.length === 0 ? (
        <Card>
          <CardContent className="p-8 text-center">
            <p className="text-gray-500">No phases found for this project.</p>
          </CardContent>
        </Card>
      ) : (
        phases.map((phase) => {
          const phaseTasks = tasks.filter((t) => t.phase_id === phase.id);
          const completed = phaseTasks.filter((t) => t.status === "done").length;
          const progress = phaseTasks.length > 0 ? Math.floor((completed / phaseTasks.length) * 100) : 0;

          return (
            <Card key={phase.id} className="shadow-sm">
              <CardContent className="p-6">
                <div className="mb-4 flex justify-between items-center">
                  <div>
                    <h2 className="text-lg font-semibold text-gray-900">
                      Phase {phase.phase_number}: {formatPhaseName(phase.phase_name)}
                    </h2>
                    <p className="text-sm text-gray-500">
                      {completed} of {phaseTasks.length} tasks completed
                    </p>
                  </div>
                  <div className="text-right">
                    <div className="text-sm font-medium text-gray-700 mb-1">{progress}%</div>
                    <Progress value={progress} className="w-32" />
                  </div>
                </div>

                {phaseTasks.length === 0 ? (
                  <p className="text-gray-500 text-sm">No tasks found for this phase.</p>
                ) : (
                  <ul className="space-y-3">
                    {phaseTasks.map((task) => (
                      <li key={task.id} className="border border-gray-200 p-4 rounded-lg bg-gray-50">
                        <div className="flex justify-between items-center mb-2">
                          <span className="font-medium text-gray-900">{task.task_name}</span>
                          <div className="flex space-x-1">
                            <Button
                              size="sm"
                              variant={task.status === "todo" ? "default" : "outline"}
                              onClick={() => handleStatusUpdate(task.id, "todo")}
                              className="text-xs"
                            >
                              Todo
                            </Button>
                            <Button
                              size="sm"
                              variant={task.status === "in_progress" ? "default" : "outline"}
                              onClick={() => handleStatusUpdate(task.id, "in_progress")}
                              className="text-xs"
                            >
                              In Progress
                            </Button>
                            <Button
                              size="sm"
                              variant={task.status === "done" ? "default" : "outline"}
                              onClick={() => handleStatusUpdate(task.id, "done")}
                              className="text-xs"
                            >
                              Done
                            </Button>
                          </div>
                        </div>
                        
                        <div className="flex items-center space-x-4 text-sm">
                          <span className={`font-medium ${getStatusColor(task.status)}`}>
                            Status: {task.status.replace("_", " ").toUpperCase()}
                          </span>
                          {task.due_date && (
                            <span className="text-gray-500">📅 Due: {new Date(task.due_date).toLocaleDateString()}</span>
                          )}
                        </div>
                        
                        {task.notes && (
                          <p className="text-sm text-gray-600 mt-2">📝 {task.notes}</p>
                        )}
                      </li>
                    ))}
                  </ul>
                )}
              </CardContent>
            </Card>
          );
        })
      )}
    </div>
  );
}
