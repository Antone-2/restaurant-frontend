import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { reviews as initialReviews, Review } from "@/data/reviewsData";
import StarRating from "@/components/StarRating";
import { useToast } from "@/hooks/use-toast";

const ReviewsPage = () => {
  const { toast } = useToast();
  const [reviewsList, setReviewsList] = useState<Review[]>(initialReviews);
  const [name, setName] = useState("");
  const [rating, setRating] = useState(5);
  const [comment, setComment] = useState("");

  const avgRating = 3.9;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !comment) return;
    const newReview: Review = {
      id: Date.now().toString(),
      name,
      rating,
      comment,
      date: new Date().toISOString().split("T")[0],
    };
    setReviewsList([newReview, ...reviewsList]);
    setName("");
    setRating(5);
    setComment("");
    toast({ title: "Thank you!", description: "Your review has been submitted." });
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
          {reviewsList.map((review) => (
            <Card key={review.id} className="border-primary/10 bg-card">
              <CardContent className="p-5">
                <div className="flex items-center justify-between mb-2">
                  <h3 className="font-semibold text-card-foreground">{review.name}</h3>
                  <span className="text-xs text-muted-foreground">{review.date}</span>
                </div>
                <StarRating rating={review.rating} size={16} />
                <p className="text-muted-foreground text-sm mt-2">{review.comment}</p>
              </CardContent>
            </Card>
          ))}
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
              <Button type="submit" className="bg-primary text-primary-foreground hover:bg-primary/90">Submit Review</Button>
            </form>
          </CardContent>
        </Card>
      </div>
    </main>
  );
};

export default ReviewsPage;
