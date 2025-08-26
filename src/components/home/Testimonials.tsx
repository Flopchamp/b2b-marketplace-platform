"use client";

import { motion } from "framer-motion";
import { StarIcon } from "@heroicons/react/24/solid";

export function Testimonials() {
  const testimonials = [
    {
      name: "Sarah Johnson",
      role: "CEO",
      company: "TechRetail Solutions",
      image: "/placeholder-avatar-1.jpg",
      content: "This platform has revolutionized our supply chain. We~ve reduced costs by 35% and improved delivery times significantly. The direct connection with manufacturers has been a game-changer.",
      rating: 5,
    },
    {
      name: "Michael Chen",
      role: "Supply Chain Director",
      company: "Global Manufacturing Inc.",
      image: "/placeholder-avatar-2.jpg",
      content: "The analytics and insights we get from this platform help us make better decisions. Our inventory management has improved dramatically, and customer satisfaction is at an all-time high.",
      rating: 5,
    },
    {
      name: "Emily Rodriguez",
      role: "Procurement Manager",
      company: "Metro Retail Group",
      image: "/placeholder-avatar-3.jpg",
      content: "The credit solutions and flexible payment terms have allowed us to grow our business faster than ever. The platform is intuitive and the support team is exceptional.",
      rating: 5,
    },
  ];

  return (
    <section className="py-20 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          viewport={{ once: true }}
          className="text-center mb-16"
        >
          <h2 className="text-4xl font-bold text-gray-900 mb-4">
            What Our{" "}
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-purple-600">
              Customers Say
            </span>
          </h2>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Hear from business leaders who are transforming their operations with our platform.
          </p>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {testimonials.map((testimonial, index) => (
            <motion.div
              key={testimonial.name}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: index * 0.2 }}
              viewport={{ once: true }}
              className="bg-gray-50 rounded-2xl p-8 hover:shadow-lg transition-shadow duration-300"
            >
              <div className="flex items-center space-x-1 mb-4">
                {[...Array(testimonial.rating)].map((_, i) => (
                  <StarIcon key={i} className="h-5 w-5 text-yellow-400" />
                ))}
              </div>
              
              <p className="text-gray-700 mb-6 italic">
                "{testimonial.content}"
              </p>
              
              <div className="flex items-center space-x-4">
                <div className="w-12 h-12 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full flex items-center justify-center">
                  <span className="text-white font-semibold">
                    {testimonial.name.split(' ').map(n => n[0]).join('')}
                  </span>
                </div>
                <div>
                  <div className="font-semibold text-gray-900">{testimonial.name}</div>
                  <div className="text-sm text-gray-600">{testimonial.role}, {testimonial.company}</div>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
