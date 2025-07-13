import { useState } from "react";
import { Home } from "./Home";
import { Messages } from "./Messages";
import { BottomNav } from "@/components/Layout/BottomNav";
import { FloatingActionButton } from "@/components/Layout/FloatingActionButton";
import { useToast } from "@/hooks/use-toast";

const Index = () => {
  const [activeTab, setActiveTab] = useState("home");
  const { toast } = useToast();

  const handleTabChange = (tab: string) => {
    setActiveTab(tab);
    
    // Show toast for non-implemented features
    if (["search", "add", "profile"].includes(tab)) {
      toast({
        title: "Coming Soon!",
        description: `${tab.charAt(0).toUpperCase() + tab.slice(1)} feature will be available soon.`,
      });
      return;
    }
  };

  const renderContent = () => {
    switch (activeTab) {
      case "home":
        return <Home />;
      case "messages":
        return <Messages />;
      default:
        return <Home />;
    }
  };

  return (
    <div className="min-h-screen bg-background">
      {renderContent()}
      <FloatingActionButton />
      <BottomNav activeTab={activeTab} onTabChange={handleTabChange} />
    </div>
  );
};

export default Index;
