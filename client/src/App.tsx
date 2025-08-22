// Test App - Minimal version to identify crash source

const App = () => {
  return (
    <div className="min-h-screen bg-white flex items-center justify-center">
      <div className="text-center">
        <div className="text-6xl mb-4">🍅</div>
        <h1 className="text-3xl font-bold text-red-500 mb-2">Tomati Market</h1>
        <p className="text-xl text-gray-700 mb-4">مرحبا بك في توماتي!</p>
        <p className="text-lg text-gray-600">Marhaba bik fi Tomati App!</p>
        <p className="text-gray-500 mt-4">Test version - App is loading...</p>
      </div>
    </div>
  );
};

export default App;
