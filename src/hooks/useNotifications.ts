import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from '@/hooks/use-toast';

export const useNotifications = () => {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  // Play notification sound
  const playNotificationSound = () => {
    const audio = new Audio();
    audio.src = 'data:audio/wav;base64,UklGRnoGAABXQVZFZm10IBAAAAABAAEAQB8AAEAfAAABAAgAZGF0YQoGAACBhYqFbF1fdJivrJBhNjVgodDbq2EcBj+a2/LDciUFLIHO8tiJNwgZaLvt559NEAxQp+PwtmMcBjiR1/LMeSwFJHfH8N2QQAoUXrTp66hVFApGn+DyvmINBz2P1fPQeSsFJXfH8N2QQAoUXrTp66hVFApGn+DyvmINBz2P1fPQeSsFJXfH8N2QQAoUXrTp66hVFApGn+DyvmINBz2P1fPQeSsFJXfH8N2QQAoUXrTp66hVFApGn+DyvmINBz2P1fPQeSsFJXfH8N2QQAoUXrTp66hVFApGn+DyvmINBz2P1fPQeSsFJXfH8N2QQAoUXrTp66hVFApGn+DyvmINBz2P1fPQeSsFJXfH8N2QQAoUXrTp66hVFApGn+DyvmINBz2P1fPQeSsF';
    audio.play().catch(() => {
      // Fallback if audio fails to play
      console.log('Notification sound failed to play');
    });
  };

  // Fetch notifications with project details
  const { data: notifications, isLoading } = useQuery({
    queryKey: ['notifications', user?.id],
    queryFn: async () => {
      if (!user?.id) return [];
      
      const { data, error } = await supabase
        .from('notifications')
        .select(`
          *,
          kitchen_projects(project_reference)
        `)
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      return data;
    },
    enabled: !!user?.id
  });

  // Mark notification as read
  const markAsRead = useMutation({
    mutationFn: async (notificationId: string) => {
      const { error } = await supabase
        .from('notifications')
        .update({ read: true })
        .eq('id', notificationId);
      
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['notifications'] });
    }
  });

  // Mark all notifications as read
  const markAllAsRead = useMutation({
    mutationFn: async () => {
      if (!user?.id) return;
      
      const { error } = await supabase
        .from('notifications')
        .update({ read: true })
        .eq('user_id', user.id)
        .eq('read', false);
      
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['notifications'] });
    }
  });

  // Set up realtime subscription for notifications
  useEffect(() => {
    if (!user?.id) return;

    const channel = supabase
      .channel('notifications')
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'notifications',
          filter: `user_id=eq.${user.id}`
        },
        (payload) => {
          // Play notification sound
          playNotificationSound();
          
          // Show toast notification
          toast({
            title: payload.new.title,
            description: payload.new.message,
          });
          
          // Invalidate queries to refresh notifications
          queryClient.invalidateQueries({ queryKey: ['notifications'] });
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [user?.id, queryClient]);

  const unreadCount = notifications?.filter(n => !n.read).length || 0;

  return {
    notifications,
    isLoading,
    markAsRead,
    markAllAsRead,
    unreadCount
  };
};