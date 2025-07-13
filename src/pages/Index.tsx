import { useState } from "react";
import { Home as HomeIcon, Search as SearchIcon, PlusCircle, MessageCircle, User } from "lucide-react";
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
    <div className="min-h-screen bg-background">
      {currentView === "product" ? (
        <ProductDetail 
          productId={selectedProduct}
          onBack={handleBackToMain}
        />
      ) : (
        <>
          {/* Header with Logo */}
          <header className="sticky top-0 z-50 bg-white border-b border-gray-100 px-4 py-3">
            <div className="flex items-center justify-center">
              <img 
                src="/lovable-uploads/f4b586f4-ea24-427c-8503-b21b87ab2e35.png" 
                alt="Tomati Logo" 
                className="h-10 w-10 mr-3"
              />
              <h1 className="text-2xl font-bold bg-gradient-tomati bg-clip-text text-transparent">
                Tomati
              </h1>
            </div>
          </header>
          
          {renderContent()}
          <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 px-4 py-2 z-50">
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
                  <span className="text-xs">{label}</span>
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
