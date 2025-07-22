import { useState, useEffect } from "react";
import { X, Check, SlidersHorizontal } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";
import { useQuery } from "@tanstack/react-query";
import { apiClient } from "@/lib/apiClient";
import { useLanguage } from "@/hooks/useLanguage";

interface FilterModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onApplyFilters: (filters: FilterState) => void;
  initialFilters?: FilterState;
}

export interface FilterState {
  categories: string[];
  priceRange: [number, number];
  location: string;
  isFree: boolean | null;
  isReserved: boolean | null;
  isPromoted: boolean | null;
}

const defaultFilters: FilterState = {
  categories: [],
  priceRange: [0, 10000],
  location: '',
  isFree: null,
  isReserved: null,
  isPromoted: null,
};

export function FilterModal({ open, onOpenChange, onApplyFilters, initialFilters = defaultFilters }: FilterModalProps) {
  const [filters, setFilters] = useState<FilterState>(initialFilters);
  const { t } = useLanguage();

  const { data: categories = [] } = useQuery({
    queryKey: ['categories'],
    queryFn: () => apiClient.getCategories(),
  });

  useEffect(() => {
    setFilters(initialFilters);
  }, [initialFilters]);

  const handleCategoryToggle = (categoryName: string) => {
    setFilters(prev => ({
      ...prev,
      categories: prev.categories.includes(categoryName)
        ? prev.categories.filter(c => c !== categoryName)
        : [...prev.categories, categoryName]
    }));
  };

  const handlePriceRangeChange = (value: number[]) => {
    setFilters(prev => ({
      ...prev,
      priceRange: [value[0], value[1]]
    }));
  };

  const resetFilters = () => {
    setFilters(defaultFilters);
  };

  const applyFilters = () => {
    onApplyFilters(filters);
    onOpenChange(false);
  };

  const activeFiltersCount = 
    filters.categories.length + 
    (filters.location ? 1 : 0) +
    (filters.isFree !== null ? 1 : 0) +
    (filters.isReserved !== null ? 1 : 0) +
    (filters.isPromoted !== null ? 1 : 0) +
    (filters.priceRange[0] !== 0 || filters.priceRange[1] !== 10000 ? 1 : 0);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <SlidersHorizontal size={20} />
            {t('filters')} 
            {activeFiltersCount > 0 && (
              <Badge variant="secondary" className="ml-2">
                {activeFiltersCount}
              </Badge>
            )}
          </DialogTitle>
        </DialogHeader>
        
        <ScrollArea className="max-h-[70vh] pr-4">
          <div className="space-y-6">
            {/* Categories */}
            <div>
              <Label className="text-sm font-medium mb-3 block">
                {t('categories')}
              </Label>
              <div className="grid grid-cols-2 gap-2">
                {categories.map((category: any) => (
                  <Button
                    key={category.id}
                    variant={filters.categories.includes(category.name) ? "default" : "outline"}
                    size="sm"
                    onClick={() => handleCategoryToggle(category.name)}
                    className="justify-start"
                  >
                    {filters.categories.includes(category.name) && (
                      <Check size={16} className="mr-1" />
                    )}
                    {category.name}
                  </Button>
                ))}
              </div>
            </div>

            <Separator />

            {/* Price Range */}
            <div>
              <Label className="text-sm font-medium mb-3 block">
                Prix: {filters.priceRange[0]} TND - {filters.priceRange[1]} TND
              </Label>
              <Slider
                value={filters.priceRange}
                onValueChange={handlePriceRangeChange}
                max={10000}
                min={0}
                step={100}
                className="w-full"
              />
              <div className="flex justify-between text-xs text-muted-foreground mt-2">
                <span>0 TND</span>
                <span>10,000 TND</span>
              </div>
            </div>

            <Separator />

            {/* Location */}
            <div>
              <Label htmlFor="location" className="text-sm font-medium mb-3 block">
                {t('location')}
              </Label>
              <Input
                id="location"
                placeholder="Ex: Tunis, Sfax, Sousse..."
                value={filters.location}
                onChange={(e) => setFilters(prev => ({ ...prev, location: e.target.value }))}
              />
            </div>

            <Separator />

            {/* Quick Filters */}
            <div>
              <Label className="text-sm font-medium mb-3 block">
                {t('quickFilters')}
              </Label>
              <div className="space-y-2">
                <Button
                  variant={filters.isFree === true ? "default" : "outline"}
                  size="sm"
                  onClick={() => setFilters(prev => ({ 
                    ...prev, 
                    isFree: prev.isFree === true ? null : true 
                  }))}
                  className="w-full justify-start"
                >
                  {filters.isFree === true && <Check size={16} className="mr-2" />}
                  {t('freeOnly')}
                </Button>
                
                <Button
                  variant={filters.isReserved === false ? "default" : "outline"}
                  size="sm"
                  onClick={() => setFilters(prev => ({ 
                    ...prev, 
                    isReserved: prev.isReserved === false ? null : false 
                  }))}
                  className="w-full justify-start"
                >
                  {filters.isReserved === false && <Check size={16} className="mr-2" />}
                  {t('availableOnly')}
                </Button>
                
                <Button
                  variant={filters.isPromoted === true ? "default" : "outline"}
                  size="sm"
                  onClick={() => setFilters(prev => ({ 
                    ...prev, 
                    isPromoted: prev.isPromoted === true ? null : true 
                  }))}
                  className="w-full justify-start"
                >
                  {filters.isPromoted === true && <Check size={16} className="mr-2" />}
                  🔥 {t('promotedOnly')}
                </Button>
              </div>
            </div>
          </div>
        </ScrollArea>

        <div className="flex justify-between gap-3 mt-6">
          <Button
            variant="outline"
            onClick={resetFilters}
            className="flex-1"
          >
            {t('reset')}
          </Button>
          <Button
            onClick={applyFilters}
            className="flex-1"
          >
            {t('applyFilters')} {activeFiltersCount > 0 && `(${activeFiltersCount})`}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}