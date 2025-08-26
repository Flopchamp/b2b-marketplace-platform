"use client";

import { motion } from "framer-motion";
import {
  CurrencyDollarIcon,
  ClockIcon,
  EyeIcon,
  ShieldCheckIcon,
  ChartBarIcon,
  UserGroupIcon,
} from "@heroicons/react/24/outline";

export function Benefits() {
  const benefits = [
    {
      icon: CurrencyDollarIcon,
      title: "Reduce Costs by Up to 30%",
      description: "Eliminate middleman markups and reduce operational costs through direct connections and automated processes.",
      stats: "Average savings of $50,000+ per year",
      color: "from-green-500 to-green-600",
    },
    {
      icon: ClockIcon,
      title: "Faster Time to Market",
      description: "Streamlined ordering and delivery processes reduce lead times and get products to market faster.",
      stats: "50% reduction in processing time",
      color: "from-blue-500 to-blue-600",
    },
    {
      icon: EyeIcon,
      title: "Complete Transparency",
      description: "Full visibility into pricing, inventory, shipping, and payment status for informed decision making.",
      stats: "100% transaction transparency",
      color: "from-purple-500 to-purple-600",
    },
    {
      icon: ShieldCheckIcon,
      title: "Enhanced Security & Trust",
      description: "Rigorous verification, secure payments, and comprehensive insurance protect all transactions.",
      stats: "99.9% fraud protection rate",
      color: "from-indigo-500 to-indigo-600",
    },
    {
      icon: ChartBarIcon,
      title: "Data-Driven Insights",
      description: "Advanced analytics and reporting help optimize operations, forecast demand, and identify opportunities.",
      stats: "Increase revenue by 25% on average",
      color: "from-orange-500 to-orange-600",
    },
    {
      icon: UserGroupIcon,
      title: "Scalable Growth",
      description: "Platform grows with your business, supporting everything from small retailers to enterprise companies.",
      stats: "Handle 10x growth seamlessly",
      color: "from-teal-500 to-teal-600",
    },
  ];

  return (
    <section className="py-20 bg-white">
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
            Why Choose Our{" "}
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-purple-600">
              B2B Platform
            </span>
          </h2>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Our platform delivers measurable results that transform how businesses operate, 
            grow, and succeed in the modern marketplace.
          </p>
        </motion.div>

        {/* Benefits Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {benefits.map((benefit, index) => (
            <motion.div
              key={benefit.title}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: index * 0.1 }}
              viewport={{ once: true }}
              className="group"
            >
              <div className="bg-white rounded-2xl p-8 shadow-lg hover:shadow-2xl transition-all duration-300 border border-gray-100 hover:border-gray-200 h-full relative overflow-hidden">
                {/* Background Gradient */}
                <div className={`absolute inset-0 bg-gradient-to-br ${benefit.color} opacity-0 group-hover:opacity-5 transition-opacity duration-300`}></div>
                
                {/* Icon */}
                <div className={`w-14 h-14 rounded-xl bg-gradient-to-r ${benefit.color} flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300`}>
                  <benefit.icon className="h-7 w-7 text-white" />
                </div>

                {/* Content */}
                <h3 className="text-xl font-bold text-gray-900 mb-4 group-hover:text-gray-700 transition-colors">
                  {benefit.title}
                </h3>
                <p className="text-gray-600 mb-4 leading-relaxed group-hover:text-gray-700 transition-colors">
                  {benefit.description}
                </p>

                {/* Stats */}
                <div className={`inline-block px-4 py-2 rounded-full text-sm font-semibold bg-gradient-to-r ${benefit.color} text-white`}>
                  {benefit.stats}
                </div>
              </div>
            </motion.div>
          ))}
        </div>

        {/* Comparison Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.8 }}
          viewport={{ once: true }}
          className="mt-20"
        >
          <div className="bg-gray-50 rounded-3xl p-8 lg:p-12">
            <h3 className="text-3xl font-bold text-center text-gray-900 mb-12">
              Traditional B2B vs Our Platform
            </h3>
            
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              {/* Traditional Way */}
              <div className="bg-red-50 rounded-2xl p-6 border-2 border-red-100">
                <div className="text-center mb-6">
                  <h4 className="text-xl font-bold text-red-700 mb-2">Traditional B2B</h4>
                  <p className="text-red-600 text-sm">Multiple middlemen, higher costs</p>
                </div>
                <ul className="space-y-3">
                  <li className="flex items-center text-red-700">
                    <div className="w-2 h-2 bg-red-500 rounded-full mr-3"></div>
                    Multiple middlemen add 20-40% markup
                  </li>
                  <li className="flex items-center text-red-700">
                    <div className="w-2 h-2 bg-red-500 rounded-full mr-3"></div>
                    Limited transparency in pricing
                  </li>
                  <li className="flex items-center text-red-700">
                    <div className="w-2 h-2 bg-red-500 rounded-full mr-3"></div>
                    Slow manual processes
                  </li>
                  <li className="flex items-center text-red-700">
                    <div className="w-2 h-2 bg-red-500 rounded-full mr-3"></div>
                    Complex payment terms
                  </li>
                  <li className="flex items-center text-red-700">
                    <div className="w-2 h-2 bg-red-500 rounded-full mr-3"></div>
                    Limited product selection
                  </li>
                </ul>
              </div>

              {/* Our Platform */}
              <div className="bg-green-50 rounded-2xl p-6 border-2 border-green-100">
                <div className="text-center mb-6">
                  <h4 className="text-xl font-bold text-green-700 mb-2">Our Platform</h4>
                  <p className="text-green-600 text-sm">Direct connections, maximum efficiency</p>
                </div>
                <ul className="space-y-3">
                  <li className="flex items-center text-green-700">
                    <div className="w-2 h-2 bg-green-500 rounded-full mr-3"></div>
                    Direct connections save 20-40% on costs
                  </li>
                  <li className="flex items-center text-green-700">
                    <div className="w-2 h-2 bg-green-500 rounded-full mr-3"></div>
                    Complete price transparency
                  </li>
                  <li className="flex items-center text-green-700">
                    <div className="w-2 h-2 bg-green-500 rounded-full mr-3"></div>
                    Automated workflows
                  </li>
                  <li className="flex items-center text-green-700">
                    <div className="w-2 h-2 bg-green-500 rounded-full mr-3"></div>
                    Flexible payment options
                  </li>
                  <li className="flex items-center text-green-700">
                    <div className="w-2 h-2 bg-green-500 rounded-full mr-3"></div>
                    Access to thousands of products
                  </li>
                </ul>
              </div>
            </div>

            <div className="text-center mt-8">
              <button className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white px-8 py-3 rounded-lg font-semibold transition-all duration-300 shadow-lg hover:shadow-xl">
                Start Your Transformation Today
              </button>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
