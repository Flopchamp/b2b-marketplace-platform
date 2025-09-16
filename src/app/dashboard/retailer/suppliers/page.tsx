"use client";

import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { 
  BuildingIcon,
  MapPinIcon,
  StarIcon,
  PackageIcon,
  ArrowLeftIcon,
  ShieldCheckIcon,
  TruckIcon,
  MailIcon,
  GlobeIcon
} from 'lucide-react';

interface Supplier {
  _id: string;
  companyName: string;
  businessEmail: string;
  website?: string;
  phone?: string;
  address?: {
    street: string;
    city: string;
    state: string;
    country: string;
  };
  description?: string;
  industries: string[];
  certifications: string[];
  rating: number;
  totalReviews: number;
  productsCount: number;
  joinedDate: string;
  isVerified: boolean;
  logo?: string;
}

export default function SuppliersPage() {
  const [suppliers, setSuppliers] = useState<Supplier[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterIndustry, setFilterIndustry] = useState('all');
  const [filterVerified, setFilterVerified] = useState(false);
  const router = useRouter();

  const fetchSuppliers = useCallback(async () => {
    try {
      setLoading(true);
      const accessToken = localStorage.getItem('accessToken');

      const response = await fetch('/api/suppliers', {
        headers: {
          'Authorization': `Bearer ${accessToken}`,
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        throw new Error('Failed to fetch suppliers');
      }

      const result = await response.json();
      if (result.success) {
        setSuppliers(result.data);
      }
    } catch (error) {
      console.error('Error fetching suppliers:', error);
    } finally {
      setLoading(false);
    }
  }, []);

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

    fetchSuppliers();
  }, [router, fetchSuppliers]);

  const filteredSuppliers = suppliers.filter(supplier => {
    const matchesSearch = supplier.companyName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         supplier.description?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         supplier.industries.some(industry => 
                           industry.toLowerCase().includes(searchTerm.toLowerCase())
                         );
    
    const matchesIndustry = filterIndustry === 'all' || 
                           supplier.industries.includes(filterIndustry);
    
    const matchesVerified = !filterVerified || supplier.isVerified;

    return matchesSearch && matchesIndustry && matchesVerified;
  });

  const uniqueIndustries = Array.from(
    new Set(suppliers.flatMap(supplier => supplier.industries))
  ).sort();

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
    });
  };

  const renderStars = (rating: number) => {
    return Array.from({ length: 5 }, (_, index) => (
      <StarIcon
        key={index}
        className={`h-4 w-4 ${
          index < Math.floor(rating)
            ? 'text-yellow-400 fill-current'
            : 'text-gray-300'
        }`}
      />
    ));
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading suppliers...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center">
              <button
                onClick={() => router.push('/dashboard/retailer')}
                className="mr-4 p-2 text-gray-400 hover:text-gray-600"
              >
                <ArrowLeftIcon className="h-5 w-5" />
              </button>
              <h1 className="text-xl font-semibold text-gray-900">Supplier Directory</h1>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {/* Search and Filters */}
        <div className="bg-white shadow rounded-lg p-6 mb-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label htmlFor="search" className="block text-sm font-medium text-gray-700 mb-1">
                Search Suppliers
              </label>
              <input
                type="text"
                id="search"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Search by company name, description, or industry..."
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
              />
            </div>
            
            <div>
              <label htmlFor="industry" className="block text-sm font-medium text-gray-700 mb-1">
                Industry
              </label>
              <select
                id="industry"
                value={filterIndustry}
                onChange={(e) => setFilterIndustry(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
              >
                <option value="all">All Industries</option>
                {uniqueIndustries.map((industry) => (
                  <option key={industry} value={industry}>
                    {industry}
                  </option>
                ))}
              </select>
            </div>

            <div className="flex items-end">
              <label className="flex items-center">
                <input
                  type="checkbox"
                  checked={filterVerified}
                  onChange={(e) => setFilterVerified(e.target.checked)}
                  className="rounded border-gray-300 text-purple-600 shadow-sm focus:border-purple-300 focus:ring focus:ring-purple-200 focus:ring-opacity-50"
                />
                <span className="ml-2 text-sm text-gray-700">Verified suppliers only</span>
              </label>
            </div>
          </div>
        </div>

        {/* Results Summary */}
        <div className="mb-6">
          <p className="text-gray-600">
            Showing {filteredSuppliers.length} of {suppliers.length} suppliers
          </p>
        </div>

        {/* Suppliers Grid */}
        {filteredSuppliers.length === 0 ? (
          <div className="text-center py-12">
            <BuildingIcon className="h-16 w-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No suppliers found</h3>
            <p className="text-gray-500">
              {suppliers.length === 0 
                ? "No suppliers are currently available."
                : "Try adjusting your search criteria to find more suppliers."
              }
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredSuppliers.map((supplier) => (
              <div key={supplier._id} className="bg-white rounded-lg shadow-md hover:shadow-lg transition-shadow overflow-hidden">
                {/* Supplier Header */}
                <div className="p-6">
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex items-center">
                      <div className="h-12 w-12 bg-gradient-to-br from-purple-500 to-blue-600 rounded-lg flex items-center justify-center">
                        <BuildingIcon className="h-6 w-6 text-white" />
                      </div>
                      <div className="ml-3">
                        <h3 className="text-lg font-medium text-gray-900">{supplier.companyName}</h3>
                        {supplier.isVerified && (
                          <div className="flex items-center mt-1">
                            <ShieldCheckIcon className="h-4 w-4 text-green-500 mr-1" />
                            <span className="text-sm text-green-600">Verified</span>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Rating */}
                  <div className="flex items-center mb-3">
                    <div className="flex items-center">
                      {renderStars(supplier.rating)}
                    </div>
                    <span className="ml-2 text-sm text-gray-600">
                      {supplier.rating.toFixed(1)} ({supplier.totalReviews} reviews)
                    </span>
                  </div>

                  {/* Description */}
                  {supplier.description && (
                    <p className="text-gray-600 text-sm mb-4 line-clamp-3">
                      {supplier.description}
                    </p>
                  )}

                  {/* Industries */}
                  <div className="mb-4">
                    <div className="flex flex-wrap gap-2">
                      {supplier.industries.slice(0, 3).map((industry) => (
                        <span
                          key={industry}
                          className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-purple-100 text-purple-800"
                        >
                          {industry}
                        </span>
                      ))}
                      {supplier.industries.length > 3 && (
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
                          +{supplier.industries.length - 3} more
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Stats */}
                  <div className="grid grid-cols-2 gap-4 mb-4">
                    <div className="text-center p-3 bg-gray-50 rounded-lg">
                      <PackageIcon className="h-5 w-5 text-gray-400 mx-auto mb-1" />
                      <div className="text-lg font-semibold text-gray-900">{supplier.productsCount}</div>
                      <div className="text-xs text-gray-500">Products</div>
                    </div>
                    <div className="text-center p-3 bg-gray-50 rounded-lg">
                      <TruckIcon className="h-5 w-5 text-gray-400 mx-auto mb-1" />
                      <div className="text-lg font-semibold text-gray-900">{formatDate(supplier.joinedDate)}</div>
                      <div className="text-xs text-gray-500">Member since</div>
                    </div>
                  </div>

                  {/* Contact Info */}
                  <div className="space-y-2 mb-4">
                    {supplier.address && (
                      <div className="flex items-center text-sm text-gray-600">
                        <MapPinIcon className="h-4 w-4 mr-2" />
                        <span>{supplier.address.city}, {supplier.address.country}</span>
                      </div>
                    )}
                    <div className="flex items-center text-sm text-gray-600">
                      <MailIcon className="h-4 w-4 mr-2" />
                      <span>{supplier.businessEmail}</span>
                    </div>
                    {supplier.website && (
                      <div className="flex items-center text-sm text-gray-600">
                        <GlobeIcon className="h-4 w-4 mr-2" />
                        <a 
                          href={supplier.website} 
                          target="_blank" 
                          rel="noopener noreferrer"
                          className="text-purple-600 hover:text-purple-800"
                        >
                          Visit Website
                        </a>
                      </div>
                    )}
                  </div>

                  {/* Action Buttons */}
                  <div className="flex space-x-2">
                    <Link 
                      href={`/dashboard/retailer/suppliers/${supplier._id}`}
                      className="flex-1 text-center px-4 py-2 bg-purple-600 text-white text-sm font-medium rounded-lg hover:bg-purple-700 transition-colors"
                    >
                      View Profile
                    </Link>
                    <Link 
                      href={`/dashboard/retailer/products?supplier=${supplier._id}`}
                      className="flex-1 text-center px-4 py-2 border border-purple-600 text-purple-600 text-sm font-medium rounded-lg hover:bg-purple-50 transition-colors"
                    >
                      Browse Products
                    </Link>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
