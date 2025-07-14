import { useState } from "react";
import { Home as HomeIcon, Search as SearchIcon, PlusCircle, MessageCircle, User, Bell } from "lucide-react";
import { Home as HomePage } from "./Home";
import { Messages } from "./Messages";
import { ProductDetail } from "./ProductDetail";
import { Search } from "./Search";
import { AddProduct } from "./AddProduct";
import { Profile } from "./Profile";
import { useToast } from "@/hooks/use-toast";

const Index = () => {
  const [activeTab, setActiveTab] = useState("home");
  const [currentView, setCurrentView] = useState<"main" | "product">("main");
  const [selectedProduct, setSelectedProduct] = useState<string>("");
  const { toast } = useToast();

  const handleTabChange = (tab: string) => {
    setActiveTab(tab);
  };

  const handleProductClick = (productId: string) => {
    setSelectedProduct(productId);
    setCurrentView("product");
  };

  const handleBackToMain = () => {
    setCurrentView("main");
    setSelectedProduct("");
  };

  const renderContent = () => {
    switch (activeTab) {
      case "home":
        return <HomePage onProductClick={handleProductClick} activeTab={activeTab} onTabChange={handleTabChange} />;
      case "search":
        return <Search activeTab={activeTab} onTabChange={handleTabChange} onProductClick={handleProductClick} />;
      case "add":
        return <AddProduct activeTab={activeTab} onTabChange={handleTabChange} />;
      case "messages":
        return <Messages activeTab={activeTab} onTabChange={handleTabChange} />;
      case "profile":
        return <Profile activeTab={activeTab} onTabChange={handleTabChange} />;
      default:
        return <HomePage onProductClick={handleProductClick} activeTab={activeTab} onTabChange={handleTabChange} />;
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Removed background decorative elements */}
      {currentView === "product" ? (
        <ProductDetail 
          productId={selectedProduct}
          onBack={handleBackToMain}
        />
      ) : (
        <>
          {/* Header with Logo */}
          <header className="sticky top-0 z-50 bg-white border-b border-gray-100 shadow-sm">
            {/* Single Row Header */}
            <div className="flex items-center justify-between px-4 py-3">
              <div className="flex items-center gap-4">
                <h1 className="text-2xl font-fredoka text-primary tracking-wide">
                  Tomati
                </h1>
                <button className="px-6 py-2 bg-gray-100 rounded-full text-sm font-medium text-gray-700 hover:bg-gray-200">
                  Tous les catégories
                </button>
              </div>
              
              <div className="relative">
                <img 
                  src="/lovable-uploads/618489ca-9b35-4e4f-aacf-ba98ff16d1b6.png" 
                  alt="Tomati Logo" 
                  className="h-12 w-12 rounded-full"
                />
              </div>
              
              <div className="flex items-center gap-3">
                <button className="p-2 hover:bg-gray-100 rounded-full">
                  <SearchIcon size={20} className="text-gray-600" />
                </button>
                <button className="p-2 hover:bg-gray-100 rounded-full relative">
                  <Bell size={20} className="text-gray-600" />
                  <span className="absolute -top-1 -right-1 bg-primary text-white text-xs w-5 h-5 rounded-full flex items-center justify-center">
                    1
                  </span>
                </button>
              </div>
            </div>
          </header>
          
          {renderContent()}
          <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 px-4 py-3 z-50">
            <div className="flex justify-around items-center max-w-md mx-auto">
              {[
                { id: "home", icon: HomeIcon, label: "Accueil" },
                { id: "search", icon: SearchIcon, label: "Recherche" },
                { id: "add", icon: PlusCircle, label: "Ajouter" },
                { id: "messages", icon: MessageCircle, label: "Messages" },
                { id: "profile", icon: User, label: "Profil" },
              ].map(({ id, icon: Icon, label }) => (
                <button
                  key={id}
                  onClick={() => handleTabChange(id)}
                  className={`flex flex-col items-center gap-1 p-2 transition-colors ${
                    activeTab === id 
                      ? "text-primary" 
                      : "text-gray-500"
                  }`}
                >
                  <Icon size={20} />
                  <span className="text-xs font-medium">{label}</span>
                </button>
              ))}
            </div>
          </div>
        </>
      )}
    </div>
  );
};

export default Index;
