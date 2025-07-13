import { useState } from "react";
import { Header } from "@/components/Layout/Header";
import { MessageCircle, Phone, Video, MoreHorizontal, Send, Plus, Edit2, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";

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

export const Messages = ({ activeTab, onTabChange }: { activeTab?: string; onTabChange?: (tab: string) => void }) => {
  const [messages, setMessages] = useState<Message[]>(initialMessages);
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
    <div className="min-h-screen bg-background pb-20">
      <Header activeTab={activeTab} onTabChange={onTabChange} />

      {/* Add Message Button */}
      <div className="px-4 py-4 max-w-md mx-auto">
        <Dialog open={isCreateOpen} onOpenChange={setIsCreateOpen}>
          <DialogTrigger asChild>
            <Button className="w-full bg-tomati-red hover:bg-tomati-red/90 text-white">
              <Plus size={16} className="mr-2" />
              Add New Message
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
              <Button onClick={handleCreate} className="w-full bg-tomati-red hover:bg-tomati-red/90">
                Create Message
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {/* Messages List */}
      <div className="px-4 space-y-3 max-w-md mx-auto">
        {messages.map((conversation) => (
          <Card key={conversation.id} className="hover:shadow-sm transition-shadow">
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
                        <Badge className="bg-tomati-red text-white text-xs min-w-5 h-5 rounded-full">
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
                    className="w-8 h-8 p-0 hover:bg-tomati-red/10"
                    onClick={() => handleEdit(conversation)}
                  >
                    <Edit2 size={14} className="text-tomati-red" />
                  </Button>
                  <Button 
                    variant="ghost" 
                    size="sm" 
                    className="w-8 h-8 p-0 hover:bg-red-100"
                    onClick={() => handleDelete(conversation.id)}
                  >
                    <Trash2 size={14} className="text-red-500" />
                  </Button>
                  <Button variant="ghost" size="sm" className="w-8 h-8 p-0 hover:bg-green-100">
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
              <Button onClick={handleUpdate} className="w-full bg-tomati-red hover:bg-tomati-red/90">
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

      {/* Chat Input */}
      <div className="fixed bottom-4 left-0 right-0 bg-card border-t border-border px-4 py-3">
        <div className="max-w-md mx-auto flex items-center gap-2">
          <Input 
            placeholder="Type a message..." 
            className="flex-1 rounded-full border-muted"
          />
          <Button size="sm" className="rounded-full w-10 h-10 p-0 bg-tomati-red hover:bg-tomati-red/90 shadow-lg">
            <Send size={16} className="text-white" />
          </Button>
        </div>
      </div>
    </div>
  );
};