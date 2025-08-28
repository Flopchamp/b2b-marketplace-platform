"use client";

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { ArrowLeftIcon, PackageIcon, SaveIcon, LoaderIcon } from 'lucide-react';

interface ProductFormData {
  name: string;
  description: string;
  categoryId: string;
  basePricing: {
    price: number;
    currency: string;
    minOrderQuantity: number;
  };
  specifications: {
    weight?: string;
    dimensions?: string;
    material?: string;
    color?: string;
    brand?: string;
  };
  inventory: {
    quantity: number;
    lowStockThreshold: number;
    sku: string;
  };
  media: {
    images: string[];
    documents: string[];
  };
  compliance: {
    certifications: string[];
    standards: string[];
  };
}

interface Category {
  id: string;
  name: string;
  slug: string;
  description?: string;
}

export default function AddProductPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [categories, setCategories] = useState<Category[]>([]);
  const [formData, setFormData] = useState<ProductFormData>({
    name: '',
    description: '',
    categoryId: '',
    basePricing: {
      price: 0,
      currency: 'USD',
      minOrderQuantity: 1,
    },
    specifications: {},
    inventory: {
      quantity: 0,
      lowStockThreshold: 10,
      sku: '',
    },
    media: {
      images: [],
      documents: [],
    },
    compliance: {
      certifications: [],
      standards: [],
    },
  });

  useEffect(() => {
    fetchCategories();
  }, []);

  const fetchCategories = async () => {
    try {
      const response = await fetch('/api/categories');
      const data = await response.json();
      if (data.success) {
        console.log('Categories loaded:', data.data.length);
        setCategories(data.data);
      } else {
        console.error('Failed to fetch categories:', data.error);
      }
    } catch (error) {
      console.error('Error fetching categories:', error);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    
    if (name.includes('.')) {
      const [section, field] = name.split('.');
      setFormData(prev => {
        const sectionData = prev[section as keyof ProductFormData] as Record<string, unknown>;
        return {
          ...prev,
          [section]: {
            ...sectionData,
            [field]: field === 'price' || field === 'quantity' || field === 'minOrderQuantity' || field === 'lowStockThreshold' 
              ? parseFloat(value) || 0 
              : value
          }
        };
      });
    } else {
      setFormData(prev => ({
        ...prev,
        [name]: value
      }));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const accessToken = localStorage.getItem('accessToken');
      if (!accessToken) {
        alert('Please log in to add products');
        router.push('/auth/signin');
        return;
      }

      // Transform form data to match API schema
      const apiPayload = {
        name: formData.name,
        description: formData.description,
        sku: formData.inventory.sku,
        basePrice: formData.basePricing.price,
        minOrderQty: formData.basePricing.minOrderQuantity,
        stockQuantity: formData.inventory.quantity,
        lowStockAlert: formData.inventory.lowStockThreshold,
        categoryId: formData.categoryId,
        images: formData.media.images,
        videos: [],
        documents: formData.media.documents,
        specifications: {
          brand: formData.specifications.brand || '',
          color: formData.specifications.color || '',
          material: formData.specifications.material || '',
          weight: formData.specifications.weight || '',
          currency: formData.basePricing.currency,
        },
        tags: [],
        regions: ['all'],
        visibleTo: ['all']
      };

      console.log('Sending API payload:', apiPayload);

      const response = await fetch('/api/products', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${accessToken}`,
        },
        body: JSON.stringify(apiPayload),
      });

      const data = await response.json();

      if (response.ok) {
        alert('Product added successfully!');
        router.push('/dashboard/company/products');
      } else {
        console.error('API Error:', data);
        alert(data.error || 'Failed to add product');
      }
    } catch (error) {
      console.error('Error adding product:', error);
      alert('Error adding product. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center">
              <button
                onClick={() => router.back()}
                className="mr-4 p-2 text-gray-400 hover:text-gray-600 transition-colors"
              >
                <ArrowLeftIcon className="h-5 w-5" />
              </button>
              <PackageIcon className="h-8 w-8 text-blue-600 mr-3" />
              <div>
                <h1 className="text-xl font-semibold text-gray-900">Add New Product</h1>
                <p className="text-sm text-gray-500">Create a new product for your catalog</p>
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-4xl mx-auto py-6 px-4 sm:px-6 lg:px-8">
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Basic Information */}
          <div className="bg-white shadow rounded-lg p-6">
            <h2 className="text-lg font-medium text-gray-900 mb-4">Basic Information</h2>
            <div className="grid grid-cols-1 gap-6">
              <div>
                <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">
                  Product Name *
                </label>
                <input
                  type="text"
                  id="name"
                  name="name"
                  value={formData.name}
                  onChange={handleInputChange}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  required
                />
              </div>

              <div>
                <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-1">
                  Description *
                </label>
                <textarea
                  id="description"
                  name="description"
                  value={formData.description}
                  onChange={handleInputChange}
                  rows={4}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  required
                />
              </div>

              <div>
                <label htmlFor="categoryId" className="block text-sm font-medium text-gray-700 mb-1">
                  Category *
                </label>
                <select
                  id="categoryId"
                  name="categoryId"
                  value={formData.categoryId}
                  onChange={handleInputChange}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  required
                >
                  <option value="">Select a category</option>
                  {categories.map(cat => (
                    <option key={cat.id} value={cat.id}>{cat.name}</option>
                  ))}
                </select>
              </div>
            </div>
          </div>

          {/* Pricing */}
          <div className="bg-white shadow rounded-lg p-6">
            <h2 className="text-lg font-medium text-gray-900 mb-4">Pricing</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div>
                <label htmlFor="basePricing.price" className="block text-sm font-medium text-gray-700 mb-1">
                  Base Price *
                </label>
                <input
                  type="number"
                  id="basePricing.price"
                  name="basePricing.price"
                  value={formData.basePricing.price}
                  onChange={handleInputChange}
                  step="0.01"
                  min="0"
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  required
                />
              </div>

              <div>
                <label htmlFor="basePricing.currency" className="block text-sm font-medium text-gray-700 mb-1">
                  Currency
                </label>
                <select
                  id="basePricing.currency"
                  name="basePricing.currency"
                  value={formData.basePricing.currency}
                  onChange={handleInputChange}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="USD">USD</option>
                  <option value="EUR">EUR</option>
                  <option value="GBP">GBP</option>
                </select>
              </div>

              <div>
                <label htmlFor="basePricing.minOrderQuantity" className="block text-sm font-medium text-gray-700 mb-1">
                  Min Order Quantity
                </label>
                <input
                  type="number"
                  id="basePricing.minOrderQuantity"
                  name="basePricing.minOrderQuantity"
                  value={formData.basePricing.minOrderQuantity}
                  onChange={handleInputChange}
                  min="1"
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
            </div>
          </div>

          {/* Inventory */}
          <div className="bg-white shadow rounded-lg p-6">
            <h2 className="text-lg font-medium text-gray-900 mb-4">Inventory</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div>
                <label htmlFor="inventory.sku" className="block text-sm font-medium text-gray-700 mb-1">
                  SKU *
                </label>
                <input
                  type="text"
                  id="inventory.sku"
                  name="inventory.sku"
                  value={formData.inventory.sku}
                  onChange={handleInputChange}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  required
                />
              </div>

              <div>
                <label htmlFor="inventory.quantity" className="block text-sm font-medium text-gray-700 mb-1">
                  Quantity *
                </label>
                <input
                  type="number"
                  id="inventory.quantity"
                  name="inventory.quantity"
                  value={formData.inventory.quantity}
                  onChange={handleInputChange}
                  min="0"
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  required
                />
              </div>

              <div>
                <label htmlFor="inventory.lowStockThreshold" className="block text-sm font-medium text-gray-700 mb-1">
                  Low Stock Threshold
                </label>
                <input
                  type="number"
                  id="inventory.lowStockThreshold"
                  name="inventory.lowStockThreshold"
                  value={formData.inventory.lowStockThreshold}
                  onChange={handleInputChange}
                  min="0"
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
            </div>
          </div>

          {/* Specifications */}
          <div className="bg-white shadow rounded-lg p-6">
            <h2 className="text-lg font-medium text-gray-900 mb-4">Specifications (Optional)</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label htmlFor="specifications.brand" className="block text-sm font-medium text-gray-700 mb-1">
                  Brand
                </label>
                <input
                  type="text"
                  id="specifications.brand"
                  name="specifications.brand"
                  value={formData.specifications.brand || ''}
                  onChange={handleInputChange}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>

              <div>
                <label htmlFor="specifications.color" className="block text-sm font-medium text-gray-700 mb-1">
                  Color
                </label>
                <input
                  type="text"
                  id="specifications.color"
                  name="specifications.color"
                  value={formData.specifications.color || ''}
                  onChange={handleInputChange}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>

              <div>
                <label htmlFor="specifications.material" className="block text-sm font-medium text-gray-700 mb-1">
                  Material
                </label>
                <input
                  type="text"
                  id="specifications.material"
                  name="specifications.material"
                  value={formData.specifications.material || ''}
                  onChange={handleInputChange}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>

              <div>
                <label htmlFor="specifications.weight" className="block text-sm font-medium text-gray-700 mb-1">
                  Weight
                </label>
                <input
                  type="text"
                  id="specifications.weight"
                  name="specifications.weight"
                  value={formData.specifications.weight || ''}
                  onChange={handleInputChange}
                  placeholder="e.g., 1.5kg"
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
            </div>
          </div>

          {/* Submit Button */}
          <div className="flex justify-end space-x-4">
            <button
              type="button"
              onClick={() => router.back()}
              className="px-6 py-3 border border-gray-300 rounded-lg text-gray-700 font-medium hover:bg-gray-50 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="px-6 py-3 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center"
            >
              {loading ? (
                <>
                  <LoaderIcon className="h-5 w-5 mr-2 animate-spin" />
                  Creating Product...
                </>
              ) : (
                <>
                  <SaveIcon className="h-5 w-5 mr-2" />
                  Create Product
                </>
              )}
            </button>
          </div>
        </form>
      </main>
    </div>
  );
}
