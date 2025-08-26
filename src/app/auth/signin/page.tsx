import { Metadata } from "next";
import { ArrowRightIcon, CheckIcon, BuildingIcon, StoreIcon } from "lucide-react";

export const metadata: Metadata = {
  title: "Sign In - DirectConnect B2B Marketplace",
  description: "Sign in to your DirectConnect account and start connecting directly with manufacturers and retailers.",
};

export default function SignInPage() {
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
              <button className="w-full bg-blue-600 text-white py-3 px-4 rounded-lg font-medium hover:bg-blue-700 transition-colors">
                Sign In as Company
              </button>
              <button className="w-full border border-blue-600 text-blue-600 py-3 px-4 rounded-lg font-medium hover:bg-blue-50 transition-colors">
                Create Company Account
              </button>
            </div>

            <div className="mt-6 text-center">
              <a href="/companies" className="text-blue-600 hover:text-blue-700 transition-colors text-sm">
                Learn more about selling on DirectConnect →
              </a>
            </div>
          </div>

          {/* Retailer Sign In */}
          <div className="bg-white rounded-lg shadow-lg p-8 border-2 border-transparent hover:border-green-200 transition-colors">
            <div className="text-center">
              <div className="inline-flex items-center justify-center w-16 h-16 bg-green-100 rounded-lg">
                <StoreIcon className="h-8 w-8 text-green-600" />
              </div>
              <h2 className="mt-4 text-2xl font-bold text-gray-900">For Retailers</h2>
              <p className="mt-2 text-gray-600">
                Retailers and buyers looking to source directly from manufacturers
              </p>
            </div>

            <div className="mt-6 space-y-3">
              {[
                "Save 15-30% on procurement",
                "Access to 10,000+ products",
                "Flexible payment terms",
                "No minimum orders"
              ].map((benefit, index) => (
                <div key={index} className="flex items-center">
                  <CheckIcon className="h-5 w-5 text-green-500 mr-3" />
                  <span className="text-gray-600">{benefit}</span>
                </div>
              ))}
            </div>

            <div className="mt-8 space-y-4">
              <button className="w-full bg-green-600 text-white py-3 px-4 rounded-lg font-medium hover:bg-green-700 transition-colors">
                Sign In as Retailer
              </button>
              <button className="w-full border border-green-600 text-green-600 py-3 px-4 rounded-lg font-medium hover:bg-green-50 transition-colors">
                Create Retailer Account
              </button>
            </div>

            <div className="mt-6 text-center">
              <a href="/retailers" className="text-green-600 hover:text-green-700 transition-colors text-sm">
                Learn more about buying on DirectConnect →
              </a>
            </div>
          </div>
        </div>

        {/* Sign In Form */}
        <div className="bg-white rounded-lg shadow-lg p-8 max-w-md mx-auto">
          <div className="text-center mb-6">
            <h3 className="text-xl font-semibold text-gray-900">Sign In to Your Account</h3>
            <p className="text-gray-600">Welcome back! Please enter your details.</p>
          </div>

          <form className="space-y-6">
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
                Email Address
              </label>
              <input
                type="email"
                id="email"
                name="email"
                required
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-600 focus:border-transparent"
                placeholder="your@email.com"
              />
            </div>

            <div>
              <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-2">
                Password
              </label>
              <input
                type="password"
                id="password"
                name="password"
                required
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-600 focus:border-transparent"
                placeholder="Enter your password"
              />
            </div>

            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <input
                  type="checkbox"
                  id="remember"
                  name="remember"
                  className="h-4 w-4 text-blue-600 border-gray-300 rounded focus:ring-blue-600"
                />
                <label htmlFor="remember" className="ml-2 text-sm text-gray-700">
                  Remember me
                </label>
              </div>
              <a href="/auth/forgot-password" className="text-sm text-blue-600 hover:text-blue-700 transition-colors">
                Forgot password?
              </a>
            </div>

            <button
              type="submit"
              className="w-full bg-blue-600 text-white py-3 px-4 rounded-lg font-medium hover:bg-blue-700 transition-colors"
            >
              Sign In
            </button>
          </form>

          <div className="mt-6">
            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-gray-300" />
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="px-2 bg-white text-gray-500">Or continue with</span>
              </div>
            </div>

            <div className="mt-6 grid grid-cols-2 gap-3">
              <button className="w-full border border-gray-300 py-2 px-4 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors">
                Google
              </button>
              <button className="w-full border border-gray-300 py-2 px-4 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors">
                Microsoft
              </button>
            </div>
          </div>

          <div className="mt-6 text-center">
            <p className="text-sm text-gray-600">
              Don&apos;t have an account?{" "}
              <a href="/auth/signup" className="text-blue-600 hover:text-blue-700 transition-colors font-medium">
                Sign up for free
              </a>
            </p>
          </div>
        </div>

        {/* Benefits Footer */}
        <div className="bg-blue-50 rounded-lg p-6">
          <div className="text-center">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">
              Join the DirectConnect Community
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-sm">
              <div className="text-center">
                <div className="text-2xl font-bold text-blue-600">10,000+</div>
                <div className="text-gray-600">Active Products</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-blue-600">500+</div>
                <div className="text-gray-600">Verified Companies</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-blue-600">1,200+</div>
                <div className="text-gray-600">Happy Retailers</div>
              </div>
            </div>
          </div>
        </div>

        {/* Security Notice */}
        <div className="text-center text-sm text-gray-500">
          <p>
            Your data is protected with enterprise-grade security.{" "}
            <a href="/privacy" className="text-blue-600 hover:text-blue-700 transition-colors">
              Privacy Policy
            </a>{" "}
            |{" "}
            <a href="/terms" className="text-blue-600 hover:text-blue-700 transition-colors">
              Terms of Service
            </a>
          </p>
        </div>
      </div>
    </div>
  );
}
