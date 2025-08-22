import { Loader2 } from 'lucide-react';

export function AppLoading() {
  return (
    <div className="fixed inset-0 bg-white flex items-center justify-center z-50">
      <div className="text-center">
        <div className="text-6xl mb-4">🍅</div>
        <h1 className="text-2xl font-bold text-red-500 mb-2">Tomati</h1>
        <div className="flex items-center justify-center gap-2 text-gray-600">
          <Loader2 className="h-4 w-4 animate-spin" />
          <span className="text-sm">Chargement...</span>
        </div>
      </div>
    </div>
  );
}