"use client";

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { 
  ArrowLeftIcon, 
  PackageIcon, 
  PlusIcon, 
  SearchIcon,
  EditIcon,
  TrashIcon,
  EyeIcon
} from 'lucide-react';

interface Product {
  _id: string;
  name: string;
  description: string;
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
  specifications: {
    brand?: string;
    color?: string;
    material?: string;
    weight?: string;
  };
  createdAt: string;
  updatedAt: string;
}

export default function ProductsListPage() {
  const router = useRouter();
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null);

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const accessToken = localStorage.getItem('accessToken');
        console.log('🔍 Debug: Access token exists?', !!accessToken);
        console.log('🔍 Debug: Token preview:', accessToken ? accessToken.substring(0, 20) + '...' : 'No token');
        
        if (!accessToken) {
          console.log('🔍 Debug: No access token, redirecting to signin');
          router.push('/auth/signin');
          return;
        }

        const response = await fetch(`/api/products`, {
          headers: {
            'Authorization': `Bearer ${accessToken}`,
            'Content-Type': 'application/json',
          },
        });
        
        console.log('🔍 Debug: API response status:', response.status);
        const data = await response.json();
        console.log('🔍 Debug: API response data:', data);

        if (response.ok && data.success) {
          setProducts(data.data.products || []);
        } else {
          console.error('Failed to fetch products:', data.error);
          if (response.status === 401) {
            console.log('🔍 Debug: 401 error, redirecting to signin');
            router.push('/auth/signin');
          }
        }
      } catch (error) {
        console.error('Error fetching products:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchProducts();
  }, [router]);

  const handleViewProduct = (productId: string) => {
    // For now, we'll create a simple view modal or navigate to a detail page
    // You can implement a dedicated product detail page later
    router.push(`/dashboard/company/products/${productId}`);
  };

  const handleEditProduct = (productId: string) => {
    router.push(`/dashboard/company/products/${productId}/edit`);
  };

  const handleDeleteProduct = async (productId: string) => {
    if (deleteConfirm !== productId) {
      setDeleteConfirm(productId);
      return;
    }

    try {
      const accessToken = localStorage.getItem('accessToken');
      const response = await fetch(`/api/products/${productId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${accessToken}`,
          'Content-Type': 'application/json',
        },
      });

      const data = await response.json();

      if (response.ok && data.success) {
        // Remove product from local state
        setProducts(prev => prev.filter(p => p._id !== productId));
        setDeleteConfirm(null);
        // You could add a toast notification here
        alert('Product deleted successfully!');
      } else {
        console.error('Failed to delete product:', data.error);
        alert('Failed to delete product: ' + data.error);
      }
    } catch (error) {
      console.error('Error deleting product:', error);
      alert('Error deleting product');
    }
  };

  const filteredProducts = products.filter(product =>
    product.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    product.category.primary.toLowerCase().includes(searchQuery.toLowerCase()) ||
    product.sku.toLowerCase().includes(searchQuery.toLowerCase())
  );

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading products...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center">
              <button
                onClick={() => router.push('/dashboard/company')}
                className="mr-4 p-2 text-gray-400 hover:text-gray-600 transition-colors"
              >
                <ArrowLeftIcon className="h-5 w-5" />
              </button>
              <PackageIcon className="h-8 w-8 text-blue-600 mr-3" />
              <div>
                <h1 className="text-xl font-semibold text-gray-900">My Products</h1>
                <p className="text-sm text-gray-500">Manage your product catalog</p>
              </div>
            </div>
            <Link href="/dashboard/company/products/add">
              <button className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 transition-colors">
                <PlusIcon className="h-5 w-5 mr-2" />
                Add Product
              </button>
            </Link>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto py-6 px-4 sm:px-6 lg:px-8">
        {/* Search Bar */}
        <div className="mb-6">
          <div className="relative">
            <SearchIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
            <input
              type="text"
              placeholder="Search products by name, category, or SKU..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
        </div>

        {/* Products Grid */}
        {filteredProducts.length === 0 ? (
          <div className="text-center py-12">
            <PackageIcon className="h-16 w-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              {products.length === 0 ? 'No products yet' : 'No products match your search'}
            </h3>
            <p className="text-gray-500 mb-6">
              {products.length === 0 
                ? 'Start building your product catalog by adding your first product'
                : 'Try adjusting your search terms to find what you\'re looking for'
              }
            </p>
            {products.length === 0 && (
              <Link href="/dashboard/company/products/add">
                <button className="inline-flex items-center px-6 py-3 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 transition-colors">
                  <PlusIcon className="h-5 w-5 mr-2" />
                  Add Your First Product
                </button>
              </Link>
            )}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredProducts.map((product) => (
              <div key={product._id} className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow">
                <div className="p-6">
                  <div className="flex items-start justify-between mb-3">
                    <h3 className="text-lg font-semibold text-gray-900 truncate">{product.name}</h3>
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                      product.inventory.available > product.inventory.reorderLevel
                        ? 'bg-green-100 text-green-800'
                        : product.inventory.available > 0
                        ? 'bg-yellow-100 text-yellow-800'
                        : 'bg-red-100 text-red-800'
                    }`}>
                      {product.inventory.available > product.inventory.reorderLevel
                        ? 'In Stock'
                        : product.inventory.available > 0
                        ? 'Low Stock'
                        : 'Out of Stock'
                      }
                    </span>
                  </div>

                  <p className="text-gray-600 text-sm mb-3 line-clamp-2">{product.description}</p>

                  <div className="space-y-2 mb-4">
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-500">Category:</span>
                      <span className="font-medium">{product.category.primary}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-500">SKU:</span>
                      <span className="font-medium font-mono">{product.sku}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-500">Price:</span>
                      <span className="font-medium">{product.pricing.currency} {product.pricing.basePrice}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-500">Stock:</span>
                      <span className="font-medium">{product.inventory.available} units</span>
                    </div>
                    {product.specifications.brand && (
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-500">Brand:</span>
                        <span className="font-medium">{product.specifications.brand}</span>
                      </div>
                    )}
                  </div>

                  <div className="flex space-x-2">
                    <button 
                      onClick={() => handleViewProduct(product._id)}
                      className="flex-1 inline-flex items-center justify-center px-3 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 transition-colors"
                    >
                      <EyeIcon className="h-4 w-4 mr-2" />
                      View
                    </button>
                    <button 
                      onClick={() => handleEditProduct(product._id)}
                      className="flex-1 inline-flex items-center justify-center px-3 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 transition-colors"
                    >
                      <EditIcon className="h-4 w-4 mr-2" />
                      Edit
                    </button>
                    <button 
                      onClick={() => handleDeleteProduct(product._id)}
                      className={`px-3 py-2 border rounded-md text-sm font-medium transition-colors ${
                        deleteConfirm === product._id
                          ? 'border-red-500 bg-red-50 text-red-700 hover:bg-red-100'
                          : 'border-red-300 text-red-700 bg-white hover:bg-red-50'
                      }`}
                      title={deleteConfirm === product._id ? 'Click again to confirm deletion' : 'Delete product'}
                    >
                      <TrashIcon className="h-4 w-4" />
                      {deleteConfirm === product._id && <span className="ml-1 text-xs">Confirm?</span>}
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Summary Stats */}
        {products.length > 0 && (
          <div className="mt-8 bg-white rounded-lg shadow p-6">
            <h3 className="text-lg font-medium text-gray-900 mb-4">Product Summary</h3>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div className="text-center">
                <div className="text-2xl font-bold text-blue-600">{products.length}</div>
                <div className="text-sm text-gray-500">Total Products</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-green-600">
                  {products.filter(p => p.inventory.available > p.inventory.reorderLevel).length}
                </div>
                <div className="text-sm text-gray-500">In Stock</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-yellow-600">
                  {products.filter(p => p.inventory.available > 0 && p.inventory.available <= p.inventory.reorderLevel).length}
                </div>
                <div className="text-sm text-gray-500">Low Stock</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-red-600">
                  {products.filter(p => p.inventory.available === 0).length}
                </div>
                <div className="text-sm text-gray-500">Out of Stock</div>
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
