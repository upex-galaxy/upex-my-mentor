'use client';

import { useState, useTransition } from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { sendMessageToMentor } from '@/lib/actions/messaging';
import { MIN_MESSAGE_LENGTH, MAX_MESSAGE_LENGTH } from '@/types';
import type { MessageComposerModalProps } from '@/types';
import { Loader2, Send, CheckCircle } from 'lucide-react';

export function MessageComposerModal({
  mentorId,
  mentorName,
  open,
  onOpenChange,
}: MessageComposerModalProps) {
  const [content, setContent] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [isPending, startTransition] = useTransition();

  const charCount = content.length;
  const isValidLength = charCount >= MIN_MESSAGE_LENGTH && charCount <= MAX_MESSAGE_LENGTH;

  const handleSubmit = () => {
    if (!isValidLength) {
      setError(`El mensaje debe tener entre ${MIN_MESSAGE_LENGTH} y ${MAX_MESSAGE_LENGTH} caracteres`);
      return;
    }

    setError(null);

    startTransition(async () => {
      const result = await sendMessageToMentor({
        mentorId,
        content,
      });

      if (result.success) {
        setSuccess(true);
        setContent('');
        // Auto-close after showing success message
        setTimeout(() => {
          onOpenChange(false);
          setSuccess(false);
        }, 1500);
      } else {
        setError(result.error || 'Error al enviar el mensaje');
      }
    });
  };

  const handleClose = (isOpen: boolean) => {
    if (!isPending) {
      onOpenChange(isOpen);
      if (!isOpen) {
        // Reset state when closing
        setContent('');
        setError(null);
        setSuccess(false);
      }
    }
  };

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent data-testid="message_composer_modal" className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle data-testid="modal_title">
            Enviar mensaje a {mentorName}
          </DialogTitle>
          <DialogDescription>
            Escribe tu mensaje para iniciar una conversación con el mentor.
          </DialogDescription>
        </DialogHeader>

        {success ? (
          <div
            data-testid="success_message"
            className="flex flex-col items-center justify-center py-8 space-y-3"
          >
            <CheckCircle className="h-12 w-12 text-green-500" />
            <p className="text-lg font-medium text-green-600">
              Mensaje enviado exitosamente
            </p>
          </div>
        ) : (
          <>
            <div className="space-y-4">
              <div className="space-y-2">
                <Textarea
                  data-testid="message_textarea"
                  placeholder="Escribe tu mensaje aquí... (mínimo 10 caracteres)"
                  value={content}
                  onChange={(e) => {
                    setContent(e.target.value);
                    setError(null);
                  }}
                  disabled={isPending}
                  className="min-h-[150px] resize-none"
                  maxLength={MAX_MESSAGE_LENGTH}
                />
                <div className="flex justify-between text-sm">
                  <span
                    data-testid="char_counter"
                    className={
                      charCount < MIN_MESSAGE_LENGTH
                        ? 'text-muted-foreground'
                        : charCount > MAX_MESSAGE_LENGTH
                          ? 'text-destructive'
                          : 'text-green-600'
                    }
                  >
                    {charCount}/{MAX_MESSAGE_LENGTH} caracteres
                    {charCount < MIN_MESSAGE_LENGTH && (
                      <span className="text-muted-foreground">
                        {' '}
                        (mínimo {MIN_MESSAGE_LENGTH})
                      </span>
                    )}
                  </span>
                </div>
              </div>

              {error && (
                <p data-testid="error_message" className="text-sm text-destructive">
                  {error}
                </p>
              )}
            </div>

            <DialogFooter>
              <Button
                data-testid="cancel_button"
                type="button"
                variant="outline"
                onClick={() => handleClose(false)}
                disabled={isPending}
              >
                Cancelar
              </Button>
              <Button
                data-testid="send_button"
                type="button"
                onClick={handleSubmit}
                disabled={isPending || !isValidLength}
              >
                {isPending ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Enviando...
                  </>
                ) : (
                  <>
                    <Send className="mr-2 h-4 w-4" />
                    Enviar mensaje
                  </>
                )}
              </Button>
            </DialogFooter>
          </>
        )}
      </DialogContent>
    </Dialog>
  );
}
