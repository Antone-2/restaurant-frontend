import { useState, useEffect } from "react";
import { X, Star, ChevronLeft, ChevronRight, Quote } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { reviewsApi } from "@/services/api";
import { reviews } from "@/data/reviewsData";

interface Review {
    _id?: string;
    id?: string;
    name: string;
    rating: number;
    comment: string;
    date?: string;
}

const ReviewPopups = () => {
    const [reviewsList, setReviewsList] = useState<Review[]>([]);
    const [currentIndex, setCurrentIndex] = useState(0);
    const [isVisible, setIsVisible] = useState(false);
    const [isPaused, setIsPaused] = useState(false);

    useEffect(() => {
        // Try to fetch from API, fall back to static data
        const fetchReviews = async () => {
            try {
                const data = await reviewsApi.getAll();
                setReviewsList(data.slice(0, 5)); // Show max 5 reviews
            } catch {
                // Use static data as fallback
                setReviewsList(reviews.slice(0, 5));
            }
        };
        fetchReviews();

        // Show popup after 5 seconds
        const timer = setTimeout(() => {
            setIsVisible(true);
        }, 5000);

        return () => clearTimeout(timer);
    }, []);

    // Auto-rotate reviews
    useEffect(() => {
        if (!isVisible || isPaused || reviewsList.length === 0) return;

        const interval = setInterval(() => {
            setCurrentIndex((prev) => (prev + 1) % reviewsList.length);
        }, 6000);

        return () => clearInterval(interval);
    }, [isVisible, isPaused, reviewsList.length]);

    const nextReview = () => {
        setCurrentIndex((prev) => (prev + 1) % reviewsList.length);
    };

    const prevReview = () => {
        setCurrentIndex((prev) => (prev - 1 + reviewsList.length) % reviewsList.length);
    };

    const closePopup = () => {
        setIsVisible(false);
    };

    if (!isVisible || reviewsList.length === 0) return null;

    const currentReview = reviewsList[currentIndex];

    return (
        <>
            {/* Fixed Review Button */}
            <button
                onClick={() => setIsVisible(true)}
                className="fixed bottom-24 right-6 z-40 bg-primary text-primary-foreground px-4 py-3 rounded-full shadow-lg hover:scale-110 transition-transform flex items-center gap-2 animate-bounce"
            >
                <Star className="w-5 h-5 fill-yellow-400 text-yellow-400" />
                <span className="font-semibold">Reviews</span>
                <Badge variant="secondary" className="ml-1">{reviewsList.length}</Badge>
            </button>

            {/* Review Popup Modal */}
            {isVisible && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
                    {/* Backdrop */}
                    <div
                        className="absolute inset-0 bg-black/50 backdrop-blur-sm"
                        onClick={closePopup}
                    />

                    {/* Popup Card */}
                    <div
                        className="relative bg-background rounded-2xl shadow-2xl max-w-md w-full overflow-hidden animate-scale-in"
                        onMouseEnter={() => setIsPaused(true)}
                        onMouseLeave={() => setIsPaused(false)}
                    >
                        {/* Header */}
                        <div className="bg-primary/10 p-4 flex items-center justify-between">
                            <div className="flex items-center gap-2">
                                <Quote className="w-6 h-6 text-primary" />
                                <h3 className="font-bold text-lg">Customer Reviews</h3>
                            </div>
                            <Button variant="ghost" size="icon" onClick={closePopup}>
                                <X className="w-5 h-5" />
                            </Button>
                        </div>

                        {/* Review Content */}
                        <CardContent className="p-6">
                            <div className="text-center mb-6">
                                <div className="flex justify-center mb-3">
                                    {[1, 2, 3, 4, 5].map((star) => (
                                        <Star
                                            key={star}
                                            className={`w-6 h-6 ${star <= currentReview.rating
                                                    ? "fill-yellow-400 text-yellow-400"
                                                    : "text-gray-300"
                                                }`}
                                        />
                                    ))}
                                </div>

                                <blockquote className="text-lg italic text-muted-foreground mb-4">
                                    "{currentReview.comment}"
                                </blockquote>

                                <div className="flex items-center justify-center gap-2">
                                    <div className="w-10 h-10 bg-primary/20 rounded-full flex items-center justify-center">
                                        <span className="font-bold text-primary">
                                            {currentReview.name.charAt(0)}
                                        </span>
                                    </div>
                                    <div className="text-left">
                                        <p className="font-semibold">{currentReview.name}</p>
                                        <p className="text-xs text-muted-foreground">Verified Customer</p>
                                    </div>
                                </div>
                            </div>

                            {/* Navigation */}
                            <div className="flex items-center justify-between">
                                <Button variant="outline" size="icon" onClick={prevReview}>
                                    <ChevronLeft className="w-5 h-5" />
                                </Button>

                                <div className="flex gap-1">
                                    {reviewsList.map((_, idx) => (
                                        <button
                                            key={idx}
                                            onClick={() => setCurrentIndex(idx)}
                                            className={`w-2 h-2 rounded-full transition-all ${idx === currentIndex
                                                    ? "bg-primary w-6"
                                                    : "bg-muted-foreground/30"
                                                }`}
                                        />
                                    ))}
                                </div>

                                <Button variant="outline" size="icon" onClick={nextReview}>
                                    <ChevronRight className="w-5 h-5" />
                                </Button>
                            </div>
                        </CardContent>

                        {/* Footer */}
                        <div className="bg-muted/50 p-3 text-center">
                            <p className="text-sm text-muted-foreground">
                                Thank you for your feedback!
                                <Button variant="link" className="text-primary ml-1 h-auto p-0">
                                    <a href="/reviews">See all reviews</a>
                                </Button>
                            </p>
                        </div>
                    </div>

                    <style>{`
            @keyframes scaleIn {
              from { opacity: 0; transform: scale(0.9) translateY(20px); }
              to { opacity: 1; transform: scale(1) translateY(0); }
            }
            .animate-scale-in {
              animation: scaleIn 0.3s ease-out;
            }
          `}</style>
                </div>
            )}
        </>
    );
};

export default ReviewPopups;
