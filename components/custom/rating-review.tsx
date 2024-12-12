import { Star } from "lucide-react";

interface RatingReviewProps {
  rating: number;
  reviewCount: number;
}

export default function RatingReview({
  rating,
  reviewCount,
}: RatingReviewProps) {
  return (
    <div className="flex items-center space-x-1">
      {[1, 2, 3, 4, 5].map((star) => (
        <div key={star} className="relative">
          <Star className="h-4 w-4 text-gray-300" />
          <div
            className="absolute top-0 left-0 overflow-hidden"
            style={{
              width: `${Math.min(
                100,
                Math.max(0, (rating - (star - 1)) * 100)
              )}%`,
            }}
          >
            <Star className="h-4 w-4 text-yellow-400 fill-yellow-400" />
          </div>
        </div>
      ))}
      <span className="ml-2 text-sm">{rating.toFixed(1)}</span>
      <span className="ml-1 text-sm text-gray-500">
        ({reviewCount} reviews)
      </span>
    </div>
  );
}
