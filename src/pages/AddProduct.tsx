import { useState } from "react";
import { Header } from "@/components/Layout/Header";
import { Camera, MapPin, Tag, DollarSign, FileText, Upload } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";

const categories = [
  "Electronics", "Cars", "Furniture", "Sports", "Vehicles", "Clothing", "Books", "Other"
];

export const AddProduct = ({ activeTab, onTabChange }: { 
  activeTab?: string; 
  onTabChange?: (tab: string) => void;
}) => {
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    price: "",
    category: "",
    location: "Ariana, Tunisia",
    condition: "new",
    isFree: false
  });
  const [selectedImages, setSelectedImages] = useState<string[]>([]);
  const { toast } = useToast();

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    files.forEach(file => {
      const reader = new FileReader();
      reader.onload = (event) => {
        if (event.target?.result) {
          setSelectedImages(prev => [...prev, event.target!.result as string]);
        }
      };
      reader.readAsDataURL(file);
    });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.title || !formData.description || (!formData.price && !formData.isFree)) {
      toast({
        title: "Error",
        description: "Please fill in all required fields",
        variant: "destructive"
      });
      return;
    }

    // Simulate successful product creation
    toast({
      title: "Success!",
      description: "Your product has been listed successfully",
    });
    
    // Reset form
    setFormData({
      title: "",
      description: "",
      price: "",
      category: "",
      location: "Ariana, Tunisia",
      condition: "new",
      isFree: false
    });
    setSelectedImages([]);
  };

  return (
    <div className="min-h-screen bg-background pb-20">
      <Header activeTab={activeTab} onTabChange={onTabChange} />

      <div className="px-4 py-4 max-w-md mx-auto">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-tomati-red">
              <Tag size={20} />
              Add New Product
            </CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              {/* Images Upload */}
              <div>
                <label className="block text-sm font-medium mb-2">Product Images</label>
                <div className="border-2 border-dashed border-muted rounded-lg p-4 text-center">
                  <input
                    type="file"
                    multiple
                    accept="image/*"
                    onChange={handleImageUpload}
                    className="hidden"
                    id="image-upload"
                  />
                  <label htmlFor="image-upload" className="cursor-pointer">
                    <Upload size={24} className="mx-auto text-muted-foreground mb-2" />
                    <p className="text-sm text-muted-foreground">Upload product images</p>
                  </label>
                  {selectedImages.length > 0 && (
                    <div className="flex flex-wrap gap-2 mt-3">
                      {selectedImages.map((image, index) => (
                        <img
                          key={index}
                          src={image}
                          alt={`Preview ${index + 1}`}
                          className="w-16 h-16 object-cover rounded border"
                        />
                      ))}
                    </div>
                  )}
                </div>
              </div>

              {/* Title */}
              <div>
                <label className="block text-sm font-medium mb-2">Product Title *</label>
                <Input
                  placeholder="e.g., iPhone 15 Pro - Like New"
                  value={formData.title}
                  onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
                  className="border-tomati-red/20 focus:border-tomati-red"
                />
              </div>

              {/* Description */}
              <div>
                <label className="block text-sm font-medium mb-2">Description *</label>
                <Textarea
                  placeholder="Describe your product..."
                  value={formData.description}
                  onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                  className="border-tomati-red/20 focus:border-tomati-red min-h-20"
                />
              </div>

              {/* Price */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-2">Price</label>
                  <div className="relative">
                    <DollarSign size={16} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground" />
                    <Input
                      type="number"
                      placeholder="170"
                      value={formData.price}
                      onChange={(e) => setFormData(prev => ({ ...prev, price: e.target.value }))}
                      disabled={formData.isFree}
                      className="pl-10 border-tomati-red/20 focus:border-tomati-red"
                    />
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    id="is-free"
                    checked={formData.isFree}
                    onChange={(e) => setFormData(prev => ({ 
                      ...prev, 
                      isFree: e.target.checked,
                      price: e.target.checked ? "" : prev.price
                    }))}
                  />
                  <label htmlFor="is-free" className="text-sm">Free to give</label>
                </div>
              </div>

              {/* Category */}
              <div>
                <label className="block text-sm font-medium mb-2">Category</label>
                <div className="flex flex-wrap gap-2">
                  {categories.map((category) => (
                    <Button
                      key={category}
                      type="button"
                      variant={formData.category === category ? "default" : "outline"}
                      size="sm"
                      onClick={() => setFormData(prev => ({ ...prev, category }))}
                      className={`text-xs ${
                        formData.category === category 
                          ? "bg-tomati-red hover:bg-tomati-red/90" 
                          : "border-tomati-red/20 hover:bg-tomati-red/10"
                      }`}
                    >
                      {category}
                    </Button>
                  ))}
                </div>
              </div>

              {/* Condition */}
              <div>
                <label className="block text-sm font-medium mb-2">Condition</label>
                <div className="flex gap-2">
                  {["new", "used", "refurbished"].map((condition) => (
                    <Button
                      key={condition}
                      type="button"
                      variant={formData.condition === condition ? "default" : "outline"}
                      size="sm"
                      onClick={() => setFormData(prev => ({ ...prev, condition }))}
                      className={`capitalize ${
                        formData.condition === condition 
                          ? "bg-tomati-red hover:bg-tomati-red/90" 
                          : "border-tomati-red/20 hover:bg-tomati-red/10"
                      }`}
                    >
                      {condition}
                    </Button>
                  ))}
                </div>
              </div>

              {/* Location */}
              <div>
                <label className="block text-sm font-medium mb-2">Location</label>
                <div className="relative">
                  <MapPin size={16} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground" />
                  <Input
                    placeholder="Ariana, Tunisia"
                    value={formData.location}
                    onChange={(e) => setFormData(prev => ({ ...prev, location: e.target.value }))}
                    className="pl-10 border-tomati-red/20 focus:border-tomati-red"
                  />
                </div>
              </div>

              {/* Submit Button */}
              <Button 
                type="submit" 
                className="w-full bg-tomati-red hover:bg-tomati-red/90 text-white py-3 mt-6"
              >
                List Product
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};