import { useState } from "react";
import { Filter, ChevronDown, X, MapPin, DollarSign, Calendar, Grid3X3 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { Slider } from "@/components/ui/slider";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";

interface FilterOptions {
  category: string;
  minPrice: number;
  maxPrice: number;
  location: string;
  condition: string;
  sortBy: string;
  sortOrder: 'asc' | 'desc';
  freeOnly: boolean;
  availableOnly: boolean;
  dateRange: string;
}

interface AdvancedFiltersProps {
  onFiltersChange: (filters: FilterOptions) => void;
  onClearFilters: () => void;
  isOpen: boolean;
  onToggle: () => void;
}

const categories = [
  "Toutes catégories",
  "Électronique", 
  "Sport", 
  "Voiture", 
  "Bureautique", 
  "Jeux vidéo", 
  "Mobilier"
];

const locations = [
  "Toutes les villes",
  "Tunis", 
  "Sfax", 
  "Sousse", 
  "Monastir", 
  "Bizerte", 
  "Gabès",
  "Kairouan",
  "Nabeul"
];

const sortOptions = [
  { value: "date", label: "Date de publication" },
  { value: "price", label: "Prix" },
  { value: "title", label: "Titre" },
  { value: "likes", label: "Popularité" },
  { value: "location", label: "Localisation" }
];

export const AdvancedFilters = ({ onFiltersChange, onClearFilters, isOpen, onToggle }: AdvancedFiltersProps) => {
  const [filters, setFilters] = useState<FilterOptions>({
    category: "",
    minPrice: 0,
    maxPrice: 10000,
    location: "",
    condition: "",
    sortBy: "date",
    sortOrder: "desc",
    freeOnly: false,
    availableOnly: true,
    dateRange: "all"
  });

  const [priceRange, setPriceRange] = useState([0, 10000]);
  const [activeFiltersCount, setActiveFiltersCount] = useState(0);

  const updateFilters = (newFilters: Partial<FilterOptions>) => {
    const updatedFilters = { ...filters, ...newFilters };
    setFilters(updatedFilters);
    onFiltersChange(updatedFilters);
    
    // Count active filters
    let count = 0;
    if (updatedFilters.category) count++;
    if (updatedFilters.location) count++;
    if (updatedFilters.minPrice > 0 || updatedFilters.maxPrice < 10000) count++;
    if (updatedFilters.freeOnly) count++;
    if (!updatedFilters.availableOnly) count++;
    if (updatedFilters.dateRange !== "all") count++;
    
    setActiveFiltersCount(count);
  };

  const handleClearFilters = () => {
    const defaultFilters = {
      category: "",
      minPrice: 0,
      maxPrice: 10000,
      location: "",
      condition: "",
      sortBy: "date",
      sortOrder: "desc" as const,
      freeOnly: false,
      availableOnly: true,
      dateRange: "all"
    };
    setFilters(defaultFilters);
    setPriceRange([0, 10000]);
    setActiveFiltersCount(0);
    onClearFilters();
  };

  const handlePriceChange = (values: number[]) => {
    setPriceRange(values);
    updateFilters({ minPrice: values[0], maxPrice: values[1] });
  };

  return (
    <div className="w-full">
      {/* Filter Toggle Button */}
      <Button 
        variant="outline" 
        onClick={onToggle}
        className="w-full mb-4 flex items-center justify-between"
      >
        <div className="flex items-center gap-2">
          <Filter size={18} />
          <span>Filtres et tri</span>
          {activeFiltersCount > 0 && (
            <Badge variant="secondary" className="rounded-full">
              {activeFiltersCount}
            </Badge>
          )}
        </div>
        <ChevronDown 
          size={18} 
          className={`transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`} 
        />
      </Button>

      {/* Advanced Filters Panel */}
      <Collapsible open={isOpen} onOpenChange={onToggle}>
        <CollapsibleContent>
          <Card className="border-2 border-primary/20">
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <CardTitle className="text-lg flex items-center gap-2">
                  <Filter size={20} />
                  Filtres avancés
                </CardTitle>
                <Button variant="ghost" size="sm" onClick={handleClearFilters}>
                  <X size={16} className="mr-1" />
                  Effacer
                </Button>
              </div>
            </CardHeader>
            
            <CardContent className="space-y-6">
              {/* Sort Options */}
              <div className="space-y-3">
                <h4 className="font-semibold text-sm flex items-center gap-2">
                  <Grid3X3 size={16} />
                  Trier par
                </h4>
                <div className="flex gap-2">
                  <Select 
                    value={filters.sortBy} 
                    onValueChange={(value) => updateFilters({ sortBy: value })}
                  >
                    <SelectTrigger className="flex-1">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {sortOptions.map(option => (
                        <SelectItem key={option.value} value={option.value}>
                          {option.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  
                  <Select 
                    value={filters.sortOrder} 
                    onValueChange={(value: 'asc' | 'desc') => updateFilters({ sortOrder: value })}
                  >
                    <SelectTrigger className="w-32">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="desc">
                        {filters.sortBy === 'price' ? 'Plus cher' : 
                         filters.sortBy === 'date' ? 'Plus récent' : 'Z-A'}
                      </SelectItem>
                      <SelectItem value="asc">
                        {filters.sortBy === 'price' ? 'Moins cher' : 
                         filters.sortBy === 'date' ? 'Plus ancien' : 'A-Z'}
                      </SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              {/* Category Filter */}
              <div className="space-y-3">
                <h4 className="font-semibold text-sm flex items-center gap-2">
                  <Grid3X3 size={16} />
                  Catégorie
                </h4>
                <Select 
                  value={filters.category} 
                  onValueChange={(value) => updateFilters({ category: value === "Toutes catégories" ? "" : value })}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Sélectionnez une catégorie" />
                  </SelectTrigger>
                  <SelectContent>
                    {categories.map(category => (
                      <SelectItem key={category} value={category}>
                        {category}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Location Filter */}
              <div className="space-y-3">
                <h4 className="font-semibold text-sm flex items-center gap-2">
                  <MapPin size={16} />
                  Localisation
                </h4>
                <Select 
                  value={filters.location} 
                  onValueChange={(value) => updateFilters({ location: value === "Toutes les villes" ? "" : value })}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Sélectionnez une ville" />
                  </SelectTrigger>
                  <SelectContent>
                    {locations.map(location => (
                      <SelectItem key={location} value={location}>
                        {location}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Price Range */}
              <div className="space-y-3">
                <h4 className="font-semibold text-sm flex items-center gap-2">
                  <DollarSign size={16} />
                  Fourchette de prix
                </h4>
                <div className="px-3">
                  <Slider
                    value={priceRange}
                    onValueChange={handlePriceChange}
                    max={10000}
                    min={0}
                    step={50}
                    className="w-full"
                  />
                  <div className="flex justify-between text-sm text-muted-foreground mt-2">
                    <span>{priceRange[0]}€</span>
                    <span>{priceRange[1]}€</span>
                  </div>
                </div>
              </div>

              {/* Date Range */}
              <div className="space-y-3">
                <h4 className="font-semibold text-sm flex items-center gap-2">
                  <Calendar size={16} />
                  Date de publication
                </h4>
                <Select 
                  value={filters.dateRange} 
                  onValueChange={(value) => updateFilters({ dateRange: value })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Toutes les dates</SelectItem>
                    <SelectItem value="today">Aujourd'hui</SelectItem>
                    <SelectItem value="week">Cette semaine</SelectItem>
                    <SelectItem value="month">Ce mois</SelectItem>
                    <SelectItem value="3months">3 derniers mois</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Additional Options */}
              <div className="space-y-4 pt-4 border-t">
                <h4 className="font-semibold text-sm">Options supplémentaires</h4>
                
                <div className="flex items-center space-x-2">
                  <Checkbox 
                    id="freeOnly"
                    checked={filters.freeOnly}
                    onCheckedChange={(checked) => updateFilters({ freeOnly: !!checked })}
                  />
                  <label htmlFor="freeOnly" className="text-sm font-medium">
                    Produits gratuits uniquement
                  </label>
                </div>
                
                <div className="flex items-center space-x-2">
                  <Checkbox 
                    id="availableOnly"
                    checked={filters.availableOnly}
                    onCheckedChange={(checked) => updateFilters({ availableOnly: !!checked })}
                  />
                  <label htmlFor="availableOnly" className="text-sm font-medium">
                    Masquer les produits réservés
                  </label>
                </div>
              </div>

              {/* Active Filters Summary */}
              {activeFiltersCount > 0 && (
                <div className="pt-4 border-t">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-semibold">Filtres actifs</span>
                    <Badge variant="secondary">{activeFiltersCount}</Badge>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {filters.category && (
                      <Badge variant="outline" className="text-xs">
                        {filters.category}
                      </Badge>
                    )}
                    {filters.location && (
                      <Badge variant="outline" className="text-xs">
                        📍 {filters.location}
                      </Badge>
                    )}
                    {(filters.minPrice > 0 || filters.maxPrice < 10000) && (
                      <Badge variant="outline" className="text-xs">
                        💰 {filters.minPrice}€ - {filters.maxPrice}€
                      </Badge>
                    )}
                    {filters.freeOnly && (
                      <Badge variant="outline" className="text-xs">
                        🆓 Gratuit
                      </Badge>
                    )}
                    {filters.dateRange !== "all" && (
                      <Badge variant="outline" className="text-xs">
                        📅 {filters.dateRange === "today" ? "Aujourd'hui" : 
                             filters.dateRange === "week" ? "Cette semaine" :
                             filters.dateRange === "month" ? "Ce mois" : "3 mois"}
                      </Badge>
                    )}
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </CollapsibleContent>
      </Collapsible>
    </div>
  );
};