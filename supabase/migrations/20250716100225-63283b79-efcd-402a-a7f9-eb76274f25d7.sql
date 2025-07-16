-- Create categories table
CREATE TABLE public.categories (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL UNIQUE,
  icon TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create products table
CREATE TABLE public.products (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  title TEXT NOT NULL,
  price TEXT NOT NULL,
  location TEXT NOT NULL,
  image_url TEXT,
  category TEXT NOT NULL,
  likes INTEGER NOT NULL DEFAULT 0,
  is_reserved BOOLEAN NOT NULL DEFAULT false,
  is_free BOOLEAN NOT NULL DEFAULT false,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE public.categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.products ENABLE ROW LEVEL SECURITY;

-- Create policies for categories (public read access)
CREATE POLICY "Categories are publicly readable" 
ON public.categories 
FOR SELECT 
USING (true);

-- Create policies for products (public read access)
CREATE POLICY "Products are publicly readable" 
ON public.products 
FOR SELECT 
USING (true);

-- Create policies for authenticated users to manage their own products
CREATE POLICY "Users can insert their own products" 
ON public.products 
FOR INSERT 
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own products" 
ON public.products 
FOR UPDATE 
USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own products" 
ON public.products 
FOR DELETE 
USING (auth.uid() = user_id);

-- Create function to update timestamps
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger for automatic timestamp updates
CREATE TRIGGER update_products_updated_at
  BEFORE UPDATE ON public.products
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- Insert sample categories
INSERT INTO public.categories (name, icon) VALUES 
  ('Electronics', 'smartphone'),
  ('Furniture', 'sofa'),
  ('Sports', 'bike'),
  ('Vehicles', 'car'),
  ('Cars', 'car-front');

-- Insert sample products
INSERT INTO public.products (title, price, location, image_url, category, likes, is_reserved, is_free) VALUES 
  ('Vente carte mère i5 - Gaming PC Components', '170 DT', 'Ariana, Tunisia', '/src/assets/motherboard-i5.jpg', 'Electronics', 12, false, false),
  ('Canapé - Modern Sofa Set', 'Free', 'Tunis, Tunisia', '/src/assets/modern-sofa.jpg', 'Furniture', 8, false, true),
  ('Craft 500 - Mountain Bike', '300 DT', 'Ariana, Tunisia', '/src/assets/mountain-bike.jpg', 'Sports', 15, true, false),
  ('New Holland - Tractor Equipment', 'Free', 'Ariana, Tunisia', '/src/assets/tractor-holland.jpg', 'Vehicles', 6, false, true),
  ('Tesla Model 3 - Electric Car', '120,000 DT', 'Gabes, Tunisia', '/src/assets/tesla-model3.jpg', 'Cars', 45, false, false),
  ('iPhone 15 Pro - Like New', '2,800 DT', 'Sousse, Tunisia', '/src/assets/iphone-15-pro.jpg', 'Electronics', 23, false, false);