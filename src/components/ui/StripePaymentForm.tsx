import React, { useState, useEffect } from 'react';
import { loadStripe, StripeElementsOptions } from '@stripe/stripe-js';
import {
  Elements,
  CardElement,
  useStripe,
  useElements,
} from '@stripe/react-stripe-js';
import { Loader2, CreditCard, Check, X } from 'lucide-react';
import { formatPrice } from '@/lib/stripe/stripe-config';

// Initialize Stripe
const stripePromise = loadStripe(process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY!);

interface PaymentFormProps {
  amount: number;
  currency?: string;
  orderId?: string;
  onSuccess?: (paymentIntentId: string) => void;
  onError?: (error: string) => void;
  metadata?: Record<string, string>;
}

interface PaymentStatus {
  type: 'idle' | 'processing' | 'success' | 'error';
  message?: string;
}

const PaymentForm: React.FC<PaymentFormProps> = ({
  amount,
  currency = 'usd',
  orderId,
  onSuccess,
  onError,
  metadata = {},
}) => {
  const [paymentStatus, setPaymentStatus] = useState<PaymentStatus>({ type: 'idle' });
  const [clientSecret, setClientSecret] = useState<string>('');

  const stripe = useStripe();
  const elements = useElements();

  // Create payment intent when component mounts
  useEffect(() => {
    const createPaymentIntent = async () => {
      try {
        const accessToken = localStorage.getItem('accessToken');
        const userData = localStorage.getItem('user');
        
        console.log('Auth check:', { 
          hasToken: !!accessToken, 
          tokenPreview: accessToken?.substring(0, 20) + '...', 
          userData: userData ? JSON.parse(userData) : null 
        });
        
        if (!accessToken) {
          setPaymentStatus({
            type: 'error',
            message: 'Authentication required. Please log in.',
          });
          onError?.('Authentication required. Please log in.');
          return;
        }

        const response = await fetch('/api/payments/create-intent', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${accessToken}`,
          },
          body: JSON.stringify({
            amount,
            currency,
            orderId,
            metadata,
          }),
        });

        console.log('Payment intent response:', { 
          status: response.status, 
          ok: response.ok 
        });

        const data = await response.json();
        console.log('Payment intent data:', data);

        if (data.success) {
          setClientSecret(data.data.clientSecret);
        } else {
          setPaymentStatus({
            type: 'error',
            message: data.error || 'Failed to initialize payment',
          });
          onError?.(data.error || 'Failed to initialize payment');
        }
      } catch {
        const errorMessage = 'Failed to create payment intent';
        setPaymentStatus({
          type: 'error',
          message: errorMessage,
        });
        onError?.(errorMessage);
      }
    };

    if (amount > 0) {
      createPaymentIntent();
    }
  }, [amount, currency, orderId, metadata, onError]);

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();

    if (!stripe || !elements || !clientSecret) {
      return;
    }

    setPaymentStatus({ type: 'processing' });

    const card = elements.getElement(CardElement);

    if (!card) {
      setPaymentStatus({
        type: 'error',
        message: 'Card element not found',
      });
      return;
    }

    // Confirm the payment intent
    const { error, paymentIntent } = await stripe.confirmCardPayment(clientSecret, {
      payment_method: {
        card: card,
      },
    });

    if (error) {
      setPaymentStatus({
        type: 'error',
        message: error.message || 'Payment failed',
      });
      onError?.(error.message || 'Payment failed');
    } else if (paymentIntent.status === 'succeeded') {
      setPaymentStatus({
        type: 'success',
        message: 'Payment successful!',
      });
      onSuccess?.(paymentIntent.id);
    }
  };

  const cardElementOptions = {
    style: {
      base: {
        fontSize: '16px',
        color: '#424770',
        '::placeholder': {
          color: '#aab7c4',
        },
      },
      invalid: {
        color: '#9e2146',
      },
    },
  };

  if (paymentStatus.type === 'success') {
    return (
      <div className="w-full max-w-md mx-auto bg-white rounded-lg shadow-lg">
        <div className="p-6">
          <div className="text-center">
            <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <Check className="w-8 h-8 text-green-600" />
            </div>
            <h3 className="text-lg font-semibold text-green-800 mb-2">
              Payment Successful!
            </h3>
            <p className="text-gray-600">
              Your payment of {formatPrice(amount, currency)} has been processed successfully.
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full max-w-md mx-auto bg-white rounded-lg shadow-lg">
      <div className="p-6">
        <div className="flex items-center gap-2 mb-4">
          <CreditCard className="w-5 h-5" />
          <h2 className="text-xl font-semibold text-gray-900">Complete Payment</h2>
        </div>
        <p className="text-sm text-gray-600 mb-6">
          Amount: <span className="font-semibold">{formatPrice(amount, currency)}</span>
        </p>

        {paymentStatus.type === 'error' && (
          <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-lg">
            <div className="flex items-center">
              <X className="h-4 w-4 text-red-500 mr-2" />
              <span className="text-red-700 text-sm">{paymentStatus.message}</span>
            </div>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="p-3 border border-gray-300 rounded-md bg-gray-50">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Card Information
            </label>
            <CardElement options={cardElementOptions} />
          </div>

          <button
            type="submit"
            disabled={!stripe || !elements || paymentStatus.type === 'processing'}
            className="w-full bg-purple-600 hover:bg-purple-700 disabled:bg-gray-400 disabled:cursor-not-allowed text-white font-medium py-3 px-4 rounded-lg transition-colors"
          >
            {paymentStatus.type === 'processing' ? (
              <span className="flex items-center justify-center">
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Processing...
              </span>
            ) : (
              `Pay ${formatPrice(amount, currency)}`
            )}
          </button>
        </form>

        <div className="mt-4 text-xs text-gray-500 text-center">
          Your payment information is secure and encrypted.
        </div>
      </div>
    </div>
  );
};

// Wrapper component to provide Stripe Elements context
const StripePaymentForm: React.FC<PaymentFormProps> = (props) => {
  const elementsOptions: StripeElementsOptions = {
    appearance: {
      theme: 'stripe',
    },
  };

  return (
    <Elements stripe={stripePromise} options={elementsOptions}>
      <PaymentForm {...props} />
    </Elements>
  );
};

export default StripePaymentForm;
