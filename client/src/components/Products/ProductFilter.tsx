import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Slider } from '@/components/ui/slider';
import { Search, Filter, SortAsc, SortDesc, Grid, List, X } from 'lucide-react';

interface ProductFilterProps {
  onFilter: (filters: any) => void;
  onSort: (sortBy: string, direction: 'asc' | 'desc') => void;
  onViewModeChange: (mode: 'grid' | 'list') => void;
  viewMode: 'grid' | 'list';
  productCount: number;
}

export function ProductFilter({ 
  onFilter, 
  onSort, 
  onViewModeChange, 
  viewMode, 
  productCount 
}: ProductFilterProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const [category, setCategory] = useState('all');
  const [priceRange, setPriceRange] = useState([0, 100000]);
  const [condition, setCondition] = useState('all');
  const [location, setLocation] = useState('all');
  const [sortBy, setSortBy] = useState('created_at');
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('desc');
  const [showFilters, setShowFilters] = useState(false);

  const handleSearch = () => {
    onFilter({
      search: searchTerm,
      category,
      priceRange,
      condition,
      location
    });
  };

  const handleSort = (field: string) => {
    const newDirection = sortBy === field && sortDirection === 'asc' ? 'desc' : 'asc';
    setSortBy(field);
    setSortDirection(newDirection);
    onSort(field, newDirection);
  };

  const clearFilters = () => {
    setSearchTerm('');
    setCategory('all');
    setPriceRange([0, 100000]);
    setCondition('all');
    setLocation('all');
    onFilter({
      search: '',
      category: 'all',
      priceRange: [0, 100000],
      condition: 'all',
      location: 'all'
    });
  };

  const activeFiltersCount = [
    searchTerm !== '',
    category !== 'all',
    priceRange[0] !== 0 || priceRange[1] !== 100000,
    condition !== 'all',
    location !== 'all'
  ].filter(Boolean).length;

  return (
    <Card className="mb-6">
      <CardContent className="p-4">
        {/* Main Search Bar */}
        <div className="flex flex-col lg:flex-row gap-3 mb-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
            <Input
              placeholder="Rechercher des produits..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
              onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
            />
          </div>
          
          <div className="flex gap-2">
            <Button onClick={handleSearch} className="px-6">
              <Search size={16} className="mr-2" />
              Rechercher
            </Button>
            
            <Button
              variant="outline"
              onClick={() => setShowFilters(!showFilters)}
              className="relative"
            >
              <Filter size={16} className="mr-2" />
              Filtres
              {activeFiltersCount > 0 && (
                <Badge className="absolute -top-2 -right-2 h-5 w-5 p-0 text-xs">
                  {activeFiltersCount}
                </Badge>
              )}
            </Button>
          </div>
        </div>

        {/* Advanced Filters */}
        {showFilters && (
          <div className="border-t pt-4 space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              {/* Catégorie */}
              <div>
                <label className="text-sm font-medium mb-2 block">Catégorie</label>
                <Select value={category} onValueChange={setCategory}>
                  <SelectTrigger>
                    <SelectValue placeholder="Toutes" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Toutes catégories</SelectItem>
                    <SelectItem value="voiture">Voitures</SelectItem>
                    <SelectItem value="immobilier">Immobilier</SelectItem>
                    <SelectItem value="emplois">Emplois</SelectItem>
                    <SelectItem value="electronique">Électronique</SelectItem>
                    <SelectItem value="mode">Mode</SelectItem>
                    <SelectItem value="mobilier">Mobilier</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* État */}
              <div>
                <label className="text-sm font-medium mb-2 block">État</label>
                <Select value={condition} onValueChange={setCondition}>
                  <SelectTrigger>
                    <SelectValue placeholder="Tous" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Tous états</SelectItem>
                    <SelectItem value="new">Neuf</SelectItem>
                    <SelectItem value="like_new">Comme neuf</SelectItem>
                    <SelectItem value="good">Bon état</SelectItem>
                    <SelectItem value="used">Utilisé</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Localisation */}
              <div>
                <label className="text-sm font-medium mb-2 block">Localisation</label>
                <Select value={location} onValueChange={setLocation}>
                  <SelectTrigger>
                    <SelectValue placeholder="Toutes" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Toutes régions</SelectItem>
                    <SelectItem value="tunis">Tunis</SelectItem>
                    <SelectItem value="sfax">Sfax</SelectItem>
                    <SelectItem value="sousse">Sousse</SelectItem>
                    <SelectItem value="bizerte">Bizerte</SelectItem>
                    <SelectItem value="gabes">Gabès</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Actions */}
              <div className="flex items-end">
                <Button
                  variant="outline"
                  onClick={clearFilters}
                  className="w-full"
                  disabled={activeFiltersCount === 0}
                >
                  <X size={16} className="mr-2" />
                  Effacer
                </Button>
              </div>
            </div>

            {/* Prix Range */}
            <div>
              <label className="text-sm font-medium mb-2 block">
                Prix: {priceRange[0]} DT - {priceRange[1]} DT
              </label>
              <Slider
                value={priceRange}
                onValueChange={setPriceRange}
                max={100000}
                min={0}
                step={500}
                className="w-full"
              />
              <div className="flex justify-between text-xs text-gray-500 mt-1">
                <span>0 DT</span>
                <span>100,000+ DT</span>
              </div>
            </div>
          </div>
        )}

        {/* Results Bar */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 pt-4 border-t">
          <div className="flex items-center gap-3">
            <span className="text-sm text-gray-600">
              {productCount} produit{productCount !== 1 ? 's' : ''} trouvé{productCount !== 1 ? 's' : ''}
            </span>
            {activeFiltersCount > 0 && (
              <Badge variant="secondary">
                {activeFiltersCount} filtre{activeFiltersCount !== 1 ? 's' : ''} actif{activeFiltersCount !== 1 ? 's' : ''}
              </Badge>
            )}
          </div>

          <div className="flex items-center gap-2">
            {/* Tri */}
            <div className="flex gap-1">
              <Button
                variant={sortBy === 'created_at' ? 'default' : 'outline'}
                size="sm"
                onClick={() => handleSort('created_at')}
                className="text-xs"
              >
                Date
                {sortBy === 'created_at' && (
                  sortDirection === 'asc' ? <SortAsc size={12} className="ml-1" /> : <SortDesc size={12} className="ml-1" />
                )}
              </Button>
              <Button
                variant={sortBy === 'price' ? 'default' : 'outline'}
                size="sm"
                onClick={() => handleSort('price')}
                className="text-xs"
              >
                Prix
                {sortBy === 'price' && (
                  sortDirection === 'asc' ? <SortAsc size={12} className="ml-1" /> : <SortDesc size={12} className="ml-1" />
                )}
              </Button>
            </div>

            {/* Mode d'affichage */}
            <div className="flex border rounded-md">
              <Button
                variant={viewMode === 'grid' ? 'default' : 'ghost'}
                size="sm"
                onClick={() => onViewModeChange('grid')}
                className="rounded-r-none"
              >
                <Grid size={16} />
              </Button>
              <Button
                variant={viewMode === 'list' ? 'default' : 'ghost'}
                size="sm"
                onClick={() => onViewModeChange('list')}
                className="rounded-l-none"
              >
                <List size={16} />
              </Button>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}