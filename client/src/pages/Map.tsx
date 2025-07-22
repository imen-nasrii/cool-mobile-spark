import { ProductMap } from '@/components/Map/ProductMap';
import { useLanguage } from '@/hooks/useLanguage';

export function Map() {
  const { t } = useLanguage();

  return (
    <div className="h-screen flex flex-col">
      {/* Header */}
      <div className="bg-white border-b px-4 py-3 flex-shrink-0">
        <h1 className="text-lg font-semibold text-gray-900">
          Articles près de vous
        </h1>
        <p className="text-sm text-gray-600 mt-1">
          Découvrez les annonces autour de votre position
        </p>
      </div>

      {/* Map Container */}
      <div className="flex-1 relative">
        <ProductMap />
      </div>
    </div>
  );
}