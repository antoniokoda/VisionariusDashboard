import { useState, useRef, useEffect } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Send, Mic, Paperclip, X } from "lucide-react";
import { format } from "date-fns";
import { enUS } from "date-fns/locale";
import { type ConversationMessage } from "@shared/schema";
import { apiRequest } from "@/lib/queryClient";
import { useAuth } from "@/hooks/useAuth";

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
  const [isRecording, setIsRecording] = useState(false);
  const [audioBlob, setAudioBlob] = useState<Blob | null>(null);
  const [recordingDuration, setRecordingDuration] = useState(0);
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  const scrollAreaRef = useRef<HTMLDivElement>(null);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const recordingTimerRef = useRef<NodeJS.Timeout | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const queryClient = useQueryClient();
  const { user } = useAuth();

  const { data: messages = [], isLoading } = useQuery<ConversationMessage[]>({
    queryKey: [`/api/clients/${clientId}/conversation`],
    enabled: isOpen && clientId > 0,
  });

  const addMessageMutation = useMutation({
    mutationFn: async (message: { message: string; userId: number; userName: string; type?: string; fileUrl?: string }) => {
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
    if (!newMessage.trim() && !audioBlob && selectedFiles.length === 0) return;

    if (!user) return;
    
    // Send text message
    if (newMessage.trim()) {
      addMessageMutation.mutate({
        message: newMessage.trim(),
        userId: 1, // Fixed user ID for now
        userName: "User",
        type: "text"
      });
    }

    // Send audio message
    if (audioBlob) {
      // Convert blob to base64 data URL for persistent storage
      const reader = new FileReader();
      reader.onload = () => {
        const audioDataUrl = reader.result as string;
        addMessageMutation.mutate({
          message: `Voice message (${recordingDuration}s)`,
          userId: 1,
          userName: "User",
          type: "audio",
          fileUrl: audioDataUrl
        });
      };
      reader.readAsDataURL(audioBlob);
      setAudioBlob(null);
      setRecordingDuration(0);
    }

    // Send file messages
    selectedFiles.forEach(file => {
      const reader = new FileReader();
      reader.onload = () => {
        const fileDataUrl = reader.result as string;
        addMessageMutation.mutate({
          message: `File: ${file.name}`,
          userId: 1,
          userName: "User",
          type: "file",
          fileUrl: fileDataUrl
        });
      };
      reader.readAsDataURL(file);
    });

    setSelectedFiles([]);
  };

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const mediaRecorder = new MediaRecorder(stream);
      const audioChunks: Blob[] = [];

      mediaRecorder.ondataavailable = (event) => {
        audioChunks.push(event.data);
      };

      mediaRecorder.onstop = () => {
        const audioBlob = new Blob(audioChunks, { type: 'audio/webm;codecs=opus' });
        setAudioBlob(audioBlob);
        stream.getTracks().forEach(track => track.stop());
      };

      mediaRecorderRef.current = mediaRecorder;
      mediaRecorder.start();
      setIsRecording(true);
      setRecordingDuration(0);

      // Start timer
      recordingTimerRef.current = setInterval(() => {
        setRecordingDuration(prev => prev + 1);
      }, 1000);
    } catch (error) {
      console.error('Error accessing microphone:', error);
      alert('Unable to access microphone. Please check permissions.');
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
      
      if (recordingTimerRef.current) {
        clearInterval(recordingTimerRef.current);
        recordingTimerRef.current = null;
      }
    }
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    setSelectedFiles(prev => [...prev, ...files]);
  };

  const removeFile = (index: number) => {
    setSelectedFiles(prev => prev.filter((_, i) => i !== index));
  };

  const removeAudio = () => {
    setAudioBlob(null);
    setRecordingDuration(0);
  };

  const formatMessageTime = (timestamp: string): string => {
    return format(new Date(timestamp), "MMM d 'at' HH:mm", { locale: enUS });
  };

  const getInitials = (name: string): string => {
    return name.split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase();
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl h-[600px] flex flex-col">
        <DialogHeader className="pb-4 border-b">
          <DialogTitle className="text-lg font-semibold">
            Conversation - {clientName}
          </DialogTitle>
        </DialogHeader>

        {/* Messages Area */}
        <ScrollArea className="flex-1 p-4" ref={scrollAreaRef}>
          {isLoading ? (
            <div className="flex items-center justify-center h-32">
              <div className="text-neutral-500">Loading conversation...</div>
            </div>
          ) : messages.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-32 text-center">
              <div className="text-neutral-500 mb-2">No messages yet</div>
              <div className="text-sm text-neutral-400">
                Start the conversation by writing a note about this client
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
                        <div className="space-y-2">
                          <div className="flex items-center space-x-2">
                            <Mic className="h-4 w-4 text-blue-500" />
                            <span className="text-sm text-blue-600">{message.message}</span>
                          </div>
                          {message.fileUrl && (
                            <audio 
                              controls 
                              className="w-full max-w-xs"
                              preload="metadata"
                            >
                              <source src={message.fileUrl} type="audio/webm" />
                              <source src={message.fileUrl} type="audio/wav" />
                              <source src={message.fileUrl} type="audio/mp3" />
                              Your browser does not support the audio element.
                            </audio>
                          )}
                        </div>
                      ) : message.type === "file" ? (
                        <div className="flex items-center space-x-2">
                          <Paperclip className="h-4 w-4 text-gray-500" />
                          <span className="text-sm text-gray-600">File attachment</span>
                          {message.fileUrl && (
                            <Button
                              variant="link"
                              size="sm"
                              className="p-0 h-auto text-xs"
                              onClick={() => window.open(message.fileUrl!, '_blank')}
                            >
                              Open
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

        {/* Attachments Preview */}
        {(selectedFiles.length > 0 || audioBlob) && (
          <div className="border-t pt-3 pb-3 space-y-2">
            {/* Audio preview */}
            {audioBlob && (
              <div className="flex items-center justify-between bg-blue-50 p-2 rounded">
                <div className="flex items-center space-x-2">
                  <Mic className="h-4 w-4 text-blue-500" />
                  <span className="text-sm text-blue-700">Voice message ({recordingDuration}s)</span>
                </div>
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={removeAudio}
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>
            )}
            
            {/* Files preview */}
            {selectedFiles.map((file, index) => (
              <div key={index} className="flex items-center justify-between bg-gray-50 p-2 rounded">
                <div className="flex items-center space-x-2">
                  <Paperclip className="h-4 w-4 text-gray-500" />
                  <span className="text-sm text-gray-700">{file.name}</span>
                </div>
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={() => removeFile(index)}
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>
            ))}
          </div>
        )}

        {/* Message Input */}
        <div className="border-t pt-4">
          <form onSubmit={handleSendMessage} className="flex items-end space-x-2">
            <div className="flex-1">
              <textarea
                value={newMessage}
                onChange={(e) => setNewMessage(e.target.value)}
                placeholder="Write a note about this client..."
                className="w-full min-h-[40px] max-h-[120px] p-3 border border-gray-200 rounded-lg resize-none focus:outline-none focus:ring-2 focus:ring-primary/20"
                onKeyDown={(e) => {
                  if (e.key === 'Enter' && !e.shiftKey) {
                    e.preventDefault();
                    handleSendMessage(e);
                  }
                }}
              />
            </div>
            
            <input
              type="file"
              ref={fileInputRef}
              onChange={handleFileSelect}
              multiple
              className="hidden"
            />
            
            <div className="flex space-x-1">
              <Button
                type="button"
                variant="outline"
                size="icon"
                className="h-10 w-10"
                title="Adjuntar archivo"
                onClick={() => fileInputRef.current?.click()}
              >
                <Paperclip className="h-4 w-4" />
              </Button>
              
              <Button
                type="button"
                variant={isRecording ? "destructive" : "outline"}
                size="icon"
                className="h-10 w-10"
                title={isRecording ? "Detener grabación" : "Grabar audio"}
                onClick={isRecording ? stopRecording : startRecording}
              >
                <Mic className={`h-4 w-4 ${isRecording ? 'animate-pulse' : ''}`} />
              </Button>
              
              <Button
                type="submit"
                size="icon"
                className="h-10 w-10"
                disabled={(!newMessage.trim() && !audioBlob && selectedFiles.length === 0) || addMessageMutation.isPending}
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