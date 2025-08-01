import { useState } from 'react';
import { ProductFilter } from './ProductFilter';
import { ProductGrid } from './ProductGrid';

interface ProductOrganizerProps {
  onProductClick?: (productId: string) => void;
  onProductLike?: (productId: string) => void;
  onProductMessage?: (productId: string) => void;
}

export function ProductOrganizer({ 
  onProductClick, 
  onProductLike, 
  onProductMessage 
}: ProductOrganizerProps) {
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [filters, setFilters] = useState({
    search: '',
    category: 'all',
    priceRange: [0, 100000],
    condition: 'all',
    location: 'all'
  });
  const [sortConfig, setSortConfig] = useState({
    sortBy: 'created_at',
    direction: 'desc' as 'asc' | 'desc'
  });

  const handleFilter = (newFilters: any) => {
    setFilters(newFilters);
  };

  const handleSort = (sortBy: string, direction: 'asc' | 'desc') => {
    setSortConfig({ sortBy, direction });
  };

  const handleViewModeChange = (mode: 'grid' | 'list') => {
    setViewMode(mode);
  };

  return (
    <div className="space-y-6">
      <ProductFilter
        onFilter={handleFilter}
        onSort={handleSort}
        onViewModeChange={handleViewModeChange}
        viewMode={viewMode}
        productCount={0} // This will be updated when we get the actual count
      />
      
      <ProductGrid
        category={filters.category === 'all' ? '' : filters.category}
        searchTerm={filters.search}
        sortBy={`${sortConfig.sortBy}-${sortConfig.direction}`}
        onProductClick={onProductClick}
        onProductLike={onProductLike}
        onProductMessage={onProductMessage}
        viewMode={viewMode}
        filters={filters}
      />
    </div>
  );
}