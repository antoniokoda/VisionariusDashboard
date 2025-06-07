import { useState, useRef, useEffect } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Send, Mic, Paperclip, X } from "lucide-react";
import { format } from "date-fns";
import { es } from "date-fns/locale";
import { type ConversationMessage } from "@shared/schema";
import { apiRequest } from "@/lib/queryClient";

interface ClientConversationProps {
  isOpen: boolean;
  onClose: () => void;
  clientId: number;
  clientName: string;
}

export function ClientConversation({ 
  isOpen, 
  onClose, 
  clientId, 
  clientName 
}: ClientConversationProps) {
  const [newMessage, setNewMessage] = useState("");
  const [userName] = useState("Usuario"); // In a real app, this would come from auth
  const scrollAreaRef = useRef<HTMLDivElement>(null);
  const queryClient = useQueryClient();

  const { data: messages = [], isLoading } = useQuery<ConversationMessage[]>({
    queryKey: [`/api/clients/${clientId}/conversation`],
    enabled: isOpen && clientId > 0,
  });

  const addMessageMutation = useMutation({
    mutationFn: async (message: { message: string; userId: string; userName: string; type?: string }) => {
      const response = await apiRequest("POST", `/api/clients/${clientId}/conversation`, message);
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [`/api/clients/${clientId}/conversation`] });
      setNewMessage("");
    },
  });

  useEffect(() => {
    if (scrollAreaRef.current) {
      scrollAreaRef.current.scrollTop = scrollAreaRef.current.scrollHeight;
    }
  }, [messages]);

  const handleSendMessage = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMessage.trim()) return;

    addMessageMutation.mutate({
      message: newMessage.trim(),
      userId: "1", // In a real app, this would come from auth
      userName: userName,
      type: "text"
    });
  };

  const formatMessageTime = (timestamp: string): string => {
    return format(new Date(timestamp), "d MMM 'a las' HH:mm", { locale: es });
  };

  const getInitials = (name: string): string => {
    return name.split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase();
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl h-[600px] flex flex-col">
        <DialogHeader className="flex flex-row items-center justify-between space-y-0 pb-4 border-b">
          <DialogTitle className="text-lg font-semibold">
            Conversación - {clientName}
          </DialogTitle>
          <Button variant="ghost" size="icon" onClick={onClose}>
            <X className="h-4 w-4" />
          </Button>
        </DialogHeader>

        {/* Messages Area */}
        <ScrollArea className="flex-1 p-4" ref={scrollAreaRef}>
          {isLoading ? (
            <div className="flex items-center justify-center h-32">
              <div className="text-neutral-500">Cargando conversación...</div>
            </div>
          ) : messages.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-32 text-center">
              <div className="text-neutral-500 mb-2">No hay mensajes aún</div>
              <div className="text-sm text-neutral-400">
                Empieza la conversación escribiendo una nota sobre este cliente
              </div>
            </div>
          ) : (
            <div className="space-y-4">
              {messages.map((message) => (
                <div key={message.id} className="flex items-start space-x-3">
                  <Avatar className="w-8 h-8">
                    <AvatarFallback className="text-xs bg-primary text-primary-foreground">
                      {getInitials(message.userName)}
                    </AvatarFallback>
                  </Avatar>
                  
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center space-x-2 mb-1">
                      <span className="text-sm font-medium text-neutral-900">
                        {message.userName}
                      </span>
                      <span className="text-xs text-neutral-500">
                        {formatMessageTime(message.timestamp)}
                      </span>
                    </div>
                    
                    <div className="bg-gray-100 rounded-lg p-3 max-w-lg">
                      {message.type === "text" ? (
                        <p className="text-sm text-neutral-800 whitespace-pre-wrap">
                          {message.message}
                        </p>
                      ) : message.type === "audio" ? (
                        <div className="flex items-center space-x-2">
                          <Mic className="h-4 w-4 text-blue-500" />
                          <span className="text-sm text-blue-600">Mensaje de audio</span>
                          {message.fileUrl && (
                            <Button
                              variant="link"
                              size="sm"
                              className="p-0 h-auto text-xs"
                              onClick={() => window.open(message.fileUrl!, '_blank')}
                            >
                              Reproducir
                            </Button>
                          )}
                        </div>
                      ) : message.type === "file" ? (
                        <div className="flex items-center space-x-2">
                          <Paperclip className="h-4 w-4 text-gray-500" />
                          <span className="text-sm text-gray-600">Archivo adjunto</span>
                          {message.fileUrl && (
                            <Button
                              variant="link"
                              size="sm"
                              className="p-0 h-auto text-xs"
                              onClick={() => window.open(message.fileUrl!, '_blank')}
                            >
                              Abrir
                            </Button>
                          )}
                        </div>
                      ) : null}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </ScrollArea>

        {/* Message Input */}
        <div className="border-t pt-4">
          <form onSubmit={handleSendMessage} className="flex items-end space-x-2">
            <div className="flex-1">
              <textarea
                value={newMessage}
                onChange={(e) => setNewMessage(e.target.value)}
                placeholder="Escribe una nota sobre este cliente..."
                className="w-full min-h-[40px] max-h-[120px] p-3 border border-gray-200 rounded-lg resize-none focus:outline-none focus:ring-2 focus:ring-primary/20"
                onKeyDown={(e) => {
                  if (e.key === 'Enter' && !e.shiftKey) {
                    e.preventDefault();
                    handleSendMessage(e);
                  }
                }}
              />
            </div>
            
            <div className="flex space-x-1">
              <Button
                type="button"
                variant="outline"
                size="icon"
                className="h-10 w-10"
                title="Adjuntar archivo"
              >
                <Paperclip className="h-4 w-4" />
              </Button>
              
              <Button
                type="button"
                variant="outline"
                size="icon"
                className="h-10 w-10"
                title="Grabar audio"
              >
                <Mic className="h-4 w-4" />
              </Button>
              
              <Button
                type="submit"
                size="icon"
                className="h-10 w-10"
                disabled={!newMessage.trim() || addMessageMutation.isPending}
              >
                <Send className="h-4 w-4" />
              </Button>
            </div>
          </form>
          
          <div className="text-xs text-neutral-500 mt-2">
            Presiona Enter para enviar, Shift+Enter para nueva línea
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}