"use client";

import { useEffect, useState } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { 
  ArrowLeftIcon, 
  PackageIcon, 
  EditIcon,
  TrashIcon,
  TagIcon,
  DollarSignIcon,
  BoxIcon
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

export default function ProductDetailPage() {
  const router = useRouter();
  const params = useParams();
  const [product, setProduct] = useState<Product | null>(null);
  const [loading, setLoading] = useState(true);
  const [deleteConfirm, setDeleteConfirm] = useState(false);

  useEffect(() => {
    const fetchProduct = async () => {
      try {
        const accessToken = localStorage.getItem('accessToken');
        if (!accessToken) {
          router.push('/auth/signin');
          return;
        }

        const response = await fetch(`/api/products/${params.id}`, {
          headers: {
            'Authorization': `Bearer ${accessToken}`,
            'Content-Type': 'application/json',
          },
        });
        
        const data = await response.json();

        if (response.ok && data.success) {
          setProduct(data.data);
        } else {
          console.error('Failed to fetch product:', data.error);
          if (response.status === 404 || response.status === 403) {
            router.push('/dashboard/company/products');
          }
        }
      } catch (error) {
        console.error('Error fetching product:', error);
      } finally {
        setLoading(false);
      }
    };

    if (params.id) {
      fetchProduct();
    }
  }, [params.id, router]);

  const handleDeleteProduct = async () => {
    if (!deleteConfirm) {
      setDeleteConfirm(true);
      return;
    }

    try {
      const accessToken = localStorage.getItem('accessToken');
      const response = await fetch(`/api/products/${params.id}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${accessToken}`,
          'Content-Type': 'application/json',
        },
      });

      const data = await response.json();

      if (response.ok && data.success) {
        alert('Product deleted successfully!');
        router.push('/dashboard/company/products');
      } else {
        console.error('Failed to delete product:', data.error);
        alert('Failed to delete product: ' + data.error);
      }
    } catch (error) {
      console.error('Error deleting product:', error);
      alert('Error deleting product');
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading product...</p>
        </div>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <PackageIcon className="h-16 w-16 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">Product not found</h3>
          <p className="text-gray-500 mb-6">The product you&apos;re looking for doesn&apos;t exist or you don&apos;t have permission to view it.</p>
          <button
            onClick={() => router.push('/dashboard/company/products')}
            className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 transition-colors"
          >
            <ArrowLeftIcon className="h-5 w-5 mr-2" />
            Back to Products
          </button>
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
                onClick={() => router.push('/dashboard/company/products')}
                className="mr-4 p-2 text-gray-400 hover:text-gray-600 transition-colors"
              >
                <ArrowLeftIcon className="h-5 w-5" />
              </button>
              <PackageIcon className="h-8 w-8 text-blue-600 mr-3" />
              <div>
                <h1 className="text-xl font-semibold text-gray-900">{product.name}</h1>
                <p className="text-sm text-gray-500">Product Details</p>
              </div>
            </div>
            <div className="flex items-center space-x-3">
              <button
                onClick={() => router.push(`/dashboard/company/products/${product._id}/edit`)}
                className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-lg font-medium text-gray-700 bg-white hover:bg-gray-50 transition-colors"
              >
                <EditIcon className="h-5 w-5 mr-2" />
                Edit
              </button>
              <button
                onClick={handleDeleteProduct}
                className={`inline-flex items-center px-4 py-2 border rounded-lg font-medium transition-colors ${
                  deleteConfirm
                    ? 'border-red-500 bg-red-50 text-red-700 hover:bg-red-100'
                    : 'border-red-300 text-red-700 bg-white hover:bg-red-50'
                }`}
              >
                <TrashIcon className="h-5 w-5 mr-2" />
                {deleteConfirm ? 'Confirm Delete' : 'Delete'}
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto py-6 px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main Product Info */}
          <div className="lg:col-span-2 space-y-6">
            {/* Basic Information */}
            <div className="bg-white rounded-lg shadow p-6">
              <div className="flex items-center mb-4">
                <TagIcon className="h-5 w-5 text-gray-400 mr-2" />
                <h2 className="text-lg font-medium text-gray-900">Basic Information</h2>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-500 mb-1">Product Name</label>
                  <p className="text-gray-900">{product.name}</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-500 mb-1">SKU</label>
                  <p className="font-mono text-gray-900">{product.sku}</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-500 mb-1">Category</label>
                  <p className="text-gray-900">{product.category.primary}</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-500 mb-1">Status</label>
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
              </div>
              <div className="mt-4">
                <label className="block text-sm font-medium text-gray-500 mb-1">Description</label>
                <p className="text-gray-900">{product.description}</p>
              </div>
            </div>

            {/* Specifications */}
            <div className="bg-white rounded-lg shadow p-6">
              <h2 className="text-lg font-medium text-gray-900 mb-4">Specifications</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {product.specifications.brand && (
                  <div>
                    <label className="block text-sm font-medium text-gray-500 mb-1">Brand</label>
                    <p className="text-gray-900">{product.specifications.brand}</p>
                  </div>
                )}
                {product.specifications.color && (
                  <div>
                    <label className="block text-sm font-medium text-gray-500 mb-1">Color</label>
                    <p className="text-gray-900">{product.specifications.color}</p>
                  </div>
                )}
                {product.specifications.material && (
                  <div>
                    <label className="block text-sm font-medium text-gray-500 mb-1">Material</label>
                    <p className="text-gray-900">{product.specifications.material}</p>
                  </div>
                )}
                {product.specifications.weight && (
                  <div>
                    <label className="block text-sm font-medium text-gray-500 mb-1">Weight</label>
                    <p className="text-gray-900">{product.specifications.weight}</p>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Pricing */}
            <div className="bg-white rounded-lg shadow p-6">
              <div className="flex items-center mb-4">
                <DollarSignIcon className="h-5 w-5 text-gray-400 mr-2" />
                <h2 className="text-lg font-medium text-gray-900">Pricing</h2>
              </div>
              <div className="space-y-3">
                <div>
                  <label className="block text-sm font-medium text-gray-500 mb-1">Base Price</label>
                  <p className="text-2xl font-bold text-gray-900">
                    {product.pricing.currency} {product.pricing.basePrice.toFixed(2)}
                  </p>
                </div>
              </div>
            </div>

            {/* Inventory */}
            <div className="bg-white rounded-lg shadow p-6">
              <div className="flex items-center mb-4">
                <BoxIcon className="h-5 w-5 text-gray-400 mr-2" />
                <h2 className="text-lg font-medium text-gray-900">Inventory</h2>
              </div>
              <div className="space-y-3">
                <div>
                  <label className="block text-sm font-medium text-gray-500 mb-1">Available Stock</label>
                  <p className="text-xl font-semibold text-gray-900">{product.inventory.available} units</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-500 mb-1">Reserved</label>
                  <p className="text-gray-900">{product.inventory.reserved} units</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-500 mb-1">Reorder Level</label>
                  <p className="text-gray-900">{product.inventory.reorderLevel} units</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-500 mb-1">Last Updated</label>
                  <p className="text-sm text-gray-900">
                    {new Date(product.inventory.lastUpdated).toLocaleDateString()}
                  </p>
                </div>
              </div>
            </div>

            {/* Metadata */}
            <div className="bg-white rounded-lg shadow p-6">
              <h2 className="text-lg font-medium text-gray-900 mb-4">Metadata</h2>
              <div className="space-y-3">
                <div>
                  <label className="block text-sm font-medium text-gray-500 mb-1">Created</label>
                  <p className="text-sm text-gray-900">
                    {new Date(product.createdAt).toLocaleDateString()}
                  </p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-500 mb-1">Last Modified</label>
                  <p className="text-sm text-gray-900">
                    {new Date(product.updatedAt).toLocaleDateString()}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
