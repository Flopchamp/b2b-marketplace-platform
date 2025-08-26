"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { 
  BuildingOfficeIcon,
  ShoppingBagIcon,
  TruckIcon,
  CreditCardIcon,
  ChartBarIcon,
  ShieldCheckIcon
} from "@heroicons/react/24/outline";

export function Hero() {
  return (
    <section className="relative overflow-hidden bg-gradient-to-br from-blue-50 via-purple-50 to-indigo-50 py-20 sm:py-32">
      {/* Background decoration */}
      <div className="absolute inset-0">
        <div className="absolute inset-0 bg-[url(/grid.svg)] opacity-10"></div>
        <div className="absolute top-0 right-0 -translate-y-12 translate-x-12">
          <div className="w-72 h-72 bg-gradient-to-br from-blue-400/20 to-purple-400/20 rounded-full blur-3xl"></div>
        </div>
        <div className="absolute bottom-0 left-0 translate-y-12 -translate-x-12">
          <div className="w-72 h-72 bg-gradient-to-br from-purple-400/20 to-indigo-400/20 rounded-full blur-3xl"></div>
        </div>
      </div>

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          {/* Left Column - Content */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="text-center lg:text-left"
          >
            {/* Badge */}
            <div className="inline-flex items-center px-4 py-2 rounded-full text-sm font-medium bg-blue-100 text-blue-800 mb-6">
              <span className="w-2 h-2 bg-blue-600 rounded-full mr-2"></span>
              Revolutionizing B2B Commerce
            </div>

            {/* Headline */}
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-gray-900 leading-tight mb-6">
              Eliminate{" "}
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-purple-600">
                Middlemen
              </span>
              <br />
              Connect{" "}
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-purple-600 to-indigo-600">
                Directly
              </span>
            </h1>

            {/* Subtitle */}
            <p className="text-xl text-gray-600 mb-8 max-w-2xl">
              Our B2B marketplace platform connects companies directly with retailers, 
              reducing costs, increasing transparency, and streamlining the entire supply chain 
              with integrated logistics and credit solutions.
            </p>

            {/* CTAs */}
            <div className="flex flex-col sm:flex-row gap-4 mb-8">
              <Link
                href="/auth/register?type=company"
                className="bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white px-8 py-4 rounded-lg text-lg font-semibold transition-all duration-300 flex items-center justify-center space-x-2 shadow-lg hover:shadow-xl"
              >
                <BuildingOfficeIcon className="h-5 w-5" />
                <span>Start Selling</span>
              </Link>
              <Link
                href="/auth/register?type=retailer"
                className="bg-gradient-to-r from-purple-600 to-purple-700 hover:from-purple-700 hover:to-purple-800 text-white px-8 py-4 rounded-lg text-lg font-semibold transition-all duration-300 flex items-center justify-center space-x-2 shadow-lg hover:shadow-xl"
              >
                <ShoppingBagIcon className="h-5 w-5" />
                <span>Start Buying</span>
              </Link>
            </div>

            {/* Trust indicators */}
            <div className="flex items-center justify-center lg:justify-start space-x-8 text-sm text-gray-500">
              <div className="flex items-center space-x-2">
                <ShieldCheckIcon className="h-4 w-4" />
                <span>Verified Suppliers</span>
              </div>
              <div className="flex items-center space-x-2">
                <TruckIcon className="h-4 w-4" />
                <span>Integrated Logistics</span>
              </div>
              <div className="flex items-center space-x-2">
                <CreditCardIcon className="h-4 w-4" />
                <span>Credit Solutions</span>
              </div>
            </div>
          </motion.div>

          {/* Right Column - Visual */}
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.8, delay: 0.2 }}
            className="relative"
          >
            {/* Main illustration container */}
            <div className="relative w-full h-96 lg:h-[500px]">
              {/* Company Card */}
              <motion.div
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.8, delay: 0.4 }}
                className="absolute top-0 left-0 bg-white rounded-2xl shadow-2xl p-6 w-64 z-10"
              >
                <div className="flex items-center space-x-3 mb-4">
                  <div className="w-12 h-12 bg-gradient-to-r from-blue-500 to-blue-600 rounded-lg flex items-center justify-center">
                    <BuildingOfficeIcon className="h-6 w-6 text-white" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-900">Manufacturing Co.</h3>
                    <p className="text-sm text-gray-500">Direct Supplier</p>
                  </div>
                </div>
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Products</span>
                    <span className="font-semibold">2,547</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Retailers</span>
                    <span className="font-semibold">1,234</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div className="bg-gradient-to-r from-blue-500 to-blue-600 h-2 rounded-full w-3/4"></div>
                  </div>
                </div>
              </motion.div>

              {/* Connection Lines */}
              <svg className="absolute inset-0 w-full h-full z-0" viewBox="0 0 400 400">
                <motion.path
                  initial={{ pathLength: 0 }}
                  animate={{ pathLength: 1 }}
                  transition={{ duration: 2, delay: 0.8 }}
                  d="M 150 150 Q 200 200 250 150"
                  stroke="url(#gradient1)"
                  strokeWidth="3"
                  fill="none"
                  strokeDasharray="5,5"
                />
                <motion.path
                  initial={{ pathLength: 0 }}
                  animate={{ pathLength: 1 }}
                  transition={{ duration: 2, delay: 1 }}
                  d="M 150 250 Q 200 200 250 250"
                  stroke="url(#gradient2)"
                  strokeWidth="3"
                  fill="none"
                  strokeDasharray="5,5"
                />
                <defs>
                  <linearGradient id="gradient1" x1="0%" y1="0%" x2="100%" y2="0%">
                    <stop offset="0%" stopColor="#3B82F6" />
                    <stop offset="100%" stopColor="#8B5CF6" />
                  </linearGradient>
                  <linearGradient id="gradient2" x1="0%" y1="0%" x2="100%" y2="0%">
                    <stop offset="0%" stopColor="#8B5CF6" />
                    <stop offset="100%" stopColor="#6366F1" />
                  </linearGradient>
                </defs>
              </svg>

              {/* Retailer Card */}
              <motion.div
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.8, delay: 0.6 }}
                className="absolute top-16 right-0 bg-white rounded-2xl shadow-2xl p-6 w-64 z-10"
              >
                <div className="flex items-center space-x-3 mb-4">
                  <div className="w-12 h-12 bg-gradient-to-r from-purple-500 to-purple-600 rounded-lg flex items-center justify-center">
                    <ShoppingBagIcon className="h-6 w-6 text-white" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-900">Retail Store</h3>
                    <p className="text-sm text-gray-500">Verified Buyer</p>
                  </div>
                </div>
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Orders</span>
                    <span className="font-semibold">456</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Savings</span>
                    <span className="font-semibold text-green-600">25%</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div className="bg-gradient-to-r from-purple-500 to-purple-600 h-2 rounded-full w-4/5"></div>
                  </div>
                </div>
              </motion.div>

              {/* Analytics Card */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8, delay: 0.8 }}
                className="absolute bottom-0 left-1/2 transform -translate-x-1/2 bg-white rounded-2xl shadow-2xl p-6 w-72 z-10"
              >
                <div className="flex items-center space-x-3 mb-4">
                  <div className="w-12 h-12 bg-gradient-to-r from-indigo-500 to-indigo-600 rounded-lg flex items-center justify-center">
                    <ChartBarIcon className="h-6 w-6 text-white" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-900">Platform Analytics</h3>
                    <p className="text-sm text-gray-500">Real-time Insights</p>
                  </div>
                </div>
                <div className="grid grid-cols-3 gap-4 text-center">
                  <div>
                    <div className="text-2xl font-bold text-blue-600">95%</div>
                    <div className="text-xs text-gray-500">Cost Reduction</div>
                  </div>
                  <div>
                    <div className="text-2xl font-bold text-purple-600">48h</div>
                    <div className="text-xs text-gray-500">Avg Delivery</div>
                  </div>
                  <div>
                    <div className="text-2xl font-bold text-indigo-600">99.9%</div>
                    <div className="text-xs text-gray-500">Uptime</div>
                  </div>
                </div>
              </motion.div>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
