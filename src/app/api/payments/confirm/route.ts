import { NextRequest, NextResponse } from 'next/server';
import { getServerStripe } from '@/lib/stripe/stripe-config';
import { verifyAuth } from '@/lib/auth/auth-middleware';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export async function POST(request: NextRequest) {
  try {
    // Verify authentication
    const authResult = await verifyAuth(request);
    if (!authResult.success || !authResult.user) {
      return NextResponse.json(
        { success: false, error: 'Authentication required' },
        { status: 401 }
      );
    }

    const body = await request.json();
    const { paymentIntentId } = body;

    if (!paymentIntentId) {
      return NextResponse.json(
        { success: false, error: 'Payment intent ID is required' },
        { status: 400 }
      );
    }

    // Get server-side Stripe instance
    const stripe = getServerStripe();

    // Retrieve the payment intent from Stripe
    const paymentIntent = await stripe.paymentIntents.retrieve(paymentIntentId);

    if (!paymentIntent) {
      return NextResponse.json(
        { success: false, error: 'Payment intent not found' },
        { status: 404 }
      );
    }

    // Verify the payment intent belongs to the authenticated user
    if (paymentIntent.metadata.userId !== authResult.user.id) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized access to payment intent' },
        { status: 403 }
      );
    }

    // Check payment status
    const isSuccessful = paymentIntent.status === 'succeeded';
    const isProcessing = paymentIntent.status === 'processing';
    const requiresAction = paymentIntent.status === 'requires_action';

    // If payment is successful, update order payment status in database
    if (isSuccessful && paymentIntent.metadata.orderId) {
      try {
        await prisma.order.update({
          where: { id: paymentIntent.metadata.orderId },
          data: {
            paymentStatus: 'PAID',
            status: 'CONFIRMED', // Move order to confirmed status
          },
        });
        
        // Also create a payment record
        await prisma.payment.create({
          data: {
            orderId: paymentIntent.metadata.orderId,
            amount: paymentIntent.amount / 100, // Convert from cents
            currency: paymentIntent.currency.toUpperCase(),
            method: 'CREDIT_CARD',
            status: 'PAID',
            transactionId: paymentIntent.id,
            processedAt: new Date(),
          },
        });
      } catch (dbError) {
        console.error('Database update error:', dbError);
        // Don't fail the response if payment succeeded but DB update failed
        // This should be handled by webhooks as backup
      }
    }

    return NextResponse.json({
      success: true,
      data: {
        paymentIntentId: paymentIntent.id,
        status: paymentIntent.status,
        amount: paymentIntent.amount,
        currency: paymentIntent.currency,
        isSuccessful,
        isProcessing,
        requiresAction,
        clientSecret: requiresAction ? paymentIntent.client_secret : undefined,
      },
    });

  } catch (error) {
    console.error('Payment confirmation error:', error);
    
    if (error instanceof Error) {
      return NextResponse.json(
        { success: false, error: error.message },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { success: false, error: 'Failed to confirm payment' },
      { status: 500 }
    );
  }
}

export async function OPTIONS() {
  return new NextResponse(null, {
    status: 200,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type, Authorization',
    },
  });
}
