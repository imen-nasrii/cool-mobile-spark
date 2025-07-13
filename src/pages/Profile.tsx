import { useState } from "react";
import { Header } from "@/components/Layout/Header";
import { User, Settings, Heart, MessageSquare, Package, Star, Edit, Phone, MapPin, Mail } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { useToast } from "@/hooks/use-toast";

// Import product images
import teslaImage from "@/assets/tesla-model3.jpg";
import motherboardImage from "@/assets/motherboard-i5.jpg";

const userStats = [
  { icon: Package, label: "Listed", value: "12", color: "text-blue-600" },
  { icon: Heart, label: "Liked", value: "45", color: "text-red-500" },
  { icon: MessageSquare, label: "Messages", value: "23", color: "text-green-600" },
  { icon: Star, label: "Rating", value: "4.8", color: "text-yellow-500" }
];

const userProducts = [
  {
    id: "1",
    title: "Tesla Model 3 - Electric Car",
    price: "120,000 DT",
    image: teslaImage,
    status: "active",
    views: 245,
    likes: 45
  },
  {
    id: "2", 
    title: "Gaming PC Components",
    price: "170 DT",
    image: motherboardImage,
    status: "sold",
    views: 89,
    likes: 12
  }
];

export const Profile = ({ activeTab, onTabChange }: { 
  activeTab?: string; 
  onTabChange?: (tab: string) => void;
}) => {
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [userInfo, setUserInfo] = useState({
    name: "Ahmed Ben Ali",
    username: "@ahmed_benali",
    email: "ahmed.benali@email.com",
    phone: "+216 20 123 456",
    location: "Ariana, Tunisia",
    bio: "Passionate seller with 3+ years experience. Always honest in my deals."
  });
  const { toast } = useToast();

  const handleSaveProfile = () => {
    setIsEditOpen(false);
    toast({
      title: "Success!",
      description: "Profile updated successfully",
    });
  };

  return (
    <div className="min-h-screen bg-background pb-20">
      <Header activeTab={activeTab} onTabChange={onTabChange} />

      <div className="px-4 py-4 max-w-md mx-auto space-y-6">
        {/* Profile Header */}
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-4 mb-4">
              <Avatar className="w-16 h-16">
                <AvatarFallback className="bg-tomati-red/10 text-tomati-red text-xl font-bold">
                  {userInfo.name.split(' ').map(n => n[0]).join('')}
                </AvatarFallback>
              </Avatar>
              <div className="flex-1">
                <h2 className="text-xl font-bold text-foreground">{userInfo.name}</h2>
                <p className="text-muted-foreground">{userInfo.username}</p>
                <div className="flex items-center gap-1 mt-1">
                  <Star size={14} className="text-yellow-500 fill-current" />
                  <span className="text-sm font-medium">4.8</span>
                  <span className="text-xs text-muted-foreground">(24 reviews)</span>
                </div>
              </div>
              <Dialog open={isEditOpen} onOpenChange={setIsEditOpen}>
                <DialogTrigger asChild>
                  <Button variant="outline" size="sm" className="border-tomati-red/20 hover:bg-tomati-red/10">
                    <Edit size={14} />
                  </Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>Edit Profile</DialogTitle>
                  </DialogHeader>
                  <div className="space-y-4">
                    <Input
                      placeholder="Full Name"
                      value={userInfo.name}
                      onChange={(e) => setUserInfo(prev => ({ ...prev, name: e.target.value }))}
                    />
                    <Input
                      placeholder="Username"
                      value={userInfo.username}
                      onChange={(e) => setUserInfo(prev => ({ ...prev, username: e.target.value }))}
                    />
                    <Input
                      placeholder="Email"
                      value={userInfo.email}
                      onChange={(e) => setUserInfo(prev => ({ ...prev, email: e.target.value }))}
                    />
                    <Input
                      placeholder="Phone"
                      value={userInfo.phone}
                      onChange={(e) => setUserInfo(prev => ({ ...prev, phone: e.target.value }))}
                    />
                    <Input
                      placeholder="Location"
                      value={userInfo.location}
                      onChange={(e) => setUserInfo(prev => ({ ...prev, location: e.target.value }))}
                    />
                    <Button onClick={handleSaveProfile} className="w-full bg-tomati-red hover:bg-tomati-red/90">
                      Save Changes
                    </Button>
                  </div>
                </DialogContent>
              </Dialog>
            </div>

            <p className="text-sm text-muted-foreground mb-4">{userInfo.bio}</p>

            <div className="flex items-center gap-4 text-sm text-muted-foreground">
              <div className="flex items-center gap-1">
                <MapPin size={14} />
                <span>{userInfo.location}</span>
              </div>
              <div className="flex items-center gap-1">
                <Phone size={14} />
                <span>{userInfo.phone}</span>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Stats */}
        <div className="grid grid-cols-4 gap-3">
          {userStats.map((stat) => (
            <Card key={stat.label} className="text-center">
              <CardContent className="pt-4 pb-3">
                <stat.icon size={20} className={`mx-auto mb-2 ${stat.color}`} />
                <div className="text-lg font-bold text-foreground">{stat.value}</div>
                <div className="text-xs text-muted-foreground">{stat.label}</div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Tabs */}
        <Tabs defaultValue="products" className="w-full">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="products">My Products</TabsTrigger>
            <TabsTrigger value="liked">Liked</TabsTrigger>
            <TabsTrigger value="settings">Settings</TabsTrigger>
          </TabsList>

          <TabsContent value="products" className="space-y-3 mt-4">
            {userProducts.map((product) => (
              <Card key={product.id}>
                <CardContent className="p-4">
                  <div className="flex items-center gap-3">
                    <img 
                      src={product.image} 
                      alt={product.title}
                      className="w-16 h-16 object-cover rounded-lg"
                    />
                    <div className="flex-1 min-w-0">
                      <h4 className="font-medium text-foreground truncate">{product.title}</h4>
                      <p className="text-sm font-semibold text-tomati-red">{product.price}</p>
                      <div className="flex items-center gap-3 text-xs text-muted-foreground mt-1">
                        <span>{product.views} views</span>
                        <span>{product.likes} likes</span>
                        <Badge 
                          variant={product.status === "active" ? "default" : "secondary"}
                          className={product.status === "active" ? "bg-green-100 text-green-800" : ""}
                        >
                          {product.status}
                        </Badge>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </TabsContent>

          <TabsContent value="liked" className="mt-4">
            <div className="text-center py-8">
              <Heart size={48} className="mx-auto text-muted-foreground mb-4" />
              <p className="text-muted-foreground">Your liked products will appear here</p>
            </div>
          </TabsContent>

          <TabsContent value="settings" className="space-y-3 mt-4">
            <Card>
              <CardHeader>
                <CardTitle className="text-base">Account Settings</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <Button variant="outline" className="w-full justify-start">
                  <Settings size={16} className="mr-2" />
                  Notification Settings
                </Button>
                <Button variant="outline" className="w-full justify-start">
                  <User size={16} className="mr-2" />
                  Privacy Settings
                </Button>
                <Button variant="outline" className="w-full justify-start text-red-600 hover:text-red-700">
                  <Settings size={16} className="mr-2" />
                  Delete Account
                </Button>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};