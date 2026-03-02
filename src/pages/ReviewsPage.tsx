import { useState, useEffect } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import StarRating from "@/components/StarRating";
import { useToast } from "@/hooks/use-toast";
import { reviewsApi } from "@/services/api";

interface Review {
  _id: string;
  name: string;
  rating: number;
  comment: string;
  createdAt: string;
}

const ReviewsPage = () => {
  const { toast } = useToast();
  const [reviewsList, setReviewsList] = useState<Review[]>([]);
  const [name, setName] = useState("");
  const [rating, setRating] = useState(5);
  const [comment, setComment] = useState("");
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [avgRating, setAvgRating] = useState(0);

  useEffect(() => {
    loadReviews();
  }, []);

  const loadReviews = async () => {
    try {
      const data = await reviewsApi.getAll();
      const sortedReviews = data.sort((a: Review, b: Review) =>
        new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
      );
      setReviewsList(sortedReviews);

      if (data.length > 0) {
        const avg = (data.reduce((sum, r) => sum + r.rating, 0) / data.length).toFixed(1);
        setAvgRating(parseFloat(avg));
      }
    } catch (err: any) {
      console.error("Failed to load reviews", err);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !comment) {
      toast({
        title: "Missing Information",
        description: "Please fill in all fields",
        variant: "destructive"
      });
      return;
    }

    setSubmitting(true);
    try {
      await reviewsApi.create({ name, rating, comment });

      setName("");
      setRating(5);
      setComment("");

      toast({ title: "Thank you!", description: "Your review has been submitted." });
      loadReviews();
    } catch (err: any) {
      toast({
        title: "Failed to Submit",
        description: err.message || "Could not submit review",
        variant: "destructive"
      });
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <main className="pt-20 pb-16 min-h-screen bg-background">
      <div className="container mx-auto px-4 max-w-4xl">
        <div className="text-center mb-10">
          <h1 className="font-display text-4xl font-bold text-foreground mb-2">Customer Reviews</h1>
          <div className="flex items-center justify-center gap-3 mt-4">
            <span className="text-5xl font-bold text-primary font-display">{avgRating}</span>
            <div>
              <StarRating rating={4} size={22} />
              <p className="text-muted-foreground text-sm mt-1">Based on 143 reviews</p>
            </div>
          </div>
        </div>

        <div className="grid gap-4 mb-12">
          {loading ? (
            <div className="text-center py-12">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
              <p className="text-muted-foreground mt-4">Loading reviews...</p>
            </div>
          ) : reviewsList.length === 0 ? (
            <p className="text-muted-foreground text-center py-8">No reviews yet. Be the first to review!</p>
          ) : (
            reviewsList.map((review) => (
              <Card key={review._id} className="border-primary/10 bg-card">
                <CardContent className="p-5">
                  <div className="flex items-center justify-between mb-2">
                    <h3 className="font-semibold text-card-foreground">{review.name}</h3>
                    <span className="text-xs text-muted-foreground">{new Date(review.createdAt).toLocaleDateString()}</span>
                  </div>
                  <StarRating rating={review.rating} size={16} />
                  <p className="text-muted-foreground text-sm mt-2">{review.comment}</p>
                </CardContent>
              </Card>
            ))
          )}
        </div>

        <Card className="border-primary/20 bg-card">
          <CardContent className="p-6">
            <h2 className="font-display text-2xl font-bold text-card-foreground mb-4">Leave a Review</h2>
            <form onSubmit={handleSubmit} className="space-y-4">
              <Input placeholder="Your name" value={name} onChange={(e) => setName(e.target.value)} required className="bg-background" />
              <div>
                <label className="text-sm text-muted-foreground block mb-1">Your Rating</label>
                <StarRating rating={rating} interactive onChange={setRating} size={24} />
              </div>
              <Textarea placeholder="Share your experience..." value={comment} onChange={(e) => setComment(e.target.value)} required className="bg-background" />
              <Button type="submit" disabled={submitting} className="bg-primary text-primary-foreground hover:bg-primary/90">
                {submitting ? "Submitting..." : "Submit Review"}
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>
    </main>
  );
};

export default ReviewsPage;
