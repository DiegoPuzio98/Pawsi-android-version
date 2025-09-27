import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/components/ui/use-toast";
import { MessageSquare, Send, Eye, EyeOff } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { formatDistanceToNow } from "date-fns";
import { es } from "date-fns/locale";

interface Message {
  id: string;
  sender_id: string;
  recipient_id: string;
  post_id?: string;
  post_type?: string;
  subject: string;
  content: string;
  read_at?: string;
  created_at: string;
}

interface Profile {
  id: string;
  display_name?: string;
}

interface MessageCenterProps {
  postId?: string;
  postType?: string;
  recipientId?: string;
}

export function MessageCenter({ postId, postType, recipientId }: MessageCenterProps) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [profiles, setProfiles] = useState<Record<string, Profile>>({});
  const [selectedMessage, setSelectedMessage] = useState<Message | null>(null);
  const [newMessageOpen, setNewMessageOpen] = useState(false);
  const [subject, setSubject] = useState("");
  const [content, setContent] = useState("");
  const [loading, setLoading] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);
  const { user } = useAuth();
  const { toast } = useToast();

  const fetchMessages = async () => {
    if (!user) return;

    // Fetch messages
    const { data: messageData, error: messageError } = await supabase
      .from('messages')
      .select('*')
      .or(`sender_id.eq.${user.id},recipient_id.eq.${user.id}`)
      .order('created_at', { ascending: false });

    if (messageError) {
      console.error('Error fetching messages:', messageError);
      return;
    }

    setMessages(messageData || []);
    
    // Count unread messages
    const unread = messageData?.filter(msg => 
      msg.recipient_id === user.id && !msg.read_at
    ).length || 0;
    setUnreadCount(unread);

    // Fetch unique user profiles
    const userIds = new Set<string>();
    messageData?.forEach(msg => {
      userIds.add(msg.sender_id);
      userIds.add(msg.recipient_id);
    });

    if (userIds.size > 0) {
      const { data: profileData } = await supabase
        .from('profiles')
        .select('id, display_name')
        .in('id', Array.from(userIds));

      const profileMap: Record<string, Profile> = {};
      profileData?.forEach(profile => {
        profileMap[profile.id] = profile;
      });
      setProfiles(profileMap);
    }
  };

  const sendMessage = async () => {
    if (!user || !recipientId) return;
    
    setLoading(true);
    try {
      const { error } = await supabase.from('messages').insert({
        sender_id: user.id,
        recipient_id: recipientId,
        post_id: postId || null,
        post_type: postType || null,
        subject,
        content
      });

      if (error) throw error;

      // Send notification to recipient
      await supabase.functions.invoke('send-message-notification', {
        body: {
          recipient_id: recipientId,
          sender_id: user.id,
          message_subject: subject
        }
      });

      toast({ title: "Mensaje enviado", description: "Tu mensaje ha sido enviado correctamente." });
      setNewMessageOpen(false);
      setSubject("");
      setContent("");
      fetchMessages();
    } catch (error: any) {
      toast({ title: "Error", description: error.message });
    } finally {
      setLoading(false);
    }
  };

  const markAsRead = async (messageId: string) => {
    if (!user) return;

    const { error } = await supabase
      .from('messages')
      .update({ read_at: new Date().toISOString() })
      .eq('id', messageId)
      .eq('recipient_id', user.id);

    if (!error) {
      fetchMessages();
    }
  };

  useEffect(() => {
    fetchMessages();
  }, [user]);

  if (recipientId && postId) {
    // Contact form mode
    return (
      <Dialog open={newMessageOpen} onOpenChange={setNewMessageOpen}>
        <DialogTrigger asChild>
          <Button variant="outline" className="w-full">
            <MessageSquare className="h-4 w-4 mr-2" />
            Contactar vía Pawsi
          </Button>
        </DialogTrigger>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Enviar mensaje</DialogTitle>
          </DialogHeader>
          <div className="grid gap-4">
            <div>
              <label className="text-sm font-medium">Asunto</label>
              <Input
                value={subject}
                onChange={(e) => setSubject(e.target.value)}
                placeholder="Asunto del mensaje"
              />
            </div>
            <div>
              <label className="text-sm font-medium">Mensaje</label>
              <Textarea
                value={content}
                onChange={(e) => setContent(e.target.value)}
                placeholder="Escribe tu mensaje..."
                rows={4}
              />
            </div>
            <Button onClick={sendMessage} disabled={loading || !subject || !content}>
              <Send className="h-4 w-4 mr-2" />
              {loading ? "Enviando..." : "Enviar mensaje"}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    );
  }

  // Message center view
  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold">Mensajes</h2>
        {unreadCount > 0 && (
          <Badge variant="destructive" className="ml-2">
            {unreadCount}
          </Badge>
        )}
      </div>

      <div className="grid gap-4">
        {messages.map((message) => {
          const isRecipient = message.recipient_id === user?.id;
          const isUnread = isRecipient && !message.read_at;
          const otherUserId = isRecipient ? message.sender_id : message.recipient_id;
          const otherUser = profiles[otherUserId];

          return (
            <Card key={message.id} className={`cursor-pointer transition-colors hover:bg-muted/50 ${isUnread ? 'border-primary' : ''}`}>
              <CardContent className="p-4">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="font-medium">
                        {isRecipient ? 'De: ' : 'Para: '}{otherUser?.display_name || 'Usuario'}
                      </span>
                      {isUnread && <Badge variant="destructive" className="text-xs">Nuevo</Badge>}
                    </div>
                    <h3 className="font-semibold mb-1">{message.subject}</h3>
                    <p className="text-sm text-muted-foreground line-clamp-2">{message.content}</p>
                    <p className="text-xs text-muted-foreground mt-2">
                      {formatDistanceToNow(new Date(message.created_at), { addSuffix: true, locale: es })}
                    </p>
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => {
                      setSelectedMessage(message);
                      if (isUnread) {
                        markAsRead(message.id);
                      }
                    }}
                  >
                    {isUnread ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </Button>
                </div>
              </CardContent>
            </Card>
          );
        })}

        {messages.length === 0 && (
          <Card>
            <CardContent className="p-8 text-center">
              <MessageSquare className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
              <p className="text-muted-foreground">No tienes mensajes aún</p>
            </CardContent>
          </Card>
        )}
      </div>

      {/* Message detail dialog */}
      <Dialog open={!!selectedMessage} onOpenChange={() => setSelectedMessage(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{selectedMessage?.subject}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <p className="text-sm text-muted-foreground">
                {selectedMessage?.recipient_id === user?.id ? 'De: ' : 'Para: '}
                {(() => {
                  const otherUserId = selectedMessage?.recipient_id === user?.id 
                    ? selectedMessage?.sender_id 
                    : selectedMessage?.recipient_id;
                  return profiles[otherUserId || '']?.display_name || 'Usuario';
                })()}
              </p>
            </div>
            <div className="bg-muted p-4 rounded">
              <p className="whitespace-pre-wrap">{selectedMessage?.content}</p>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}