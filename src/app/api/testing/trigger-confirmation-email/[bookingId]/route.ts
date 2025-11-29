import { NextRequest, NextResponse } from 'next/server';
import { BookingConfirmationService } from '@/lib/services/booking-confirmation.service';

/**
 * POST /api/testing/trigger-confirmation-email/[bookingId]
 * 
 * Testing endpoint to manually trigger confirmation emails for a booking
 * This endpoint bypasses payment requirements and allows QA to test the email functionality
 * 
 * NOTE: This should ONLY be available in non-production environments
 */
export async function POST(
  request: NextRequest,
  { params }: { params: { bookingId: string } }
) {
  // Only allow in development/staging environments
  if (process.env.NODE_ENV === 'production') {
    return NextResponse.json(
      { error: 'This endpoint is not available in production' },
      { status: 403 }
    );
  }

  try {
    const { bookingId } = params;

    if (!bookingId) {
      return NextResponse.json(
        { error: 'Booking ID is required' },
        { status: 400 }
      );
    }

    console.log(`[QA Testing] Triggering confirmation email for booking: ${bookingId}`);

    // Send confirmation emails (bypassing status checks if needed for testing)
    const result = await BookingConfirmationService.sendConfirmationEmails(bookingId);

    return NextResponse.json(
      {
        success: result.success,
        mentorEmailSent: result.mentorEmailSent,
        menteeEmailSent: result.menteeEmailSent,
        error: result.error,
        message: 'Testing endpoint executed',
      },
      { status: result.success ? 200 : 500 }
    );
  } catch (error) {
    console.error('Error in trigger-confirmation-email testing API:', error);
    return NextResponse.json(
      {
        error: 'Internal server error',
        details: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}
