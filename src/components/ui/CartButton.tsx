'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { ShoppingCartIcon } from '@heroicons/react/24/outline';
import CartService from '@/lib/services/cart-service';
import ShoppingCart from '@/components/ui/ShoppingCart';

export default function CartButton() {
  const router = useRouter();
  const [itemCount, setItemCount] = useState(0);
  const [isCartOpen, setIsCartOpen] = useState(false);

  useEffect(() => {
    // Update cart count on component mount
    updateCartCount();

    // Listen for storage changes to update cart across tabs
    const handleStorageChange = () => {
      updateCartCount();
    };

    window.addEventListener('storage', handleStorageChange);
    
    // Also check periodically for cart updates
    const interval = setInterval(updateCartCount, 1000);

    return () => {
      window.removeEventListener('storage', handleStorageChange);
      clearInterval(interval);
    };
  }, []);

  const updateCartCount = () => {
    const count = CartService.getCartItemCount();
    setItemCount(count);
  };

  const handleCheckout = () => {
    router.push('/dashboard/retailer/checkout');
  };

  return (
    <>
      <button
        onClick={() => setIsCartOpen(true)}
        className="relative p-2 text-gray-400 hover:text-gray-500"
      >
        <ShoppingCartIcon className="h-6 w-6" />
        {itemCount > 0 && (
          <span className="absolute -top-1 -right-1 bg-purple-600 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
            {itemCount}
          </span>
        )}
      </button>

      <ShoppingCart
        isOpen={isCartOpen}
        onClose={() => setIsCartOpen(false)}
        onCheckout={handleCheckout}
      />
    </>
  );
}
