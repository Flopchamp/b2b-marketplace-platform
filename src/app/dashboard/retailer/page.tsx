"use client";

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { 
  StoreIcon, 
  ShoppingCartIcon, 
  TrendingUpIcon, 
  SearchIcon, 
  PackageIcon,
  HeartIcon,
  LogOutIcon
} from 'lucide-react';

interface User {
  id: string;
  email: string;
  role: string;
  businessName?: string;
  verificationStatus: string;
  kycStatus: string;
}

export default function RetailerDashboard() {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    // Check if user is logged in
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
      setUser(parsedUser);
    } catch (error) {
      console.error('Error parsing user data:', error);
      router.push('/auth/signin');
      return;
    }

    setLoading(false);
  }, [router]);

  const handleLogout = () => {
    localStorage.removeItem('accessToken');
    localStorage.removeItem('user');
    router.push('/');
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading dashboard...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center">
              <StoreIcon className="h-8 w-8 text-purple-600 mr-3" />
              <div>
                <h1 className="text-xl font-semibold text-gray-900">Retailer Dashboard</h1>
                <p className="text-sm text-gray-500">{user.businessName || 'Retail Account'}</p>
              </div>
            </div>
            <div className="flex items-center space-x-4">
              <div className="text-right">
                <p className="text-sm font-medium text-gray-900">{user.email}</p>
                <div className="flex items-center space-x-2">
                  <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                    user.verificationStatus === 'verified' 
                      ? 'bg-green-100 text-green-800' 
                      : user.verificationStatus === 'pending'
                      ? 'bg-yellow-100 text-yellow-800'
                      : 'bg-red-100 text-red-800'
                  }`}>
                    {user.verificationStatus}
                  </span>
                  <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                    user.kycStatus === 'verified' 
                      ? 'bg-green-100 text-green-800' 
                      : user.kycStatus === 'pending'
                      ? 'bg-yellow-100 text-yellow-800'
                      : 'bg-red-100 text-red-800'
                  }`}>
                    KYC: {user.kycStatus}
                  </span>
                </div>
              </div>
              <button
                onClick={handleLogout}
                className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-purple-500"
              >
                <LogOutIcon className="h-4 w-4 mr-2" />
                Logout
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto py-6 px-4 sm:px-6 lg:px-8">
        {/* Welcome Section */}
        <div className="bg-white overflow-hidden shadow rounded-lg mb-6">
          <div className="px-4 py-5 sm:p-6">
            <h2 className="text-lg font-medium text-gray-900 mb-2">
              Welcome to DirectConnect! 🛍️
            </h2>
            <p className="text-gray-600 mb-4">
              Your retailer account has been successfully created. Start discovering products from verified manufacturers and suppliers.
            </p>
            {user.verificationStatus === 'pending' && (
              <div className="bg-yellow-50 border border-yellow-200 rounded-md p-4">
                <div className="flex">
                  <div className="flex-shrink-0">
                    <svg className="h-5 w-5 text-yellow-400" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                    </svg>
                  </div>
                  <div className="ml-3">
                    <h3 className="text-sm font-medium text-yellow-800">
                      Account Verification Pending
                    </h3>
                    <div className="mt-2 text-sm text-yellow-700">
                      <p>Please complete your account verification to start purchasing from suppliers.</p>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4 mb-6">
          <div className="bg-white overflow-hidden shadow rounded-lg">
            <div className="p-5">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <ShoppingCartIcon className="h-6 w-6 text-gray-400" />
                </div>
                <div className="ml-5 w-0 flex-1">
                  <dl>
                    <dt className="text-sm font-medium text-gray-500 truncate">Orders</dt>
                    <dd className="text-lg font-medium text-gray-900">0</dd>
                  </dl>
                </div>
              </div>
            </div>
          </div>

          <div className="bg-white overflow-hidden shadow rounded-lg">
            <div className="p-5">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <HeartIcon className="h-6 w-6 text-gray-400" />
                </div>
                <div className="ml-5 w-0 flex-1">
                  <dl>
                    <dt className="text-sm font-medium text-gray-500 truncate">Wishlist</dt>
                    <dd className="text-lg font-medium text-gray-900">0</dd>
                  </dl>
                </div>
              </div>
            </div>
          </div>

          <div className="bg-white overflow-hidden shadow rounded-lg">
            <div className="p-5">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <TrendingUpIcon className="h-6 w-6 text-gray-400" />
                </div>
                <div className="ml-5 w-0 flex-1">
                  <dl>
                    <dt className="text-sm font-medium text-gray-500 truncate">Monthly Spend</dt>
                    <dd className="text-lg font-medium text-gray-900">$0</dd>
                  </dl>
                </div>
              </div>
            </div>
          </div>

          <div className="bg-white overflow-hidden shadow rounded-lg">
            <div className="p-5">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <PackageIcon className="h-6 w-6 text-gray-400" />
                </div>
                <div className="ml-5 w-0 flex-1">
                  <dl>
                    <dt className="text-sm font-medium text-gray-500 truncate">Suppliers</dt>
                    <dd className="text-lg font-medium text-gray-900">0</dd>
                  </dl>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="bg-white shadow rounded-lg">
          <div className="px-4 py-5 sm:p-6">
            <h3 className="text-lg leading-6 font-medium text-gray-900 mb-4">Quick Actions</h3>
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
              <button className="relative group bg-white p-6 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-purple-500 rounded-lg border border-gray-300 hover:border-purple-300 hover:shadow-md transition-all">
                <div>
                  <span className="rounded-lg inline-flex p-3 bg-purple-50 group-hover:bg-purple-100 transition-colors">
                    <SearchIcon className="h-6 w-6 text-purple-600" />
                  </span>
                </div>
                <div className="mt-4">
                  <h3 className="text-lg font-medium text-gray-900">Browse Products</h3>
                  <p className="mt-2 text-sm text-gray-500">
                    Discover products from verified manufacturers
                  </p>
                </div>
                <span className="pointer-events-none absolute top-6 right-6 text-gray-300 group-hover:text-gray-400 transition-colors">
                  <svg className="h-6 w-6" fill="currentColor" viewBox="0 0 24 24">
                    <path d="m11.293 17.293 1.414 1.414L19.414 12l-6.707-6.707-1.414 1.414L15.586 11H6v2h9.586l-4.293 4.293z" />
                  </svg>
                </span>
              </button>

              <button className="relative group bg-white p-6 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-purple-500 rounded-lg border border-gray-300 hover:border-purple-300 hover:shadow-md transition-all">
                <div>
                  <span className="rounded-lg inline-flex p-3 bg-blue-50 group-hover:bg-blue-100 transition-colors">
                    <PackageIcon className="h-6 w-6 text-blue-600" />
                  </span>
                </div>
                <div className="mt-4">
                  <h3 className="text-lg font-medium text-gray-900">Browse Suppliers</h3>
                  <p className="mt-2 text-sm text-gray-500">
                    Connect with trusted suppliers and manufacturers
                  </p>
                </div>
                <span className="pointer-events-none absolute top-6 right-6 text-gray-300 group-hover:text-gray-400 transition-colors">
                  <svg className="h-6 w-6" fill="currentColor" viewBox="0 0 24 24">
                    <path d="m11.293 17.293 1.414 1.414L19.414 12l-6.707-6.707-1.414 1.414L15.586 11H6v2h9.586l-4.293 4.293z" />
                  </svg>
                </span>
              </button>

              <button className="relative group bg-white p-6 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-purple-500 rounded-lg border border-gray-300 hover:border-purple-300 hover:shadow-md transition-all">
                <div>
                  <span className="rounded-lg inline-flex p-3 bg-green-50 group-hover:bg-green-100 transition-colors">
                    <TrendingUpIcon className="h-6 w-6 text-green-600" />
                  </span>
                </div>
                <div className="mt-4">
                  <h3 className="text-lg font-medium text-gray-900">View Orders</h3>
                  <p className="mt-2 text-sm text-gray-500">
                    Track your orders and purchase history
                  </p>
                </div>
                <span className="pointer-events-none absolute top-6 right-6 text-gray-300 group-hover:text-gray-400 transition-colors">
                  <svg className="h-6 w-6" fill="currentColor" viewBox="0 0 24 24">
                    <path d="m11.293 17.293 1.414 1.414L19.414 12l-6.707-6.707-1.414 1.414L15.586 11H6v2h9.586l-4.293 4.293z" />
                  </svg>
                </span>
              </button>
            </div>
          </div>
        </div>

        {/* Recent Activity Section */}
        <div className="mt-6 bg-white shadow rounded-lg">
          <div className="px-4 py-5 sm:p-6">
            <h3 className="text-lg leading-6 font-medium text-gray-900 mb-4">Recent Activity</h3>
            <div className="text-center py-8">
              <ShoppingCartIcon className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <h4 className="text-lg font-medium text-gray-900 mb-2">No activity yet</h4>
              <p className="text-gray-500 mb-4">Start browsing products to see your activity here</p>
              <button className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-purple-600 hover:bg-purple-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-purple-500">
                <SearchIcon className="h-4 w-4 mr-2" />
                Browse Products
              </button>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
