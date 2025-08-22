import { useState, useRef, useEffect } from 'react';
import { Bot, Send, X, MessageCircle, Minimize2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { cn } from '@/lib/utils';

interface Message {
  id: string;
  text: string;
  isBot: boolean;
  timestamp: Date;
}

interface TamtoumaResponse {
  keywords: string[];
  response: string;
  followUp?: string[];
}

const tamtoumaKnowledge: TamtoumaResponse[] = [
  {
    keywords: ['salut', 'bonjour', 'hello', 'hi', 'hey'],
    response: "Bonjour ! Je suis Tamtouma, votre assistant virtuel sur Tomati Market ! 🍅 Comment puis-je vous aider aujourd'hui ?",
    followUp: ['Comment vendre un produit ?', 'Comment acheter ?', 'Comment contacter un vendeur ?']
  },
  {
    keywords: ['vendre', 'publier', 'annonce', 'produit'],
    response: "Pour vendre sur Tomati Market : 1️⃣ Cliquez sur le bouton '+' flottant en bas à droite 2️⃣ Choisissez votre catégorie (Auto, Immobilier, Emplois...) 3️⃣ Remplissez les détails et ajoutez des photos 4️⃣ Publiez votre annonce ! 🚀",
    followUp: ['Quelles catégories disponibles ?', 'Comment ajouter des photos ?', 'Comment fixer le prix ?']
  },
  {
    keywords: ['acheter', 'commander', 'achat'],
    response: "Pour acheter : 1️⃣ Trouvez le produit qui vous intéresse 2️⃣ Cliquez sur 'Contacter' pour discuter avec le vendeur 3️⃣ Négociez le prix et les détails 4️⃣ Planifiez un rendez-vous si nécessaire ! 💬",
    followUp: ['Comment contacter vendeur ?', 'Comment négocier prix ?', 'Système de paiement ?']
  },
  {
    keywords: ['rendez-vous', 'rencontrer', 'calendrier'],
    response: "Système de rendez-vous : 📅 Dans une conversation, cliquez sur l'icône calendrier pour proposer un rendez-vous. Le vendeur peut accepter/refuser. Une fois confirmé, le produit est automatiquement réservé ! ⏰",
    followUp: ['Comment confirmer rendez-vous ?', 'Produit réservé automatiquement ?', 'Annuler rendez-vous ?']
  },
  {
    keywords: ['voiture', 'auto', 'véhicule', 'équipements'],
    response: "Section Auto : 🚗 Vous pouvez ajouter tous les détails de votre véhicule (marque, année, kilométrage, carburant...) et sélectionner les équipements disponibles (ABS, climatisation, GPS, etc.) ! Les équipements s'affichent avec des icônes dans l'annonce.",
    followUp: ['Liste des équipements ?', 'Comment ajouter photos voiture ?', 'Estimation prix voiture ?']
  },
  {
    keywords: ['immobilier', 'appartement', 'maison', 'villa'],
    response: "Section Immobilier : 🏠 Ajoutez le type de bien (villa, appartement...), surface, nombre de pièces, étage, et services (parking, jardin, balcon...). La localisation s'affiche automatiquement sur la carte ! 📍",
    followUp: ['Types de biens disponibles ?', 'Comment indiquer localisation ?', 'Surface minimum ?']
  },
  {
    keywords: ['emploi', 'travail', 'job', 'recrutement'],
    response: "Section Emplois : 💼 Publiez vos offres d'emploi avec le type de contrat, secteur d'activité, expérience requise, salaire, et avantages. Les candidats peuvent vous contacter directement !",
    followUp: ['Types de contrats ?', 'Comment recruter ?', 'Publier CV ?']
  },
  {
    keywords: ['prix', 'gratuit', 'paiement', 'coût'],
    response: "Tarification : 💰 Vous pouvez proposer des produits gratuits ou payants. Indiquez votre prix en TND (dinars tunisiens). La négociation se fait directement entre acheteur et vendeur via les messages !",
    followUp: ['Frais de commission ?', 'Modes de paiement ?', 'Négociation prix ?']
  },
  {
    keywords: ['message', 'contacter', 'discussion', 'chat'],
    response: "Messagerie : 💬 Cliquez sur 'Contacter' sous un produit pour démarrer une conversation. Vous pouvez envoyer des messages, des photos, et même planifier des rendez-vous avec l'icône calendrier ! 📅",
    followUp: ['Envoyer photos dans chat ?', 'Historique messages ?', 'Bloquer utilisateur ?']
  },
  {
    keywords: ['carte', 'localisation', 'gps', 'adresse'],
    response: "Carte et localisation : 🗺️ Tous les produits sont géolocalisés ! Utilisez l'onglet 'Carte' pour voir les produits près de chez vous. La localisation s'affiche aussi dans les détails de chaque produit !",
    followUp: ['Comment changer localisation ?', 'Recherche par zone ?', 'Distance maximale ?']
  },
  {
    keywords: ['compte', 'profil', 'inscription', 'connexion'],
    response: "Compte utilisateur : 👤 Créez votre compte pour publier des annonces et contacter les vendeurs. Votre profil affiche votre nom et date d'inscription. Les vendeurs peuvent voir qui les contacte !",
    followUp: ['Modifier profil ?', 'Mot de passe oublié ?', 'Supprimer compte ?']
  },
  {
    keywords: ['photo', 'image', 'ajouter'],
    response: "Photos : 📸 Vous pouvez ajouter jusqu'à 8 photos par produit ! Les images s'affichent dans une galerie avec navigation. Pour les voitures, ajoutez des photos de l'extérieur, intérieur, et détails importants !",
    followUp: ['Format photos accepté ?', 'Taille maximum ?', 'Modifier photos ?']
  },
  {
    keywords: ['recherche', 'chercher', 'filtrer'],
    response: "Recherche : 🔍 Utilisez la barre de recherche pour trouver des produits par nom, catégorie ou localisation. Vous pouvez aussi filtrer par catégorie et trier par prix, date, popularité !",
    followUp: ['Recherche avancée ?', 'Sauvegarder recherches ?', 'Alertes nouveaux produits ?']
  },
  {
    keywords: ['aide', 'help', 'problème', 'support'],
    response: "Besoin d'aide ? 🆘 Je suis là pour vous ! Posez-moi vos questions sur l'utilisation de Tomati Market. Si vous avez un problème technique, décrivez-moi ce qui ne fonctionne pas et je vous aiderai !",
    followUp: ['Contact support technique ?', 'Signaler un bug ?', 'Suggestions améliorations ?']
  },
  {
    keywords: ['merci', 'thanks', 'remercie'],
    response: "De rien ! 😊 Je suis ravi de vous avoir aidé ! N'hésitez pas à revenir me voir si vous avez d'autres questions sur Tomati Market. Bonne vente et bon achat ! 🍅✨",
  }
];

const defaultResponses = [
  "Je ne suis pas sûr de comprendre votre question. Pouvez-vous être plus précis ? 🤔",
  "Hmm, je n'ai pas d'information sur ce sujet. Essayez de reformuler votre question ! 💭",
  "Je suis encore en apprentissage ! Pouvez-vous me poser une question sur l'utilisation de Tomati Market ? 🍅"
];

export const TamtoumaAssistant = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [isMinimized, setIsMinimized] = useState(false);
  const [messages, setMessages] = useState<Message[]>([
    {
      id: '1',
      text: "Salut ! Je suis Tamtouma 🍅, votre assistant virtuel sur Tomati Market ! Comment puis-je vous aider aujourd'hui ?",
      isBot: true,
      timestamp: new Date()
    }
  ]);
  const [inputValue, setInputValue] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const findBestResponse = (userMessage: string): TamtoumaResponse | null => {
    const messageLower = userMessage.toLowerCase();
    
    // Chercher une correspondance exacte avec les mots-clés
    for (const knowledge of tamtoumaKnowledge) {
      for (const keyword of knowledge.keywords) {
        if (messageLower.includes(keyword)) {
          return knowledge;
        }
      }
    }
    
    return null;
  };

  const handleSendMessage = async () => {
    if (!inputValue.trim()) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      text: inputValue,
      isBot: false,
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMessage]);
    setInputValue('');
    setIsTyping(true);

    // Simuler un délai de réflexion
    setTimeout(() => {
      const bestResponse = findBestResponse(inputValue);
      const botResponse = bestResponse 
        ? bestResponse.response 
        : defaultResponses[Math.floor(Math.random() * defaultResponses.length)];

      const botMessage: Message = {
        id: (Date.now() + 1).toString(),
        text: botResponse,
        isBot: true,
        timestamp: new Date()
      };

      setMessages(prev => [...prev, botMessage]);
      setIsTyping(false);

      // Ajouter des suggestions de suivi si disponibles
      if (bestResponse?.followUp) {
        setTimeout(() => {
          const followUpMessage: Message = {
            id: (Date.now() + 2).toString(),
            text: `💡 Questions liées : ${bestResponse.followUp!.join(' • ')}`,
            isBot: true,
            timestamp: new Date()
          };
          setMessages(prev => [...prev, followUpMessage]);
        }, 1000);
      }
    }, 1000 + Math.random() * 1000);
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleSendMessage();
    }
  };

  const handleQuickReply = (question: string) => {
    setInputValue(question);
    setTimeout(() => handleSendMessage(), 100);
  };

  if (!isOpen) {
    return (
      <Button
        onClick={() => setIsOpen(true)}
        className="fixed bottom-4 left-4 z-50 bg-red-500 hover:bg-red-600 text-white rounded-full w-14 h-14 shadow-lg"
        title="Assistant Tamtouma"
      >
        <Bot size={24} />
      </Button>
    );
  }

  return (
    <div className={cn(
      "fixed bottom-4 left-4 z-50 bg-white border border-gray-200 rounded-lg shadow-xl transition-all duration-300",
      isMinimized ? "w-80 h-16" : "w-80 h-96"
    )}>
      {/* Header */}
      <div className="flex items-center justify-between p-3 bg-red-500 text-white rounded-t-lg">
        <div className="flex items-center gap-2">
          <Bot size={20} />
          <span className="font-medium">Tamtouma</span>
          <div className="w-2 h-2 bg-green-400 rounded-full"></div>
        </div>
        <div className="flex gap-1">
          <Button
            onClick={() => setIsMinimized(!isMinimized)}
            variant="ghost"
            size="sm"
            className="text-white hover:bg-red-600 h-8 w-8 p-0"
          >
            <Minimize2 size={16} />
          </Button>
          <Button
            onClick={() => setIsOpen(false)}
            variant="ghost"
            size="sm"
            className="text-white hover:bg-red-600 h-8 w-8 p-0"
          >
            <X size={16} />
          </Button>
        </div>
      </div>

      {!isMinimized && (
        <>
          {/* Messages */}
          <div className="flex-1 overflow-y-auto p-3 h-64 bg-gray-50">
            <div className="space-y-3">
              {messages.map((message) => (
                <div
                  key={message.id}
                  className={cn(
                    "flex",
                    message.isBot ? "justify-start" : "justify-end"
                  )}
                >
                  <div
                    className={cn(
                      "max-w-[80%] rounded-lg px-3 py-2 text-sm",
                      message.isBot
                        ? "bg-white text-gray-800 border border-gray-200"
                        : "bg-red-500 text-white"
                    )}
                  >
                    {message.isBot && (
                      <div className="flex items-center gap-1 mb-1">
                        <Bot size={12} className="text-red-500" />
                        <span className="text-xs font-medium text-red-500">Tamtouma</span>
                      </div>
                    )}
                    <p className="whitespace-pre-wrap">{message.text}</p>
                  </div>
                </div>
              ))}
              
              {isTyping && (
                <div className="flex justify-start">
                  <div className="bg-white border border-gray-200 rounded-lg px-3 py-2">
                    <div className="flex items-center gap-1">
                      <Bot size={12} className="text-red-500" />
                      <span className="text-xs font-medium text-red-500">Tamtouma</span>
                    </div>
                    <div className="flex gap-1 mt-1">
                      <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></div>
                      <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                      <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                    </div>
                  </div>
                </div>
              )}
              <div ref={messagesEndRef} />
            </div>
          </div>

          {/* Input */}
          <div className="p-3 border-t border-gray-200">
            <div className="flex gap-2">
              <Input
                placeholder="Tapez votre question..."
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                onKeyPress={handleKeyPress}
                className="flex-1 text-sm"
                disabled={isTyping}
              />
              <Button
                onClick={handleSendMessage}
                disabled={!inputValue.trim() || isTyping}
                className="bg-red-500 hover:bg-red-600 text-white px-3"
              >
                <Send size={16} />
              </Button>
            </div>
          </div>
        </>
      )}
    </div>
  );
};