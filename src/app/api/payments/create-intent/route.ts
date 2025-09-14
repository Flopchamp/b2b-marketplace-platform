import { NextRequest, NextResponse } from 'next/server';
import { getServerStripe, convertToStripeAmount } from '@/lib/stripe/stripe-config';
import { verifyAuth } from '@/lib/auth/auth-middleware';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export async function POST(request: NextRequest) {
  try {
    // Verify authentication
    const authResult = await verifyAuth(request);
    console.log('Auth result:', authResult);
    
    if (!authResult.success || !authResult.user) {
      return NextResponse.json(
        { success: false, error: 'Authentication required' },
        { status: 401 }
      );
    }

    console.log('User role:', authResult.user.role);

    // Only retailers can create payment intents
    if (authResult.user.role !== 'retailer') {
      return NextResponse.json(
        { success: false, error: `Only retailers can create payment intents. Current role: ${authResult.user.role}` },
        { status: 403 }
      );
    }

    const body = await request.json();
    const { amount, currency = 'usd', orderId, metadata = {} } = body;

    if (!amount || amount <= 0) {
      return NextResponse.json(
        { success: false, error: 'Invalid amount' },
        { status: 400 }
      );
    }

    // Get user's retailer information
    const user = await prisma.user.findUnique({
      where: { id: authResult.user.id },
      include: { retailer: true }
    });

    if (!user?.retailer) {
      return NextResponse.json(
        { success: false, error: 'Retailer profile not found' },
        { status: 400 }
      );
    }

    // Get server-side Stripe instance
    const stripe = getServerStripe();

    // Create payment intent
    const paymentIntent = await stripe.paymentIntents.create({
      amount: convertToStripeAmount(amount, currency),
      currency: currency.toLowerCase(),
      automatic_payment_methods: {
        enabled: true,
      },
      metadata: {
        userId: authResult.user.id,
        retailerId: user.retailer.id,
        orderId: orderId || '',
        ...metadata,
      },
      description: orderId ? `Payment for Order ${orderId}` : 'B2B Marketplace Payment',
    });

    return NextResponse.json({
      success: true,
      data: {
        clientSecret: paymentIntent.client_secret,
        paymentIntentId: paymentIntent.id,
        amount: amount,
        currency: currency,
      },
    });

  } catch (error) {
    console.error('Payment intent creation error:', error);
    
    if (error instanceof Error) {
      return NextResponse.json(
        { success: false, error: error.message },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { success: false, error: 'Failed to create payment intent' },
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
