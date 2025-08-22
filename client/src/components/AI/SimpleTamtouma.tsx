import React from 'react';

export const SimpleTamtouma = () => {
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
      onClick={() => alert('🤖 Tamtouma: Salut ! Je suis votre assistant ! Comment puis-je vous aider ?')}
    >
      🤖
    </div>
  );
};