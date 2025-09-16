import Stripe from 'stripe';

// Server-side Stripe instance (only use on API routes)
let serverStripe: Stripe | null = null;

export function getServerStripe(): Stripe {
  if (!serverStripe) {
    if (!process.env.STRIPE_SECRET_KEY) {
      throw new Error('STRIPE_SECRET_KEY is not defined in environment variables');
    }
    
    serverStripe = new Stripe(process.env.STRIPE_SECRET_KEY, {
      apiVersion: '2025-08-27.basil',
      typescript: true,
    });
  }
  
  return serverStripe;
}

// Client-side configuration (safe for browser)
export const STRIPE_CONFIG = {
  publishableKey: process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY!,
  currency: 'usd',
  paymentMethods: ['card'],
  automaticPaymentMethods: {
    enabled: true,
  },
} as const;

// Helper function to convert amount to smallest currency unit
export function convertToStripeAmount(amount: number, currency = 'usd'): number {
  // Most currencies use 2 decimal places (cents)
  // Some currencies like JPY use 0 decimal places
  const zeroDecimalCurrencies = ['jpy', 'krw', 'vnd', 'clp'];
  
  if (zeroDecimalCurrencies.includes(currency.toLowerCase())) {
    return Math.round(amount);
  }
  
  return Math.round(amount * 100);
}

// Helper function to convert from Stripe amount to regular amount
export function convertFromStripeAmount(amount: number, currency = 'usd'): number {
  const zeroDecimalCurrencies = ['jpy', 'krw', 'vnd', 'clp'];
  
  if (zeroDecimalCurrencies.includes(currency.toLowerCase())) {
    return amount;
  }
  
  return amount / 100;
}

// Format currency for display
export function formatCurrency(amount: number, currency = 'usd'): string {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: currency.toUpperCase(),
  }).format(amount);
}

// Alias for formatCurrency for compatibility
export const formatPrice = formatCurrency;
