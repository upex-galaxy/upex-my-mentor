'use client';

import { useState } from 'react';
import { Star } from 'lucide-react';
import { cn } from '@/lib/utils';

interface StarRatingInputProps {
  value: number;
  onChange: (value: number) => void;
  disabled?: boolean;
}

/**
 * Interactive star rating input component (1-5 stars)
 * Supports mouse hover preview and keyboard navigation
 */
export function StarRatingInput({
  value,
  onChange,
  disabled = false,
}: StarRatingInputProps) {
  const [hoverValue, setHoverValue] = useState<number | null>(null);

  const displayValue = hoverValue ?? value;

  const handleKeyDown = (e: React.KeyboardEvent, starValue: number) => {
    if (disabled) return;

    switch (e.key) {
      case 'Enter':
      case ' ':
        e.preventDefault();
        onChange(starValue);
        break;
      case 'ArrowRight':
        e.preventDefault();
        if (starValue < 5) {
          onChange(starValue + 1);
        }
        break;
      case 'ArrowLeft':
        e.preventDefault();
        if (starValue > 1) {
          onChange(starValue - 1);
        }
        break;
    }
  };

  return (
    <div
      className="flex items-center gap-1"
      role="radiogroup"
      aria-label="Valoración"
      onMouseLeave={() => setHoverValue(null)}
    >
      {[1, 2, 3, 4, 5].map((starValue) => {
        const isFilled = starValue <= displayValue;
        const isSelected = starValue === value;

        return (
          <button
            key={starValue}
            type="button"
            role="radio"
            aria-checked={isSelected}
            aria-label={`${starValue} estrella${starValue !== 1 ? 's' : ''}`}
            disabled={disabled}
            tabIndex={isSelected || (value === 0 && starValue === 1) ? 0 : -1}
            className={cn(
              'p-1 rounded-md transition-all duration-150 focus:outline-none focus-visible:ring-2 focus-visible:ring-primary',
              disabled
                ? 'cursor-not-allowed opacity-50'
                : 'cursor-pointer hover:scale-110'
            )}
            onClick={() => !disabled && onChange(starValue)}
            onMouseEnter={() => !disabled && setHoverValue(starValue)}
            onKeyDown={(e) => handleKeyDown(e, starValue)}
          >
            <Star
              className={cn(
                'h-8 w-8 transition-colors duration-150',
                isFilled
                  ? 'fill-yellow-400 text-yellow-400'
                  : 'text-gray-300 hover:text-yellow-200'
              )}
            />
          </button>
        );
      })}
    </div>
  );
}
