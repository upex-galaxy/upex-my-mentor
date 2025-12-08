'use client';

import { useState } from 'react';
import { Check, Loader2 } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { StarRatingInput } from './star-rating-input';
import { createReview } from '@/lib/actions/reviews';

interface ReviewFormProps {
  bookingId: string;
  subjectId: string;
  subjectName: string;
  onSuccess?: () => void;
  onCancel?: () => void;
}

const MAX_COMMENT_LENGTH = 500;

/**
 * Review submission form with star rating and optional comment
 */
export function ReviewForm({
  bookingId,
  subjectId,
  subjectName,
  onSuccess,
  onCancel,
}: ReviewFormProps) {
  const [rating, setRating] = useState(0);
  const [comment, setComment] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    // Validation
    if (rating === 0) {
      setError('Por favor selecciona una valoración');
      return;
    }

    setIsSubmitting(true);

    try {
      const result = await createReview({
        booking_id: bookingId,
        subject_id: subjectId,
        rating,
        comment: comment.trim() || undefined,
      });

      if (!result.success) {
        setError(result.error || 'Error al enviar la valoración');
        setIsSubmitting(false);
        return;
      }

      setIsSuccess(true);

      // Wait a moment to show success, then callback
      setTimeout(() => {
        onSuccess?.();
      }, 2000);
    } catch {
      setError('Error de conexión. Por favor intenta de nuevo.');
      setIsSubmitting(false);
    }
  };

  // Success state
  if (isSuccess) {
    return (
      <Card className="w-full max-w-md mx-auto shadow-lg rounded-xl">
        <CardContent className="pt-8 pb-8 text-center">
          <div className="w-16 h-16 mx-auto mb-4 bg-green-100 rounded-full flex items-center justify-center">
            <Check className="h-8 w-8 text-green-600" />
          </div>
          <h2 className="text-xl font-semibold mb-2">
            ¡Gracias por tu valoración!
          </h2>
          <p className="text-muted-foreground">
            Tu feedback ayuda a construir una comunidad de confianza.
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="w-full max-w-md mx-auto shadow-lg rounded-xl">
      <CardHeader className="text-center">
        <CardTitle className="text-xl">
          ¿Cómo fue tu sesión con {subjectName}?
        </CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Star Rating */}
          <div className="space-y-2">
            <Label htmlFor="rating">Tu valoración</Label>
            <div className="flex justify-center">
              <StarRatingInput
                value={rating}
                onChange={setRating}
                disabled={isSubmitting}
              />
            </div>
          </div>

          {/* Comment */}
          <div className="space-y-2">
            <Label htmlFor="comment">Cuéntanos más (opcional)</Label>
            <Textarea
              id="comment"
              placeholder="Comparte tu experiencia: ¿El mentee estuvo preparado? ¿Fue puntual? ¿Hubo buena comunicación?"
              value={comment}
              onChange={(e) =>
                setComment(e.target.value.slice(0, MAX_COMMENT_LENGTH))
              }
              disabled={isSubmitting}
              rows={4}
              className="resize-none"
            />
            <div className="text-right text-sm text-muted-foreground">
              {comment.length} / {MAX_COMMENT_LENGTH} caracteres
            </div>
          </div>

          {/* Error message */}
          {error && (
            <div className="text-sm text-destructive text-center">{error}</div>
          )}

          {/* Buttons */}
          <div className="flex gap-3 pt-2">
            <Button
              type="button"
              variant="outline"
              className="flex-1"
              onClick={onCancel}
              disabled={isSubmitting}
            >
              Cancelar
            </Button>
            <Button type="submit" className="flex-1" disabled={isSubmitting}>
              {isSubmitting ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Enviando...
                </>
              ) : (
                'Enviar valoración'
              )}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}
