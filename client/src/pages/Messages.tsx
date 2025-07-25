import { useState, useEffect } from "react";
import { MessageCircle, Phone, Video, MoreHorizontal, Send, Plus, Edit2, Trash2, ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { useQuery } from "@tanstack/react-query";
import { apiClient } from "@/lib/apiClient";

interface Message {
  id: string;
  name: string;
  username: string;
  lastMessage: string;
  timeAgo: string;
  unread: number;
  avatar: string;
  online: boolean;
}

const initialMessages: Message[] = [
  {
    id: "1",
    name: "Imen",
    username: "@imen",
    lastMessage: "Bonjour",
    timeAgo: "2h",
    unread: 0,
    avatar: "I",
    online: true
  },
  {
    id: "2", 
    name: "Sayros",
    username: "@sayros",
    lastMessage: "Mazel disponible ? J'en ai besoin pour mon fils.",
    timeAgo: "1d",
    unread: 2,
    avatar: "S",
    online: false
  }
];

interface ChatMessage {
  id: string;
  senderId: string;
  content: string;
  timestamp: Date;
  isOwn: boolean;
}

export const Messages = ({ activeTab, onTabChange }: { activeTab?: string; onTabChange?: (tab: string) => void }) => {
  const [messages, setMessages] = useState<Message[]>(initialMessages);
  const [selectedConversation, setSelectedConversation] = useState<string | null>(null);
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>([]);
  const [newChatMessage, setNewChatMessage] = useState("");
  const [productId, setProductId] = useState<string | null>(null);
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [editingMessage, setEditingMessage] = useState<Message | null>(null);
  const [newMessage, setNewMessage] = useState({
    name: "",
    username: "",
    lastMessage: "",
    online: false
  });
  const { toast } = useToast();

  // Check URL for product parameter
  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const productParam = urlParams.get('product');
    if (productParam) {
      setProductId(productParam);
      // Start a new conversation for this product
      startProductConversation(productParam);
    }
  }, []);

  // Fetch product details if needed
  const { data: product } = useQuery({
    queryKey: ['/api/products', productId],
    queryFn: () => productId ? apiClient.getProduct(productId) : null,
    enabled: !!productId,
  });

  const startProductConversation = (prodId: string) => {
    // Create a new conversation about this product
    const conversation: Message = {
      id: `product_${prodId}`,
      name: "Vendeur du produit",
      username: "@vendeur",
      lastMessage: "Conversation à propos du produit",
      timeAgo: "maintenant",
      unread: 0,
      avatar: "V",
      online: true
    };
    
    setMessages(prev => [conversation, ...prev]);
    setSelectedConversation(conversation.id);
    
    // Add initial message
    const initialMessage: ChatMessage = {
      id: "1",
      senderId: "vendor",
      content: `Bonjour ! Je suis intéressé(e) par votre produit. Pouvez-vous me donner plus d'informations ?`,
      timestamp: new Date(),
      isOwn: true
    };
    setChatMessages([initialMessage]);
  };

  const handleSendMessage = () => {
    if (!newChatMessage.trim() || !selectedConversation) return;

    const message: ChatMessage = {
      id: Date.now().toString(),
      senderId: "me",
      content: newChatMessage,
      timestamp: new Date(),
      isOwn: true
    };

    setChatMessages(prev => [...prev, message]);
    setNewChatMessage("");

    // Simulate vendor response after a delay with contextual responses
    setTimeout(() => {
      let responseContent = "Merci pour votre message ! Je vais vous répondre dans les plus brefs délais.";
      
      if (message.content.toLowerCase().includes("prix")) {
        responseContent = "Le prix est négociable. Pouvons-nous discuter par téléphone ?";
      } else if (message.content.toLowerCase().includes("intéressé")) {
        responseContent = "Parfait ! Quand pouvez-vous venir voir le produit ?";
      } else if (message.content.toLowerCase().includes("rencontrer")) {
        responseContent = "Bien sûr ! Je suis disponible ce week-end. Quel jour vous convient le mieux ?";
      }
      
      const response: ChatMessage = {
        id: (Date.now() + 1).toString(),
        senderId: "vendor",
        content: responseContent,
        timestamp: new Date(),
        isOwn: false
      };
      setChatMessages(prev => [...prev, response]);
    }, 1500);
  };

  const handleConversationSelect = (conversationId: string) => {
    setSelectedConversation(conversationId);
    // Load messages for this conversation (mock data for now)
    setChatMessages([
      {
        id: "1",
        senderId: "vendor",
        content: "Bonjour ! Comment puis-je vous aider ?",
        timestamp: new Date(Date.now() - 3600000),
        isOwn: false
      }
    ]);
  };

  if (selectedConversation) {
    const conversation = messages.find(m => m.id === selectedConversation);
    
    return (
      <div className="flex flex-col h-screen bg-white">
        {/* Chat Header */}
        <div className="flex items-center justify-between p-4 border-b bg-white sticky top-0 z-10">
          <div className="flex items-center gap-3">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setSelectedConversation(null)}
              className="p-2"
            >
              <ArrowLeft size={18} />
            </Button>
            <Avatar className="w-10 h-10">
              <AvatarFallback className="bg-primary text-primary-foreground">
                {conversation?.avatar}
              </AvatarFallback>
            </Avatar>
            <div>
              <h3 className="font-semibold">{conversation?.name}</h3>
              <p className="text-sm text-muted-foreground">
                {conversation?.online ? "En ligne" : "Hors ligne"}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Button 
              variant="ghost" 
              size="sm"
              onClick={() => toast({
                title: "Appel vocal",
                description: "Fonctionnalité d'appel en cours de développement.",
              })}
              className="hover:bg-green-100"
            >
              <Phone size={18} className="text-green-600" />
            </Button>
            <Button 
              variant="ghost" 
              size="sm"
              onClick={() => toast({
                title: "Appel vidéo",
                description: "Fonctionnalité d'appel vidéo en cours de développement.",
              })}
              className="hover:bg-blue-100"
            >
              <Video size={18} className="text-blue-600" />
            </Button>
            <Button variant="ghost" size="sm">
              <MoreHorizontal size={18} />
            </Button>
          </div>
        </div>

        {/* Product Info Banner (if from product) */}
        {product && productId && (
          <div className="p-4 bg-gray-50 border-b">
            <div className="flex items-center gap-3">
              {product.image_url && (
                <img 
                  src={product.image_url} 
                  alt={product.title}
                  className="w-12 h-12 object-cover rounded"
                />
              )}
              <div>
                <h4 className="font-medium">{product.title}</h4>
                <p className="text-sm text-muted-foreground">
                  {product.is_free ? "Gratuit" : product.price} • {product.category}
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Messages */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          {chatMessages.map((message, index) => (
            <div key={message.id}>
              <div className={`flex ${message.isOwn ? 'justify-end' : 'justify-start'}`}>
                <div className={`max-w-xs lg:max-w-md px-4 py-2 rounded-lg ${
                  message.isOwn 
                    ? 'bg-primary text-primary-foreground' 
                    : 'bg-gray-100 text-gray-900'
                }`}>
                  <p className="text-sm">{message.content}</p>
                  <p className="text-xs opacity-70 mt-1">
                    {message.timestamp.toLocaleTimeString('fr-FR', { 
                      hour: '2-digit', 
                      minute: '2-digit' 
                    })}
                  </p>
                </div>
              </div>
              
              {/* Quick Actions for received messages */}
              {!message.isOwn && index === chatMessages.length - 1 && (
                <div className="flex justify-start mt-2 ml-2">
                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setNewChatMessage("👍")}
                      className="text-xs h-7 px-2"
                    >
                      👍
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setNewChatMessage("Merci")}
                      className="text-xs h-7 px-2"
                    >
                      Merci
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setNewChatMessage("D'accord")}
                      className="text-xs h-7 px-2"
                    >
                      D'accord
                    </Button>
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>

        {/* Message Input */}
        <div className="p-4 border-t bg-white">
          {/* Quick Reply Options */}
          <div className="mb-3 flex flex-wrap gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setNewChatMessage("Oui, je suis intéressé(e)")}
              className="text-xs"
            >
              Oui, je suis intéressé(e)
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setNewChatMessage("Quel est le prix final ?")}
              className="text-xs"
            >
              Quel est le prix final ?
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setNewChatMessage("Pouvons-nous nous rencontrer ?")}
              className="text-xs"
            >
              Pouvons-nous nous rencontrer ?
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setNewChatMessage("Merci pour l'information")}
              className="text-xs"
            >
              Merci pour l'information
            </Button>
          </div>
          
          <div className="flex items-center gap-2">
            <Input
              placeholder="Tapez votre message..."
              value={newChatMessage}
              onChange={(e) => setNewChatMessage(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
              className="flex-1"
            />
            <Button 
              variant="outline"
              size="sm"
              onClick={() => toast({
                title: "Appel vocal",
                description: "Fonctionnalité d'appel en cours de développement.",
              })}
              className="hover:bg-green-100"
            >
              <Phone size={16} className="text-green-600" />
            </Button>
            <Button onClick={handleSendMessage} disabled={!newChatMessage.trim()}>
              <Send size={18} />
            </Button>
          </div>
        </div>
      </div>
    );
  }

  // Create new message
  const handleCreate = () => {
    if (!newMessage.name || !newMessage.lastMessage) {
      toast({
        title: "Error",
        description: "Please fill in all required fields",
        variant: "destructive"
      });
      return;
    }

    const message: Message = {
      id: Date.now().toString(),
      name: newMessage.name,
      username: newMessage.username || `@${newMessage.name.toLowerCase()}`,
      lastMessage: newMessage.lastMessage,
      timeAgo: "now",
      unread: 0,
      avatar: newMessage.name.charAt(0).toUpperCase(),
      online: newMessage.online
    };

    setMessages(prev => [message, ...prev]);
    setNewMessage({ name: "", username: "", lastMessage: "", online: false });
    setIsCreateOpen(false);
    
    toast({
      title: "Success",
      description: "Message created successfully",
    });
  };

  // Update message
  const handleUpdate = () => {
    if (!editingMessage) return;

    setMessages(prev => prev.map(msg => 
      msg.id === editingMessage.id 
        ? { 
            ...editingMessage,
            avatar: editingMessage.name.charAt(0).toUpperCase(),
            username: editingMessage.username || `@${editingMessage.name.toLowerCase()}`
          }
        : msg
    ));
    
    setEditingMessage(null);
    setIsEditOpen(false);
    
    toast({
      title: "Success",
      description: "Message updated successfully",
    });
  };

  // Delete message
  const handleDelete = (id: string) => {
    setMessages(prev => prev.filter(msg => msg.id !== id));
    
    toast({
      title: "Success",
      description: "Message deleted successfully",
    });
  };

  // Edit message
  const handleEdit = (message: Message) => {
    setEditingMessage({ ...message });
    setIsEditOpen(true);
  };

  return (
    <div className="min-h-screen bg-background p-4 pb-20">
      <div className="max-w-4xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-bold">Messages</h1>
          <Dialog open={isCreateOpen} onOpenChange={setIsCreateOpen}>
            <DialogTrigger asChild>
              <Button className="bg-primary hover:bg-primary/90 text-white">
                <Plus size={16} className="mr-2" />
                Nouvelle conversation
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Create New Message</DialogTitle>
              </DialogHeader>
              <div className="space-y-4">
                <Input
                  placeholder="Name *"
                  value={newMessage.name}
                  onChange={(e) => setNewMessage(prev => ({ ...prev, name: e.target.value }))}
                />
                <Input
                  placeholder="Username (optional)"
                  value={newMessage.username}
                  onChange={(e) => setNewMessage(prev => ({ ...prev, username: e.target.value }))}
                />
                <Textarea
                  placeholder="Last message *"
                  value={newMessage.lastMessage}
                  onChange={(e) => setNewMessage(prev => ({ ...prev, lastMessage: e.target.value }))}
                />
                <div className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    id="online"
                    checked={newMessage.online}
                    onChange={(e) => setNewMessage(prev => ({ ...prev, online: e.target.checked }))}
                  />
                  <label htmlFor="online" className="text-sm">Online status</label>
                </div>
                <Button onClick={handleCreate} className="w-full bg-primary hover:bg-primary/90">
                  Create Message
                </Button>
              </div>
            </DialogContent>
          </Dialog>
        </div>

        {/* Messages List */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {messages.map((conversation) => (
            <Card 
              key={conversation.id} 
              className="hover:shadow-sm transition-shadow cursor-pointer"
              onClick={() => handleConversationSelect(conversation.id)}
            >
              <CardContent className="p-4">
                <div className="flex items-center gap-3">
                  <div className="relative">
                    <Avatar className="w-12 h-12">
                      <AvatarFallback className="bg-primary/10 text-primary font-medium">
                        {conversation.avatar}
                      </AvatarFallback>
                    </Avatar>
                    {conversation.online && (
                      <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-green-500 rounded-full border-2 border-card"></div>
                    )}
                  </div>
                  
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between mb-1">
                      <h3 className="font-medium text-foreground truncate">{conversation.name}</h3>
                      <div className="flex items-center gap-2">
                        <span className="text-xs text-muted-foreground">{conversation.timeAgo}</span>
                        {conversation.unread > 0 && (
                          <Badge className="bg-primary text-white text-xs min-w-5 h-5 rounded-full">
                            {conversation.unread}
                          </Badge>
                        )}
                      </div>
                    </div>
                    <p className="text-sm text-muted-foreground truncate">{conversation.lastMessage}</p>
                    <p className="text-xs text-muted-foreground mt-1">{conversation.username}</p>
                  </div>
                  
                  <div className="flex flex-col gap-1">
                    <Button 
                      variant="ghost" 
                      size="sm" 
                      className="w-8 h-8 p-0 hover:bg-primary/10"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleEdit(conversation);
                      }}
                    >
                      <Edit2 size={14} className="text-primary" />
                    </Button>
                    <Button 
                      variant="ghost" 
                      size="sm" 
                      className="w-8 h-8 p-0 hover:bg-red-100"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleDelete(conversation.id);
                      }}
                    >
                      <Trash2 size={14} className="text-red-500" />
                    </Button>
                    <Button 
                      variant="ghost" 
                      size="sm" 
                      className="w-8 h-8 p-0 hover:bg-green-100"
                      onClick={(e) => {
                        e.stopPropagation();
                        toast({
                          title: "Appel",
                          description: `Appel de ${conversation.name}...`,
                        });
                      }}
                    >
                      <Phone size={14} className="text-green-600" />
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Edit Dialog */}
        <Dialog open={isEditOpen} onOpenChange={setIsEditOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Edit Message</DialogTitle>
            </DialogHeader>
            {editingMessage && (
              <div className="space-y-4">
                <Input
                  placeholder="Name"
                  value={editingMessage.name}
                  onChange={(e) => setEditingMessage(prev => prev ? { ...prev, name: e.target.value } : null)}
                />
                <Input
                  placeholder="Username"
                  value={editingMessage.username}
                  onChange={(e) => setEditingMessage(prev => prev ? { ...prev, username: e.target.value } : null)}
                />
                <Textarea
                  placeholder="Last message"
                  value={editingMessage.lastMessage}
                  onChange={(e) => setEditingMessage(prev => prev ? { ...prev, lastMessage: e.target.value } : null)}
                />
                <div className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    id="edit-online"
                    checked={editingMessage.online}
                    onChange={(e) => setEditingMessage(prev => prev ? { ...prev, online: e.target.checked } : null)}
                  />
                  <label htmlFor="edit-online" className="text-sm">Online status</label>
                </div>
                <Button onClick={handleUpdate} className="w-full bg-primary hover:bg-primary/90">
                  Update Message
                </Button>
              </div>
            )}
          </DialogContent>
        </Dialog>

        {/* Empty State */}
        {messages.length === 0 && (
          <div className="flex flex-col items-center justify-center py-16 px-4 text-center">
            <div className="w-16 h-16 bg-muted rounded-full flex items-center justify-center mb-4">
              <MessageCircle size={24} className="text-muted-foreground" />
            </div>
            <h3 className="text-lg font-medium text-foreground mb-2">No messages yet</h3>
            <p className="text-muted-foreground text-sm max-w-xs">
              Click "Add New Message" to create your first conversation
            </p>
          </div>
        )}
      </div>
    </div>
  );
};