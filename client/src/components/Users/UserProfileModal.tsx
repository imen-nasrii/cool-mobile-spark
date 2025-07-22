import { useState } from 'react';
import { Star, MessageCircle, Phone, MapPin, Clock, Award, X } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { Textarea } from '@/components/ui/textarea';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Separator } from '@/components/ui/separator';
import { useAuth } from '@/hooks/useAuth';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { apiClient } from '@/lib/apiClient';
import { formatDistanceToNow } from 'date-fns';
import { fr } from 'date-fns/locale';

interface UserProfileModalProps {
  isOpen: boolean;
  onClose: () => void;
  userId: string;
  userName: string;
}

interface UserReview {
  id: string;
  rating: number;
  comment: string;
  transaction_context: string;
  created_at: string;
  reviewer_name: string;
  reviewer_email: string;
}

interface UserProfile {
  id: string;
  display_name: string;
  bio: string;
  location: string;
  phone: string;
  user_rating: number;
  total_user_reviews: number;
  response_time_hours: number;
}

export function UserProfileModal({ isOpen, onClose, userId, userName }: UserProfileModalProps) {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const [showReviewForm, setShowReviewForm] = useState(false);
  const [reviewRating, setReviewRating] = useState(5);
  const [reviewComment, setReviewComment] = useState('');
  const [transactionContext, setTransactionContext] = useState('');

  // Fetch user profile
  const { data: profile } = useQuery({
    queryKey: ['user-profile', userId],
    queryFn: () => apiClient.request(`/profile/${userId}`),
    enabled: isOpen && !!userId,
  });

  // Fetch user reviews
  const { data: reviews } = useQuery({
    queryKey: ['user-reviews', userId],
    queryFn: () => apiClient.request(`/users/${userId}/reviews`),
    enabled: isOpen && !!userId,
  });

  // Submit review mutation
  const submitReviewMutation = useMutation({
    mutationFn: (reviewData: { rating: number; comment: string; transaction_context: string }) =>
      apiClient.request(`/users/${userId}/reviews`, {
        method: 'POST',
        body: JSON.stringify(reviewData),
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['user-reviews', userId] });
      queryClient.invalidateQueries({ queryKey: ['user-profile', userId] });
      setShowReviewForm(false);
      setReviewComment('');
      setTransactionContext('');
      setReviewRating(5);
    },
  });

  const renderStars = (rating: number, interactive = false, onRatingChange?: (rating: number) => void) => {
    return (
      <div className="flex gap-1">
        {Array.from({ length: 5 }, (_, i) => (
          <Star
            key={i}
            className={`w-4 h-4 ${
              i < rating ? 'fill-yellow-400 text-yellow-400' : 'text-gray-300'
            } ${interactive ? 'cursor-pointer hover:text-yellow-400' : ''}`}
            onClick={() => interactive && onRatingChange && onRatingChange(i + 1)}
          />
        ))}
      </div>
    );
  };

  const handleSubmitReview = (e: React.FormEvent) => {
    e.preventDefault();
    if (!reviewComment.trim() || !transactionContext.trim()) return;

    submitReviewMutation.mutate({
      rating: reviewRating,
      comment: reviewComment.trim(),
      transaction_context: transactionContext.trim(),
    });
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-3">
            <Avatar className="w-12 h-12">
              <AvatarFallback className="bg-blue-600 text-white">
                {userName?.charAt(0)?.toUpperCase() || 'U'}
              </AvatarFallback>
            </Avatar>
            <div>
              <h2 className="text-xl font-bold">{userName}</h2>
              {profile && (
                <div className="flex items-center gap-2 text-sm text-gray-600">
                  {renderStars(Math.round(profile.user_rating || 0))}
                  <span>({profile.total_user_reviews || 0} avis)</span>
                </div>
              )}
            </div>
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          {/* User Info */}
          {profile && (
            <Card>
              <CardContent className="p-4 space-y-3">
                {profile.bio && (
                  <p className="text-gray-700">{profile.bio}</p>
                )}
                
                <div className="grid grid-cols-1 md:grid-cols-3 gap-3 text-sm">
                  {profile.location && (
                    <div className="flex items-center gap-2">
                      <MapPin className="w-4 h-4 text-gray-500" />
                      <span>{profile.location}</span>
                    </div>
                  )}
                  
                  {profile.phone && (
                    <div className="flex items-center gap-2">
                      <Phone className="w-4 h-4 text-gray-500" />
                      <span>{profile.phone}</span>
                    </div>
                  )}
                  
                  {profile.response_time_hours && (
                    <div className="flex items-center gap-2">
                      <Clock className="w-4 h-4 text-gray-500" />
                      <span>Répond en {profile.response_time_hours}h</span>
                    </div>
                  )}
                </div>

                {profile.total_user_reviews > 0 && (
                  <div className="flex items-center gap-2 pt-2">
                    <Award className="w-4 h-4 text-yellow-500" />
                    <span className="text-sm font-medium">
                      {profile.user_rating?.toFixed(1)}/5 • {profile.total_user_reviews} avis
                    </span>
                  </div>
                )}
              </CardContent>
            </Card>
          )}

          {/* Action Buttons */}
          {user && user.id !== userId && (
            <div className="flex gap-2">
              <Button className="flex-1">
                <MessageCircle className="w-4 h-4 mr-2" />
                Envoyer un message
              </Button>
              <Button variant="outline" onClick={() => setShowReviewForm(!showReviewForm)}>
                <Star className="w-4 h-4 mr-2" />
                Donner un avis
              </Button>
            </div>
          )}

          {/* Review Form */}
          {showReviewForm && (
            <Card className="border-blue-200">
              <CardContent className="p-4">
                <h3 className="font-semibold mb-4">Donner votre avis</h3>
                <form onSubmit={handleSubmitReview} className="space-y-4">
                  <div>
                    <label className="text-sm font-medium mb-2 block">Note</label>
                    {renderStars(reviewRating, true, setReviewRating)}
                  </div>

                  <div>
                    <label className="text-sm font-medium mb-2 block">Contexte de la transaction</label>
                    <input
                      type="text"
                      value={transactionContext}
                      onChange={(e) => setTransactionContext(e.target.value)}
                      placeholder="Ex: Achat iPhone, Vente voiture, etc."
                      className="w-full px-3 py-2 border border-gray-300 rounded-md"
                      required
                    />
                  </div>

                  <div>
                    <label className="text-sm font-medium mb-2 block">Commentaire</label>
                    <Textarea
                      value={reviewComment}
                      onChange={(e) => setReviewComment(e.target.value)}
                      placeholder="Partagez votre expérience..."
                      required
                    />
                  </div>

                  <div className="flex gap-2">
                    <Button type="submit" disabled={submitReviewMutation.isPending}>
                      {submitReviewMutation.isPending ? 'Publication...' : 'Publier l\'avis'}
                    </Button>
                    <Button type="button" variant="outline" onClick={() => setShowReviewForm(false)}>
                      Annuler
                    </Button>
                  </div>
                </form>
              </CardContent>
            </Card>
          )}

          {/* Reviews List */}
          {reviews && reviews.length > 0 && (
            <div>
              <h3 className="font-semibold mb-4 flex items-center gap-2">
                <Star className="w-5 h-5 text-yellow-500" />
                Avis des clients ({reviews.length})
              </h3>
              
              <div className="space-y-4">
                {reviews.map((review: UserReview) => (
                  <Card key={review.id} className="border-l-4 border-l-yellow-400">
                    <CardContent className="p-4">
                      <div className="flex items-start justify-between mb-2">
                        <div className="flex items-center gap-3">
                          <Avatar className="w-8 h-8">
                            <AvatarFallback className="bg-gray-500 text-white text-sm">
                              {review.reviewer_name?.charAt(0)?.toUpperCase() || 'U'}
                            </AvatarFallback>
                          </Avatar>
                          <div>
                            <p className="font-medium text-sm">{review.reviewer_name}</p>
                            {renderStars(review.rating)}
                          </div>
                        </div>
                        <div className="text-right text-sm text-gray-500">
                          <Badge variant="outline" className="mb-1">
                            {review.transaction_context}
                          </Badge>
                          <p>
                            {formatDistanceToNow(new Date(review.created_at), {
                              addSuffix: true,
                              locale: fr,
                            })}
                          </p>
                        </div>
                      </div>
                      
                      <p className="text-gray-700">{review.comment}</p>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>
          )}

          {reviews && reviews.length === 0 && (
            <div className="text-center py-8 text-gray-500">
              <Star className="w-12 h-12 mx-auto mb-4 text-gray-300" />
              <p>Aucun avis pour le moment</p>
              {user && user.id !== userId && (
                <p className="text-sm mt-2">Soyez le premier à laisser un avis !</p>
              )}
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}