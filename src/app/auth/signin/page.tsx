"use client";

import { useState } from "react";
import { CheckIcon, BuildingIcon, StoreIcon, EyeIcon, EyeOffIcon } from "lucide-react";

export default function SignInPage() {
  const [accountType, setAccountType] = useState<'company' | 'retailer' | null>(null);
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState({
    email: '',
    password: '',
  });

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSignIn = async (userType: 'company' | 'retailer') => {
    if (!formData.email || !formData.password) {
      alert('Please enter your email and password');
      return;
    }

    setIsLoading(true);
    
    try {
      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email: formData.email,
          password: formData.password,
          userType,
        }),
      });

      const data = await response.json();

      if (response.ok) {
        // Store access token
        localStorage.setItem('accessToken', data.accessToken);
        localStorage.setItem('user', JSON.stringify(data.user));
        
        // Redirect based on user type
        if (userType === 'company') {
          window.location.href = '/dashboard/company';
        } else {
          window.location.href = '/dashboard/retailer';
        }
      } else {
        alert(data.error || 'Sign in failed');
      }
    } catch (error) {
      console.error('Sign in error:', error);
      alert('Sign in failed. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  if (accountType) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-md w-full bg-white rounded-lg shadow-lg p-8">
          <div className="text-center mb-8">
            <div className={`inline-flex items-center justify-center w-16 h-16 rounded-lg ${
              accountType === 'company' ? 'bg-blue-100' : 'bg-purple-100'
            }`}>
              {accountType === 'company' ? (
                <BuildingIcon className={`h-8 w-8 ${accountType === 'company' ? 'text-blue-600' : 'text-purple-600'}`} />
              ) : (
                <StoreIcon className={`h-8 w-8 ${accountType === 'retailer' ? 'text-purple-600' : 'text-blue-600'}`} />
              )}
            </div>
            <h2 className="mt-4 text-2xl font-bold text-gray-900">
              Sign In as {accountType === 'company' ? 'Company' : 'Retailer'}
            </h2>
          </div>

          <form onSubmit={(e) => { e.preventDefault(); handleSignIn(accountType); }} className="space-y-6">
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
                Email Address
              </label>
              <input
                type="email"
                id="email"
                name="email"
                value={formData.email}
                onChange={handleInputChange}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                required
              />
            </div>

            <div>
              <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-1">
                Password
              </label>
              <div className="relative">
                <input
                  type={showPassword ? "text" : "password"}
                  id="password"
                  name="password"
                  value={formData.password}
                  onChange={handleInputChange}
                  className="w-full px-4 pr-10 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2"
                >
                  {showPassword ? (
                    <EyeOffIcon className="h-5 w-5 text-gray-400" />
                  ) : (
                    <EyeIcon className="h-5 w-5 text-gray-400" />
                  )}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className={`w-full ${
                accountType === 'company'
                  ? 'bg-blue-600 hover:bg-blue-700'
                  : 'bg-purple-600 hover:bg-purple-700'
              } text-white py-3 px-4 rounded-lg font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed`}
            >
              {isLoading ? 'Signing In...' : 'Sign In'}
            </button>
          </form>

          <div className="mt-6 text-center">
            <button
              onClick={() => setAccountType(null)}
              className="text-gray-600 hover:text-gray-700"
            >
              ← Back to account type selection
            </button>
          </div>

          <div className="mt-4 text-center">
            <p className="text-gray-600">
              Don&apos;t have an account?{' '}
              <a 
                href={`/auth/register?type=${accountType}`}
                className="text-blue-600 hover:text-blue-700 font-medium"
              >
                Sign up
              </a>
            </p>
          </div>
        </div>
      </div>
    );
  }
  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl w-full space-y-8">
        {/* Header */}
        <div className="text-center">
          <h1 className="text-3xl font-bold text-gray-900">Welcome to DirectConnect</h1>
          <p className="mt-2 text-lg text-gray-600">
            Choose your account type to get started
          </p>
        </div>

        {/* Account Type Selection */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {/* Company Sign In */}
          <div className="bg-white rounded-lg shadow-lg p-8 border-2 border-transparent hover:border-blue-200 transition-colors">
            <div className="text-center">
              <div className="inline-flex items-center justify-center w-16 h-16 bg-blue-100 rounded-lg">
                <BuildingIcon className="h-8 w-8 text-blue-600" />
              </div>
              <h2 className="mt-4 text-2xl font-bold text-gray-900">For Companies</h2>
              <p className="mt-2 text-gray-600">
                Manufacturers and suppliers looking to sell directly to retailers
              </p>
            </div>

            <div className="mt-6 space-y-3">
              {[
                "Increase margins by 20-40%",
                "Direct retailer relationships", 
                "Real-time market insights",
                "Faster payment cycles"
              ].map((benefit, index) => (
                <div key={index} className="flex items-center">
                  <CheckIcon className="h-5 w-5 text-green-500 mr-3" />
                  <span className="text-gray-600">{benefit}</span>
                </div>
              ))}
            </div>

            <div className="mt-8 space-y-4">
              <button 
                onClick={() => setAccountType('company')}
                className="w-full bg-blue-600 text-white py-3 px-4 rounded-lg font-medium hover:bg-blue-700 transition-colors"
              >
                Sign In as Company
              </button>
              <a 
                href="/auth/register?type=company"
                className="w-full border border-blue-600 text-blue-600 py-3 px-4 rounded-lg font-medium hover:bg-blue-50 transition-colors block text-center"
              >
                Create Company Account
              </a>
            </div>
          </div>

          {/* Retailer Sign In */}
          <div className="bg-white rounded-lg shadow-lg p-8 border-2 border-transparent hover:border-purple-200 transition-colors">
            <div className="text-center">
              <div className="inline-flex items-center justify-center w-16 h-16 bg-purple-100 rounded-lg">
                <StoreIcon className="h-8 w-8 text-purple-600" />
              </div>
              <h2 className="mt-4 text-2xl font-bold text-gray-900">For Retailers</h2>
              <p className="mt-2 text-gray-600">
                Retailers and buyers looking to source directly from manufacturers
              </p>
            </div>

            <div className="mt-6 space-y-3">
              {[
                "Save 15-30% on procurement",
                "Access to verified suppliers",
                "Flexible payment terms", 
                "Integrated logistics"
              ].map((benefit, index) => (
                <div key={index} className="flex items-center">
                  <CheckIcon className="h-5 w-5 text-green-500 mr-3" />
                  <span className="text-gray-600">{benefit}</span>
                </div>
              ))}
            </div>

            <div className="mt-8 space-y-4">
              <button 
                onClick={() => setAccountType('retailer')}
                className="w-full bg-purple-600 text-white py-3 px-4 rounded-lg font-medium hover:bg-purple-700 transition-colors"
              >
                Sign In as Retailer
              </button>
              <a 
                href="/auth/register?type=retailer"
                className="w-full border border-purple-600 text-purple-600 py-3 px-4 rounded-lg font-medium hover:bg-purple-50 transition-colors block text-center"
              >
                Create Retailer Account
              </a>
            </div>
          </div>
        </div>

        {/* Footer Section */}
        <div className="bg-gradient-to-r from-blue-50 to-purple-50 rounded-lg p-6">
          <div className="text-center">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">
              Join the DirectConnect Community
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-sm">
              <div className="text-center">
                <div className="text-2xl font-bold text-blue-600">2,500+</div>
                <div className="text-gray-600">Active Products</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-purple-600">500+</div>
                <div className="text-gray-600">Verified Companies</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-indigo-600">1,200+</div>
                <div className="text-gray-600">Happy Retailers</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
