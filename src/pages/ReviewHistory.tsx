import { useState, useEffect } from "react";
import { useAuth } from "@/context/AuthContext";
import { useNavigate } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { reviewsApi } from "@/services/api";
import StarRating from "@/components/StarRating";
import { ArrowLeft, Star, Edit2, Trash2 } from "lucide-react";

interface Review {
    _id: string;
    name: string;
    rating: number;
    comment: string;
    createdAt: string;
}

const ReviewHistory = () => {
    const { user, isAuthenticated } = useAuth();
    const navigate = useNavigate();
    const { toast } = useToast();

    const [reviews, setReviews] = useState<Review[]>([]);
    const [loading, setLoading] = useState(true);
    const [deleting, setDeleting] = useState<string | null>(null);

    useEffect(() => {
        if (!isAuthenticated) {
            navigate("/login");
            return;
        }
        loadReviews();
    }, [isAuthenticated, navigate]);

    const loadReviews = async () => {
        try {
            const data = await reviewsApi.getAll();
            // Filter reviews by current user's name
            const userReviews = data.filter((review: Review) => review.name === user?.name);
            setReviews(userReviews.sort((a, b) =>
                new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
            ));
        } catch (err: any) {
            toast({
                title: "Error",
                description: "Could not load review history",
                variant: "destructive"
            });
        } finally {
            setLoading(false);
        }
    };

    const handleDeleteReview = async (id: string) => {
        if (!window.confirm("Are you sure you want to delete this review?")) {
            return;
        }

        setDeleting(id);
        try {
            // Assuming there's a delete endpoint
            await reviewsApi.delete(id);

            setReviews(reviews.filter(r => r._id !== id));
            toast({
                title: "Success",
                description: "Review deleted successfully"
            });
        } catch (err: any) {
            toast({
                title: "Error",
                description: err.message || "Could not delete review",
                variant: "destructive"
            });
        } finally {
            setDeleting(null);
        }
    };

    const avgRating = reviews.length > 0
        ? parseFloat((reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length).toFixed(1))
        : 0;

    return (
        <main className="pt-20 pb-16 min-h-screen bg-background">
            <div className="container mx-auto px-4 max-w-4xl">
                <Button variant="ghost" onClick={() => navigate("/profile")} className="mb-6">
                    <ArrowLeft className="w-4 h-4 mr-2" />
                    Back to Profile
                </Button>

                <div className="mb-8">
                    <h1 className="font-display text-4xl font-bold mb-2">My Reviews</h1>
                    <p className="text-muted-foreground">View and manage your restaurant reviews</p>
                </div>

                {/* Stats Card */}
                {reviews.length > 0 && (
                    <Card className="mb-8">
                        <CardContent className="p-6">
                            <div className="grid md:grid-cols-2 gap-6">
                                <div>
                                    <p className="text-muted-foreground text-sm mb-1">Total Reviews</p>
                                    <p className="text-4xl font-bold">{reviews.length}</p>
                                </div>
                                <div>
                                    <p className="text-muted-foreground text-sm mb-1">Average Rating</p>
                                    <div className="flex items-center gap-3">
                                        <p className="text-4xl font-bold">{avgRating}</p>
                                        <StarRating rating={Math.round(avgRating)} size={24} />
                                    </div>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                )}

                {/* Reviews List */}
                {loading ? (
                    <div className="text-center py-12">
                        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
                        <p className="text-muted-foreground mt-4">Loading reviews...</p>
                    </div>
                ) : reviews.length === 0 ? (
                    <Card>
                        <CardContent className="text-center py-12">
                            <Star className="w-12 h-12 mx-auto text-muted-foreground mb-4 opacity-50" />
                            <p className="text-muted-foreground mb-4">You haven't submitted any reviews yet</p>
                            <Button onClick={() => navigate("/reviews")}>Write a Review</Button>
                        </CardContent>
                    </Card>
                ) : (
                    <div className="space-y-4">
                        {reviews.map((review) => (
                            <Card key={review._id} className="hover:shadow-lg transition-shadow">
                                <CardContent className="p-6">
                                    <div className="flex items-start justify-between mb-3">
                                        <div>
                                            <h3 className="font-bold text-lg">{review.name}</h3>
                                            <p className="text-sm text-muted-foreground">
                                                {new Date(review.createdAt).toLocaleDateString()} at{" "}
                                                {new Date(review.createdAt).toLocaleTimeString()}
                                            </p>
                                        </div>
                                        <div className="text-right">
                                            <StarRating rating={review.rating} size={20} />
                                            <p className="text-sm font-semibold mt-1">{review.rating}/5</p>
                                        </div>
                                    </div>

                                    <p className="text-foreground mb-4 leading-relaxed">{review.comment}</p>

                                    <div className="flex gap-2 pt-4 border-t">
                                        <Button
                                            variant="outline"
                                            size="sm"
                                            className="flex-1"
                                            onClick={() => navigate("/reviews")}
                                        >
                                            <Edit2 className="w-4 h-4 mr-2" />
                                            Edit
                                        </Button>
                                        <Button
                                            variant="destructive"
                                            size="sm"
                                            className="flex-1"
                                            disabled={deleting === review._id}
                                            onClick={() => handleDeleteReview(review._id)}
                                        >
                                            <Trash2 className="w-4 h-4 mr-2" />
                                            {deleting === review._id ? "Deleting..." : "Delete"}
                                        </Button>
                                    </div>
                                </CardContent>
                            </Card>
                        ))}
                    </div>
                )}

                <div className="mt-8 text-center">
                    <Button onClick={() => navigate("/reviews")} size="lg">
                        <Star className="w-4 h-4 mr-2" />
                        Write Another Review
                    </Button>
                </div>
            </div>
        </main>
    );
};

export default ReviewHistory;
