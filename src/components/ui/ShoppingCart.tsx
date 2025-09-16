'use client';

import { useState, useEffect } from 'react';
import { ShoppingCartIcon, XMarkIcon, PlusIcon, MinusIcon } from '@heroicons/react/24/outline';
import CartService, { Cart, CartItem } from '@/lib/services/cart-service';
import SafeImage from '@/components/ui/SafeImage';

interface ShoppingCartProps {
  isOpen: boolean;
  onClose: () => void;
  onCheckout: () => void;
}

export default function ShoppingCart({ isOpen, onClose, onCheckout }: ShoppingCartProps) {
  const [cart, setCart] = useState<Cart>({ items: [], totalItems: 0, totalAmount: 0 });

  useEffect(() => {
    // Load cart when component mounts
    setCart(CartService.getCart());
  }, [isOpen]);

  const handleUpdateQuantity = (productId: string, quantity: number) => {
    const updatedCart = CartService.updateCartItem(productId, quantity);
    setCart(updatedCart);
  };

  const handleRemoveItem = (productId: string) => {
    const updatedCart = CartService.removeFromCart(productId);
    setCart(updatedCart);
  };

  const handleClearCart = () => {
    const updatedCart = CartService.clearCart();
    setCart(updatedCart);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-hidden">
      <div className="absolute inset-0 bg-black bg-opacity-50" onClick={onClose}></div>
      
      <div className="absolute right-0 top-0 h-full w-full max-w-md bg-white shadow-xl">
        <div className="flex h-full flex-col">
          {/* Header */}
          <div className="flex items-center justify-between border-b border-gray-200 px-4 py-6">
            <h2 className="text-lg font-medium text-gray-900">Shopping Cart</h2>
            <button
              onClick={onClose}
              className="rounded-md p-2 text-gray-400 hover:text-gray-500"
            >
              <XMarkIcon className="h-6 w-6" />
            </button>
          </div>

          {/* Cart Items */}
          <div className="flex-1 overflow-y-auto px-4 py-6">
            {cart.items.length === 0 ? (
              <div className="text-center">
                <ShoppingCartIcon className="mx-auto h-12 w-12 text-gray-400" />
                <h3 className="mt-2 text-sm font-medium text-gray-900">Your cart is empty</h3>
                <p className="mt-1 text-sm text-gray-500">
                  Start adding some products to your cart.
                </p>
              </div>
            ) : (
              <div className="space-y-6">
                {cart.items.map((item: CartItem) => (
                  <div key={item.productId} className="flex items-center space-x-4">
                    <div className="h-16 w-16 flex-shrink-0 overflow-hidden rounded-md border border-gray-200">
                      {item.productImage ? (
                        <SafeImage
                          src={item.productImage}
                          alt={item.productName || 'Product'}
                          width={64}
                          height={64}
                          className="h-full w-full object-cover object-center"
                        />
                      ) : (
                        <div className="h-full w-full bg-gray-200 flex items-center justify-center">
                          <ShoppingCartIcon className="h-8 w-8 text-gray-400" />
                        </div>
                      )}
                    </div>

                    <div className="flex-1 min-w-0">
                      <h4 className="text-sm font-medium text-gray-900 truncate">
                        {item.productName || `Product ${item.productId}`}
                      </h4>
                      <p className="text-sm text-gray-500">${item.unitPrice.toFixed(2)} each</p>
                      
                      {/* Quantity Controls */}
                      <div className="flex items-center mt-2 space-x-2">
                        <button
                          onClick={() => handleUpdateQuantity(item.productId, item.quantity - 1)}
                          className="rounded-md p-1 text-gray-400 hover:text-gray-500"
                        >
                          <MinusIcon className="h-4 w-4" />
                        </button>
                        <span className="text-sm font-medium text-gray-900 min-w-[2rem] text-center">
                          {item.quantity}
                        </span>
                        <button
                          onClick={() => handleUpdateQuantity(item.productId, item.quantity + 1)}
                          className="rounded-md p-1 text-gray-400 hover:text-gray-500"
                        >
                          <PlusIcon className="h-4 w-4" />
                        </button>
                      </div>
                    </div>

                    <div className="flex flex-col items-end">
                      <p className="text-sm font-medium text-gray-900">
                        ${item.totalPrice.toFixed(2)}
                      </p>
                      <button
                        onClick={() => handleRemoveItem(item.productId)}
                        className="text-xs text-red-600 hover:text-red-500 mt-1"
                      >
                        Remove
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Footer */}
          {cart.items.length > 0 && (
            <div className="border-t border-gray-200 px-4 py-6">
              <div className="flex justify-between text-base font-medium text-gray-900 mb-4">
                <p>Subtotal ({cart.totalItems} items)</p>
                <p>${cart.totalAmount.toFixed(2)}</p>
              </div>
              
              <div className="space-y-2">
                <button
                  onClick={() => {
                    onClose();
                    onCheckout();
                  }}
                  className="w-full bg-purple-600 text-white py-3 px-4 rounded-md hover:bg-purple-700 font-medium"
                >
                  Proceed to Checkout
                </button>
                <button
                  onClick={handleClearCart}
                  className="w-full bg-gray-200 text-gray-700 py-2 px-4 rounded-md hover:bg-gray-300 text-sm"
                >
                  Clear Cart
                </button>
              </div>

              <div className="mt-6 text-center text-sm text-gray-500">
                or{' '}
                <button
                  onClick={onClose}
                  className="font-medium text-purple-600 hover:text-purple-500"
                >
                  Continue Shopping
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
