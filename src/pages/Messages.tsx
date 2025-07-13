import { MessageCircle, Phone, MoreVertical, Send } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

const mockConversations = [
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

export const Messages = () => {
  return (
    <div className="min-h-screen bg-background pb-20">
      {/* Header */}
      <div className="sticky top-0 bg-card border-b border-border px-4 py-4 z-40">
        <div className="max-w-md mx-auto">
          <div className="flex items-center justify-between">
            <h1 className="text-xl font-bold text-foreground">Messages & Vocal Calls</h1>
            <div className="w-8 h-8 bg-warning/20 rounded-full flex items-center justify-center">
              <MessageCircle size={16} className="text-warning" />
            </div>
          </div>
          <p className="text-sm text-muted-foreground mt-1">
            Connect with buyers anywhere, anytime
          </p>
        </div>
      </div>

      {/* Conversations List */}
      <div className="px-4 py-4 space-y-3 max-w-md mx-auto">
        {mockConversations.map((conversation) => (
          <Card key={conversation.id} className="hover:shadow-sm transition-shadow cursor-pointer">
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="relative">
                  <Avatar className="w-12 h-12">
                    <AvatarFallback className="bg-primary/10 text-primary font-medium">
                      {conversation.avatar}
                    </AvatarFallback>
                  </Avatar>
                  {conversation.online && (
                    <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-success rounded-full border-2 border-card"></div>
                  )}
                </div>
                
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between mb-1">
                    <h3 className="font-medium text-foreground truncate">{conversation.name}</h3>
                    <div className="flex items-center gap-2">
                      <span className="text-xs text-muted-foreground">{conversation.timeAgo}</span>
                      {conversation.unread > 0 && (
                        <Badge className="bg-accent text-accent-foreground text-xs min-w-5 h-5 rounded-full">
                          {conversation.unread}
                        </Badge>
                      )}
                    </div>
                  </div>
                  <p className="text-sm text-muted-foreground truncate">{conversation.lastMessage}</p>
                  <p className="text-xs text-muted-foreground mt-1">{conversation.username}</p>
                </div>
                
                <div className="flex flex-col gap-2">
                  <Button variant="ghost" size="sm" className="w-8 h-8 p-0">
                    <Phone size={16} className="text-primary" />
                  </Button>
                  <Button variant="ghost" size="sm" className="w-8 h-8 p-0">
                    <MoreVertical size={16} className="text-muted-foreground" />
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Empty State */}
      {mockConversations.length === 0 && (
        <div className="flex flex-col items-center justify-center py-16 px-4 text-center">
          <div className="w-16 h-16 bg-muted rounded-full flex items-center justify-center mb-4">
            <MessageCircle size={24} className="text-muted-foreground" />
          </div>
          <h3 className="text-lg font-medium text-foreground mb-2">No messages yet</h3>
          <p className="text-muted-foreground text-sm max-w-xs">
            Start browsing products and connect with sellers to begin conversations
          </p>
        </div>
      )}

      {/* Chat Input (for demo purposes) */}
      <div className="fixed bottom-20 left-0 right-0 bg-card border-t border-border px-4 py-3">
        <div className="max-w-md mx-auto flex items-center gap-2">
          <Input 
            placeholder="Type a message..." 
            className="flex-1 rounded-full border-muted"
          />
          <Button size="sm" className="rounded-full w-10 h-10 p-0 bg-accent hover:bg-accent/90">
            <Send size={16} />
          </Button>
        </div>
      </div>
    </div>
  );
};