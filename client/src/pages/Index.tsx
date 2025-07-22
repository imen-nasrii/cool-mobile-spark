import { useState, useEffect } from "react";
import { Home as HomeIcon, Search as SearchIcon, PlusCircle, MessageCircle, User, Bell, Car, Building, Briefcase, Grid3X3, X, Heart } from "lucide-react";
import { Home as HomePage } from "./Home";
// Messages handled in separate routing
import { ProductDetail } from "./ProductDetail";
import { Search } from "./Search";
import { AddProduct } from "./AddProduct";
import { Map } from "./Map";
import { Favorites } from "./Favorites";
import Profile from "./Profile";
import { Header } from "@/components/Layout/Header";
import { BottomNav } from "@/components/Layout/BottomNav";
import { FloatingActionButton } from "@/components/Layout/FloatingActionButton";
import { ChatBot } from "@/components/Chat/ChatBot";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/hooks/useAuth";
import { useNavigate } from "react-router-dom";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { FilterModal, FilterState } from "@/components/Search/FilterModal";
import { SearchModal } from "@/components/Search/SearchModal";

const categories = [
  { id: "voiture", name: "Voiture", icon: Car },
  { id: "immobilier", name: "Immobilier", icon: Building },
  { id: "emplois", name: "Emplois", icon: Briefcase },
  { id: "autres", name: "Autres", icon: Grid3X3 }
];

const Index = () => {
  const [activeTab, setActiveTab] = useState("home");
  const [currentView, setCurrentView] = useState<"main" | "product">("main");
  const [selectedProduct, setSelectedProduct] = useState<string | null>(null);
  const [showCategoryModal, setShowCategoryModal] = useState(false);
  const [showSearchModal, setShowSearchModal] = useState(false);
  const [showFilterModal, setShowFilterModal] = useState(false);
  const [currentFilters, setCurrentFilters] = useState<FilterState>({
    categories: [],
    priceRange: [0, 10000],
    location: '',
    isFree: null,
    isReserved: null,
    isPromoted: null,
  });
  const { toast } = useToast();
  const { user, loading } = useAuth();
  const navigate = useNavigate();

  // Redirect admin users to dashboard
  useEffect(() => {
    if (user && user.role === 'admin') {
      navigate('/dashboard');
    }
  }, [user, navigate]);

  const handleTabChange = (tab: string) => {
    // Check if user is trying to access protected features
    if ((tab === "add" || tab === "messages") && !user) {
      toast({
        title: "Authentication Required",
        description: "Please sign in to access this feature.",
        variant: "destructive",
      });
      navigate("/auth");
      return;
    }
    
    // Handle navigation for messages tab
    if (tab === "messages" && user) {
      navigate("/messages");
      return;
    }
    
    setActiveTab(tab);
  };

  const handleProductClick = (productId: string) => {
    setSelectedProduct(productId);
    setCurrentView("product");
  };

  const handleBackToMain = () => {
    setCurrentView("main");
    setSelectedProduct(null);
  };

  const handleCategorySelect = (categoryId: string) => {
    setShowCategoryModal(false);
    toast({
      title: "Catégorie sélectionnée",
      description: `Vous avez sélectionné: ${categories.find(c => c.id === categoryId)?.name}`,
    });
  };

  const renderContent = () => {
    switch (activeTab) {
      case "home":
        return <HomePage onProductClick={handleProductClick} activeTab={activeTab} onTabChange={handleTabChange} />;
      case "search":
        return <Search activeTab={activeTab} onTabChange={handleTabChange} onProductClick={handleProductClick} />;
      case "map":
        return <Map />;
      case "add":
        return <AddProduct activeTab={activeTab} onTabChange={handleTabChange} />;
      case "messages":
        return <Messages activeTab={activeTab} onTabChange={handleTabChange} />;
      case "profile":
        return <Profile />;
      case "favorites":
        return <Favorites activeTab={activeTab} onTabChange={handleTabChange} />;
      default:
        return <HomePage onProductClick={handleProductClick} activeTab={activeTab} onTabChange={handleTabChange} />;
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {currentView === "product" ? (
        <ProductDetail 
          productId={selectedProduct}
          onBack={handleBackToMain}
        />
      ) : (
        <>
          <Header 
          activeTab={activeTab} 
          onTabChange={handleTabChange}
          onSearchClick={() => {
            if (activeTab !== "search") {
              setActiveTab("search");
            } else {
              setShowSearchModal(true);
            }
          }}
          onFilterClick={() => setShowFilterModal(true)}
        />
          
          {renderContent()}
          
          <BottomNav activeTab={activeTab} onTabChange={handleTabChange} />

          {/* Category Modal */}
          <Dialog open={showCategoryModal} onOpenChange={setShowCategoryModal}>
            <DialogContent className="max-w-sm mx-auto p-0 bg-white rounded-2xl">
              <div className="p-6 space-y-4">
                {categories.map((category) => (
                  <button
                    key={category.id}
                    onClick={() => handleCategorySelect(category.id)}
                    className="w-full flex items-center gap-4 p-4 text-left hover:bg-gray-50 rounded-lg transition-colors"
                  >
                    <category.icon size={24} className="text-gray-600" />
                    <span className="text-base font-medium text-gray-900">{category.name}</span>
                  </button>
                ))}
                <Button
                  onClick={() => setShowCategoryModal(false)}
                  variant="ghost"
                  size="icon"
                  className="absolute top-4 right-4 rounded-full"
                >
                  <X size={20} />
                </Button>
              </div>
            </DialogContent>
          </Dialog>
          
          <ChatBot />
          {/* Search Modal */}
          <SearchModal
            open={showSearchModal}
            onOpenChange={setShowSearchModal}
            onSearch={(query) => {
              setActiveTab("search");
              // Pass search query to Search component
            }}
          />

          {/* Filter Modal */}
          <FilterModal
            open={showFilterModal}
            onOpenChange={setShowFilterModal}
            onApplyFilters={(filters) => {
              setCurrentFilters(filters);
              // Apply filters logic here
            }}
            initialFilters={currentFilters}
          />
        </>
      )}
    </div>
  );
};

export default Index;
