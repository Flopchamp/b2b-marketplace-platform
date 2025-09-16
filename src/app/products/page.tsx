'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { 
  ShoppingCartIcon, 
  HeartIcon,
  StarIcon,
  FunnelIcon,
  MagnifyingGlassIcon,
  BuildingOfficeIcon,
  CurrencyDollarIcon
} from '@heroicons/react/24/outline';
import { HeartIcon as HeartSolidIcon, StarIcon as StarSolidIcon } from '@heroicons/react/24/solid';

interface Product {
  _id: string;
  companyId: string;
  name: string;
  description: string;
  shortDescription?: string;
  sku: string;
  category: {
    primary: string;
    secondary?: string;
    tags?: string[];
  };
  pricing: {
    basePrice: number;
    currency: string;
    bulkPricing?: Array<{
      minQuantity: number;
      maxQuantity?: number;
      unitPrice: number;
    }>;
  };
  inventory: {
    available: number;
    reserved: number;
    reorderLevel: number;
    lastUpdated: string;
  };
  media: {
    images: string[];
    videos?: string[];
    documents?: string[];
  };
  company: {
    id: string;
    name: string;
    logo?: string;
    isVerified: boolean;
  };
  specifications?: Record<string, any>;
  averageRating?: number;
  reviewCount?: number;
  createdAt: string;
  updatedAt: string;
}

interface SearchFilters {
  query: string;
  category: string;
  minPrice: number;
  maxPrice: number;
  inStock: boolean;
  company: string;
  sortBy: 'name' | 'price-low' | 'price-high' | 'newest' | 'rating';
}

export default function ProductCatalogPage() {
  const router = useRouter();
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [categories, setCategories] = useState<string[]>([]);
  const [companies, setCompanies] = useState<Array<{id: string; name: string}>>([]);
  const [wishlist, setWishlist] = useState<Set<string>>(new Set());
  const [showFilters, setShowFilters] = useState(false);
  
  const [filters, setFilters] = useState<SearchFilters>({
    query: '',
    category: '',
    minPrice: 0,
    maxPrice: 10000,
    inStock: true,
    company: '',
    sortBy: 'newest'
  });

  const [pagination, setPagination] = useState({
    page: 1,
    limit: 20,
    total: 0,
    pages: 0
  });

  useEffect(() => {
    // Check if user is authenticated retailer
    const userData = localStorage.getItem('user');
    if (userData) {
      const user = JSON.parse(userData);
      if (user.role !== 'retailer') {
        router.push('/auth/signin');
        return;
      }
    }

    loadProducts();
    loadFilterOptions();
  }, [filters, pagination.page]);

  const loadProducts = async () => {
    try {
      setLoading(true);
      
      // Build query parameters
      const searchParams = new URLSearchParams({
        page: pagination.page.toString(),
        limit: pagination.limit.toString(),
        sortBy: filters.sortBy,
      });

      if (filters.query) searchParams.append('q', filters.query);
      if (filters.category) searchParams.append('category', filters.category);
      if (filters.minPrice > 0) searchParams.append('minPrice', filters.minPrice.toString());
      if (filters.maxPrice < 10000) searchParams.append('maxPrice', filters.maxPrice.toString());
      if (filters.inStock) searchParams.append('inStock', 'true');
      if (filters.company) searchParams.append('company', filters.company);

      // TODO: Replace with actual API call
      const response = await fetch(`/api/products/search?${searchParams}`);
      
      if (response.ok) {
        const data = await response.json();
        setProducts(data.products || []);
        setPagination(prev => ({
          ...prev,
          total: data.total || 0,
          pages: data.pages || 0
        }));
      } else {
        // Mock data for now
        setProducts(generateMockProducts());
      }
    } catch (error) {
      console.error('Error loading products:', error);
      // Load mock data as fallback
      setProducts(generateMockProducts());
    } finally {
      setLoading(false);
    }
  };

  const loadFilterOptions = async () => {
    try {
      // TODO: Load actual categories and companies from API
      setCategories(['Electronics', 'Clothing', 'Food & Beverage', 'Industrial', 'Health & Beauty']);
      setCompanies([
        { id: '1', name: 'TechCorp Industries' },
        { id: '2', name: 'Fashion Forward LLC' },
        { id: '3', name: 'Global Manufacturing' }
      ]);
    } catch (error) {
      console.error('Error loading filter options:', error);
    }
  };

  const generateMockProducts = (): Product[] => {
    return Array.from({ length: 20 }, (_, i) => ({
      _id: `product_${i + 1}`,
      companyId: `company_${(i % 3) + 1}`,
      name: `Professional Product ${i + 1}`,
      description: `High-quality product designed for professional use. Meets industry standards and comes with full warranty coverage.`,
      shortDescription: `Premium quality product for professional applications.`,
      sku: `SKU-${String(i + 1).padStart(4, '0')}`,
      category: {
        primary: ['Electronics', 'Clothing', 'Industrial'][i % 3],
        secondary: 'Professional Grade',
        tags: ['premium', 'professional', 'quality']
      },
      pricing: {
        basePrice: Math.round((Math.random() * 500 + 50) * 100) / 100,
        currency: 'USD',
        bulkPricing: [
          { minQuantity: 10, maxQuantity: 49, unitPrice: Math.round((Math.random() * 500 + 50) * 0.9 * 100) / 100 },
          { minQuantity: 50, maxQuantity: 99, unitPrice: Math.round((Math.random() * 500 + 50) * 0.8 * 100) / 100 },
        ]
      },
      inventory: {
        available: Math.floor(Math.random() * 1000 + 10),
        reserved: 0,
        reorderLevel: 10,
        lastUpdated: new Date().toISOString()
      },
      media: {
        images: [`https://via.placeholder.com/400x300?text=Product+${i + 1}`],
        videos: [],
        documents: []
      },
      company: {
        id: `company_${(i % 3) + 1}`,
        name: ['TechCorp Industries', 'Fashion Forward LLC', 'Global Manufacturing'][i % 3],
        isVerified: true
      },
      specifications: {
        brand: ['TechCorp', 'FashionFwd', 'GlobalMfg'][i % 3],
        weight: `${Math.round(Math.random() * 5 + 0.5 * 100) / 100} kg`,
        warranty: '2 years'
      },
      averageRating: Math.round((Math.random() * 2 + 3) * 10) / 10,
      reviewCount: Math.floor(Math.random() * 100 + 5),
      createdAt: new Date(Date.now() - Math.random() * 30 * 24 * 60 * 60 * 1000).toISOString(),
      updatedAt: new Date().toISOString()
    }));
  };

  const formatPrice = (price: number, currency = 'USD') => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency,
    }).format(price);
  };

  const toggleWishlist = (productId: string) => {
    setWishlist(prev => {
      const newSet = new Set(prev);
      if (newSet.has(productId)) {
        newSet.delete(productId);
      } else {
        newSet.add(productId);
      }
      return newSet;
    });
  };

  const addToCart = (product: Product) => {
    // TODO: Implement cart functionality
    console.log('Adding to cart:', product.name);
    alert(`${product.name} added to cart!`);
  };

  const renderStars = (rating: number) => {
    return Array.from({ length: 5 }, (_, i) => (
      i < Math.floor(rating) ? 
        <StarSolidIcon key={i} className="h-4 w-4 text-yellow-400" /> :
        <StarIcon key={i} className="h-4 w-4 text-gray-300" />
    ));
  };

  const getBulkPriceDisplay = (product: Product) => {
    if (!product.pricing.bulkPricing?.length) return null;
    
    const firstTier = product.pricing.bulkPricing[0];
    const savings = product.pricing.basePrice - firstTier.unitPrice;
    const savingsPercent = Math.round((savings / product.pricing.basePrice) * 100);
    
    return (
      <div className="text-xs text-green-600 font-medium">
        Save {savingsPercent}% on orders of {firstTier.minQuantity}+
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center">
              <Link href="/dashboard/retailer" className="mr-4 p-2 text-gray-400 hover:text-gray-600">
                ← Back to Dashboard
              </Link>
              <h1 className="text-xl font-semibold text-gray-900">Product Catalog</h1>
            </div>
            <div className="flex items-center space-x-4">
              <Link 
                href="/dashboard/retailer/cart"
                className="p-2 text-gray-400 hover:text-gray-600 relative"
              >
                <ShoppingCartIcon className="h-6 w-6" />
                {/* TODO: Add cart item count badge */}
              </Link>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Search and Filters */}
        <div className="bg-white rounded-lg shadow p-6 mb-6">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
            {/* Search */}
            <div className="flex-1 max-w-lg">
              <div className="relative">
                <MagnifyingGlassIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search products..."
                  value={filters.query}
                  onChange={(e) => setFilters(prev => ({ ...prev, query: e.target.value }))}
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                />
              </div>
            </div>

            {/* Filter Toggle */}
            <button
              onClick={() => setShowFilters(!showFilters)}
              className="flex items-center px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
            >
              <FunnelIcon className="h-5 w-5 mr-2" />
              Filters
            </button>

            {/* Sort */}
            <select
              value={filters.sortBy}
              onChange={(e) => setFilters(prev => ({ ...prev, sortBy: e.target.value as any }))}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
            >
              <option value="newest">Newest</option>
              <option value="name">Name A-Z</option>
              <option value="price-low">Price: Low to High</option>
              <option value="price-high">Price: High to Low</option>
              <option value="rating">Highest Rated</option>
            </select>
          </div>

          {/* Expanded Filters */}
          {showFilters && (
            <div className="mt-6 pt-6 border-t border-gray-200">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Category</label>
                  <select
                    value={filters.category}
                    onChange={(e) => setFilters(prev => ({ ...prev, category: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                  >
                    <option value="">All Categories</option>
                    {categories.map(cat => (
                      <option key={cat} value={cat}>{cat}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Company</label>
                  <select
                    value={filters.company}
                    onChange={(e) => setFilters(prev => ({ ...prev, company: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                  >
                    <option value="">All Companies</option>
                    {companies.map(comp => (
                      <option key={comp.id} value={comp.id}>{comp.name}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Min Price</label>
                  <input
                    type="number"
                    value={filters.minPrice}
                    onChange={(e) => setFilters(prev => ({ ...prev, minPrice: Number(e.target.value) }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                    min="0"
                    step="10"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Max Price</label>
                  <input
                    type="number"
                    value={filters.maxPrice}
                    onChange={(e) => setFilters(prev => ({ ...prev, maxPrice: Number(e.target.value) }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                    min="0"
                    step="10"
                  />
                </div>
              </div>

              <div className="mt-4 flex items-center">
                <input
                  type="checkbox"
                  id="inStock"
                  checked={filters.inStock}
                  onChange={(e) => setFilters(prev => ({ ...prev, inStock: e.target.checked }))}
                  className="h-4 w-4 text-purple-600 focus:ring-purple-500 border-gray-300 rounded"
                />
                <label htmlFor="inStock" className="ml-2 text-sm text-gray-700">
                  In stock only
                </label>
              </div>
            </div>
          )}
        </div>

        {/* Results Count */}
        <div className="mb-6">
          <p className="text-gray-600">
            {loading ? 'Loading...' : `Showing ${products.length} products`}
          </p>
        </div>

        {/* Product Grid */}
        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {Array.from({ length: 8 }).map((_, i) => (
              <div key={i} className="bg-white rounded-lg shadow animate-pulse">
                <div className="w-full h-48 bg-gray-200 rounded-t-lg"></div>
                <div className="p-4">
                  <div className="h-4 bg-gray-200 rounded mb-2"></div>
                  <div className="h-3 bg-gray-200 rounded mb-4"></div>
                  <div className="h-6 bg-gray-200 rounded"></div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {products.map((product) => (
              <div key={product._id} className="bg-white rounded-lg shadow hover:shadow-lg transition-shadow">
                {/* Product Image */}
                <div className="relative">
                  <img
                    src={product.media.images[0] || 'https://via.placeholder.com/400x300?text=No+Image'}
                    alt={product.name}
                    className="w-full h-48 object-cover rounded-t-lg"
                  />
                  
                  {/* Wishlist Button */}
                  <button
                    onClick={() => toggleWishlist(product._id)}
                    className="absolute top-2 right-2 p-2 bg-white rounded-full shadow hover:shadow-md"
                  >
                    {wishlist.has(product._id) ? (
                      <HeartSolidIcon className="h-5 w-5 text-red-500" />
                    ) : (
                      <HeartIcon className="h-5 w-5 text-gray-400" />
                    )}
                  </button>

                  {/* Stock Badge */}
                  {product.inventory.available <= product.inventory.reorderLevel && (
                    <div className="absolute top-2 left-2 bg-orange-500 text-white px-2 py-1 rounded text-xs font-medium">
                      Low Stock
                    </div>
                  )}
                </div>

                {/* Product Info */}
                <div className="p-4">
                  {/* Company */}
                  <div className="flex items-center mb-2">
                    <BuildingOfficeIcon className="h-4 w-4 text-gray-400 mr-1" />
                    <span className="text-xs text-gray-600">{product.company.name}</span>
                    {product.company.isVerified && (
                      <span className="ml-1 text-xs text-green-600">✓</span>
                    )}
                  </div>

                  {/* Product Name */}
                  <h3 className="text-sm font-medium text-gray-900 mb-2 line-clamp-2">
                    <Link 
                      href={`/products/${product._id}`}
                      className="hover:text-purple-600"
                    >
                      {product.name}
                    </Link>
                  </h3>

                  {/* Rating */}
                  {product.averageRating && (
                    <div className="flex items-center mb-2">
                      <div className="flex">
                        {renderStars(product.averageRating)}
                      </div>
                      <span className="text-xs text-gray-600 ml-1">
                        ({product.reviewCount})
                      </span>
                    </div>
                  )}

                  {/* Price */}
                  <div className="mb-3">
                    <div className="flex items-center justify-between">
                      <span className="text-lg font-bold text-gray-900">
                        {formatPrice(product.pricing.basePrice)}
                      </span>
                      <span className="text-xs text-gray-500">per unit</span>
                    </div>
                    {getBulkPriceDisplay(product)}
                  </div>

                  {/* Stock Info */}
                  <div className="text-xs text-gray-600 mb-3">
                    {product.inventory.available > 0 ? (
                      <span>{product.inventory.available} in stock</span>
                    ) : (
                      <span className="text-red-600">Out of stock</span>
                    )}
                  </div>

                  {/* Actions */}
                  <div className="flex space-x-2">
                    <button
                      onClick={() => addToCart(product)}
                      disabled={product.inventory.available === 0}
                      className="flex-1 bg-purple-600 text-white py-2 px-3 rounded text-sm font-medium hover:bg-purple-700 disabled:bg-gray-300 disabled:cursor-not-allowed"
                    >
                      Add to Cart
                    </button>
                    <Link
                      href={`/products/${product._id}`}
                      className="p-2 border border-gray-300 rounded hover:bg-gray-50"
                    >
                      <EyeIcon className="h-4 w-4 text-gray-600" />
                    </Link>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Pagination */}
        {pagination.pages > 1 && (
          <div className="mt-8 flex justify-center">
            <div className="flex space-x-2">
              <button
                onClick={() => setPagination(prev => ({ ...prev, page: Math.max(1, prev.page - 1) }))}
                disabled={pagination.page === 1}
                className="px-4 py-2 border border-gray-300 rounded hover:bg-gray-50 disabled:opacity-50"
              >
                Previous
              </button>
              
              {Array.from({ length: Math.min(5, pagination.pages) }, (_, i) => {
                const pageNum = i + 1;
                return (
                  <button
                    key={pageNum}
                    onClick={() => setPagination(prev => ({ ...prev, page: pageNum }))}
                    className={`px-4 py-2 border rounded ${
                      pagination.page === pageNum
                        ? 'bg-purple-600 text-white border-purple-600'
                        : 'border-gray-300 hover:bg-gray-50'
                    }`}
                  >
                    {pageNum}
                  </button>
                );
              })}
              
              <button
                onClick={() => setPagination(prev => ({ ...prev, page: Math.min(pagination.pages, prev.page + 1) }))}
                disabled={pagination.page === pagination.pages}
                className="px-4 py-2 border border-gray-300 rounded hover:bg-gray-50 disabled:opacity-50"
              >
                Next
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
