
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/hooks/use-toast';

export const useTeamMembers = () => {
  const queryClient = useQueryClient();

  const { data: teamMembers, isLoading } = useQuery({
    queryKey: ['team-members'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('team_members')
        .select(`
          *,
          profiles!inner(full_name, email, role, avatar_url)
        `)
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      return data;
    }
  });

  const inviteMember = useMutation({
    mutationFn: async ({ email, role, department, phone }: {
      email: string;
      role: string;
      department: string;
      phone: string;
    }) => {
      // First, check if user already exists in profiles
      const { data: existingProfile } = await supabase
        .from('profiles')
        .select('id')
        .eq('email', email)
        .single();

      if (existingProfile) {
        // Add to team_members if not already added
        const { data, error } = await supabase
          .from('team_members')
          .insert({
            user_id: existingProfile.id,
            department,
            phone,
            status: 'active'
          })
          .select()
          .single();

        if (error) throw error;
        return data;
      } else {
        // For now, we'll create a placeholder entry
        // In a real app, you'd send an invitation email
        toast({
          title: "Invitation Feature",
          description: "User invitation system would be implemented here. For demo, user should sign up first.",
          variant: "default"
        });
        throw new Error("User must sign up first");
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['team-members'] });
      toast({
        title: "Success",
        description: "Team member added successfully",
      });
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive"
      });
    }
  });

  const updateMemberStatus = useMutation({
    mutationFn: async ({ id, status }: { id: string; status: string }) => {
      const { data, error } = await supabase
        .from('team_members')
        .update({ status, updated_at: new Date().toISOString() })
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['team-members'] });
      toast({
        title: "Success",
        description: "Member status updated successfully",
      });
    }
  });

  return {
    teamMembers,
    isLoading,
    inviteMember,
    updateMemberStatus
  };
};
