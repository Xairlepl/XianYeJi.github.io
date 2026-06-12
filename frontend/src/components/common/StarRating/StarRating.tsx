import { Star } from 'lucide-react';
import './StarRating.css';

interface StarRatingProps {
  rating: number;
  size?: number;
  showValue?: boolean;
  className?: string;
}

// 通用星级评分：用图标库 Star 渲染，按 rating 高亮
const StarRating = ({ rating, size = 16, showValue = false, className = '' }: StarRatingProps) => {
  const rounded = Math.round(rating);

  return (
    <span className={`star-rating ${className}`} aria-label={`评分 ${rating} 星`}>
      {Array.from({ length: 5 }).map((_, index) => {
        const active = index < rounded;
        return (
          <Star
            key={index}
            size={size}
            className={active ? 'star-filled' : 'star-empty'}
            fill={active ? 'currentColor' : 'none'}
          />
        );
      })}
      {showValue && <span className="star-value">{rating.toFixed(1)}</span>}
    </span>
  );
};

export default StarRating;
