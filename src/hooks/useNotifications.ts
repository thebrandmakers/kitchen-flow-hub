import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from '@/hooks/use-toast';

// Push notification function
const requestPushNotification = async (notification: any) => {
  // Check if browser supports notifications
  if (!('Notification' in window)) return;
  
  // Request permission if not granted
  if (Notification.permission === 'default') {
    const permission = await Notification.requestPermission();
    if (permission !== 'granted') return;
  }
  
  // Show push notification if permission granted
  if (Notification.permission === 'granted') {
    const pushNotification = new Notification(notification.title, {
      body: notification.message,
      icon: '/favicon.ico',
      badge: '/favicon.ico',
      requireInteraction: true
    });
    
    pushNotification.onclick = () => {
      window.focus();
      if (notification.project_id) {
        window.location.href = `/kitchen-projects/${notification.project_id}`;
      }
      pushNotification.close();
    };
    
    // Auto close after 5 seconds
    setTimeout(() => pushNotification.close(), 5000);
  }
};

export const useNotifications = () => {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  // Play notification sound and vibration
  const playNotificationSound = () => {
    // High-quality notification sound (2 seconds)
    const audio = new Audio();
    audio.src = 'data:audio/mpeg;base64,SUQzBAAAAAAAI1RTU0UAAAAPAAADTGF2ZjU4Ljc2LjEwMAAAAAAAAAAAAAD/+xDEAAH2AcYAJ4AAZw9wgFU4BwAABgBQQAEAAAAAACDxAECzT1A0kYJqGJsw+YSgCXAgYDqHyKFHSAaXiJQLNLNUmIBM7kzNTY2NjZ1Wz/+xDEFAKIKdQBmFgAoggCgBjBgAAOAgM8R8m3LY9iM7JMGhOEsRQEBBZsJqI1v/PYFJ1e/2Mg9EpKST0z///uHDc/3JYzOIRvQ+/+xDEIQLhGkAAZhAAqoQCgBjBgAAHgBaQAhUIAAAB6AWEAI2ABdv/+d/YHxD6T8/OIGfxJPd6wR/8QxBECzh4QAGYQAAKIEYAA2AAAB4AAgAhUIAAAB6AAgAhGAANr/uOJQ3//kYzEkn///h/9/y8ZIf8QxBUCzh4QAGYQAAKIEYAA2AAAB';
    audio.volume = 0.8;
    audio.play().catch(() => {
      console.log('Notification sound failed to play');
    });

    // Add vibration for 2 seconds on mobile devices
    if ('vibrate' in navigator) {
      navigator.vibrate([200, 100, 200, 100, 200, 100, 200, 100, 200, 100]);
    }
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

  // Set up realtime subscription for notifications - singleton pattern
  useEffect(() => {
    if (!user?.id) return;

    // Use a unique channel name per user to avoid conflicts
    const channelName = `notifications-${user.id}`;
    
    // Check if channel already exists
    const existingChannel = supabase.getChannels().find(ch => ch.topic === channelName);
    if (existingChannel) {
      return () => {}; // Don't create duplicate subscription
    }

    const channel = supabase
      .channel(channelName)
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'notifications',
          filter: `user_id=eq.${user.id}`
        },
        (payload) => {
          // Play notification sound and vibration
          playNotificationSound();
          
          // Request push notification permission and send notification
          requestPushNotification(payload.new);
          
          // Show toast notification with click handler
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