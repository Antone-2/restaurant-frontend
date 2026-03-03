import { Star } from "lucide-react";

interface StarRatingProps {
  rating: number;
  max?: number;
  size?: number;
  interactive?: boolean;
  onChange?: (rating: number) => void;
}

const StarRating = ({ rating, max = 5, size = 18, interactive = false, onChange }: StarRatingProps) => (
  <div className="flex gap-0.5">
    {Array.from({ length: max }, (_, i) => (
      <Star
        key={i}
        size={size}
        className={`${i < rating ? "fill-primary text-primary" : "text-muted-foreground/30"} ${
          interactive ? "cursor-pointer hover:text-primary" : ""
        }`}
        onClick={interactive && onChange ? () => onChange(i + 1) : undefined}
      />
    ))}
  </div>
);

export default StarRating;
