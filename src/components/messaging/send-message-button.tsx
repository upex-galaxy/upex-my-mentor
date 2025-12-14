'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { MessageComposerModal } from './message-composer-modal';
import { MessageSquare } from 'lucide-react';
import type { SendMessageButtonProps } from '@/types';

export function SendMessageButton({ mentorId, mentorName }: SendMessageButtonProps) {
  const [isModalOpen, setIsModalOpen] = useState(false);

  return (
    <>
      <Button
        data-testid="send_message_button"
        variant="outline"
        className="w-full"
        size="lg"
        onClick={() => setIsModalOpen(true)}
      >
        <MessageSquare className="mr-2 h-5 w-5" />
        Enviar Mensaje
      </Button>

      <MessageComposerModal
        mentorId={mentorId}
        mentorName={mentorName}
        open={isModalOpen}
        onOpenChange={setIsModalOpen}
      />
    </>
  );
}
