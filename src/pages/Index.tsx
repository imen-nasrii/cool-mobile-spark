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
    <div className="min-h-screen bg-gradient-to-br from-primary/5 via-background to-accent/5 relative overflow-hidden">
      {/* Background decorative elements */}
      <div className="absolute top-0 left-0 w-full h-full pointer-events-none">
        <div className="absolute top-20 left-20 w-32 h-32 bg-primary/10 rounded-full blur-xl animate-float"></div>
        <div className="absolute top-40 right-20 w-24 h-24 bg-accent/10 rounded-full blur-xl animate-float" style={{animationDelay: '1s'}}></div>
        <div className="absolute bottom-20 left-1/2 w-40 h-40 bg-gradient-primary/10 rounded-full blur-2xl animate-float" style={{animationDelay: '2s'}}></div>
      </div>
      {currentView === "product" ? (
        <ProductDetail 
          productId={selectedProduct}
          onBack={handleBackToMain}
        />
      ) : (
        <>
          {/* Header with Logo */}
          <header className="sticky top-0 z-50 bg-gradient-to-r from-primary/5 via-accent/5 to-primary/5 backdrop-blur-md border-b border-white/20 shadow-soft">
            {/* Single Row Header */}
            <div className="flex items-center justify-between px-4 py-4">
              <div className="flex items-center gap-4">
                <h1 className="text-3xl font-fredoka text-primary tracking-wide animate-pulse-glow bg-gradient-tomati bg-clip-text text-transparent">
                  Tomati
                </h1>
                <button className="px-6 py-3 glass-card text-sm font-medium text-foreground hover:shadow-tomati transition-all duration-300 hover:scale-105 backdrop-blur-sm">
                  Tous les catégories
                </button>
              </div>
              
              <div className="relative">
                <img 
                  src="/lovable-uploads/618489ca-9b35-4e4f-aacf-ba98ff16d1b6.png" 
                  alt="Tomati Logo" 
                  className="h-12 w-12 rounded-full shadow-medium hover:shadow-glow transition-all duration-300 hover:rotate-12 hover:scale-110"
                />
                <div className="absolute inset-0 rounded-full bg-gradient-primary opacity-20 animate-pulse"></div>
              </div>
              
              <div className="flex items-center gap-3">
                <button className="p-3 glass rounded-full hover:shadow-glow transition-all duration-300 hover:scale-110 group">
                  <SearchIcon size={20} className="text-primary group-hover:text-accent transition-colors" />
                </button>
                <button className="p-3 glass rounded-full hover:shadow-glow transition-all duration-300 hover:scale-110 relative group">
                  <Bell size={20} className="text-primary group-hover:text-accent transition-colors" />
                  <span className="absolute -top-1 -right-1 bg-gradient-accent text-white text-xs w-6 h-6 rounded-full flex items-center justify-center shadow-medium animate-bounce">
                    1
                  </span>
                </button>
              </div>
            </div>
          </header>
          
          {renderContent()}
          <div className="fixed bottom-0 left-0 right-0 glass-card border-t border-white/20 px-4 py-3 z-50 backdrop-blur-xl">
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
                  className={`flex flex-col items-center gap-1 p-3 transition-all duration-300 rounded-2xl hover:scale-110 ${
                    activeTab === id 
                      ? "text-primary bg-gradient-primary/10 shadow-tomati scale-110" 
                      : "text-muted-foreground hover:text-primary hover:bg-primary/5"
                  }`}
                >
                  <Icon size={22} className={activeTab === id ? "animate-bounce" : ""} />
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
