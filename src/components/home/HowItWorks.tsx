"use client";

import { motion } from "framer-motion";
import {
  UserPlusIcon,
  MagnifyingGlassIcon,
  ShoppingCartIcon,
  TruckIcon,
  CheckCircleIcon,
} from "@heroicons/react/24/outline";

export function HowItWorks() {
  const steps = [
    {
      icon: UserPlusIcon,
      title: "Register & Verify",
      description: "Companies and retailers sign up and complete our verification process for secure, trusted transactions.",
      color: "from-blue-500 to-blue-600",
    },
    {
      icon: MagnifyingGlassIcon,
      title: "Discover & Connect",
      description: "Browse products, compare prices, and connect directly with verified suppliers and buyers.",
      color: "from-purple-500 to-purple-600",
    },
    {
      icon: ShoppingCartIcon,
      title: "Place Orders",
      description: "Use our streamlined ordering system with transparent pricing, bulk discounts, and flexible payment terms.",
      color: "from-indigo-500 to-indigo-600",
    },
    {
      icon: TruckIcon,
      title: "Integrated Delivery",
      description: "Our logistics partners handle pickup, tracking, and delivery with real-time updates and optimization.",
      color: "from-green-500 to-green-600",
    },
    {
      icon: CheckCircleIcon,
      title: "Complete & Review",
      description: "Receive orders, complete payments, and leave reviews to build trust and improve the ecosystem.",
      color: "from-teal-500 to-teal-600",
    },
  ];

  return (
    <section id="how-it-works" className="py-20 bg-gray-50">
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
            How Our Platform{" "}
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-purple-600">
              Transforms
            </span>{" "}
            B2B Commerce
          </h2>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            From registration to delivery, our streamlined process makes B2B transactions 
            faster, more transparent, and cost-effective for everyone involved.
          </p>
        </motion.div>

        {/* Steps */}
        <div className="relative">
          {/* Connection Line */}
          <div className="hidden lg:block absolute top-1/2 left-0 right-0 h-1 bg-gradient-to-r from-blue-200 via-purple-200 via-indigo-200 via-green-200 to-teal-200 transform -translate-y-1/2 z-0"></div>

          {/* Steps Grid */}
          <div className="relative grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-8 lg:gap-4">
            {steps.map((step, index) => (
              <motion.div
                key={step.title}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8, delay: index * 0.2 }}
                viewport={{ once: true }}
                className="text-center relative z-10"
              >
                {/* Step Number */}
                <div className="inline-flex items-center justify-center w-8 h-8 bg-white border-2 border-gray-200 rounded-full text-sm font-bold text-gray-600 mb-4 lg:absolute lg:-top-4 lg:left-1/2 lg:transform lg:-translate-x-1/2 lg:z-20">
                  {index + 1}
                </div>

                {/* Icon */}
                <div className={`w-16 h-16 mx-auto rounded-2xl bg-gradient-to-r ${step.color} flex items-center justify-center mb-4 shadow-lg`}>
                  <step.icon className="h-8 w-8 text-white" />
                </div>

                {/* Content */}
                <h3 className="text-xl font-semibold text-gray-900 mb-3">
                  {step.title}
                </h3>
                <p className="text-gray-600 text-sm leading-relaxed">
                  {step.description}
                </p>
              </motion.div>
            ))}
          </div>
        </div>

        {/* Benefits Overview */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 1 }}
          viewport={{ once: true }}
          className="mt-20"
        >
          <div className="bg-white rounded-3xl p-8 lg:p-12 shadow-xl">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-center">
              {/* Left Side - Content */}
              <div>
                <h3 className="text-3xl font-bold text-gray-900 mb-6">
                  The Result? A{" "}
                  <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-purple-600">
                    Win-Win
                  </span>{" "}
                  for Everyone
                </h3>
                <div className="space-y-4">
                  <div className="flex items-start space-x-3">
                    <div className="w-6 h-6 bg-green-100 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                      <CheckCircleIcon className="h-4 w-4 text-green-600" />
                    </div>
                    <div>
                      <h4 className="font-semibold text-gray-900">For Companies</h4>
                      <p className="text-gray-600 text-sm">Direct access to retailers, better margins, and valuable customer insights</p>
                    </div>
                  </div>
                  <div className="flex items-start space-x-3">
                    <div className="w-6 h-6 bg-green-100 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                      <CheckCircleIcon className="h-4 w-4 text-green-600" />
                    </div>
                    <div>
                      <h4 className="font-semibold text-gray-900">For Retailers</h4>
                      <p className="text-gray-600 text-sm">Lower costs, wider product selection, and flexible payment options</p>
                    </div>
                  </div>
                  <div className="flex items-start space-x-3">
                    <div className="w-6 h-6 bg-green-100 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                      <CheckCircleIcon className="h-4 w-4 text-green-600" />
                    </div>
                    <div>
                      <h4 className="font-semibold text-gray-900">For the Market</h4>
                      <p className="text-gray-600 text-sm">More efficient supply chains, reduced waste, and increased transparency</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Right Side - Stats */}
              <div className="grid grid-cols-2 gap-6">
                <div className="text-center p-6 bg-blue-50 rounded-2xl">
                  <div className="text-3xl font-bold text-blue-600 mb-2">30%</div>
                  <div className="text-sm text-gray-600">Cost Reduction</div>
                </div>
                <div className="text-center p-6 bg-purple-50 rounded-2xl">
                  <div className="text-3xl font-bold text-purple-600 mb-2">50%</div>
                  <div className="text-sm text-gray-600">Faster Processing</div>
                </div>
                <div className="text-center p-6 bg-indigo-50 rounded-2xl">
                  <div className="text-3xl font-bold text-indigo-600 mb-2">99.5%</div>
                  <div className="text-sm text-gray-600">Order Accuracy</div>
                </div>
                <div className="text-center p-6 bg-green-50 rounded-2xl">
                  <div className="text-3xl font-bold text-green-600 mb-2">24/7</div>
                  <div className="text-sm text-gray-600">Support Available</div>
                </div>
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
