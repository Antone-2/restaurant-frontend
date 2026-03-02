import { useState, useRef } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import { Image, Share2, Facebook, MessageCircle, Mail, Copy, Heart, MessageSquare, Eye } from 'lucide-react';
import env from '@/lib/env';

const API_BASE_URL = `${env.VITE_API_URL}/api`;

interface ReviewWithPhotos {
    _id: string;
    userId: string;
    customerName: string;
    rating: number;
    title: string;
    content: string;
    photos: string[];
    verified: boolean;
    helpful: number;
    shares: number;
    views: number;
    createdAt: string;
}

const ReviewSubmissionWithPhotos = ({ orderId, onSuccess }: { orderId: string; onSuccess?: () => void }) => {
    const { toast } = useToast();
    const fileInputRef = useRef<HTMLInputElement>(null);
    const [photos, setPhotos] = useState<File[]>([]);
    const [photoPreview, setPhotoPreview] = useState<string[]>([]);
    const [rating, setRating] = useState(5);
    const [title, setTitle] = useState('');
    const [review, setReview] = useState('');
    const [uploading, setUploading] = useState(false);
    const [showShareModal, setShowShareModal] = useState(false);
    const [shareLink, setShareLink] = useState('');

    const handlePhotoSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
        const files = Array.from(e.target.files || []);
        if (files.length + photos.length > 5) {
            toast({
                title: 'Too many photos',
                description: 'Maximum 5 photos allowed per review',
                variant: 'destructive'
            });
            return;
        }

        setPhotos([...photos, ...files]);

        files.forEach(file => {
            const reader = new FileReader();
            reader.onload = (event) => {
                setPhotoPreview(prev => [...prev, event.target?.result as string]);
            };
            reader.readAsDataURL(file);
        });
    };

    const removePhoto = (index: number) => {
        setPhotos(prev => prev.filter((_, i) => i !== index));
        setPhotoPreview(prev => prev.filter((_, i) => i !== index));
    };

    const submitReview = async (e: React.FormEvent) => {
        e.preventDefault();

        if (rating < 1 || !title.trim() || !review.trim()) {
            toast({
                title: 'Missing information',
                description: 'Please fill in all required fields',
                variant: 'destructive'
            });
            return;
        }

        setUploading(true);
        try {
            const formData = new FormData();
            formData.append('orderId', orderId);
            formData.append('rating', rating.toString());
            formData.append('title', title);
            formData.append('content', review);

            photos.forEach(photo => {
                formData.append('photos', photo);
            });

            const response = await fetch('${API_BASE_URL}/api/reviews/submit', {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${localStorage.getItem('authToken')}`
                },
                body: formData
            });

            if (!response.ok) {
                throw new Error('Failed to submit review');
            }

            const data = await response.json();
            setShareLink(data.reviewLink || window.location.href);
            setShowShareModal(true);

            toast({
                title: 'Review submitted!',
                description: 'Thank you for your feedback'
            });

            // Reset form
            setPhotos([]);
            setPhotoPreview([]);
            setRating(5);
            setTitle('');
            setReview('');

            onSuccess?.();
        } catch (err: any) {
            toast({
                title: 'Error',
                description: err.message,
                variant: 'destructive'
            });
        } finally {
            setUploading(false);
        }
    };

    const shareOnPlatform = (platform: string) => {
        let url = '';
        const text = `Check out my review: ${title}`;

        switch (platform) {
            case 'facebook':
                url = `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(shareLink)}`;
                break;
            case 'twitter':
                url = `https://twitter.com/intent/tweet?text=${encodeURIComponent(text)}&url=${encodeURIComponent(shareLink)}`;
                break;
            case 'whatsapp':
                url = `https://wa.me/?text=${encodeURIComponent(`${text} ${shareLink}`)}`;
                break;
            case 'email':
                url = `mailto:?subject=${encodeURIComponent(title)}&body=${encodeURIComponent(`Check out my review: ${shareLink}`)}`;
                break;
            case 'copy':
                navigator.clipboard.writeText(shareLink);
                toast({ title: 'Link copied!', description: 'Share link copied to clipboard' });
                return;
        }

        if (url) window.open(url, '_blank');
    };

    return (
        <Card>
            <CardHeader>
                <CardTitle>Share Your Experience</CardTitle>
            </CardHeader>
            <CardContent>
                <form onSubmit={submitReview} className="space-y-4">
                    {/* Rating */}
                    <div>
                        <label className="text-sm font-medium">Rating</label>
                        <div className="flex gap-2 mt-2">
                            {[1, 2, 3, 4, 5].map(num => (
                                <button
                                    key={num}
                                    type="button"
                                    onClick={() => setRating(num)}
                                    className={`text-3xl transition-transform ${num <= rating ? 'text-yellow-400 scale-110' : 'text-gray-300'
                                        }`}
                                >
                                    ⭐
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* Review Title */}
                    <div>
                        <label className="text-sm font-medium">Review Title</label>
                        <input
                            type="text"
                            value={title}
                            onChange={(e) => setTitle(e.target.value)}
                            placeholder="e.g., Amazing pizza and great service!"
                            className="w-full mt-1 px-3 py-2 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                            required
                        />
                    </div>

                    {/* Review Content */}
                    <div>
                        <label className="text-sm font-medium">Your Review</label>
                        <Textarea
                            value={review}
                            onChange={(e) => setReview(e.target.value)}
                            placeholder="Share your experience with this order..."
                            rows={4}
                            className="mt-1"
                            required
                        />
                    </div>

                    {/* Photo Upload */}
                    <div>
                        <label className="text-sm font-medium">Add Photos (Optional)</label>
                        <p className="text-xs text-muted-foreground mb-2">Up to 5 photos - helps other customers</p>
                        <input
                            ref={fileInputRef}
                            type="file"
                            multiple
                            accept="image/*"
                            onChange={handlePhotoSelect}
                            className="hidden"
                        />
                        <Button
                            type="button"
                            variant="outline"
                            onClick={() => fileInputRef.current?.click()}
                            className="w-full"
                        >
                            <Image className="w-4 h-4 mr-2" />
                            Upload Photos ({photos.length}/5)
                        </Button>

                        {/* Photo Preview */}
                        {photoPreview.length > 0 && (
                            <div className="grid grid-cols-3 gap-2 mt-3">
                                {photoPreview.map((preview, idx) => (
                                    <div key={idx} className="relative group">
                                        <img src={preview} alt={`preview-${idx}`} className="w-full h-24 object-cover rounded-lg" />
                                        <button
                                            type="button"
                                            onClick={() => removePhoto(idx)}
                                            className="absolute top-1 right-1 bg-red-500 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity"
                                        >
                                            ✕
                                        </button>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>

                    {/* Submit Button */}
                    <Button type="submit" disabled={uploading} className="w-full">
                        {uploading ? 'Submitting...' : 'Submit Review'}
                    </Button>
                </form>

                {/* Share Modal */}
                {showShareModal && (
                    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
                        <Card className="w-96">
                            <CardHeader>
                                <CardTitle className="flex items-center gap-2">
                                    <Share2 className="w-5 h-5" />
                                    Share Your Review
                                </CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <p className="text-sm text-muted-foreground">
                                    Your review has been published! Share it with others:
                                </p>

                                <div className="grid grid-cols-2 gap-2">
                                    <Button
                                        variant="outline"
                                        onClick={() => shareOnPlatform('facebook')}
                                        className="flex items-center gap-2"
                                    >
                                        <Facebook className="w-4 h-4" />
                                        Facebook
                                    </Button>
                                    <Button
                                        variant="outline"
                                        onClick={() => shareOnPlatform('whatsapp')}
                                        className="flex items-center gap-2"
                                    >
                                        <MessageCircle className="w-4 h-4" />
                                        WhatsApp
                                    </Button>
                                    <Button
                                        variant="outline"
                                        onClick={() => shareOnPlatform('email')}
                                        className="flex items-center gap-2"
                                    >
                                        <Mail className="w-4 h-4" />
                                        Email
                                    </Button>
                                    <Button
                                        variant="outline"
                                        onClick={() => shareOnPlatform('copy')}
                                        className="flex items-center gap-2"
                                    >
                                        <Copy className="w-4 h-4" />
                                        Copy Link
                                    </Button>
                                </div>

                                <Button onClick={() => setShowShareModal(false)} className="w-full">
                                    Done
                                </Button>
                            </CardContent>
                        </Card>
                    </div>
                )}
            </CardContent>
        </Card>
    );
};

// Display reviews with photos
export const ReviewsWithPhotos = ({ orderId }: { orderId?: string }) => {
    const [reviews, setReviews] = useState<ReviewWithPhotos[]>([]);
    const [loading, setLoading] = useState(true);

    const fetchReviews = async () => {
        try {
            const url = orderId
                ? `${API_BASE_URL}/api/reviews?orderId=${orderId}`
                : '${API_BASE_URL}/api/reviews';

            const response = await fetch(url);
            if (response.ok) {
                const data = await response.json();
                setReviews(data.reviews || []);
            }
        } catch (err) {
            console.error('Failed to fetch reviews:', err);
        } finally {
            setLoading(false);
        }
    };

    useState(() => {
        fetchReviews();
    });

    if (loading) return <p className="text-center text-muted-foreground py-8">Loading reviews...</p>;

    return (
        <div className="space-y-4">
            {reviews.map(review => (
                <Card key={review._id}>
                    <CardContent className="pt-6">
                        <div className="flex justify-between items-start mb-3">
                            <div>
                                <h3 className="font-semibold">{review.title}</h3>
                                <div className="flex items-center gap-2">
                                    <span className="text-sm text-muted-foreground">{review.customerName}</span>
                                    {review.verified && <Badge className="text-xs">Verified</Badge>}
                                </div>
                            </div>
                            <div className="text-right">
                                <p className="text-lg">{'⭐'.repeat(review.rating)}</p>
                                <p className="text-xs text-muted-foreground">
                                    {new Date(review.createdAt).toLocaleDateString()}
                                </p>
                            </div>
                        </div>

                        <p className="text-sm text-muted-foreground mb-3">{review.content}</p>

                        {/* Photos */}
                        {review.photos.length > 0 && (
                            <div className="grid grid-cols-3 gap-2 mb-3">
                                {review.photos.map((photo, idx) => (
                                    <img key={idx} src={photo} alt={`review-photo-${idx}`} className="w-full h-24 object-cover rounded" />
                                ))}
                            </div>
                        )}

                        {/* Engagement stats */}
                        <div className="flex gap-4 text-xs text-muted-foreground pt-3 border-t">
                            <button className="flex items-center gap-1 hover:text-primary">
                                <Heart className="w-4 h-4" /> {review.helpful}
                            </button>
                            <button className="flex items-center gap-1 hover:text-primary">
                                <MessageSquare className="w-4 h-4" /> Reply
                            </button>
                            <button className="flex items-center gap-1 hover:text-primary">
                                <Share2 className="w-4 h-4" /> {review.shares}
                            </button>
                            <div className="flex items-center gap-1 ml-auto">
                                <Eye className="w-4 h-4" /> {review.views}
                            </div>
                        </div>
                    </CardContent>
                </Card>
            ))}
        </div>
    );
};

export default ReviewSubmissionWithPhotos;
