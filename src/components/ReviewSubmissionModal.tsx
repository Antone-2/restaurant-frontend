import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import StarRating from "@/components/StarRating";
import { useToast } from "@/hooks/use-toast";
import { reviewsApi } from "@/services/api";
import { Loader2, ThumbsUp } from "lucide-react";

interface ReviewSubmissionModalProps {
    isOpen: boolean;
    onClose: () => void;
    orderId: string;
    customerName: string;
    customerEmail?: string;
}

const ReviewSubmissionModal = ({
    isOpen,
    onClose,
    orderId,
    customerName,
    customerEmail,
}: ReviewSubmissionModalProps) => {
    const { toast } = useToast();
    const [rating, setRating] = useState(5);
    const [comment, setComment] = useState("");
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [isSubmitted, setIsSubmitted] = useState(false);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!comment.trim()) {
            toast({
                title: "Missing Information",
                description: "Please share your experience in the comment",
                variant: "destructive"
            });
            return;
        }

        setIsSubmitting(true);
        try {
            await reviewsApi.create({
                name: customerName,
                rating,
                comment,
                orderId,
                email: customerEmail,
            });

            setIsSubmitted(true);
            toast({
                title: "Thank you!",
                description: "Your review has been submitted and is pending approval.",
            });

            // Close modal after a short delay
            setTimeout(() => {
                handleClose();
            }, 2000);
        } catch (err: any) {
            toast({
                title: "Failed to Submit",
                description: err.message || "Could not submit review",
                variant: "destructive"
            });
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleClose = () => {
        setRating(5);
        setComment("");
        setIsSubmitted(false);
        onClose();
    };

    return (
        <Dialog open={isOpen} onOpenChange={handleClose}>
            <DialogContent className="sm:max-w-md">
                <DialogHeader>
                    <DialogTitle>Rate Your Order</DialogTitle>
                    <DialogDescription>
                        How was your experience with The Quill? Your feedback helps us improve.
                    </DialogDescription>
                </DialogHeader>

                {isSubmitted ? (
                    <div className="text-center py-6">
                        <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                            <ThumbsUp className="w-8 h-8 text-green-600" />
                        </div>
                        <h3 className="text-lg font-semibold mb-2">Thank You!</h3>
                        <p className="text-muted-foreground">
                            Your review has been submitted successfully.
                        </p>
                    </div>
                ) : (
                    <form onSubmit={handleSubmit} className="space-y-4">
                        <div className="text-center">
                            <p className="text-sm text-muted-foreground mb-2">Tap to rate</p>
                            <StarRating
                                rating={rating}
                                size={32}
                                interactive
                                onChange={setRating}
                            />
                            <p className="text-sm mt-2 font-medium">
                                {rating === 5 && "Excellent!"}
                                {rating === 4 && "Very Good"}
                                {rating === 3 && "Good"}
                                {rating === 2 && "Fair"}
                                {rating === 1 && "Poor"}
                            </p>
                        </div>

                        <div>
                            <Textarea
                                placeholder="Tell us about your experience..."
                                value={comment}
                                onChange={(e) => setComment(e.target.value)}
                                rows={4}
                                required
                            />
                        </div>

                        <Button
                            type="submit"
                            className="w-full"
                            disabled={isSubmitting}
                        >
                            {isSubmitting ? (
                                <>
                                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                                    Submitting...
                                </>
                            ) : (
                                "Submit Review"
                            )}
                        </Button>
                    </form>
                )}
            </DialogContent>
        </Dialog>
    );
};

export default ReviewSubmissionModal;
