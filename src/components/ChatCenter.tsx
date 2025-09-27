import { useState, useEffect, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/components/ui/use-toast";
import { MessageSquare, Send, Trash2, Flag, UserX, ArrowLeft } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { formatDistanceToNow } from "date-fns";
import { es } from "date-fns/locale";
import { ReportDialog } from "@/components/ReportDialog";
import { useSearchParams } from "react-router-dom";
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

interface Conversation {
  otherUserId: string;
  otherUserName: string;
  postTitle?: string;
  postId?: string;
  postType?: string;
  messages: Message[];
  unreadCount: number;
  lastMessageTime: string;
}

interface ChatCenterProps {
  postId?: string;
  postType?: string;
  recipientId?: string;
  postTitle?: string;
}

export function ChatCenter({ postId, postType, recipientId, postTitle }: ChatCenterProps) {
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [selectedConversation, setSelectedConversation] = useState<Conversation | null>(null);
  const [profiles, setProfiles] = useState<Record<string, Profile>>({});
  const [newMessageContent, setNewMessageContent] = useState("");
  const [newMessageOpen, setNewMessageOpen] = useState(false);
  const [subject, setSubject] = useState("");
  const [content, setContent] = useState("");
  const [loading, setLoading] = useState(false);
  const [reportDialogOpen, setReportDialogOpen] = useState(false);
  const { user } = useAuth();
  const { toast } = useToast();
const messagesEndRef = useRef<HTMLDivElement>(null);
const [searchParams] = useSearchParams();

  // Auto-fill subject with the post title when opening a new message dialog
  useEffect(() => {
    if (newMessageOpen && postTitle && !subject) {
      setSubject(postTitle);
    }
  }, [newMessageOpen, postTitle, subject]);

  const fetchConversations = async () => {
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

    // Fetch unique user profiles
    const userIds = new Set<string>();
    messageData?.forEach(msg => {
      userIds.add(msg.sender_id);
      userIds.add(msg.recipient_id);
    });

    let profileMap: Record<string, Profile> = {};
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

    // Group messages into conversations
    const conversationMap = new Map<string, Conversation>();
    
    messageData?.forEach(message => {
      const otherUserId = message.sender_id === user.id ? message.recipient_id : message.sender_id;
      const conversationKey = [user.id, otherUserId].sort().join('-') + (message.post_id || '');
      
      if (!conversationMap.has(conversationKey)) {
        const postTitle = message.post_id ? 
          (message.subject.includes('Re:') ? message.subject.replace('Re: ', '') : message.subject) :
          'Conversación general';
          
        conversationMap.set(conversationKey, {
          otherUserId,
          otherUserName: profiles[otherUserId]?.display_name || 'Usuario',
          postTitle,
          postId: message.post_id,
          postType: message.post_type,
          messages: [],
          unreadCount: 0,
          lastMessageTime: message.created_at
        });
      }
      
      const conversation = conversationMap.get(conversationKey)!;
      conversation.messages.push(message);
      
      if (message.recipient_id === user.id && !message.read_at) {
        conversation.unreadCount++;
      }
      
      // Update last message time if this message is newer
      if (new Date(message.created_at) > new Date(conversation.lastMessageTime)) {
        conversation.lastMessageTime = message.created_at;
      }
    });

    // Sort conversations by last message time
    const sortedConversations = Array.from(conversationMap.values())
      .sort((a, b) => new Date(b.lastMessageTime).getTime() - new Date(a.lastMessageTime).getTime());

    setConversations(sortedConversations);

    // Update profile names with fetched data
    sortedConversations.forEach(conv => {
      if (profiles[conv.otherUserId]) {
        conv.otherUserName = profiles[conv.otherUserId].display_name || 'Usuario';
      }
    });
  };

  const sendMessage = async (isNewConversation = false, conversationPostId?: string, conversationPostType?: string) => {
    if (!user || (!recipientId && !selectedConversation)) return;
    
    const targetRecipientId = isNewConversation ? recipientId : selectedConversation?.otherUserId;
    const messageContent = isNewConversation ? content : newMessageContent;
    const messageSubject = isNewConversation ? subject : `Re: ${selectedConversation?.postTitle || 'Conversación'}`;
    
    if (!messageContent.trim()) return;
    
    setLoading(true);
    try {
      const { error } = await supabase.from('messages').insert({
        sender_id: user.id,
        recipient_id: targetRecipientId,
        post_id: isNewConversation ? postId : conversationPostId,
        post_type: isNewConversation ? postType : conversationPostType,
        subject: messageSubject,
        content: messageContent
      });

      if (error) throw error;

      // Send in-app notification to recipient
      await supabase.functions.invoke('send-message-notification', {
        body: {
          recipient_id: targetRecipientId!,
          sender_id: user.id,
          message_subject: messageSubject
        }
      });

      // Create the new message object for immediate UI update
      const newMessage: Message = {
        id: Date.now().toString(), // temporary ID
        sender_id: user.id,
        recipient_id: targetRecipientId!,
        post_id: isNewConversation ? postId : conversationPostId,
        post_type: isNewConversation ? postType : conversationPostType,
        subject: messageSubject,
        content: messageContent,
        created_at: new Date().toISOString()
      };

      if (isNewConversation) {
        setNewMessageOpen(false);
        setSubject("");
        setContent("");
      } else {
        // Immediately update the selected conversation with the new message
        if (selectedConversation) {
          const updatedConversation = {
            ...selectedConversation,
            messages: [...selectedConversation.messages, newMessage],
            lastMessageTime: newMessage.created_at
          };
          setSelectedConversation(updatedConversation);
          
          // Update conversations list
          setConversations(prevConversations => 
            prevConversations.map(conv => 
              conv.otherUserId === selectedConversation.otherUserId && 
              conv.postId === selectedConversation.postId
                ? updatedConversation 
                : conv
            )
          );
        }
        setNewMessageContent("");
      }
      
      // Auto-scroll to bottom after sending message
      setTimeout(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
      }, 100);
      
      // Refresh conversations to get the real message from database
      fetchConversations();
    } catch (error: any) {
      toast({ title: "Error", description: error.message });
    } finally {
      setLoading(false);
    }
  };

  const markAsRead = async (conversationMessages: Message[]) => {
    if (!user) return;

    const unreadMessages = conversationMessages.filter(msg => 
      msg.recipient_id === user.id && !msg.read_at
    );

    for (const message of unreadMessages) {
      await supabase
        .from('messages')
        .update({ read_at: new Date().toISOString() })
        .eq('id', message.id);
    }

    fetchConversations();
  };

  const deleteConversation = async (conversation: Conversation) => {
    if (!user) return;

    if (!confirm("¿Estás seguro de que quieres eliminar esta conversación? Esta acción no se puede deshacer.")) {
      return;
    }

    const messageIds = conversation.messages.map(msg => msg.id);
    
    const { error } = await supabase
      .from('messages')
      .delete()
      .in('id', messageIds)
      .or(`sender_id.eq.${user.id},recipient_id.eq.${user.id}`);

    if (error) {
      toast({ title: "Error", description: "No se pudo eliminar la conversación" });
      return;
    }

    toast({ title: "Conversación eliminada", description: "La conversación ha sido eliminada." });
    setSelectedConversation(null);
    fetchConversations();
  };

  const blockUser = async (userId: string) => {
    if (!user) return;

    if (!confirm("¿Estás seguro de que quieres bloquear a este usuario? También se eliminará la conversación.")) {
      return;
    }

    try {
      // Add user to blocks table - using any to bypass TypeScript error until types are regenerated
      const { error: blockError } = await (supabase as any)
        .from('user_blocks')
        .insert({
          blocker_id: user.id,
          blocked_id: userId
        });

      if (blockError) throw blockError;

      // Delete conversation messages
      if (selectedConversation) {
        const messageIds = selectedConversation.messages.map(msg => msg.id);
        await supabase
          .from('messages')
          .delete()
          .in('id', messageIds);
      }

      toast({ title: "Usuario bloqueado", description: "El usuario ha sido bloqueado y la conversación eliminada." });
      setSelectedConversation(null);
      fetchConversations();
    } catch (error: any) {
      console.error('Error blocking user:', error);
      toast({ title: "Error", description: "No se pudo bloquear al usuario" });
    }
  };

  useEffect(() => {
    fetchConversations();
  }, [user]);

  // Open conversation when arriving with ?from=<userId>
  useEffect(() => {
    const from = searchParams.get('from');
    if (from && conversations.length > 0 && !selectedConversation) {
      const conv = conversations.find((c) => c.otherUserId === from);
      if (conv) {
        setSelectedConversation(conv);
        // Mark any unread messages as read
        markAsRead(conv.messages);
      }
    }
  }, [conversations, searchParams, selectedConversation]);

  // Auto-scroll to bottom when conversation changes or new messages arrive
  useEffect(() => {
    if (selectedConversation) {
      setTimeout(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
      }, 100);
    }
  }, [selectedConversation?.messages.length]);

  const totalUnreadCount = conversations.reduce((sum, conv) => sum + conv.unreadCount, 0);

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
                placeholder={postTitle || "Asunto del mensaje"}
                defaultValue={postTitle}
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
            <Button onClick={() => sendMessage(true)} disabled={loading || !subject || !content}>
              <Send className="h-4 w-4 mr-2" />
              {loading ? "Enviando..." : "Enviar mensaje"}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    );
  }

  if (selectedConversation) {
    // Chat view
    const sortedMessages = [...selectedConversation.messages].sort(
      (a, b) => new Date(a.created_at).getTime() - new Date(b.created_at).getTime()
    );

    return (
      <div className="space-y-4">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="sm" onClick={() => setSelectedConversation(null)}>
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <div className="flex-1">
            <h2 className="text-xl font-bold">{profiles[selectedConversation.otherUserId]?.display_name || 'Usuario'}</h2>
            {selectedConversation.postTitle && selectedConversation.postTitle !== 'Conversación general' && (
              <p className="text-sm text-muted-foreground">Sobre: {selectedConversation.postTitle}</p>
            )}
          </div>
          <div className="flex gap-2">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => {
                if (confirm("¿Estás seguro de que quieres reportar a este usuario?")) {
                  setReportDialogOpen(true);
                }
              }}
              title="Reportar usuario"
            >
              <Flag className="h-4 w-4" />
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => blockUser(selectedConversation.otherUserId)}
              title="Bloquear usuario"
            >
              <UserX className="h-4 w-4" />
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => deleteConversation(selectedConversation)}
              title="Eliminar conversación"
            >
              <Trash2 className="h-4 w-4" />
            </Button>
          </div>
        </div>

        <div className="border rounded-lg h-96 flex flex-col">
          <div className="flex-1 p-4 overflow-y-auto space-y-4">
            {sortedMessages.map((message) => {
              const isSentByMe = message.sender_id === user?.id;
              return (
                <div
                  key={message.id}
                  className={`flex ${isSentByMe ? 'justify-end' : 'justify-start'}`}
                >
                  <div
                    className={`max-w-[70%] p-3 rounded-lg ${
                      isSentByMe
                        ? 'bg-primary text-primary-foreground'
                        : 'bg-muted'
                    }`}
                  >
                    <p className="text-sm">{message.content}</p>
                    <p className="text-xs opacity-70 mt-1">
                      {formatDistanceToNow(new Date(message.created_at), { addSuffix: true, locale: es })}
                    </p>
                  </div>
                </div>
              );
            })}
            <div ref={messagesEndRef} />
          </div>
          
          <div className="border-t p-4">
            <div className="flex gap-2">
              <Input
                value={newMessageContent}
                onChange={(e) => setNewMessageContent(e.target.value)}
                placeholder="Escribe tu mensaje..."
                onKeyPress={(e) => {
                  if (e.key === 'Enter' && !e.shiftKey) {
                    e.preventDefault();
                    sendMessage(false, selectedConversation.postId, selectedConversation.postType);
                  }
                }}
              />
              <Button 
                onClick={() => sendMessage(false, selectedConversation.postId, selectedConversation.postType)}
                disabled={loading || !newMessageContent.trim()}
              >
                <Send className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </div>

        <ReportDialog
          open={reportDialogOpen}
          onOpenChange={setReportDialogOpen}
          postId={selectedConversation.postId || ''}
          postType="reported"
        />
      </div>
    );
  }

  // Conversations list
  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold">Mensajes</h2>
        {totalUnreadCount > 0 && (
          <Badge variant="destructive" className="ml-2">
            {totalUnreadCount}
          </Badge>
        )}
      </div>

      <div className="grid gap-4">
        {conversations.map((conversation, index) => {
          const lastMessage = conversation.messages[0]; // First message is the most recent due to ordering
          
          return (
            <Card
              key={`${conversation.otherUserId}-${conversation.postId || 'general'}-${index}`}
              className={`cursor-pointer transition-colors hover:bg-muted/50 ${
                conversation.unreadCount > 0 ? 'border-primary' : ''
              }`}
              onClick={() => {
                setSelectedConversation(conversation);
                markAsRead(conversation.messages);
              }}
            >
              <CardContent className="p-4">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="font-medium">{profiles[conversation.otherUserId]?.display_name || 'Usuario'}</span>
                      {conversation.unreadCount > 0 && (
                        <Badge variant="destructive" className="text-xs">
                          {conversation.unreadCount}
                        </Badge>
                      )}
                    </div>
                    {conversation.postTitle && conversation.postTitle !== 'Conversación general' && (
                      <p className="text-sm text-muted-foreground mb-1">
                        Sobre: {conversation.postTitle}
                      </p>
                    )}
                    <p className="text-sm text-muted-foreground line-clamp-2">
                      {lastMessage?.content}
                    </p>
                    <p className="text-xs text-muted-foreground mt-2">
                      {formatDistanceToNow(new Date(conversation.lastMessageTime), { addSuffix: true, locale: es })}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          );
        })}

        {conversations.length === 0 && (
          <Card>
            <CardContent className="p-8 text-center">
              <MessageSquare className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
              <p className="text-muted-foreground">No tienes conversaciones aún</p>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}