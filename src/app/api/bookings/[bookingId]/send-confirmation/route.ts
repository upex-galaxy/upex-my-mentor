import { NextRequest, NextResponse } from 'next/server';
import { BookingConfirmationService } from '@/lib/services/booking-confirmation.service';

/**
 * POST /api/bookings/[bookingId]/send-confirmation
 * 
 * Send confirmation emails for a booking
 * This endpoint will be called by the payment webhook or internally after payment confirmation
 */
export async function POST(
  request: NextRequest,
  { params }: { params: { bookingId: string } }
) {
  try {
    const { bookingId } = params;

    if (!bookingId) {
      return NextResponse.json(
        { error: 'Booking ID is required' },
        { status: 400 }
      );
    }

    // Send confirmation emails
    const result = await BookingConfirmationService.sendConfirmationEmails(bookingId);

    if (!result.success) {
      return NextResponse.json(
        {
          error: result.error || 'Failed to send confirmation emails',
          mentorEmailSent: result.mentorEmailSent,
          menteeEmailSent: result.menteeEmailSent,
        },
        { status: 500 }
      );
    }

    return NextResponse.json(
      {
        success: true,
        mentorEmailSent: result.mentorEmailSent,
        menteeEmailSent: result.menteeEmailSent,
      },
      { status: 200 }
    );
  } catch (error) {
    console.error('Error in send-confirmation API:', error);
    return NextResponse.json(
      {
        error: 'Internal server error',
        details: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}
