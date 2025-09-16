'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { 
  ShoppingCartIcon, 
  CreditCardIcon,
  TruckIcon,
  CheckCircleIcon,
  ArrowLeftIcon
} from '@heroicons/react/24/outline';
import CartService, { Cart } from '@/lib/services/cart-service';
import StripePaymentForm from '@/components/ui/StripePaymentForm';

interface ShippingAddress {
  street: string;
  city: string;
  state: string;
  zipCode: string;
  country: string;
}

export default function CheckoutPage() {
  const router = useRouter();
  const [cart, setCart] = useState<Cart>({ items: [], totalItems: 0, totalAmount: 0 });
  const [step, setStep] = useState(1); // 1: Review, 2: Shipping, 3: Payment, 4: Confirmation
  const [orderComplete, setOrderComplete] = useState(false);
  const [orderId, setOrderId] = useState('');
  
  const [shippingAddress, setShippingAddress] = useState<ShippingAddress>({
    street: '',
    city: '',
    state: '',
    zipCode: '',
    country: 'United States'
  });

  useEffect(() => {
    // Check authentication
    const accessToken = localStorage.getItem('accessToken');
    const userData = localStorage.getItem('user');

    if (!accessToken || !userData) {
      router.push('/auth/signin');
      return;
    }

    try {
      const parsedUser = JSON.parse(userData);
      if (parsedUser.role !== 'retailer') {
        router.push('/auth/signin');
        return;
      }
    } catch (error) {
      console.error('Error parsing user data:', error);
      router.push('/auth/signin');
      return;
    }

    // Load cart
    const currentCart = CartService.getCart();
    setCart(currentCart);

    // Redirect if cart is empty
    if (currentCart.items.length === 0) {
      router.push('/dashboard/retailer/products');
    }
  }, [router]);

  const formatPrice = (price: number, currency = 'USD') => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency,
    }).format(price);
  };

  const handleAddressChange = (field: keyof ShippingAddress, value: string) => {
    setShippingAddress(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const validateAddress = () => {
    return shippingAddress.street && 
           shippingAddress.city && 
           shippingAddress.state && 
           shippingAddress.zipCode;
  };

  const handlePlaceOrder = async (paymentIntentId?: string) => {
    if (!validateAddress()) {
      alert('Please complete all shipping address fields');
      return;
    }

    try {
      const accessToken = localStorage.getItem('accessToken');

      const orderData = {
        items: cart.items.map(item => ({
          productId: item.productId,
          quantity: item.quantity,
          unitPrice: item.unitPrice,
          totalPrice: item.totalPrice
        })),
        shippingAddress,
        paymentIntentId, // Include Stripe payment intent ID
        notes: paymentIntentId ? 'Order placed with Stripe payment' : 'Order placed through checkout'
      };

      const response = await fetch('/api/orders', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${accessToken}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(orderData),
      });

      if (!response.ok) {
        throw new Error('Failed to place order');
      }

      const result = await response.json();
      if (result.success) {
        setOrderId(result.data.id);
        setOrderComplete(true);
        setStep(4);
        
        // Clear cart
        CartService.clearCart();
        
        // Show success notification
        const notification = document.createElement('div');
        notification.className = 'fixed top-4 right-4 bg-green-500 text-white px-6 py-3 rounded-lg shadow-lg z-50';
        notification.textContent = 'Order placed successfully!';
        document.body.appendChild(notification);
        
        setTimeout(() => {
          document.body.removeChild(notification);
        }, 3000);
      } else {
        throw new Error(result.error || 'Failed to place order');
      }
    } catch (error) {
      console.error('Error placing order:', error);
      alert('Failed to place order. Please try again.');
    }
  };

  if (orderComplete) {
    return (
      <div className="min-h-screen bg-gray-50">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="bg-white rounded-lg shadow-lg p-8 text-center">
            <CheckCircleIcon className="h-16 w-16 text-green-500 mx-auto mb-4" />
            <h1 className="text-2xl font-bold text-gray-900 mb-2">Order Confirmed!</h1>
            <p className="text-gray-600 mb-6">
              Your order has been successfully placed and is being processed.
            </p>
            <div className="bg-gray-50 rounded-lg p-4 mb-6">
              <p className="text-sm text-gray-500">Order ID</p>
              <p className="text-lg font-medium text-gray-900">#{orderId.slice(-8)}</p>
            </div>
            <div className="space-y-3">
              <button
                onClick={() => router.push('/dashboard/retailer/orders')}
                className="w-full px-6 py-3 bg-purple-600 text-white rounded-lg font-medium hover:bg-purple-700"
              >
                View Order Details
              </button>
              <button
                onClick={() => router.push('/dashboard/retailer/products')}
                className="w-full px-6 py-3 bg-gray-200 text-gray-700 rounded-lg font-medium hover:bg-gray-300"
              >
                Continue Shopping
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center h-16">
            <button
              onClick={() => router.push('/dashboard/retailer/products')}
              className="mr-4 p-2 text-gray-400 hover:text-gray-600"
            >
              <ArrowLeftIcon className="h-5 w-5" />
            </button>
            <h1 className="text-xl font-semibold text-gray-900">Checkout</h1>
          </div>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2">
            {/* Step Indicator */}
            <div className="mb-8">
              <div className="flex items-center">
                {[
                  { step: 1, title: 'Review Cart', icon: ShoppingCartIcon },
                  { step: 2, title: 'Shipping', icon: TruckIcon },
                  { step: 3, title: 'Payment', icon: CreditCardIcon },
                ].map((stepInfo, index) => (
                  <div key={stepInfo.step} className="flex items-center">
                    <div className={`flex items-center justify-center w-8 h-8 rounded-full ${
                      step >= stepInfo.step 
                        ? 'bg-purple-600 text-white' 
                        : 'bg-gray-200 text-gray-400'
                    }`}>
                      <stepInfo.icon className="h-4 w-4" />
                    </div>
                    <span className={`ml-2 text-sm font-medium ${
                      step >= stepInfo.step ? 'text-purple-600' : 'text-gray-400'
                    }`}>
                      {stepInfo.title}
                    </span>
                    {index < 2 && (
                      <div className={`ml-4 mr-4 h-px w-16 ${
                        step > stepInfo.step ? 'bg-purple-600' : 'bg-gray-200'
                      }`} />
                    )}
                  </div>
                ))}
              </div>
            </div>

            {/* Step Content */}
            {step === 1 && (
              <div className="bg-white rounded-lg border p-6">
                <h2 className="text-lg font-medium text-gray-900 mb-4">Review Your Order</h2>
                <div className="space-y-4">
                  {cart.items.map((item, index) => (
                    <div key={index} className="flex items-center space-x-4 py-4 border-b border-gray-200">
                      <div className="flex-1">
                        <h3 className="text-sm font-medium text-gray-900">
                          {item.productName || `Product ${item.productId}`}
                        </h3>
                        <p className="text-sm text-gray-500">Quantity: {item.quantity}</p>
                        <p className="text-sm text-gray-500">{formatPrice(item.unitPrice)} each</p>
                      </div>
                      <div className="text-right">
                        <p className="text-sm font-medium text-gray-900">
                          {formatPrice(item.totalPrice)}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
                <div className="mt-6 flex justify-end">
                  <button
                    onClick={() => setStep(2)}
                    className="px-6 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700"
                  >
                    Continue to Shipping
                  </button>
                </div>
              </div>
            )}

            {step === 2 && (
              <div className="bg-white rounded-lg border p-6">
                <h2 className="text-lg font-medium text-gray-900 mb-4">Shipping Address</h2>
                <div className="grid grid-cols-1 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Street Address
                    </label>
                    <input
                      type="text"
                      value={shippingAddress.street}
                      onChange={(e) => handleAddressChange('street', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500"
                      placeholder="123 Main Street"
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        City
                      </label>
                      <input
                        type="text"
                        value={shippingAddress.city}
                        onChange={(e) => handleAddressChange('city', e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500"
                        placeholder="New York"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        State
                      </label>
                      <input
                        type="text"
                        value={shippingAddress.state}
                        onChange={(e) => handleAddressChange('state', e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500"
                        placeholder="NY"
                      />
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        ZIP Code
                      </label>
                      <input
                        type="text"
                        value={shippingAddress.zipCode}
                        onChange={(e) => handleAddressChange('zipCode', e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500"
                        placeholder="10001"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Country
                      </label>
                      <select
                        value={shippingAddress.country}
                        onChange={(e) => handleAddressChange('country', e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500"
                      >
                        <option value="United States">United States</option>
                        <option value="Canada">Canada</option>
                      </select>
                    </div>
                  </div>
                </div>
                <div className="mt-6 flex justify-between">
                  <button
                    onClick={() => setStep(1)}
                    className="px-6 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300"
                  >
                    Back
                  </button>
                  <button
                    onClick={() => setStep(3)}
                    disabled={!validateAddress()}
                    className="px-6 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 disabled:bg-gray-300 disabled:cursor-not-allowed"
                  >
                    Continue to Payment
                  </button>
                </div>
              </div>
            )}

            {step === 3 && (
              <div className="bg-white rounded-lg border p-6">
                <h2 className="text-lg font-medium text-gray-900 mb-6">Payment</h2>
                
                <div className="flex justify-center">
                  <StripePaymentForm
                    amount={cart.totalAmount}
                    currency="usd"
                    orderId={undefined} // Will be created after payment success
                    onSuccess={async (paymentIntentId) => {
                      // Create order after successful payment
                      await handlePlaceOrder(paymentIntentId);
                    }}
                    onError={(error) => {
                      console.error('Payment error:', error);
                      alert(`Payment failed: ${error}`);
                    }}
                    metadata={{
                      customerType: 'retailer',
                      cartItemCount: cart.totalItems.toString(),
                    }}
                  />
                </div>
                
                <div className="mt-6 flex justify-between">
                  <button
                    onClick={() => setStep(2)}
                    className="px-6 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300"
                  >
                    Back
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* Order Summary */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-lg border p-6 sticky top-4">
              <h3 className="text-lg font-medium text-gray-900 mb-4">Order Summary</h3>
              <div className="space-y-3">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Subtotal ({cart.totalItems} items)</span>
                  <span className="text-gray-900">{formatPrice(cart.totalAmount)}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Shipping</span>
                  <span className="text-gray-900">FREE</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Tax</span>
                  <span className="text-gray-900">Calculated at delivery</span>
                </div>
                <div className="border-t pt-3">
                  <div className="flex justify-between text-lg font-medium">
                    <span className="text-gray-900">Total</span>
                    <span className="text-gray-900">{formatPrice(cart.totalAmount)}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
