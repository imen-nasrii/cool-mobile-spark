import React, { useState } from 'react';

export const SimpleTamtouma = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState([
    { id: '1', text: "Salut ! Je suis Tamtouma 🍅 ! Comment puis-je vous aider ?", isBot: true }
  ]);
  const [inputValue, setInputValue] = useState('');

  const quickResponses = [
    { keywords: ['salut', 'bonjour', 'hello'], response: "Bonjour ! Je suis Tamtouma 🍅 Comment puis-je vous aider ?" },
    { keywords: ['vendre', 'publier'], response: "Pour vendre : Cliquez sur '+' → Choisissez catégorie → Publiez ! 🚀" },
    { keywords: ['acheter'], response: "Pour acheter : Trouvez produit → Contactez vendeur → Négociez ! 💬" },
    { keywords: ['rendez-vous'], response: "Rendez-vous : Dans conversation, cliquez calendrier 📅" },
    { keywords: ['aide', 'help'], response: "Je suis là pour vous aider ! 🆘" }
  ];

  const handleSendMessage = () => {
    if (!inputValue.trim()) return;
    
    const userMessage = { id: Date.now().toString(), text: inputValue, isBot: false };
    setMessages(prev => [...prev, userMessage]);
    
    const response = quickResponses.find(r => 
      r.keywords.some(k => inputValue.toLowerCase().includes(k))
    )?.response || "Je ne comprends pas. Essayez : vendre, acheter, rendez-vous, aide 🤔";
    
    setTimeout(() => {
      const botMessage = { id: (Date.now() + 1).toString(), text: response, isBot: true };
      setMessages(prev => [...prev, botMessage]);
    }, 500);
    
    setInputValue('');
  };

  if (!isOpen) {
    return (
      <div 
        style={{
          position: 'fixed',
          bottom: '20px',
          left: '20px',
          zIndex: 99999,
          width: '60px',
          height: '60px',
          backgroundColor: '#ef4444',
          borderRadius: '50%',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          color: 'white',
          fontSize: '24px',
          cursor: 'pointer',
          boxShadow: '0 4px 12px rgba(0,0,0,0.3)'
        }}
        onClick={() => setIsOpen(true)}
      >
        🤖
      </div>
    );
  }

  return (
    <div style={{
      position: 'fixed',
      bottom: '20px',
      left: '20px',
      zIndex: 99999,
      width: '320px',
      height: '400px',
      backgroundColor: 'white',
      borderRadius: '12px',
      boxShadow: '0 8px 32px rgba(0,0,0,0.3)',
      border: '2px solid #ef4444',
      display: 'flex',
      flexDirection: 'column'
    }}>
      {/* Header */}
      <div style={{
        backgroundColor: '#ef4444',
        color: 'white',
        padding: '12px',
        borderRadius: '10px 10px 0 0',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <span style={{ fontSize: '20px' }}>🤖</span>
          <span style={{ fontWeight: 'bold' }}>Tamtouma</span>
        </div>
        <button 
          onClick={() => setIsOpen(false)}
          style={{
            background: 'none',
            border: 'none',
            color: 'white',
            fontSize: '20px',
            cursor: 'pointer',
            padding: '4px'
          }}
        >
          ✕
        </button>
      </div>

      {/* Messages */}
      <div style={{
        flex: 1,
        padding: '12px',
        overflowY: 'auto',
        backgroundColor: '#f9f9f9'
      }}>
        {messages.map((message) => (
          <div key={message.id} style={{
            display: 'flex',
            justifyContent: message.isBot ? 'flex-start' : 'flex-end',
            marginBottom: '12px'
          }}>
            <div style={{
              maxWidth: '80%',
              padding: '8px 12px',
              borderRadius: '12px',
              backgroundColor: message.isBot ? 'white' : '#ef4444',
              color: message.isBot ? 'black' : 'white',
              border: message.isBot ? '1px solid #ddd' : 'none',
              fontSize: '14px'
            }}>
              {message.isBot && (
                <div style={{ 
                  display: 'flex', 
                  alignItems: 'center', 
                  gap: '4px', 
                  marginBottom: '4px',
                  fontSize: '12px',
                  color: '#ef4444',
                  fontWeight: 'bold'
                }}>
                  🤖 Tamtouma
                </div>
              )}
              <p style={{ margin: 0 }}>{message.text}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Input */}
      <div style={{
        padding: '12px',
        borderTop: '1px solid #ddd',
        display: 'flex',
        gap: '8px'
      }}>
        <input
          type="text"
          placeholder="Tapez votre question..."
          value={inputValue}
          onChange={(e) => setInputValue(e.target.value)}
          onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
          style={{
            flex: 1,
            padding: '8px 12px',
            border: '1px solid #ddd',
            borderRadius: '20px',
            outline: 'none',
            fontSize: '14px'
          }}
        />
        <button 
          onClick={handleSendMessage}
          disabled={!inputValue.trim()}
          style={{
            backgroundColor: '#ef4444',
            color: 'white',
            border: 'none',
            borderRadius: '50%',
            width: '40px',
            height: '40px',
            cursor: inputValue.trim() ? 'pointer' : 'not-allowed',
            opacity: inputValue.trim() ? 1 : 0.5,
            fontSize: '16px'
          }}
        >
          ➤
        </button>
      </div>
    </div>
  );
};