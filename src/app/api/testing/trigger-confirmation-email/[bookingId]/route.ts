import { NextRequest, NextResponse } from 'next/server';

export async function POST(
  req: NextRequest,
  { params }: { params: { bookingId: string } },
) {
  const { bookingId } = params;

  if (!bookingId) {
    return NextResponse.json({ error: 'Booking ID is required.' }, { status: 400 });
  }

  const edgeFunctionUrl = process.env.NEXT_PUBLIC_SUPABASE_EDGE_FUNCTION_URL_CONFIRM_BOOKING;

  if (!edgeFunctionUrl) {
    console.error('NEXT_PUBLIC_SUPABASE_EDGE_FUNCTION_URL_CONFIRM_BOOKING is not set.');
    return NextResponse.json(
      { error: 'Edge Function URL is not configured.' },
      { status: 500 },
    );
  }

  try {
    const response = await fetch(edgeFunctionUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${process.env.SUPABASE_SERVICE_ROLE_KEY}`, // Use service role key if invoking directly, or anon key if via client
      },
      body: JSON.stringify({ bookingId }),
    });

    if (!response.ok) {
      const errorData = await response.json();
      console.error('Error from Edge Function:', errorData);
      return NextResponse.json(errorData, { status: response.status });
    }

    const data = await response.json();
    return NextResponse.json(data, { status: 200 });
  } catch (error: any) {
    console.error('Error invoking Edge Function:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}