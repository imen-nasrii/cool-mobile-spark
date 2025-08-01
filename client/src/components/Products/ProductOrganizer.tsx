import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Grid, List, Filter, Search, SortAsc, SortDesc } from 'lucide-react';

interface ProductOrganizerProps {
  products: any[];
  viewMode: 'grid' | 'list';
  onViewModeChange: (mode: 'grid' | 'list') => void;
  onFilter: (filters: any) => void;
  onSort: (sortBy: string, direction: 'asc' | 'desc') => void;
}

export function ProductOrganizer({ 
  products, 
  viewMode, 
  onViewModeChange, 
  onFilter, 
  onSort 
}: ProductOrganizerProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [priceFilter, setPriceFilter] = useState('all');
  const [sortBy, setSortBy] = useState('created_at');
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('desc');

  const handleSearch = (value: string) => {
    setSearchTerm(value);
    onFilter({ search: value, category: categoryFilter, price: priceFilter });
  };

  const handleCategoryFilter = (value: string) => {
    setCategoryFilter(value);
    onFilter({ search: searchTerm, category: value, price: priceFilter });
  };

  const handlePriceFilter = (value: string) => {
    setPriceFilter(value);
    onFilter({ search: searchTerm, category: categoryFilter, price: value });
  };

  const handleSort = (field: string) => {
    const newDirection = sortBy === field && sortDirection === 'asc' ? 'desc' : 'asc';
    setSortBy(field);
    setSortDirection(newDirection);
    onSort(field, newDirection);
  };

  return (
    <Card className="mb-6">
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <span>Organisation des Produits</span>
          <div className="flex items-center gap-2">
            <Button
              variant={viewMode === 'grid' ? 'default' : 'outline'}
              size="sm"
              onClick={() => onViewModeChange('grid')}
            >
              <Grid className="w-4 h-4" />
            </Button>
            <Button
              variant={viewMode === 'list' ? 'default' : 'outline'}
              size="sm"
              onClick={() => onViewModeChange('list')}
            >
              <List className="w-4 h-4" />
            </Button>
          </div>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
          {/* Recherche */}
          <div className="relative">
            <Search className="absolute left-3 top-3 w-4 h-4 text-gray-400" />
            <Input
              placeholder="Rechercher..."
              value={searchTerm}
              onChange={(e) => handleSearch(e.target.value)}
              className="pl-10"
            />
          </div>

          {/* Filtre par catégorie */}
          <Select value={categoryFilter} onValueChange={handleCategoryFilter}>
            <SelectTrigger>
              <SelectValue placeholder="Catégorie" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Toutes les catégories</SelectItem>
              <SelectItem value="voiture">Voitures</SelectItem>
              <SelectItem value="immobilier">Immobilier</SelectItem>
              <SelectItem value="emplois">Emplois</SelectItem>
              <SelectItem value="autres">Autres</SelectItem>
            </SelectContent>
          </Select>

          {/* Filtre par prix */}
          <Select value={priceFilter} onValueChange={handlePriceFilter}>
            <SelectTrigger>
              <SelectValue placeholder="Prix" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Tous les prix</SelectItem>
              <SelectItem value="free">Gratuit</SelectItem>
              <SelectItem value="0-1000">0 - 1000 DT</SelectItem>
              <SelectItem value="1000-5000">1000 - 5000 DT</SelectItem>
              <SelectItem value="5000-20000">5000 - 20000 DT</SelectItem>
              <SelectItem value="20000+">20000+ DT</SelectItem>
            </SelectContent>
          </Select>

          {/* Tri par date */}
          <Button
            variant="outline"
            onClick={() => handleSort('created_at')}
            className="flex items-center gap-2"
          >
            Date
            {sortBy === 'created_at' && (
              sortDirection === 'asc' ? <SortAsc className="w-4 h-4" /> : <SortDesc className="w-4 h-4" />
            )}
          </Button>

          {/* Tri par prix */}
          <Button
            variant="outline"
            onClick={() => handleSort('price')}
            className="flex items-center gap-2"
          >
            Prix
            {sortBy === 'price' && (
              sortDirection === 'asc' ? <SortAsc className="w-4 h-4" /> : <SortDesc className="w-4 h-4" />
            )}
          </Button>
        </div>

        {/* Statistiques rapides */}
        <div className="flex gap-4 mt-4 pt-4 border-t">
          <Badge variant="secondary">
            {products.length} produits
          </Badge>
          <Badge variant="outline">
            {products.filter(p => p.promoted).length} promus
          </Badge>
          <Badge variant="outline">
            {products.filter(p => p.is_free).length} gratuits
          </Badge>
        </div>
      </CardContent>
    </Card>
  );
}