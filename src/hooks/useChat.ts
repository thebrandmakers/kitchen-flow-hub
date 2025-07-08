import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { subscriptionManager } from '@/lib/subscriptionManager';

interface ChatMessage {
  id: string;
  project_id: string;
  sender_id: string;
  message: string;
  created_at: string;
  updated_at: string;
  profiles: {
    full_name: string;
    avatar_url: string;
  };
}

export const useChat = (projectId: string) => {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  // Fetch chat messages
  const { data: messages, isLoading } = useQuery({
    queryKey: ['chat-messages', projectId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('chat_messages')
        .select(`
          *,
          profiles(full_name, avatar_url)
        `)
        .eq('project_id', projectId)
        .order('created_at', { ascending: true });
      
      if (error) throw error;
      return data as ChatMessage[];
    },
    enabled: !!projectId
  });

  // Send message mutation
  const sendMessage = useMutation({
    mutationFn: async (message: string) => {
      if (!user?.id) throw new Error('User not authenticated');
      
      const { error } = await supabase
        .from('chat_messages')
        .insert({
          project_id: projectId,
          sender_id: user.id,
          message: message.trim()
        });
      
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['chat-messages', projectId] });
    }
  });

  // Set up realtime subscription for chat messages using global subscription manager
  useEffect(() => {
    if (!projectId) return;

    const subscriptionKey = `chat-${projectId}`;
    
    const channel = subscriptionManager.getOrCreateSubscription(subscriptionKey, () => {
      return supabase
        .channel(subscriptionKey)
        .on(
          'postgres_changes',
          {
            event: 'INSERT',
            schema: 'public',
            table: 'chat_messages',
            filter: `project_id=eq.${projectId}`
          },
          () => {
            // Invalidate queries to refresh messages
            queryClient.invalidateQueries({ queryKey: ['chat-messages', projectId] });
          }
        )
        .subscribe();
    });

    return () => {
      // Don't remove subscription here - let the manager handle cleanup
      // when the last component using this subscription unmounts
    };
  }, [projectId, queryClient]);

  return {
    messages: messages || [],
    isLoading,
    sendMessage
  };
};