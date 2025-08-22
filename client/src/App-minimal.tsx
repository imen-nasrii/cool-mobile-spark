// Ultra minimal test - just plain HTML
function App() {
  return (
    <div style={{ 
      minHeight: '100vh', 
      backgroundColor: 'white', 
      display: 'flex', 
      alignItems: 'center', 
      justifyContent: 'center',
      fontFamily: 'Arial, sans-serif'
    }}>
      <div style={{ textAlign: 'center' }}>
        <div style={{ fontSize: '60px', marginBottom: '16px' }}>🍅</div>
        <h1 style={{ fontSize: '32px', fontWeight: 'bold', color: '#ef4444', marginBottom: '8px' }}>
          Tomati Market
        </h1>
        <p style={{ fontSize: '20px', color: '#374151', marginBottom: '16px' }}>
          مرحبا بك في توماتي!
        </p>
        <p style={{ fontSize: '18px', color: '#6b7280' }}>
          Marhaba bik fi Tomati App!
        </p>
        <p style={{ color: '#9ca3af', marginTop: '16px' }}>
          Ultra minimal version (no Tailwind, no hooks)
        </p>
      </div>
    </div>
  );
}

export default App;