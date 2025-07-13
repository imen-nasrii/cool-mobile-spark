import { useState } from "react";
import { Home } from "./Home";
import { Messages } from "./Messages";
import { ProductDetail } from "./ProductDetail";
import { Search } from "./Search";
import { AddProduct } from "./AddProduct";
import { Profile } from "./Profile";
import { Header } from "@/components/Layout/Header";
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
    if (currentView === "product") {
      return (
        <ProductDetail 
          productId={selectedProduct}
          onBack={handleBackToMain}
        />
      );
    }

    switch (activeTab) {
      case "home":
        return <Home onProductClick={handleProductClick} activeTab={activeTab} onTabChange={handleTabChange} />;
      case "search":
        return <Search activeTab={activeTab} onTabChange={handleTabChange} onProductClick={handleProductClick} />;
      case "add":
        return <AddProduct activeTab={activeTab} onTabChange={handleTabChange} />;
      case "messages":
        return <Messages activeTab={activeTab} onTabChange={handleTabChange} />;
      case "profile":
        return <Profile activeTab={activeTab} onTabChange={handleTabChange} />;
      default:
        return <Home onProductClick={handleProductClick} activeTab={activeTab} onTabChange={handleTabChange} />;
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <Header activeTab={activeTab} onTabChange={handleTabChange} />
      <main className="container mx-auto px-4 py-6 max-w-7xl">
        {renderContent()}
      </main>
    </div>
  );
};

export default Index;
