import { Button } from '@/components/ui/button';

interface SimpleWelcomeProps {
  onClose: () => void;
}

export function SimpleWelcome({ onClose }: SimpleWelcomeProps) {
  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white p-8 rounded-lg max-w-md w-full text-center">
        <div className="text-6xl mb-4">🍅</div>
        <h1 className="text-2xl font-bold mb-2">مرحبا بك في توماتي!</h1>
        <p className="text-lg mb-2">Marhaba bik fi Tomati App!</p>
        <p className="text-gray-600 mb-6">Bienvenue dans votre marketplace tunisienne</p>
        <Button 
          onClick={onClose}
          className="bg-red-500 hover:bg-red-600 text-white"
        >
          Commencer 🌟
        </Button>
      </div>
    </div>
  );
}