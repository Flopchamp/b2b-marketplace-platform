"use client";

import { useState, useEffect, useCallback } from 'react';
import { useRouter, useParams } from 'next/navigation';
import Image from 'next/image';
import { 
  ArrowLeftIcon,
  ShoppingCartIcon,
  HeartIcon,
  ShareIcon,
  MinusIcon,
  PlusIcon,
  TruckIcon,
  ShieldCheckIcon
} from 'lucide-react';
import CartButton from '@/components/ui/CartButton';

interface Product {
  _id: string;
  name: string;
  description: string;
  shortDescription?: string;
  sku: string;
  pricing: {
    basePrice: number;
    currency: string;
    bulkPricing?: Array<{
      minQuantity: number;
      discount: number;
      discountType: string;
    }>;
  };
  inventory: {
    available: number;
    reserved: number;
    reorderLevel: number;
  };
  media: {
    images: string[];
    videos: string[];
    documents: string[];
  };
  category: {
    primary: string;
    secondary?: string;
    tags: string[];
  };
  specifications?: Record<string, unknown>;
  companyId: string;
  seo: {
    slug: string;
    metaTitle?: string;
    metaDescription?: string;
  };
  createdAt?: string;
  updatedAt?: string;
}

export default function ProductDetailPage() {
  const router = useRouter();
  const params = useParams();
  const productId = params.id as string;
  
  const [product, setProduct] = useState<Product | null>(null);
  const [loading, setLoading] = useState(true);
  const [quantity, setQuantity] = useState(1);
  const [selectedImage, setSelectedImage] = useState(0);
  const [activeTab, setActiveTab] = useState('description');

  const fetchProduct = useCallback(async () => {
    try {
      setLoading(true);
      const accessToken = localStorage.getItem('accessToken');

      const response = await fetch(`/api/products/${productId}`, {
        headers: {
          'Authorization': `Bearer ${accessToken}`,
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        throw new Error('Failed to fetch product');
      }

      const result = await response.json();
      if (result.success) {
        setProduct(result.data);
      } else {
        console.error('API error:', result.error);
        router.push('/dashboard/retailer/products');
      }
    } catch (error) {
      console.error('Error fetching product:', error);
      router.push('/dashboard/retailer/products');
    } finally {
      setLoading(false);
    }
  }, [productId, router]);

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

    fetchProduct();
  }, [router, fetchProduct]);

  const formatPrice = (price: number, currency = 'USD') => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency,
    }).format(price);
  };

  const calculateBulkPrice = (basePrice: number, qty: number, bulkPricing?: Array<{minQuantity: number, discount: number, discountType: string}>) => {
    if (!bulkPricing || bulkPricing.length === 0) {
      return basePrice * qty;
    }

    const applicableTier = bulkPricing
      .filter(tier => qty >= tier.minQuantity)
      .sort((a, b) => b.minQuantity - a.minQuantity)[0];

    if (!applicableTier) {
      return basePrice * qty;
    }

    const discountedPrice = applicableTier.discountType === 'percentage'
      ? basePrice * (1 - applicableTier.discount / 100)
      : basePrice - applicableTier.discount;

    return discountedPrice * qty;
  };

  const handleQuantityChange = (increment: boolean) => {
    if (increment) {
      setQuantity(prev => Math.min(prev + 1, product?.inventory.available || 1));
    } else {
      setQuantity(prev => Math.max(prev - 1, 1));
    }
  };

  const handleAddToCart = () => {
    if (!product) return;
    
    // Import CartService dynamically to avoid SSR issues
    import('@/lib/services/cart-service').then(({ default: CartService }) => {
      const cartItem = {
        productId: product._id,
        quantity: quantity,
        unitPrice: unitPrice,
        totalPrice: totalPrice,
        productName: product.name,
        productImage: product.media?.images?.[0] || undefined,
      };
      
      CartService.addToCart(cartItem);
      
      // Show success notification
      const notification = document.createElement('div');
      notification.className = 'fixed top-4 right-4 bg-green-500 text-white px-6 py-3 rounded-lg shadow-lg z-50';
      notification.textContent = `Added ${quantity} ${product.name} to cart!`;
      document.body.appendChild(notification);
      
      setTimeout(() => {
        document.body.removeChild(notification);
      }, 3000);
    });
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading product...</p>
        </div>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Product not found</h2>
          <p className="text-gray-600 mb-4">The product you&apos;re looking for doesn&apos;t exist.</p>
          <button
            onClick={() => router.push('/dashboard/retailer/products')}
            className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700"
          >
            Back to Products
          </button>
        </div>
      </div>
    );
  }

  const totalPrice = calculateBulkPrice(product.pricing.basePrice, quantity, product.pricing.bulkPricing);
  const unitPrice = totalPrice / quantity;
  const savings = (product.pricing.basePrice - unitPrice) * quantity;

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center">
              <button
                onClick={() => router.push('/dashboard/retailer/products')}
                className="mr-4 p-2 text-gray-400 hover:text-gray-600"
              >
                <ArrowLeftIcon className="h-5 w-5" />
              </button>
              <h1 className="text-xl font-semibold text-gray-900">Product Details</h1>
            </div>
            <div className="flex items-center">
              <CartButton />
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Product Images */}
          <div>
            <div className="aspect-square bg-white rounded-lg border overflow-hidden mb-4">
              {product.media.images && product.media.images.length > 0 ? (
                <Image
                  src={product.media.images[selectedImage] || product.media.images[0]}
                  alt={product.name}
                  width={600}
                  height={600}
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="w-full h-full bg-gray-200 flex items-center justify-center">
                  <ShoppingCartIcon className="h-16 w-16 text-gray-400" />
                </div>
              )}
            </div>

            {/* Image Thumbnails */}
            {product.media.images && product.media.images.length > 1 && (
              <div className="grid grid-cols-4 gap-2">
                {product.media.images.slice(0, 4).map((image, index) => (
                  <button
                    key={index}
                    onClick={() => setSelectedImage(index)}
                    className={`aspect-square bg-white rounded-lg border-2 overflow-hidden ${
                      selectedImage === index ? 'border-purple-500' : 'border-gray-200'
                    }`}
                  >
                    <Image
                      src={image}
                      alt={`${product.name} ${index + 1}`}
                      width={150}
                      height={150}
                      className="w-full h-full object-cover"
                    />
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Product Info */}
          <div>
            <div className="bg-white rounded-lg border p-6">
              {/* Product Title and Price */}
              <div className="mb-6">
                <h1 className="text-2xl font-bold text-gray-900 mb-2">{product.name}</h1>
                <p className="text-gray-600 mb-4">{product.shortDescription}</p>
                
                <div className="flex items-center space-x-4 mb-4">
                  <span className="text-3xl font-bold text-gray-900">
                    {formatPrice(unitPrice, product.pricing.currency)}
                  </span>
                  {savings > 0 && (
                    <span className="text-lg text-green-600 font-medium">
                      Save {formatPrice(savings, product.pricing.currency)}
                    </span>
                  )}
                </div>

                <div className="flex items-center space-x-4 text-sm text-gray-600">
                  <span>SKU: {product.sku}</span>
                  <span className={`px-2 py-1 rounded-full text-xs ${
                    product.inventory.available > 0 
                      ? 'bg-green-100 text-green-800' 
                      : 'bg-red-100 text-red-800'
                  }`}>
                    {product.inventory.available > 0 ? 'In Stock' : 'Out of Stock'} 
                    ({product.inventory.available} available)
                  </span>
                </div>
              </div>

              {/* Quantity and Add to Cart */}
              <div className="border-t pt-6 mb-6">
                <div className="flex items-center space-x-4 mb-4">
                  <label className="text-sm font-medium text-gray-700">Quantity:</label>
                  <div className="flex items-center border border-gray-300 rounded-lg">
                    <button
                      onClick={() => handleQuantityChange(false)}
                      disabled={quantity <= 1}
                      className="p-2 text-gray-400 hover:text-gray-600 disabled:opacity-50"
                    >
                      <MinusIcon className="h-4 w-4" />
                    </button>
                    <span className="px-4 py-2 text-center min-w-[60px]">{quantity}</span>
                    <button
                      onClick={() => handleQuantityChange(true)}
                      disabled={quantity >= product.inventory.available}
                      className="p-2 text-gray-400 hover:text-gray-600 disabled:opacity-50"
                    >
                      <PlusIcon className="h-4 w-4" />
                    </button>
                  </div>
                </div>

                <div className="mb-4 p-3 bg-gray-50 rounded-lg">
                  <div className="flex justify-between text-sm">
                    <span>Unit Price:</span>
                    <span>{formatPrice(unitPrice, product.pricing.currency)}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span>Quantity:</span>
                    <span>{quantity}</span>
                  </div>
                  <div className="flex justify-between font-semibold text-lg border-t pt-2 mt-2">
                    <span>Total:</span>
                    <span>{formatPrice(totalPrice, product.pricing.currency)}</span>
                  </div>
                </div>

                <div className="flex space-x-3">
                  <button
                    onClick={handleAddToCart}
                    disabled={product.inventory.available === 0}
                    className="flex-1 flex items-center justify-center px-6 py-3 bg-purple-600 text-white rounded-lg font-medium hover:bg-purple-700 disabled:bg-gray-300 disabled:cursor-not-allowed"
                  >
                    <ShoppingCartIcon className="h-5 w-5 mr-2" />
                    Add to Cart
                  </button>
                  <button className="p-3 border border-gray-300 rounded-lg hover:bg-gray-50">
                    <HeartIcon className="h-5 w-5 text-gray-400" />
                  </button>
                  <button className="p-3 border border-gray-300 rounded-lg hover:bg-gray-50">
                    <ShareIcon className="h-5 w-5 text-gray-400" />
                  </button>
                </div>
              </div>

              {/* Trust Badges */}
              <div className="border-t pt-6">
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div className="flex items-center">
                    <ShieldCheckIcon className="h-5 w-5 text-green-500 mr-2" />
                    <span className="text-gray-600">Verified Supplier</span>
                  </div>
                  <div className="flex items-center">
                    <TruckIcon className="h-5 w-5 text-blue-500 mr-2" />
                    <span className="text-gray-600">Fast Shipping</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Product Details Tabs */}
        <div className="mt-8 bg-white rounded-lg border">
          <div className="border-b">
            <nav className="flex space-x-8 px-6">
              {[
                { id: 'description', label: 'Description' },
                { id: 'specifications', label: 'Specifications' },
                { id: 'bulk-pricing', label: 'Bulk Pricing' }
              ].map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`py-4 px-1 border-b-2 font-medium text-sm ${
                    activeTab === tab.id
                      ? 'border-purple-500 text-purple-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  }`}
                >
                  {tab.label}
                </button>
              ))}
            </nav>
          </div>

          <div className="p-6">
            {activeTab === 'description' && (
              <div>
                <h3 className="text-lg font-medium text-gray-900 mb-4">Product Description</h3>
                <div className="prose max-w-none text-gray-600">
                  {product.description}
                </div>
                {product.category.tags.length > 0 && (
                  <div className="mt-6">
                    <h4 className="text-sm font-medium text-gray-900 mb-2">Tags:</h4>
                    <div className="flex flex-wrap gap-2">
                      {product.category.tags.map((tag, index) => (
                        <span
                          key={index}
                          className="px-3 py-1 bg-gray-100 text-gray-700 text-sm rounded-full"
                        >
                          {tag}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}

            {activeTab === 'specifications' && (
              <div>
                <h3 className="text-lg font-medium text-gray-900 mb-4">Specifications</h3>
                {product.specifications && Object.keys(product.specifications).length > 0 ? (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {Object.entries(product.specifications).map(([key, value]) => (
                      <div key={key} className="flex justify-between py-2 border-b border-gray-200">
                        <span className="font-medium text-gray-700 capitalize">
                          {key.replace(/([A-Z])/g, ' $1').trim()}:
                        </span>
                        <span className="text-gray-600">{String(value)}</span>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-gray-500">No specifications available.</p>
                )}
              </div>
            )}

            {activeTab === 'bulk-pricing' && (
              <div>
                <h3 className="text-lg font-medium text-gray-900 mb-4">Bulk Pricing Tiers</h3>
                {product.pricing.bulkPricing && product.pricing.bulkPricing.length > 0 ? (
                  <div className="overflow-hidden border border-gray-200 rounded-lg">
                    <table className="min-w-full divide-y divide-gray-200">
                      <thead className="bg-gray-50">
                        <tr>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Minimum Quantity
                          </th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Discount
                          </th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Price per Unit
                          </th>
                        </tr>
                      </thead>
                      <tbody className="bg-white divide-y divide-gray-200">
                        {product.pricing.bulkPricing.map((tier, index) => {
                          const discountedPrice = tier.discountType === 'percentage'
                            ? product.pricing.basePrice * (1 - tier.discount / 100)
                            : product.pricing.basePrice - tier.discount;
                          
                          return (
                            <tr key={index}>
                              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                {tier.minQuantity}+
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap text-sm text-green-600">
                                {tier.discountType === 'percentage' ? `${tier.discount}%` : formatPrice(tier.discount)}
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                                {formatPrice(discountedPrice, product.pricing.currency)}
                              </td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>
                ) : (
                  <p className="text-gray-500">No bulk pricing tiers available.</p>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
