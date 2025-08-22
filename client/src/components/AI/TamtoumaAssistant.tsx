import { useState } from 'react';
import { Bot, Send, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

interface Message {
  id: string;
  text: string;
  isBot: boolean;
}

const quickResponses = [
  { keywords: ['salut', 'bonjour', 'hello'], response: "Bonjour ! Je suis Tamtouma 🍅 Comment puis-je vous aider ?" },
  { keywords: ['vendre', 'publier'], response: "Pour vendre : Cliquez sur '+' → Choisissez catégorie → Publiez ! 🚀" },
  { keywords: ['acheter'], response: "Pour acheter : Trouvez produit → Contactez vendeur → Négociez ! 💬" },
  { keywords: ['rendez-vous'], response: "Rendez-vous : Dans conversation, cliquez calendrier 📅" },
  { keywords: ['aide', 'help'], response: "Je suis là pour vous aider ! 🆘" }
];

export const TamtoumaAssistant = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([
    { id: '1', text: "Salut ! Je suis Tamtouma 🍅 ! Comment puis-je vous aider ?", isBot: true }
  ]);
  const [inputValue, setInputValue] = useState('');

  // Debug: s'assurer que le composant est rendu
  console.log('TamtoumaAssistant rendered, isOpen:', isOpen);

  const handleSendMessage = () => {
    if (!inputValue.trim()) return;
    
    const userMessage: Message = { id: Date.now().toString(), text: inputValue, isBot: false };
    setMessages(prev => [...prev, userMessage]);
    
    const response = quickResponses.find(r => 
      r.keywords.some(k => inputValue.toLowerCase().includes(k))
    )?.response || "Je ne comprends pas. Essayez : vendre, acheter, rendez-vous, aide 🤔";
    
    setTimeout(() => {
      const botMessage: Message = { id: (Date.now() + 1).toString(), text: response, isBot: true };
      setMessages(prev => [...prev, botMessage]);
    }, 500);
    
    setInputValue('');
  };

  if (!isOpen) {
    return (
      <Button
        onClick={() => setIsOpen(true)}
        className="fixed bottom-4 left-4 z-[9999] bg-red-500 hover:bg-red-600 text-white rounded-full w-14 h-14 shadow-lg"
      >
        <Bot size={24} />
      </Button>
    );
  }

  return (
    <div className="fixed bottom-4 left-4 z-[9999] bg-white border border-gray-200 rounded-lg shadow-xl w-80 h-96">
      <div className="flex items-center justify-between p-3 bg-red-500 text-white rounded-t-lg">
        <div className="flex items-center gap-2">
          <Bot size={20} />
          <span className="font-medium">Tamtouma</span>
        </div>
        <Button onClick={() => setIsOpen(false)} variant="ghost" size="sm" className="text-white hover:bg-red-600 h-8 w-8 p-0">
          <X size={16} />
        </Button>
      </div>
      
      <div className="flex-1 overflow-y-auto p-3 h-64 bg-gray-50">
        {messages.map((message) => (
          <div key={message.id} className={`flex ${message.isBot ? "justify-start" : "justify-end"} mb-3`}>
            <div className={`max-w-[80%] rounded-lg px-3 py-2 text-sm ${message.isBot ? "bg-white text-gray-800 border" : "bg-red-500 text-white"}`}>
              {message.isBot && (
                <div className="flex items-center gap-1 mb-1">
                  <Bot size={12} className="text-red-500" />
                  <span className="text-xs font-medium text-red-500">Tamtouma</span>
                </div>
              )}
              <p>{message.text}</p>
            </div>
          </div>
        ))}
      </div>
      
      <div className="p-3 border-t">
        <div className="flex gap-2">
          <Input
            placeholder="Tapez votre question..."
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
            className="flex-1 text-sm"
          />
          <Button onClick={handleSendMessage} disabled={!inputValue.trim()} className="bg-red-500 hover:bg-red-600 text-white px-3">
            <Send size={16} />
          </Button>
        </div>
      </div>
    </div>
  );
};