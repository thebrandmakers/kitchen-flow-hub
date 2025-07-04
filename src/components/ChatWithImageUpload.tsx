import React, { useState, useEffect, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { ScrollArea } from '@/components/ui/scroll-area';
import { useChat } from '@/hooks/useChat';
import { useAuth } from '@/contexts/AuthContext';
import { format } from 'date-fns';
import { MessageCircle, ImageIcon, Send } from 'lucide-react';
import ImageUpload from '@/components/ImageUpload';

interface ChatWithImageUploadProps {
  projectId: string;
}

export const ChatWithImageUpload: React.FC<ChatWithImageUploadProps> = ({ projectId }) => {
  const [newMessage, setNewMessage] = useState('');
  const [chatImages, setChatImages] = useState<string[]>([]);
  const { user } = useAuth();
  const { messages, isLoading, sendMessage } = useChat(projectId);
  const scrollAreaRef = useRef<HTMLDivElement>(null);

  // Auto-scroll to bottom when new messages arrive
  useEffect(() => {
    if (scrollAreaRef.current) {
      scrollAreaRef.current.scrollTop = scrollAreaRef.current.scrollHeight;
    }
  }, [messages]);

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMessage.trim() && chatImages.length === 0) return;

    try {
      let messageContent = newMessage.trim();
      
      // If there are images, add them to the message
      if (chatImages.length > 0) {
        const imageText = chatImages.map((url, index) => `[Image ${index + 1}: ${url}]`).join('\n');
        messageContent = messageContent ? `${messageContent}\n\n${imageText}` : imageText;
      }

      await sendMessage.mutateAsync(messageContent);
      setNewMessage('');
      setChatImages([]);
    } catch (error) {
      console.error('Failed to send message:', error);
    }
  };

  const extractImagesFromMessage = (message: string) => {
    const imageRegex = /\[Image \d+: (https?:\/\/[^\]]+)\]/g;
    const images: string[] = [];
    let match;
    
    while ((match = imageRegex.exec(message)) !== null) {
      images.push(match[1]);
    }
    
    return images;
  };

  const removeImagesFromMessage = (message: string) => {
    return message.replace(/\[Image \d+: https?:\/\/[^\]]+\]/g, '').trim();
  };

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <MessageCircle className="h-5 w-5" />
            Project Chat
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center h-64">
            <div className="text-gray-500">Loading messages...</div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="h-[500px] flex flex-col">
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center gap-2">
          <MessageCircle className="h-5 w-5" />
          Project Chat
        </CardTitle>
      </CardHeader>
      
      <CardContent className="flex-1 flex flex-col p-0">
        <ScrollArea className="flex-1 px-4" ref={scrollAreaRef}>
          <div className="space-y-4 pb-4">
            {messages.length === 0 ? (
              <div className="text-center text-gray-500 py-8">
                No messages yet. Start the conversation!
              </div>
            ) : (
              messages.map((message) => {
                const isOwnMessage = message.sender_id === user?.id;
                const messageImages = extractImagesFromMessage(message.message);
                const textContent = removeImagesFromMessage(message.message);
                
                return (
                  <div
                    key={message.id}
                    className={`flex gap-3 ${isOwnMessage ? 'flex-row-reverse' : 'flex-row'}`}
                  >
                    <Avatar className="h-8 w-8 flex-shrink-0">
                      <AvatarImage src={message.profiles.avatar_url || ''} />
                      <AvatarFallback>
                        {message.profiles.full_name
                          ? message.profiles.full_name.split(' ').map(n => n[0]).join('').toUpperCase()
                          : 'U'
                        }
                      </AvatarFallback>
                    </Avatar>
                    
                    <div className={`flex flex-col ${isOwnMessage ? 'items-end' : 'items-start'} max-w-[80%]`}>
                      <div className={`rounded-lg px-3 py-2 ${
                        isOwnMessage 
                          ? 'bg-blue-600 text-white' 
                          : 'bg-gray-100 text-gray-900'
                      }`}>
                        {textContent && <p className="text-sm break-words">{textContent}</p>}
                        
                        {messageImages.length > 0 && (
                          <div className="mt-2 grid grid-cols-2 gap-1">
                            {messageImages.map((imageUrl, index) => (
                              <img
                                key={index}
                                src={imageUrl}
                                alt={`Shared image ${index + 1}`}
                                className="w-full h-20 object-cover rounded border cursor-pointer"
                                onClick={() => window.open(imageUrl, '_blank')}
                              />
                            ))}
                          </div>
                        )}
                      </div>
                      <div className="flex items-center gap-2 mt-1">
                        {!isOwnMessage && (
                          <span className="text-xs text-gray-500 font-medium">
                            {message.profiles.full_name}
                          </span>
                        )}
                        <span className="text-xs text-gray-400">
                          {format(new Date(message.created_at), 'HH:mm')}
                        </span>
                      </div>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </ScrollArea>
        
        <form onSubmit={handleSendMessage} className="p-4 border-t bg-white space-y-3">
          {/* Image upload section */}
          <ImageUpload
            label="Attach Images"
            images={chatImages}
            onImagesChange={setChatImages}
            maxImages={3}
          />
          
          <div className="flex gap-2">
            <Input
              value={newMessage}
              onChange={(e) => setNewMessage(e.target.value)}
              placeholder="Type your message..."
              className="flex-1"
              disabled={sendMessage.isPending}
            />
            <Button 
              type="submit" 
              disabled={(!newMessage.trim() && chatImages.length === 0) || sendMessage.isPending}
            >
              <Send className="h-4 w-4" />
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
};

export default ChatWithImageUpload;