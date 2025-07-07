
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog';
import { Building2, ArrowLeft, Users, Phone, Mail, Edit, Trash2, ChefHat, ClipboardList, Eye } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useTeamMembers } from '@/hooks/useTeamMembers';
import { useAuth } from '@/contexts/AuthContext';
import InviteMemberDialog from '@/components/team/InviteMemberDialog';
import { format } from 'date-fns';
import { useAllProfiles } from '@/hooks/useAllProfiles';
import { useAssignedProjects } from '@/hooks/useAssignedProjects';

const Team = () => {
  const navigate = useNavigate();
  const { userRole } = useAuth();
  const { teamMembers, isLoading, deleteMember, updateMember } = useTeamMembers();
  const { data: allProfiles } = useAllProfiles();
  const { data: assignedProjects } = useAssignedProjects();
  const [editingMember, setEditingMember] = useState<any>(null);
  const [editForm, setEditForm] = useState({ department: '', phone: '', status: '' });

  const handleEditMember = (member: any) => {
    setEditingMember(member);
    setEditForm({
      department: member.department || '',
      phone: member.phone || '',
      status: member.status || 'active'
    });
  };

  const handleUpdateMember = async () => {
    if (!editingMember) return;
    
    try {
      await updateMember.mutateAsync({
        id: editingMember.id,
        updates: editForm
      });
      setEditingMember(null);
    } catch (error) {
      console.error('Failed to update member:', error);
    }
  };

  const canManageTeam = userRole === 'owner' || userRole === 'manager' || userRole === 'designer';
  const isTeamLead = userRole === 'owner' || userRole === 'designer' || userRole === 'manager';

  const getRoleColor = (role: string) => {
    switch (role) {
      case 'owner': return 'bg-purple-100 text-purple-800';
      case 'manager': return 'bg-indigo-100 text-indigo-800';
      case 'designer': return 'bg-blue-100 text-blue-800';
      case 'factory': return 'bg-orange-100 text-orange-800';
      case 'installer': return 'bg-green-100 text-green-800';
      case 'sales': return 'bg-pink-100 text-pink-800';
      case 'worker': return 'bg-yellow-100 text-yellow-800';
      case 'client': return 'bg-gray-100 text-gray-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'bg-green-100 text-green-800';
      case 'inactive': return 'bg-red-100 text-red-800';
      case 'pending': return 'bg-yellow-100 text-yellow-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading team members...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <div className="flex items-center space-x-3">
              <Button variant="ghost" onClick={() => navigate('/dashboard')}>
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back to Dashboard
              </Button>
              <Building2 className="h-8 w-8 text-blue-600" />
              <div>
                <h1 className="text-2xl font-bold text-gray-900">Team Management</h1>
                <p className="text-sm text-gray-500">Manage team members and invitations</p>
              </div>
            </div>
            {canManageTeam && <InviteMemberDialog />}
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Show different content based on role */}
        {isTeamLead ? (
          <>
            <h2 className="text-xl font-semibold mb-6">All Team Members</h2>
            {allProfiles && allProfiles.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {allProfiles.map((profile) => (
                  <Card key={profile.id} className="cursor-pointer hover:shadow-md transition-shadow">
                    <CardContent className="p-6">
                      <div className="flex items-center space-x-4">
                        <Avatar className="h-12 w-12">
                          <AvatarImage src={profile.avatar_url || ''} />
                          <AvatarFallback>
                            {profile.full_name 
                              ? profile.full_name.split(' ').map(n => n[0]).join('').toUpperCase()
                              : 'TM'
                            }
                          </AvatarFallback>
                        </Avatar>
                        <div className="flex-1">
                          <h3 className="text-lg font-medium text-gray-900">
                            {profile.full_name || 'Team Member'}
                          </h3>
                          <div className="flex items-center space-x-2 mt-1">
                            <Mail className="h-3 w-3 text-gray-400" />
                            <p className="text-sm text-gray-500">{profile.email}</p>
                          </div>
                        </div>
                      </div>
                      
                      <div className="mt-4 space-y-2">
                        <div className="flex flex-wrap gap-2">
                          <Badge className={getRoleColor(profile.role)}>
                            {profile.role.charAt(0).toUpperCase() + profile.role.slice(1)}
                          </Badge>
                        </div>
                        
                        <p className="text-xs text-gray-500">
                          Registered {format(new Date(profile.created_at), 'MMM dd, yyyy')}
                        </p>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            ) : (
              <div className="text-center py-12">
                <Users className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">No Team Members</h3>
                <p className="text-gray-500 mb-6">Start building your team by inviting members.</p>
              </div>
            )}
          </>
        ) : (
          <>
            <h2 className="text-xl font-semibold mb-6">My Assigned Projects</h2>
            {assignedProjects && assignedProjects.length > 0 ? (
              <div className="space-y-4">
                {assignedProjects.map((assignment) => (
                  <Card key={assignment.id} className="cursor-pointer hover:shadow-md transition-shadow">
                    <CardContent className="p-6">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-4">
                          <ChefHat className="h-8 w-8 text-orange-600" />
                          <div>
                            <h3 className="text-lg font-medium text-gray-900">
                              {assignment.kitchen_projects?.project_reference}
                            </h3>
                            <p className="text-sm text-gray-500">
                              Phase {assignment.phase_number}: {assignment.phase_name.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase())}
                            </p>
                            <p className="text-xs text-gray-500">
                              Client: {assignment.kitchen_projects?.kitchen_clients?.name}
                            </p>
                          </div>
                        </div>
                        <div className="flex items-center space-x-2">
                          <Badge className={assignment.status === 'done' ? 'bg-green-100 text-green-800' : assignment.status === 'in_progress' ? 'bg-blue-100 text-blue-800' : 'bg-gray-100 text-gray-800'}>
                            {assignment.status?.replace('_', ' ').toUpperCase() || 'TODO'}
                          </Badge>
                          <Button 
                            variant="outline" 
                            size="sm"
                            onClick={() => {
                              const projectId = assignment.kitchen_projects?.id;
                              if (projectId) {
                                navigate(`/kitchen-projects/${projectId}`);
                              } else {
                                alert('Unable to navigate to project - project information is missing');
                              }
                            }}
                          >
                            <Eye className="h-4 w-4 mr-1" />
                            View
                          </Button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            ) : (
              <div className="text-center py-12">
                <ClipboardList className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">No Assignments</h3>
                <p className="text-gray-500">You don't have any project assignments yet.</p>
              </div>
            )}
          </>
        )}

        {/* Legacy team members section for management roles */}
        {canManageTeam && teamMembers && teamMembers.length > 0 && (
          <div className="mt-12">
            <h2 className="text-xl font-semibold mb-6">Team Member Management</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {teamMembers.map((member) => (
              <Card key={member.id} className="cursor-pointer hover:shadow-md transition-shadow">
                <CardContent className="p-6">
                  <div className="flex items-center space-x-4">
                    <Avatar className="h-12 w-12">
                      <AvatarImage src={member.profiles?.avatar_url || ''} />
                      <AvatarFallback>
                        {member.profiles?.full_name 
                          ? member.profiles.full_name.split(' ').map(n => n[0]).join('').toUpperCase()
                          : 'TM'
                        }
                      </AvatarFallback>
                    </Avatar>
                    <div className="flex-1">
                      <h3 className="text-lg font-medium text-gray-900">
                        {member.profiles?.full_name || 'Team Member'}
                      </h3>
                      <div className="flex items-center space-x-2 mt-1">
                        <Mail className="h-3 w-3 text-gray-400" />
                        <p className="text-sm text-gray-500">{member.profiles?.email}</p>
                      </div>
                      {member.phone && (
                        <div className="flex items-center space-x-2 mt-1">
                          <Phone className="h-3 w-3 text-gray-400" />
                          <p className="text-sm text-gray-500">{member.phone}</p>
                        </div>
                      )}
                    </div>
                  </div>
                  
                  <div className="mt-4 space-y-2">
                    <div className="flex flex-wrap gap-2">
                      <Badge className={getRoleColor(member.profiles?.role || 'worker')}>
                        {(member.profiles?.role || 'worker').charAt(0).toUpperCase() + (member.profiles?.role || 'worker').slice(1)}
                      </Badge>
                      <Badge className={getStatusColor(member.status || 'active')}>
                        {(member.status || 'active').charAt(0).toUpperCase() + (member.status || 'active').slice(1)}
                      </Badge>
                    </div>
                    
                    {member.department && (
                      <p className="text-sm text-gray-600">
                        <span className="font-medium">Department:</span> {member.department}
                      </p>
                    )}
                    
                    <p className="text-xs text-gray-500">
                      Joined {format(new Date(member.created_at), 'MMM dd, yyyy')}
                    </p>

                    {canManageTeam && (
                      <div className="flex gap-2 mt-3">
                        <Dialog>
                          <DialogTrigger asChild>
                            <Button variant="outline" size="sm" onClick={() => handleEditMember(member)}>
                              <Edit className="h-3 w-3 mr-1" />
                              Edit
                            </Button>
                          </DialogTrigger>
                          <DialogContent>
                            <DialogHeader>
                              <DialogTitle>Edit Team Member</DialogTitle>
                            </DialogHeader>
                            <div className="space-y-4">
                              <div>
                                <Label htmlFor="department">Department</Label>
                                <Input
                                  id="department"
                                  value={editForm.department}
                                  onChange={(e) => setEditForm({...editForm, department: e.target.value})}
                                />
                              </div>
                              <div>
                                <Label htmlFor="phone">Phone</Label>
                                <Input
                                  id="phone"
                                  value={editForm.phone}
                                  onChange={(e) => setEditForm({...editForm, phone: e.target.value})}
                                />
                              </div>
                              <div>
                                <Label htmlFor="status">Status</Label>
                                <Select value={editForm.status} onValueChange={(value) => setEditForm({...editForm, status: value})}>
                                  <SelectTrigger>
                                    <SelectValue />
                                  </SelectTrigger>
                                  <SelectContent>
                                    <SelectItem value="active">Active</SelectItem>
                                    <SelectItem value="inactive">Inactive</SelectItem>
                                    <SelectItem value="pending">Pending</SelectItem>
                                  </SelectContent>
                                </Select>
                              </div>
                              <Button onClick={handleUpdateMember} className="w-full">
                                Update Member
                              </Button>
                            </div>
                          </DialogContent>
                        </Dialog>

                        <AlertDialog>
                          <AlertDialogTrigger asChild>
                            <Button variant="outline" size="sm">
                              <Trash2 className="h-3 w-3 mr-1" />
                              Delete
                            </Button>
                          </AlertDialogTrigger>
                          <AlertDialogContent>
                            <AlertDialogHeader>
                              <AlertDialogTitle>Delete Team Member</AlertDialogTitle>
                              <AlertDialogDescription>
                                Are you sure you want to remove {member.profiles?.full_name} from the team? This action cannot be undone.
                              </AlertDialogDescription>
                            </AlertDialogHeader>
                            <AlertDialogFooter>
                              <AlertDialogCancel>Cancel</AlertDialogCancel>
                              <AlertDialogAction onClick={() => deleteMember.mutateAsync(member.id)}>
                                Delete
                              </AlertDialogAction>
                            </AlertDialogFooter>
                          </AlertDialogContent>
                        </AlertDialog>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Team;
