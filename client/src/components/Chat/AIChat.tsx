import { useState, useRef, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { MessageCircle, Send, Bot, User, Minimize2, Maximize2, X } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useMutation } from "@tanstack/react-query";

interface Message {
  id: string;
  content: string;
  sender: 'user' | 'ai';
  timestamp: Date;
}

interface AIChatProps {
  isOpen: boolean;
  onToggle: () => void;
  onClose: () => void;
}

export const AIChat = ({ isOpen, onToggle, onClose }: AIChatProps) => {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: '1',
      content: "Bonjour ! Je suis votre assistant IA pour Tomati. Comment puis-je vous aider aujourd'hui ? Je peux vous renseigner sur les produits, les catégories, les prix, ou répondre à toutes vos questions sur la plateforme.",
      sender: 'ai',
      timestamp: new Date()
    }
  ]);
  const [inputMessage, setInputMessage] = useState("");
  const [isMinimized, setIsMinimized] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const { toast } = useToast();

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // Mock AI response - In real implementation, this would call your AI API
  const getAIResponse = useMutation({
    mutationFn: async (userMessage: string): Promise<string> => {
      // Simulate API delay
      await new Promise(resolve => setTimeout(resolve, 1000 + Math.random() * 2000));
      
      // Mock intelligent responses based on keywords
      const message = userMessage.toLowerCase();
      
      if (message.includes('prix') || message.includes('coût') || message.includes('cher')) {
        return "Les prix sur Tomati varient selon les catégories : Électronique (50€-2000€), Sport (20€-500€), Voiture (500€-50000€), etc. Vous pouvez filtrer par gamme de prix dans la recherche. Beaucoup de produits gratuits sont aussi disponibles !";
      }
      
      if (message.includes('catégorie') || message.includes('section')) {
        return "Nous avons 6 catégories principales : Électronique, Sport, Voiture, Bureautique, Jeux vidéo, et Mobilier. Chaque catégorie contient des dizaines de produits. Quelle catégorie vous intéresse ?";
      }
      
      if (message.includes('carte') || message.includes('map') || message.includes('géolocalisation')) {
        return "La carte interactive vous permet de voir les produits près de chez vous ! Activez la géolocalisation pour voir votre position et filtrez par distance, catégorie et prix. Très pratique pour trouver des produits dans votre quartier !";
      }
      
      if (message.includes('vendre') || message.includes('publier')) {
        return "Pour vendre sur Tomati, connectez-vous et cliquez sur 'Publier une annonce'. Remplissez les détails : titre, description, prix, catégorie, localisation. Ajoutez des photos pour plus de visibilité. C'est gratuit et simple !";
      }
      
      if (message.includes('contact') || message.includes('message') || message.includes('vendeur')) {
        return "Vous pouvez contacter les vendeurs directement via le bouton 'Contacter' sur chaque produit. Un système de messagerie intégré permet d'échanger en toute sécurité. Les conversations sont sauvegardées dans votre profil.";
      }
      
      if (message.includes('favori') || message.includes('like') || message.includes('sauvegarde')) {
        return "Ajoutez des produits à vos favoris en cliquant sur le cœur ❤️. Retrouvez tous vos favoris dans votre profil. Pratique pour comparer et revenir plus tard sur les produits qui vous intéressent !";
      }
      
      if (message.includes('admin') || message.includes('modération')) {
        return "Les administrateurs Tomati modèrent la plateforme : validation des annonces, gestion des utilisateurs, statistiques. Si vous êtes admin, connectez-vous pour accéder au dashboard complet de gestion.";
      }
      
      if (message.includes('compte') || message.includes('inscription') || message.includes('connexion')) {
        return "Créez votre compte gratuitement pour publier des annonces, contacter les vendeurs, et gérer vos favoris. Utilisez votre email et choisissez un mot de passe sécurisé. La vérification est rapide !";
      }
      
      if (message.includes('gratuit') || message.includes('free')) {
        return "Oui ! Beaucoup de produits sont gratuits sur Tomati. Utilisez le filtre 'Produits gratuits' ou cherchez le badge 'Gratuit'. Une excellente façon de donner une seconde vie aux objets !";
      }
      
      if (message.includes('bonjour') || message.includes('salut') || message.includes('hello')) {
        return "Bonjour ! Ravi de vous aider sur Tomati. Je peux vous renseigner sur les produits, les fonctionnalités de la plateforme, comment vendre ou acheter. Que souhaitez-vous savoir ?";
      }
      
      if (message.includes('merci') || message.includes('thanks')) {
        return "Avec plaisir ! N'hésitez pas si vous avez d'autres questions. Je suis là pour vous aider à profiter au maximum de Tomati. Bonne navigation ! 😊";
      }
      
      // Default response
      return "Je comprends votre question ! Tomati est une plateforme d'échange qui connecte acheteurs et vendeurs. Vous pouvez parcourir les produits, utiliser la carte interactive, contacter les vendeurs, et publier vos propres annonces. Avez-vous une question spécifique sur une fonctionnalité ?";
    },
    onSuccess: (response, userMessage) => {
      const aiMessage: Message = {
        id: Date.now().toString() + '_ai',
        content: response,
        sender: 'ai',
        timestamp: new Date()
      };
      setMessages(prev => [...prev, aiMessage]);
    },
    onError: () => {
      toast({
        title: "Erreur",
        description: "Impossible de contacter l'assistant IA. Veuillez réessayer.",
        variant: "destructive",
      });
    }
  });

  const handleSendMessage = () => {
    if (!inputMessage.trim()) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      content: inputMessage,
      sender: 'user',
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMessage]);
    getAIResponse.mutate(inputMessage);
    setInputMessage("");
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed bottom-4 right-4 z-50">
      <Card className={`w-96 shadow-2xl border-2 ${isMinimized ? 'h-16' : 'h-[500px]'} transition-all duration-300`}>
        <CardHeader className="p-3 bg-primary text-primary-foreground">
          <div className="flex items-center justify-between">
            <CardTitle className="text-base flex items-center gap-2">
              <Bot size={18} />
              Assistant IA Tomati
              <Badge variant="secondary" className="text-xs">En ligne</Badge>
            </CardTitle>
            <div className="flex items-center gap-1">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setIsMinimized(!isMinimized)}
                className="h-8 w-8 p-0 text-primary-foreground hover:bg-primary-foreground/20"
              >
                {isMinimized ? <Maximize2 size={14} /> : <Minimize2 size={14} />}
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={onClose}
                className="h-8 w-8 p-0 text-primary-foreground hover:bg-primary-foreground/20"
              >
                <X size={14} />
              </Button>
            </div>
          </div>
        </CardHeader>

        {!isMinimized && (
          <CardContent className="p-0 flex flex-col h-[calc(500px-4rem)]">
            <ScrollArea className="flex-1 p-4">
              <div className="space-y-4">
                {messages.map((message) => (
                  <div
                    key={message.id}
                    className={`flex ${message.sender === 'user' ? 'justify-end' : 'justify-start'}`}
                  >
                    <div className={`flex items-start gap-2 max-w-[80%] ${message.sender === 'user' ? 'flex-row-reverse' : ''}`}>
                      <div className={`p-2 rounded-full ${message.sender === 'user' ? 'bg-primary' : 'bg-secondary'}`}>
                        {message.sender === 'user' ? (
                          <User size={14} className="text-primary-foreground" />
                        ) : (
                          <Bot size={14} className="text-secondary-foreground" />
                        )}
                      </div>
                      <div className={`p-3 rounded-lg ${
                        message.sender === 'user' 
                          ? 'bg-primary text-primary-foreground' 
                          : 'bg-secondary text-secondary-foreground'
                      }`}>
                        <p className="text-sm whitespace-pre-wrap">{message.content}</p>
                        <p className="text-xs opacity-70 mt-1">
                          {message.timestamp.toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })}
                        </p>
                      </div>
                    </div>
                  </div>
                ))}
                {getAIResponse.isPending && (
                  <div className="flex justify-start">
                    <div className="flex items-start gap-2">
                      <div className="p-2 rounded-full bg-secondary">
                        <Bot size={14} className="text-secondary-foreground" />
                      </div>
                      <div className="p-3 rounded-lg bg-secondary">
                        <div className="flex items-center gap-1">
                          <div className="w-2 h-2 bg-current rounded-full animate-bounce"></div>
                          <div className="w-2 h-2 bg-current rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                          <div className="w-2 h-2 bg-current rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                        </div>
                      </div>
                    </div>
                  </div>
                )}
                <div ref={messagesEndRef} />
              </div>
            </ScrollArea>

            <div className="p-4 border-t">
              <div className="flex items-center gap-2">
                <Input
                  placeholder="Tapez votre message..."
                  value={inputMessage}
                  onChange={(e) => setInputMessage(e.target.value)}
                  onKeyPress={handleKeyPress}
                  disabled={getAIResponse.isPending}
                  className="flex-1"
                />
                <Button 
                  onClick={handleSendMessage}
                  disabled={!inputMessage.trim() || getAIResponse.isPending}
                  size="sm"
                >
                  <Send size={16} />
                </Button>
              </div>
              <p className="text-xs text-muted-foreground mt-2 text-center">
                Assistant IA alimenté par Tomati - Vos données sont sécurisées
              </p>
            </div>
          </CardContent>
        )}
      </Card>
    </div>
  );
};

export const AIChatToggle = ({ onClick }: { onClick: () => void }) => {
  return (
    <Button
      onClick={onClick}
      className="fixed bottom-8 right-4 z-40 h-14 w-14 rounded-full shadow-2xl"
      size="lg"
    >
      <MessageCircle size={24} />
    </Button>
  );
};