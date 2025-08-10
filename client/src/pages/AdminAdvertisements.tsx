import { useState } from 'react';
import { useQuery, useMutation } from '@tanstack/react-query';
import { apiClient, queryClient } from '@/lib/queryClient';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/hooks/use-toast';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog';
import { Trash2, Search, Eye, ArrowLeft, Zap } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

interface Advertisement {
  id: string;
  title: string;
  description: string;
  image_url?: string;
  target_url?: string;
  advertiser_name: string;
  category?: string;
  position: string;
  is_active: boolean;
  click_count: number;
  impression_count: number;
  created_at: string;
}

export default function AdminAdvertisements() {
  const [searchTerm, setSearchTerm] = useState('');
  const { user } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();

  // Fetch all advertisements for admin
  const { data: advertisements = [], isLoading, refetch } = useQuery({
    queryKey: ['/admin/advertisements'],
    queryFn: () => apiClient.request('/advertisements/all?admin=true'),
    enabled: !!user && user.role === 'admin',
  });

  // Delete advertisement mutation
  const deleteAdMutation = useMutation({
    mutationFn: async (adId: string) => {
      return apiClient.request(`/admin/advertisements/${adId}`, {
        method: 'DELETE'
      });
    },
    onSuccess: (data, adId) => {
      toast({
        title: "Publicité supprimée",
        description: "La publicité a été supprimée avec succès",
      });
      
      // Remove from local state and refetch
      queryClient.invalidateQueries({ queryKey: ['/admin/advertisements'] });
      queryClient.invalidateQueries({ queryKey: ['/advertisements'] });
      refetch();
    },
    onError: (error: any) => {
      toast({
        title: "Erreur",
        description: error.message || "Impossible de supprimer la publicité",
        variant: "destructive"
      });
    }
  });

  const handleDeleteAd = (adId: string) => {
    deleteAdMutation.mutate(adId);
  };

  // Filter advertisements based on search
  const filteredAds = advertisements.filter((ad: Advertisement) =>
    ad.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    ad.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
    ad.advertiser_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    ad.position.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Identify blue-styled ads (those that might have IKEA styling or similar)
  const getAdStyle = (ad: Advertisement) => {
    const isBlueAd = ad.advertiser_name.toLowerCase().includes('ikea') || 
                   ad.title.toLowerCase().includes('mobilier') ||
                   ad.description.toLowerCase().includes('livraison gratuite');
    return isBlueAd ? 'bg-blue-50 border-blue-200' : 'bg-white';
  };

  const getPositionBadge = (position: string) => {
    const positionMap = {
      'header': { label: 'En-tête', color: 'bg-purple-100 text-purple-700' },
      'sidebar': { label: 'Barre latérale', color: 'bg-green-100 text-green-700' },
      'between_products': { label: 'Entre produits', color: 'bg-blue-100 text-blue-700' },
      'footer': { label: 'Pied de page', color: 'bg-orange-100 text-orange-700' }
    };
    const pos = positionMap[position as keyof typeof positionMap] || { label: position, color: 'bg-gray-100 text-gray-700' };
    return <Badge className={pos.color}>{pos.label}</Badge>;
  };

  if (!user || user.role !== 'admin') {
    return (
      <div className="container mx-auto px-4 py-8">
        <Card>
          <CardContent className="p-8 text-center">
            <h2 className="text-2xl font-bold text-red-600 mb-4">Accès refusé</h2>
            <p className="text-gray-600">Vous devez être administrateur pour accéder à cette page.</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <div className="flex items-center gap-4 mb-4">
          <Button
            variant="ghost"
            onClick={() => navigate('/admin')}
            className="flex items-center gap-2"
          >
            <ArrowLeft size={18} />
            Retour Dashboard
          </Button>
          <div>
            <h1 className="text-3xl font-bold">Administration des Publicités</h1>
            <p className="text-gray-600">Gérez toutes les publicités de la plateforme Tomati</p>
          </div>
        </div>
        
        {/* Search Bar */}
        <div className="relative mb-6">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
          <Input
            placeholder="Rechercher par titre, description, annonceur ou position..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Total Publicités</p>
                  <p className="text-2xl font-bold">{advertisements.length}</p>
                </div>
                <Zap className="h-8 w-8 text-blue-500" />
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Actives</p>
                  <p className="text-2xl font-bold">
                    {advertisements.filter((ad: Advertisement) => ad.is_active).length}
                  </p>
                </div>
                <Eye className="h-8 w-8 text-green-500" />
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Publicités Bleues</p>
                  <p className="text-2xl font-bold">
                    {advertisements.filter((ad: Advertisement) => 
                      ad.advertiser_name.toLowerCase().includes('ikea') || 
                      ad.title.toLowerCase().includes('mobilier')
                    ).length}
                  </p>
                </div>
                <div className="h-8 w-8 bg-blue-500 rounded-full"></div>
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Résultats</p>
                  <p className="text-2xl font-bold">{filteredAds.length}</p>
                </div>
                <Search className="h-8 w-8 text-purple-500" />
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {isLoading ? (
        <div className="text-center py-8">
          <p>Chargement des publicités...</p>
        </div>
      ) : (
        <div className="grid gap-4">
          {filteredAds.length === 0 ? (
            <Card>
              <CardContent className="p-8 text-center">
                <p className="text-gray-500">Aucune publicité trouvée</p>
              </CardContent>
            </Card>
          ) : (
            filteredAds.map((ad: Advertisement) => (
              <Card key={ad.id} className={`p-4 ${getAdStyle(ad)}`}>
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-4">
                    {/* Ad Image */}
                    <div className="w-16 h-16 bg-gray-200 rounded-lg overflow-hidden">
                      {ad.image_url ? (
                        <img 
                          src={ad.image_url} 
                          alt={ad.title}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-gray-400">
                          <Zap className="h-6 w-6" />
                        </div>
                      )}
                    </div>

                    {/* Ad Info */}
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <h3 className="font-semibold text-lg">{ad.title}</h3>
                        {ad.advertiser_name.toLowerCase().includes('ikea') && (
                          <Badge variant="secondary" className="bg-blue-100 text-blue-700">
                            Style Bleu
                          </Badge>
                        )}
                        {!ad.is_active && (
                          <Badge variant="secondary" className="bg-gray-100 text-gray-700">
                            Inactif
                          </Badge>
                        )}
                      </div>
                      <p className="text-sm text-gray-600 mb-2">{ad.description}</p>
                      <div className="flex items-center gap-4 text-sm text-gray-600">
                        <span className="font-medium text-blue-600">
                          {ad.advertiser_name}
                        </span>
                        {getPositionBadge(ad.position)}
                        {ad.category && <span>Catégorie: {ad.category}</span>}
                      </div>
                      <div className="flex items-center gap-4 text-xs text-gray-500 mt-1">
                        <span>{ad.impression_count} vues</span>
                        <span>{ad.click_count} clics</span>
                        <span>Créé le {new Date(ad.created_at).toLocaleDateString('fr-FR')}</span>
                      </div>
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex items-center gap-2">
                    <AlertDialog>
                      <AlertDialogTrigger asChild>
                        <Button 
                          variant="destructive" 
                          size="sm"
                          disabled={deleteAdMutation.isPending}
                        >
                          <Trash2 className="h-4 w-4 mr-1" />
                          Supprimer
                        </Button>
                      </AlertDialogTrigger>
                      <AlertDialogContent>
                        <AlertDialogHeader>
                          <AlertDialogTitle>Confirmer la suppression</AlertDialogTitle>
                          <AlertDialogDescription>
                            Êtes-vous sûr de vouloir supprimer la publicité "{ad.title}" de {ad.advertiser_name} ? 
                            Cette action est irréversible et supprimera également toutes les statistiques associées.
                          </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                          <AlertDialogCancel>Annuler</AlertDialogCancel>
                          <AlertDialogAction
                            onClick={() => handleDeleteAd(ad.id)}
                            className="bg-red-600 hover:bg-red-700"
                          >
                            Supprimer définitivement
                          </AlertDialogAction>
                        </AlertDialogFooter>
                      </AlertDialogContent>
                    </AlertDialog>
                  </div>
                </div>
              </Card>
            ))
          )}
        </div>
      )}
    </div>
  );
}