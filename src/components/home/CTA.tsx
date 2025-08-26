"use client";

import { motion } from "framer-motion";
import Link from "next/link";
import { BuildingOfficeIcon, ShoppingBagIcon } from "@heroicons/react/24/outline";

export function CTA() {
  return (
    <section className="py-20 bg-gradient-to-r from-blue-600 via-purple-600 to-indigo-600">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          viewport={{ once: true }}
          className="text-center"
        >
          <h2 className="text-4xl md:text-5xl font-bold text-white mb-6">
            Ready to Transform Your
            <br />
            <span className="text-blue-100">B2B Operations?</span>
          </h2>
          <p className="text-xl text-blue-100 mb-8 max-w-3xl mx-auto">
            Join thousands of companies and retailers who are already saving costs, 
            increasing efficiency, and growing their business with our platform.
          </p>
          
          <div className="flex flex-col sm:flex-row gap-4 justify-center mb-8">
            <Link
              href="/auth/register?type=company"
              className="bg-white hover:bg-gray-100 text-blue-600 px-8 py-4 rounded-lg text-lg font-semibold transition-all duration-300 flex items-center justify-center space-x-2 shadow-lg hover:shadow-xl"
            >
              <BuildingOfficeIcon className="h-5 w-5" />
              <span>Get Started as Company</span>
            </Link>
            <Link
              href="/auth/register?type=retailer"
              className="border-2 border-white text-white hover:bg-white hover:text-blue-600 px-8 py-4 rounded-lg text-lg font-semibold transition-all duration-300 flex items-center justify-center space-x-2"
            >
              <ShoppingBagIcon className="h-5 w-5" />
              <span>Get Started as Retailer</span>
            </Link>
          </div>
          
          <div className="text-center">
            <p className="text-blue-100 text-sm mb-4">
              No setup fees  30-day free trial  Cancel anytime
            </p>
            <button className="text-blue-100 hover:text-white underline text-sm transition-colors">
              Schedule a Demo Instead
            </button>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
