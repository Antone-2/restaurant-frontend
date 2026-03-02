import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { reviewsApi } from "@/services/api";
import StarRating from "@/components/StarRating";
import { Check, X, MessageSquare, Trash2, Loader2, Star } from "lucide-react";

interface Review {
    _id: string;
    name: string;
    rating: number;
    comment: string;
    orderId?: string;
    userId?: string;
    email?: string;
    status: string;
    isVisible: boolean;
    adminReply?: string;
    createdAt: string;
}

const ReviewModeration = () => {
    const { toast } = useToast();
    const [reviews, setReviews] = useState<Review[]>([]);
    const [loading, setLoading] = useState(true);
    const [filter, setFilter] = useState<string>("pending");
    const [processing, setProcessing] = useState<string | null>(null);
    const [replyText, setReplyText] = useState<Record<string, string>>({});

    useEffect(() => {
        loadReviews();
    }, [filter]);

    const loadReviews = async () => {
        setLoading(true);
        try {
            const data = await reviewsApi.getAllForAdmin(filter === "all" ? undefined : filter);
            setReviews(data);
        } catch (err: any) {
            toast({
                title: "Error",
                description: "Failed to load reviews",
                variant: "destructive"
            });
        } finally {
            setLoading(false);
        }
    };

    const handleStatusUpdate = async (reviewId: string, status: string, adminReply?: string) => {
        setProcessing(reviewId);
        try {
            await reviewsApi.updateStatus(reviewId, status, adminReply);
            toast({
                title: "Success",
                description: `Review ${status === 'approved' ? 'approved' : 'rejected'} successfully`
            });
            loadReviews();
        } catch (err: any) {
            toast({
                title: "Error",
                description: err.message || "Failed to update review",
                variant: "destructive"
            });
        } finally {
            setProcessing(null);
        }
    };

    const handleDelete = async (reviewId: string) => {
        if (!window.confirm("Are you sure you want to delete this review?")) {
            return;
        }

        setProcessing(reviewId);
        try {
            await reviewsApi.delete(reviewId);
            toast({
                title: "Success",
                description: "Review deleted successfully"
            });
            loadReviews();
        } catch (err: any) {
            toast({
                title: "Error",
                description: err.message || "Failed to delete review",
                variant: "destructive"
            });
        } finally {
            setProcessing(null);
        }
    };

    const handleReply = async (review: Review) => {
        const reply = replyText[review._id];
        if (!reply?.trim()) {
            toast({
                title: "Error",
                description: "Please enter a reply",
                variant: "destructive"
            });
            return;
        }
        await handleStatusUpdate(review._id, review.status, reply);
    };

    const getStatusBadge = (status: string) => {
        switch (status) {
            case "pending":
                return <Badge variant="outline" className="bg-yellow-500/10 text-yellow-500">Pending</Badge>;
            case "approved":
                return <Badge variant="default" className="bg-green-500">Approved</Badge>;
            case "rejected":
                return <Badge variant="destructive">Rejected</Badge>;
            default:
                return <Badge>{status}</Badge>;
        }
    };

    return (
        <Card>
            <CardHeader>
                <div className="flex items-center justify-between">
                    <CardTitle className="flex items-center gap-2">
                        <MessageSquare className="w-5 h-5" />
                        Review Moderation
                    </CardTitle>
                    <div className="flex gap-2">
                        {["pending", "approved", "rejected", "all"].map((status) => (
                            <Button
                                key={status}
                                variant={filter === status ? "default" : "outline"}
                                size="sm"
                                onClick={() => setFilter(status)}
                            >
                                {status.charAt(0).toUpperCase() + status.slice(1)}
                            </Button>
                        ))}
                    </div>
                </div>
            </CardHeader>
            <CardContent>
                {loading ? (
                    <div className="text-center py-8">
                        <Loader2 className="w-8 h-8 mx-auto animate-spin" />
                        <p className="text-muted-foreground mt-2">Loading reviews...</p>
                    </div>
                ) : reviews.length === 0 ? (
                    <div className="text-center py-8 text-muted-foreground">
                        <Star className="w-8 h-8 mx-auto mb-2 opacity-50" />
                        <p>No reviews found</p>
                    </div>
                ) : (
                    <div className="space-y-4">
                        {reviews.map((review) => (
                            <div
                                key={review._id}
                                className="border rounded-lg p-4 space-y-3"
                            >
                                <div className="flex items-start justify-between">
                                    <div>
                                        <div className="flex items-center gap-2">
                                            <h4 className="font-semibold">{review.name}</h4>
                                            {getStatusBadge(review.status)}
                                        </div>
                                        <p className="text-sm text-muted-foreground">
                                            {new Date(review.createdAt).toLocaleDateString()} at{" "}
                                            {new Date(review.createdAt).toLocaleTimeString()}
                                        </p>
                                        {review.orderId && (
                                            <p className="text-xs text-muted-foreground">
                                                Order: #{review.orderId.slice(-8).toUpperCase()}
                                            </p>
                                        )}
                                    </div>
                                    <StarRating rating={review.rating} size={16} />
                                </div>

                                <p className="text-sm">{review.comment}</p>

                                {review.adminReply && (
                                    <div className="bg-muted p-3 rounded-lg">
                                        <p className="text-xs font-semibold text-muted-foreground mb-1">Admin Reply:</p>
                                        <p className="text-sm">{review.adminReply}</p>
                                    </div>
                                )}

                                {review.status === "pending" && (
                                    <>
                                        <Textarea
                                            placeholder="Add a reply (optional)..."
                                            value={replyText[review._id] || ""}
                                            onChange={(e) =>
                                                setReplyText((prev) => ({
                                                    ...prev,
                                                    [review._id]: e.target.value,
                                                }))
                                            }
                                            className="text-sm"
                                        />
                                        <div className="flex gap-2">
                                            <Button
                                                size="sm"
                                                onClick={() => handleStatusUpdate(review._id, "approved")}
                                                disabled={processing === review._id}
                                                className="bg-green-500 hover:bg-green-600"
                                            >
                                                {processing === review._id ? (
                                                    <Loader2 className="w-4 h-4 animate-spin" />
                                                ) : (
                                                    <Check className="w-4 h-4 mr-1" />
                                                )}
                                                Approve
                                            </Button>
                                            <Button
                                                size="sm"
                                                variant="outline"
                                                onClick={() => handleStatusUpdate(review._id, "rejected")}
                                                disabled={processing === review._id}
                                            >
                                                <X className="w-4 h-4 mr-1" />
                                                Reject
                                            </Button>
                                            {replyText[review._id]?.trim() && (
                                                <Button
                                                    size="sm"
                                                    onClick={() => handleReply(review)}
                                                    disabled={processing === review._id}
                                                >
                                                    <MessageSquare className="w-4 h-4 mr-1" />
                                                    Reply & Approve
                                                </Button>
                                            )}
                                            <Button
                                                size="sm"
                                                variant="destructive"
                                                onClick={() => handleDelete(review._id)}
                                                disabled={processing === review._id}
                                                className="ml-auto"
                                            >
                                                <Trash2 className="w-4 h-4" />
                                            </Button>
                                        </div>
                                    </>
                                )}
                            </div>
                        ))}
                    </div>
                )}
            </CardContent>
        </Card>
    );
};

export default ReviewModeration;
