import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from "recharts";
import { Calendar, TrendingUp, Users, Package } from "lucide-react";

interface AnalyticsData {
  productsByCategory: Array<{ name: string; value: number }>;
  userGrowth: Array<{ month: string; users: number }>;
  productGrowth: Array<{ month: string; products: number }>;
  recentActivity: Array<{ date: string; products: number; messages: number }>;
}

const COLORS = ['hsl(var(--primary))', 'hsl(var(--secondary))', 'hsl(var(--accent))', 'hsl(var(--muted))'];

export function AnalyticsAdmin() {
  const [analytics, setAnalytics] = useState<AnalyticsData>({
    productsByCategory: [],
    userGrowth: [],
    productGrowth: [],
    recentActivity: [],
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchAnalytics();
  }, []);

  const fetchAnalytics = async () => {
    try {
      // Fetch products by category
      const { data: products } = await supabase
        .from('products')
        .select('category');

      const categoryCount = products?.reduce((acc: Record<string, number>, product) => {
        acc[product.category] = (acc[product.category] || 0) + 1;
        return acc;
      }, {}) || {};

      const productsByCategory = Object.entries(categoryCount).map(([name, value]) => ({
        name,
        value: value as number,
      }));

      // Fetch user growth (last 6 months)
      const { data: profiles } = await supabase
        .from('profiles')
        .select('created_at')
        .order('created_at', { ascending: true });

      const userGrowthData = processGrowthData(profiles || [], 'users');

      // Fetch product growth (last 6 months)
      const { data: productsData } = await supabase
        .from('products')
        .select('created_at')
        .order('created_at', { ascending: true });

      const productGrowthData = processGrowthData(productsData || [], 'products');

      // Fetch recent activity (last 7 days)
      const sevenDaysAgo = new Date();
      sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

      const { data: recentProducts } = await supabase
        .from('products')
        .select('created_at')
        .gte('created_at', sevenDaysAgo.toISOString());

      const { data: recentMessages } = await supabase
        .from('messages')
        .select('created_at')
        .gte('created_at', sevenDaysAgo.toISOString());

      const recentActivity = processRecentActivity(recentProducts || [], recentMessages || []);

      setAnalytics({
        productsByCategory,
        userGrowth: userGrowthData,
        productGrowth: productGrowthData,
        recentActivity,
      });
    } catch (error) {
      console.error('Error fetching analytics:', error);
    } finally {
      setLoading(false);
    }
  };

  const processGrowthData = (data: Array<{ created_at: string }>, type: 'users' | 'products') => {
    const last6Months = [];
    const now = new Date();
    
    for (let i = 5; i >= 0; i--) {
      const date = new Date(now.getFullYear(), now.getMonth() - i, 1);
      const monthName = date.toLocaleDateString('fr-FR', { month: 'short', year: '2-digit' });
      
      const count = data.filter(item => {
        const itemDate = new Date(item.created_at);
        return itemDate.getMonth() === date.getMonth() && 
               itemDate.getFullYear() === date.getFullYear();
      }).length;

      last6Months.push({
        month: monthName,
        [type]: count,
      });
    }
    
    return last6Months;
  };

  const processRecentActivity = (products: Array<{ created_at: string }>, messages: Array<{ created_at: string }>) => {
    const last7Days = [];
    
    for (let i = 6; i >= 0; i--) {
      const date = new Date();
      date.setDate(date.getDate() - i);
      const dateStr = date.toLocaleDateString('fr-FR', { month: 'short', day: 'numeric' });
      
      const productsCount = products.filter(p => {
        const pDate = new Date(p.created_at);
        return pDate.toDateString() === date.toDateString();
      }).length;
      
      const messagesCount = messages.filter(m => {
        const mDate = new Date(m.created_at);
        return mDate.toDateString() === date.toDateString();
      }).length;

      last7Days.push({
        date: dateStr,
        products: productsCount,
        messages: messagesCount,
      });
    }
    
    return last7Days;
  };

  if (loading) return <div>Chargement des statistiques...</div>;

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <TrendingUp className="h-5 w-5" />
            Produits par Catégorie
          </CardTitle>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie
                data={analytics.productsByCategory}
                cx="50%"
                cy="50%"
                labelLine={false}
                label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                outerRadius={80}
                fill="#8884d8"
                dataKey="value"
              >
                {analytics.productsByCategory.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Users className="h-5 w-5" />
              Croissance des Utilisateurs
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={250}>
              <BarChart data={analytics.userGrowth}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="month" />
                <YAxis />
                <Tooltip />
                <Bar dataKey="users" fill="hsl(var(--primary))" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Package className="h-5 w-5" />
              Croissance des Produits
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={250}>
              <BarChart data={analytics.productGrowth}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="month" />
                <YAxis />
                <Tooltip />
                <Bar dataKey="products" fill="hsl(var(--secondary))" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Calendar className="h-5 w-5" />
            Activité Récente (7 derniers jours)
          </CardTitle>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={analytics.recentActivity}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="date" />
              <YAxis />
              <Tooltip />
              <Bar dataKey="products" fill="hsl(var(--primary))" name="Produits" />
              <Bar dataKey="messages" fill="hsl(var(--accent))" name="Messages" />
            </BarChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>
    </div>
  );
}