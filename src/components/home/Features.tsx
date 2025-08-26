"use client";

import { motion } from "framer-motion";
import {
  ShoppingCartIcon,
  TruckIcon,
  CreditCardIcon,
  ChartBarIcon,
  ShieldCheckIcon,
  ChatBubbleLeftRightIcon,
  BellIcon,
  CogIcon,
} from "@heroicons/react/24/outline";

export function Features() {
  const features = [
    {
      icon: ShoppingCartIcon,
      title: "Direct Ordering System",
      description: "Streamlined ordering process that connects retailers directly with companies, eliminating unnecessary middlemen and reducing costs.",
      color: "from-blue-500 to-blue-600",
      delay: 0.1,
    },
    {
      icon: TruckIcon,
      title: "Integrated Logistics",
      description: "Partner with leading logistics providers for efficient delivery tracking, route optimization, and automated shipping solutions.",
      color: "from-green-500 to-green-600",
      delay: 0.2,
    },
    {
      icon: CreditCardIcon,
      title: "Credit Solutions",
      description: "Advanced credit scoring and flexible payment options including buy-now-pay-later and credit lines for trusted retailers.",
      color: "from-purple-500 to-purple-600",
      delay: 0.3,
    },
    {
      icon: ChartBarIcon,
      title: "Analytics Dashboard",
      description: "Comprehensive analytics with real-time insights, sales forecasting, and performance tracking for data-driven decisions.",
      color: "from-indigo-500 to-indigo-600",
      delay: 0.4,
    },
    {
      icon: ShieldCheckIcon,
      title: "Trust & Verification",
      description: "Rigorous verification process for all participants with ratings, reviews, and transaction history for complete transparency.",
      color: "from-red-500 to-red-600",
      delay: 0.5,
    },
    {
      icon: ChatBubbleLeftRightIcon,
      title: "Communication Hub",
      description: "Built-in messaging system with automated notifications, dispute resolution, and dedicated support channels.",
      color: "from-orange-500 to-orange-600",
      delay: 0.6,
    },
    {
      icon: BellIcon,
      title: "Smart Notifications",
      description: "Intelligent notification system for order updates, inventory alerts, payment reminders, and promotional opportunities.",
      color: "from-teal-500 to-teal-600",
      delay: 0.7,
    },
    {
      icon: CogIcon,
      title: "ERP Integration",
      description: "Seamless integration with existing ERP and accounting systems for unified business operations and automated workflows.",
      color: "from-pink-500 to-pink-600",
      delay: 0.8,
    },
  ];

  return (
    <section id="features" className="py-20 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          viewport={{ once: true }}
          className="text-center mb-16"
        >
          <h2 className="text-4xl font-bold text-gray-900 mb-4">
            Everything You Need to{" "}
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-purple-600">
              Transform B2B Commerce
            </span>
          </h2>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Our comprehensive platform provides all the tools and features needed to 
            revolutionize how companies and retailers do business together.
          </p>
        </motion.div>

        {/* Features Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {features.map((feature, index) => (
            <motion.div
              key={feature.title}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: feature.delay }}
              viewport={{ once: true }}
              className="group relative"
            >
              <div className="bg-white rounded-2xl p-6 shadow-lg hover:shadow-2xl transition-all duration-300 border border-gray-100 hover:border-gray-200 h-full">
                {/* Icon */}
                <div className={`w-12 h-12 rounded-lg bg-gradient-to-r ${feature.color} flex items-center justify-center mb-4 group-hover:scale-110 transition-transform duration-300`}>
                  <feature.icon className="h-6 w-6 text-white" />
                </div>

                {/* Content */}
                <h3 className="text-xl font-semibold text-gray-900 mb-3 group-hover:text-gray-700 transition-colors">
                  {feature.title}
                </h3>
                <p className="text-gray-600 group-hover:text-gray-700 transition-colors">
                  {feature.description}
                </p>

                {/* Hover Effect */}
                <div className="absolute inset-0 rounded-2xl bg-gradient-to-r from-blue-50 to-purple-50 opacity-0 group-hover:opacity-100 transition-opacity duration-300 -z-10"></div>
              </div>
            </motion.div>
          ))}
        </div>

        {/* Call to Action */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.9 }}
          viewport={{ once: true }}
          className="text-center mt-16"
        >
          <div className="bg-gradient-to-r from-blue-50 to-purple-50 rounded-3xl p-8">
            <h3 className="text-2xl font-bold text-gray-900 mb-4">
              Ready to Experience the Future of B2B Commerce?
            </h3>
            <p className="text-gray-600 mb-6 max-w-2xl mx-auto">
              Join thousands of companies and retailers who are already saving costs, 
              increasing efficiency, and growing their business with our platform.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <button className="bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white px-8 py-3 rounded-lg font-semibold transition-all duration-300 shadow-lg hover:shadow-xl">
                Schedule a Demo
              </button>
              <button className="border-2 border-gray-300 hover:border-gray-400 text-gray-700 hover:text-gray-900 px-8 py-3 rounded-lg font-semibold transition-all duration-300">
                View All Features
              </button>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
