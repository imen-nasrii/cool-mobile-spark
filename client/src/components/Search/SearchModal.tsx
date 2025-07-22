import { useState, useRef, useEffect } from "react";
import { Search, X, Clock, TrendingUp } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useLanguage } from "@/hooks/useLanguage";

interface SearchModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSearch: (query: string) => void;
  recentSearches?: string[];
}

const popularSearches = [
  "iPhone", "Tesla", "Appartement", "Voiture", "Emploi", "Laptop", "Meuble", "Vélo"
];

export function SearchModal({ open, onOpenChange, onSearch, recentSearches = [] }: SearchModalProps) {
  const [query, setQuery] = useState('');
  const inputRef = useRef<HTMLInputElement>(null);
  const { t } = useLanguage();

  useEffect(() => {
    if (open) {
      // Focus input when modal opens
      setTimeout(() => {
        inputRef.current?.focus();
      }, 100);
    }
  }, [open]);

  const handleSearch = (searchQuery: string) => {
    if (searchQuery.trim()) {
      onSearch(searchQuery.trim());
      onOpenChange(false);
      setQuery('');
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleSearch(query);
    }
  };

  const handleQuickSearch = (searchTerm: string) => {
    setQuery(searchTerm);
    handleSearch(searchTerm);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg p-0">
        {/* Search Header */}
        <div className="flex items-center gap-3 p-4 border-b">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground" size={18} />
            <Input
              ref={inputRef}
              placeholder={t('searchProducts')}
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              onKeyPress={handleKeyPress}
              className="pl-10 pr-4 border-0 focus-visible:ring-0 text-base"
            />
          </div>
          <Button
            variant="ghost"
            size="icon"
            onClick={() => onOpenChange(false)}
          >
            <X size={18} />
          </Button>
        </div>

        <ScrollArea className="max-h-80">
          <div className="p-4 space-y-4">
            {/* Recent Searches */}
            {recentSearches.length > 0 && (
              <div>
                <div className="flex items-center gap-2 mb-3">
                  <Clock size={16} className="text-muted-foreground" />
                  <span className="text-sm font-medium text-muted-foreground">
                    {t('recentSearches')}
                  </span>
                </div>
                <div className="flex flex-wrap gap-2">
                  {recentSearches.slice(0, 6).map((search, index) => (
                    <Badge
                      key={index}
                      variant="secondary"
                      className="cursor-pointer hover:bg-secondary/80 transition-colors"
                      onClick={() => handleQuickSearch(search)}
                    >
                      {search}
                    </Badge>
                  ))}
                </div>
              </div>
            )}

            {/* Popular Searches */}
            <div>
              <div className="flex items-center gap-2 mb-3">
                <TrendingUp size={16} className="text-muted-foreground" />
                <span className="text-sm font-medium text-muted-foreground">
                  {t('popularSearches')}
                </span>
              </div>
              <div className="flex flex-wrap gap-2">
                {popularSearches.map((search, index) => (
                  <Badge
                    key={index}
                    variant="outline"
                    className="cursor-pointer hover:bg-primary hover:text-primary-foreground transition-colors"
                    onClick={() => handleQuickSearch(search)}
                  >
                    {search}
                  </Badge>
                ))}
              </div>
            </div>

            {/* Current Query Preview */}
            {query.trim() && (
              <div className="pt-2 border-t">
                <Button
                  onClick={() => handleSearch(query)}
                  className="w-full justify-start"
                  variant="ghost"
                >
                  <Search size={16} className="mr-2" />
                  {t('searchFor')} "{query}"
                </Button>
              </div>
            )}
          </div>
        </ScrollArea>
      </DialogContent>
    </Dialog>
  );
}