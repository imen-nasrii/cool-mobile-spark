import React, { useState } from 'react';

export const SimpleTamtouma = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState([
    { id: '1', text: "Yoo ! 🍅 Tamtouma dans la place ! Ton assistant perso le plus stylé ! Qu'est-ce qu'on fait aujourd'hui ? 🔥😎", isBot: true }
  ]);
  const [inputValue, setInputValue] = useState('');

  const quickResponses = [
    { keywords: ['salut', 'bonjour', 'hello', 'yo', 'hey'], response: "Yoo ! 🍅 Tamtouma dans la place ! Prêt pour faire des affaires de ouf ? 🔥" },
    { keywords: ['vendre', 'publier', 'poster'], response: "🚀 VENDRE COMME UN BOSS ! Clique sur + → Choisis ta catégorie → Publie ton truc → Deviens riche ! 💰✨" },
    { keywords: ['acheter', 'shopping', 'achat'], response: "🛒 MODE SHOPPING ACTIVÉ ! Trouve ton crush produit → Contacte le vendeur → Négocie comme un chef ! 😎💪" },
    { keywords: ['rendez-vous', 'rdv', 'meeting'], response: "📅 TIME TO MEET ! Dans tes conversations, clique sur le calendrier et fixe ton RDV ! Easy peasy ! 🤝" },
    { keywords: ['aide', 'help', 'au secours'], response: "🆘 Tamtouma à la rescousse ! Je suis ton assistant perso ! Dis-moi tout ! 🦸‍♂️" },
    { keywords: ['prix', 'combien', 'coût'], response: "💰 Ah le prix ! Secret de négociation : commence bas, monte doucement, et charm ton vendeur ! 😉💸" },
    { keywords: ['cool', 'génial', 'top'], response: "😎 Tu as bon goût mon pote ! Tamtouma c'est la classe internationale ! 🌟🍅" },
    { keywords: ['merci', 'thanks'], response: "🙏 Avec plaisir boss ! Tamtouma est toujours là pour toi ! On fait équipe ! 💪❤️" },
    { keywords: ['blague', 'joke', 'drôle'], response: "😂 Pourquoi les tomates rougissent ? Parce qu'elles voient les prix sur Tomati ! 🍅💸 BOOM !" },
    { keywords: ['qui es tu', 'qui', 'toi'], response: "🤖 Moi ? Je suis Tamtouma ! L'IA la plus stylée de Tunisie ! Mi-tomate, mi-robot, 100% cool ! 🍅⚡" }
  ];

  const handleSendMessage = () => {
    if (!inputValue.trim()) return;
    
    const userMessage = { id: Date.now().toString(), text: inputValue, isBot: false };
    setMessages(prev => [...prev, userMessage]);
    
    const response = quickResponses.find(r => 
      r.keywords.some(k => inputValue.toLowerCase().includes(k))
    )?.response || "🤔 Hmm... Je n'ai pas compris ! Essaie : vendre, acheter, rdv, aide, prix, blague ! Ou dis juste salut ! 😄🍅";
    
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
          <span style={{ fontWeight: 'bold' }}>Tamtouma 🔥</span>
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
          placeholder="Dis-moi tout mon pote ! 🔥"
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