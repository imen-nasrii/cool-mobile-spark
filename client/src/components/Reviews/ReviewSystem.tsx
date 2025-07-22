import { useState } from 'react';
import { Star, ThumbsUp, Verified, TrendingUp, Award, Heart } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Separator } from '@/components/ui/separator';

interface Review {
  id: string;
  user_id: string;
  username: string;
  rating: number;
  title: string;
  comment: string;
  is_verified_purchase: boolean;
  is_featured: boolean;
  helpful_count: number;
  created_at: string;
  user_has_liked?: boolean;
}

interface ProductStats {
  total_reviews: number;
  average_rating: number;
  rating_distribution: { [key: number]: number };
}

interface MarketingBadge {
  id: string;
  badge_type: string;
  badge_text: string;
  badge_color: string;
  priority: number;
}

interface ReviewSystemProps {
  productId: string;
  reviews: Review[];
  stats: ProductStats;
  badges: MarketingBadge[];
  onSubmitReview?: (reviewData: any) => void;
  onHelpfulClick?: (reviewId: string) => void;
  currentUser?: { id: string; username: string };
}

export function ReviewSystem({ 
  productId, 
  reviews, 
  stats, 
  badges,
  onSubmitReview, 
  onHelpfulClick,
  currentUser 
}: ReviewSystemProps) {
  const [isWritingReview, setIsWritingReview] = useState(false);
  const [newReview, setNewReview] = useState({
    rating: 5,
    title: '',
    comment: ''
  });

  const renderStars = (rating: number, size = 16, interactive = false, onRatingChange?: (rating: number) => void) => {
    return (
      <div className="flex gap-1">
        {[1, 2, 3, 4, 5].map((star) => (
          <Star
            key={star}
            size={size}
            className={`${
              star <= rating 
                ? 'fill-yellow-400 text-yellow-400' 
                : 'text-gray-300'
            } ${interactive ? 'cursor-pointer hover:text-yellow-400' : ''} transition-colors`}
            onClick={interactive && onRatingChange ? () => onRatingChange(star) : undefined}
          />
        ))}
      </div>
    );
  };

  const getMarketingBadgeStyle = (badgeType: string) => {
    const styles = {
      'bestseller': 'bg-gradient-to-r from-orange-500 to-red-500 text-white animate-pulse',
      'trending': 'bg-gradient-to-r from-green-500 to-teal-500 text-white',
      'new': 'bg-gradient-to-r from-blue-500 to-purple-500 text-white',
      'popular': 'bg-gradient-to-r from-pink-500 to-rose-500 text-white',
      'verified': 'bg-gradient-to-r from-emerald-500 to-green-500 text-white',
    };
    return styles[badgeType as keyof typeof styles] || 'bg-gray-500 text-white';
  };

  const getMarketingIcon = (badgeType: string) => {
    const icons = {
      'bestseller': <Award className="w-3 h-3 mr-1" />,
      'trending': <TrendingUp className="w-3 h-3 mr-1" />,
      'new': <Star className="w-3 h-3 mr-1" />,
      'popular': <Heart className="w-3 h-3 mr-1" />,
      'verified': <Verified className="w-3 h-3 mr-1" />,
    };
    return icons[badgeType as keyof typeof icons];
  };

  const handleSubmitReview = () => {
    if (onSubmitReview && newReview.rating && newReview.comment.trim()) {
      onSubmitReview({
        product_id: productId,
        rating: newReview.rating,
        title: newReview.title || undefined,
        comment: newReview.comment
      });
      setNewReview({ rating: 5, title: '', comment: '' });
      setIsWritingReview(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Marketing Badges */}
      {badges.length > 0 && (
        <div className="flex flex-wrap gap-2 mb-4">
          {badges
            .sort((a, b) => b.priority - a.priority)
            .slice(0, 3)
            .map((badge) => (
              <Badge 
                key={badge.id}
                className={`${getMarketingBadgeStyle(badge.badge_type)} text-xs font-medium shadow-lg`}
              >
                {getMarketingIcon(badge.badge_type)}
                {badge.badge_text}
              </Badge>
            ))}
        </div>
      )}

      {/* Statistiques des avis */}
      <Card>
        <CardContent className="p-6">
          <div className="flex items-center gap-6 mb-6">
            <div className="text-center">
              <div className="text-3xl font-bold text-gray-900">{stats.average_rating.toFixed(1)}</div>
              <div className="flex justify-center mb-1">
                {renderStars(Math.round(stats.average_rating), 20)}
              </div>
              <div className="text-sm text-gray-600">{stats.total_reviews} avis</div>
            </div>
            
            <div className="flex-1">
              {[5, 4, 3, 2, 1].map((rating) => {
                const count = stats.rating_distribution[rating] || 0;
                const percentage = stats.total_reviews > 0 ? (count / stats.total_reviews) * 100 : 0;
                
                return (
                  <div key={rating} className="flex items-center gap-2 mb-1">
                    <span className="text-sm w-8">{rating}</span>
                    <Star size={12} className="fill-yellow-400 text-yellow-400" />
                    <div className="flex-1 bg-gray-200 rounded-full h-2">
                      <div 
                        className="bg-yellow-400 h-2 rounded-full transition-all duration-300"
                        style={{ width: `${percentage}%` }}
                      />
                    </div>
                    <span className="text-xs text-gray-600 w-8">{count}</span>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Call-to-action marketing */}
          <div className="bg-gradient-to-r from-red-50 to-orange-50 p-4 rounded-lg border border-red-200">
            <div className="flex items-center justify-between">
              <div>
                <h4 className="font-medium text-gray-900">Partagez votre expérience !</h4>
                <p className="text-sm text-gray-600">Aidez d'autres acheteurs avec votre avis sincère</p>
              </div>
              <Button 
                onClick={() => setIsWritingReview(true)}
                className="bg-red-600 hover:bg-red-700 text-white"
                disabled={!currentUser}
              >
                <Star className="w-4 h-4 mr-1" />
                Noter
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Formulaire d'écriture d'avis */}
      {isWritingReview && currentUser && (
        <Card className="border-red-300 shadow-lg">
          <CardHeader>
            <CardTitle className="text-lg">Votre avis compte !</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label className="text-sm font-medium mb-2 block">Note</Label>
              {renderStars(newReview.rating, 24, true, (rating) => 
                setNewReview(prev => ({ ...prev, rating }))
              )}
            </div>

            <div>
              <Label htmlFor="review-title" className="text-sm font-medium">
                Titre de votre avis (optionnel)
              </Label>
              <Input
                id="review-title"
                placeholder="Ex: Excellent produit, très satisfait"
                value={newReview.title}
                onChange={(e) => setNewReview(prev => ({ ...prev, title: e.target.value }))}
                className="mt-1"
              />
            </div>

            <div>
              <Label htmlFor="review-comment" className="text-sm font-medium">
                Votre commentaire *
              </Label>
              <Textarea
                id="review-comment"
                placeholder="Décrivez votre expérience avec ce produit..."
                value={newReview.comment}
                onChange={(e) => setNewReview(prev => ({ ...prev, comment: e.target.value }))}
                className="mt-1 min-h-[100px]"
                required
              />
            </div>

            <div className="flex gap-2 justify-end">
              <Button 
                variant="outline" 
                onClick={() => setIsWritingReview(false)}
              >
                Annuler
              </Button>
              <Button 
                onClick={handleSubmitReview}
                disabled={!newReview.comment.trim()}
                className="bg-red-600 hover:bg-red-700 text-white"
              >
                Publier l'avis
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Liste des avis */}
      <div className="space-y-4">
        <h3 className="text-lg font-semibold">Avis clients</h3>
        
        {reviews.length === 0 ? (
          <Card className="text-center p-8">
            <Star className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <h4 className="font-medium text-gray-900 mb-2">Aucun avis pour le moment</h4>
            <p className="text-gray-600 mb-4">Soyez le premier à laisser votre avis sur ce produit</p>
            {currentUser && (
              <Button 
                onClick={() => setIsWritingReview(true)}
                className="bg-red-600 hover:bg-red-700 text-white"
              >
                Écrire le premier avis
              </Button>
            )}
          </Card>
        ) : (
          reviews.map((review) => (
            <Card key={review.id} className={`${review.is_featured ? 'ring-2 ring-orange-200 bg-orange-50' : ''}`}>
              <CardContent className="p-4">
                {review.is_featured && (
                  <Badge className="bg-orange-500 text-white text-xs mb-3">
                    <Award className="w-3 h-3 mr-1" />
                    Avis vedette
                  </Badge>
                )}

                <div className="flex items-start gap-3">
                  <Avatar>
                    <AvatarFallback className="bg-red-600 text-white">
                      {review.username?.charAt(0)?.toUpperCase() || 'U'}
                    </AvatarFallback>
                  </Avatar>

                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="font-medium">{review.username || 'Utilisateur'}</span>
                      {review.is_verified_purchase && (
                        <Badge variant="secondary" className="text-xs">
                          <Verified className="w-3 h-3 mr-1" />
                          Achat vérifié
                        </Badge>
                      )}
                    </div>

                    <div className="flex items-center gap-2 mb-2">
                      {renderStars(review.rating, 14)}
                      <span className="text-xs text-gray-500">
                        {new Date(review.created_at).toLocaleDateString('fr-FR')}
                      </span>
                    </div>

                    {review.title && (
                      <h4 className="font-medium text-sm mb-2">{review.title}</h4>
                    )}

                    <p className="text-sm text-gray-700 mb-3 leading-relaxed">
                      {review.comment}
                    </p>

                    <div className="flex items-center gap-4">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => onHelpfulClick?.(review.id)}
                        className={`text-xs ${review.user_has_liked ? 'text-red-600' : 'text-gray-500'}`}
                      >
                        <ThumbsUp className="w-3 h-3 mr-1" />
                        Utile ({review.helpful_count})
                      </Button>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>
    </div>
  );
}