import { useState, useEffect } from "react";
import { AddButton } from "@/components/UI/FloatingButtons";
import { Home as HomeIcon, Search as SearchIcon, PlusCircle, MessageCircle, User, Bell, Car, Building, Briefcase, Grid3X3, X, Heart } from "lucide-react";
import { Home as HomePage } from "./Home";
import MessagesPage from "./Messages";
import { ProductDetail } from "./ProductDetail";
import { Search } from "./Search";
import { AddProduct } from "./AddProduct";
import Profile from "./Profile";
import { Favorites } from "./Favorites";
import { Notifications } from "./Notifications";
import { Header } from "@/components/Layout/Header";
import { BottomNav } from "@/components/Layout/BottomNav";


import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/hooks/useAuth";
import { useNavigate, useLocation } from "react-router-dom";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";

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
  const [homeSearchTerm, setHomeSearchTerm] = useState<string>("");
  const [selectedCategory, setSelectedCategory] = useState<string>("");
  const { toast } = useToast();
  const { user, loading } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const handleSearch = (query: string) => {
    if (activeTab === "home") {
      setHomeSearchTerm(query);
    } else {
      // Switch to search tab and perform search
      setActiveTab("search");
      // The Search component will handle its own search state
    }
  };

  // Check URL for tab parameter and route
  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const tabParam = urlParams.get('tab');
    const categoryParam = urlParams.get('category');
    const pathname = window.location.pathname;
    
    if (pathname === '/post') {
      setActiveTab('add');
    } else if (tabParam) {
      setActiveTab(tabParam);
      
      // Si on arrive sur l'onglet add avec une catégorie, la sélectionner
      if (tabParam === 'add' && categoryParam) {
        setSelectedCategory(categoryParam);
        toast({
          title: "Catégorie sélectionnée",
          description: `Ajout d'une annonce: ${categories.find(c => c.id === categoryParam)?.name}`,
        });
      }
    }
  }, [toast, location.search, location.pathname]);

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
    
    // Handle navigation to other pages - let MainLayout handle this
    if (tab === "map") {
      navigate("/map");
      return;
    }
    
    if (tab === "messages") {
      navigate("/messages");
      return;
    }
    
    if (tab === "profile") {
      navigate("/profile");
      return;
    }
    
    setActiveTab(tab);
    
    // Update URL to reflect current tab
    const url = new URL(window.location.href);
    if (tab !== "home") {
      url.searchParams.set('tab', tab);
    } else {
      url.searchParams.delete('tab');
    }
    window.history.replaceState({}, '', url.toString());
  };

  const handleProductClick = (productId: string) => {
    setSelectedProduct(productId);
    setCurrentView("product");
  };

  const handleBackToMain = () => {
    setCurrentView("main");
    setSelectedProduct(null);
  };

  const handleProductEdit = (productId: string) => {
    // Switch to add product tab with edit mode
    setActiveTab("add");
    setCurrentView("main");
    setSelectedProduct(null);
    
    // Add productId to URL for editing
    const url = new URL(window.location.href);
    url.searchParams.set('tab', 'add');
    url.searchParams.set('edit', productId);
    window.history.replaceState({}, '', url.toString());
    
    toast({
      title: "Mode édition",
      description: "Vous pouvez maintenant modifier votre produit",
    });
  };

  const handleCategorySelect = (categoryId: string) => {
    setShowCategoryModal(false);
    toast({
      title: "Catégorie sélectionnée",
      description: `Vous avez sélectionné: ${categories.find(c => c.id === categoryId)?.name}`,
    });
  };

  const handleFloatingCategorySelect = (categoryId: string) => {
    if (!user) {
      toast({
        title: "Connexion requise",
        description: "Veuillez vous connecter pour publier une annonce.",
        variant: "destructive",
      });
      navigate("/auth");
      return;
    }
    setActiveTab("add");
    setSelectedCategory(categoryId);
    toast({
      title: "Catégorie sélectionnée",
      description: `Ajout d'une annonce: ${categories.find(c => c.id === categoryId)?.name}`,
    });
  };

  const renderContent = () => {
    switch (activeTab) {
      case "home":
        return <HomePage onProductClick={handleProductClick} activeTab={activeTab} onTabChange={handleTabChange} searchTerm={homeSearchTerm} />;
      case "search":
        return <Search activeTab={activeTab} onTabChange={handleTabChange} onProductClick={handleProductClick} />;
      case "add":
        return <AddProduct activeTab={activeTab} onTabChange={handleTabChange} selectedCategory={selectedCategory} />;
      case "messages":
        return <MessagesPage />;
      case "profile":
        return <Profile />;
      case "favorites":
        return <Favorites activeTab={activeTab} onTabChange={handleTabChange} />;
      case "notifications":
        return <Notifications activeTab={activeTab} onTabChange={handleTabChange} />;
      default:
        return <HomePage onProductClick={handleProductClick} activeTab={activeTab} onTabChange={handleTabChange} searchTerm={homeSearchTerm} />;
    }
  };

  return (
    <div className="min-h-screen">
      {currentView === "product" ? (
        <ProductDetail 
          productId={selectedProduct}
          onBack={handleBackToMain}
          onEdit={handleProductEdit}
        />
      ) : (
        <>
          {renderContent()}

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
        </>
      )}
    </div>
  );
};

export default Index;
