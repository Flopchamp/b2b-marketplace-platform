import { NextRequest, NextResponse } from 'next/server';
import { getServerStripe } from '@/lib/stripe/stripe-config';
import { PrismaClient } from '@prisma/client';
import { headers } from 'next/headers';
import Stripe from 'stripe';

const prisma = new PrismaClient();

export async function POST(request: NextRequest) {
  try {
    const body = await request.text();
    const headersList = await headers();
    const signature = headersList.get('stripe-signature');

    if (!signature) {
      return NextResponse.json(
        { error: 'Missing stripe signature' },
        { status: 400 }
      );
    }

    const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;
    if (!webhookSecret) {
      console.error('STRIPE_WEBHOOK_SECRET is not configured');
      return NextResponse.json(
        { error: 'Webhook secret not configured' },
        { status: 500 }
      );
    }

    // Get server-side Stripe instance
    const stripe = getServerStripe();

    let event: Stripe.Event;
    try {
      event = stripe.webhooks.constructEvent(body, signature, webhookSecret);
    } catch (err) {
      console.error('Webhook signature verification failed:', err);
      return NextResponse.json(
        { error: 'Invalid signature' },
        { status: 400 }
      );
    }

    // Handle the event
    switch (event.type) {
      case 'payment_intent.succeeded':
        await handlePaymentSuccess(event.data.object as Stripe.PaymentIntent);
        break;
      
      case 'payment_intent.payment_failed':
        await handlePaymentFailed(event.data.object as Stripe.PaymentIntent);
        break;
      
      case 'payment_intent.canceled':
        await handlePaymentCanceled(event.data.object as Stripe.PaymentIntent);
        break;
      
      case 'payment_intent.requires_action':
        await handlePaymentRequiresAction(event.data.object as Stripe.PaymentIntent);
        break;
      
      default:
        console.log(`Unhandled event type: ${event.type}`);
    }

    return NextResponse.json({ received: true });

  } catch (error) {
    console.error('Webhook error:', error);
    return NextResponse.json(
      { error: 'Webhook handler failed' },
      { status: 500 }
    );
  }
}

async function handlePaymentSuccess(paymentIntent: Stripe.PaymentIntent) {
  try {
    const orderId = paymentIntent.metadata.orderId;
    
    if (!orderId) {
      console.log('No order ID found in payment intent metadata');
      return;
    }

    // Update order payment status
    await prisma.order.update({
      where: { id: orderId },
      data: {
        paymentStatus: 'PAID',
        status: 'CONFIRMED',
      },
    });

    // Find existing payment record or create new one
    const existingPayment = await prisma.payment.findFirst({
      where: { 
        orderId: orderId,
        transactionId: paymentIntent.id 
      },
    });

    if (existingPayment) {
      // Update existing payment
      await prisma.payment.update({
        where: { id: existingPayment.id },
        data: {
          status: 'PAID',
          processedAt: new Date(),
          gatewayResponse: JSON.parse(JSON.stringify(paymentIntent)),
        },
      });
    } else {
      // Create new payment record
      await prisma.payment.create({
        data: {
          orderId: orderId,
          amount: paymentIntent.amount / 100, // Convert from cents
          currency: paymentIntent.currency.toUpperCase(),
          method: 'CREDIT_CARD',
          status: 'PAID',
          transactionId: paymentIntent.id,
          processedAt: new Date(),
          gatewayResponse: JSON.parse(JSON.stringify(paymentIntent)),
        },
      });
    }

    // Create order status history
    await prisma.orderStatusHistory.create({
      data: {
        orderId: orderId,
        status: 'CONFIRMED',
        notes: `Payment successful - Transaction ID: ${paymentIntent.id}`,
      },
    });

    console.log(`Payment succeeded for order ${orderId}`);
  } catch (error) {
    console.error('Error handling payment success:', error);
  }
}

async function handlePaymentFailed(paymentIntent: Stripe.PaymentIntent) {
  try {
    const orderId = paymentIntent.metadata.orderId;
    
    if (!orderId) {
      console.log('No order ID found in payment intent metadata');
      return;
    }

    // Update order payment status
    await prisma.order.update({
      where: { id: orderId },
      data: {
        paymentStatus: 'FAILED',
      },
    });

    // Find existing payment record or create new one
    const existingPayment = await prisma.payment.findFirst({
      where: { 
        orderId: orderId,
        transactionId: paymentIntent.id 
      },
    });

    if (existingPayment) {
      // Update existing payment
      await prisma.payment.update({
        where: { id: existingPayment.id },
        data: {
          status: 'FAILED',
          gatewayResponse: JSON.parse(JSON.stringify(paymentIntent)),
        },
      });
    } else {
      // Create new payment record
      await prisma.payment.create({
        data: {
          orderId: orderId,
          amount: paymentIntent.amount / 100,
          currency: paymentIntent.currency.toUpperCase(),
          method: 'CREDIT_CARD',
          status: 'FAILED',
          transactionId: paymentIntent.id,
          gatewayResponse: JSON.parse(JSON.stringify(paymentIntent)),
        },
      });
    }

    console.log(`Payment failed for order ${orderId}`);
  } catch (error) {
    console.error('Error handling payment failure:', error);
  }
}

async function handlePaymentCanceled(paymentIntent: Stripe.PaymentIntent) {
  try {
    const orderId = paymentIntent.metadata.orderId;
    
    if (!orderId) {
      console.log('No order ID found in payment intent metadata');
      return;
    }

    // Update order status back to pending
    await prisma.order.update({
      where: { id: orderId },
      data: {
        paymentStatus: 'PENDING',
        status: 'PENDING',
      },
    });

    console.log(`Payment canceled for order ${orderId}`);
  } catch (error) {
    console.error('Error handling payment cancellation:', error);
  }
}

async function handlePaymentRequiresAction(paymentIntent: Stripe.PaymentIntent) {
  try {
    console.log(`Payment requires action for intent: ${paymentIntent.id}`);
    // This is informational - the client should handle the action
  } catch (error) {
    console.error('Error handling payment requires action:', error);
  }
}

// Disable body parsing for webhooks
export const dynamic = 'force-dynamic';
