import { Metadata } from "next";
import { CheckIcon } from "lucide-react";

export const metadata: Metadata = {
  title: "Pricing - DirectConnect B2B Marketplace",
  description: "Transparent pricing for our B2B marketplace platform. No hidden fees, competitive rates for companies and retailers.",
};

export default function PricingPage() {
  return (
    <div className="min-h-screen bg-gray-50 py-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center">
          <h1 className="text-4xl font-bold text-gray-900">
            Simple, Transparent Pricing
          </h1>
          <p className="mt-4 text-xl text-gray-600 max-w-3xl mx-auto">
            Save 15-30% on procurement costs with our low transaction fees. 
            No hidden charges, no middleman markups.
          </p>
        </div>

        {/* Transaction Fees */}
        <div className="mt-16">
          <div className="text-center">
            <h2 className="text-3xl font-bold text-gray-900">Transaction Fees</h2>
            <p className="mt-4 text-lg text-gray-600">
              Competitive rates based on your transaction volume
            </p>
          </div>

          <div className="mt-12 grid grid-cols-1 md:grid-cols-4 gap-6">
            {[
              { tier: "$0 - $50K/month", rate: "2.5%", savings: "Save 20-45%" },
              { tier: "$50K - $200K/month", rate: "2.0%", savings: "Save 23-48%" },
              { tier: "$200K - $1M/month", rate: "1.5%", savings: "Save 24-49%" },
              { tier: "$1M+/month", rate: "1.0%", savings: "Save 24-49%" },
            ].map((tier, index) => (
              <div key={index} className="bg-white rounded-lg shadow-md p-6 text-center">
                <h3 className="text-lg font-semibold text-gray-900">{tier.tier}</h3>
                <div className="mt-4">
                  <span className="text-3xl font-bold text-blue-600">{tier.rate}</span>
                  <span className="text-gray-600"> fee</span>
                </div>
                <p className="mt-2 text-sm text-green-600 font-medium">{tier.savings}</p>
                <p className="mt-2 text-xs text-gray-500">vs traditional distributors</p>
              </div>
            ))}
          </div>
        </div>

        {/* Subscription Plans */}
        <div className="mt-20">
          <div className="text-center">
            <h2 className="text-3xl font-bold text-gray-900">Subscription Plans</h2>
            <p className="mt-4 text-lg text-gray-600">
              Choose the plan that fits your business needs
            </p>
          </div>

          {/* Company Plans */}
          <div className="mt-12">
            <h3 className="text-2xl font-bold text-gray-900 text-center mb-8">For Companies</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {[
                {
                  name: "Starter",
                  price: "$99",
                  period: "/month",
                  description: "Perfect for small manufacturers",
                  features: [
                    "Up to 100 products",
                    "Basic analytics",
                    "Standard support",
                    "2.5% transaction fee"
                  ],
                  popular: false
                },
                {
                  name: "Professional",
                  price: "$299",
                  period: "/month",
                  description: "Most popular for growing companies",
                  features: [
                    "Up to 1,000 products",
                    "Advanced analytics",
                    "Priority support",
                    "API access",
                    "2.0% transaction fee"
                  ],
                  popular: true
                },
                {
                  name: "Enterprise",
                  price: "$999",
                  period: "/month",
                  description: "For large-scale operations",
                  features: [
                    "Unlimited products",
                    "Custom integrations",
                    "Dedicated account manager",
                    "White-label options",
                    "1.5% transaction fee"
                  ],
                  popular: false
                }
              ].map((plan, index) => (
                <div key={index} className={`bg-white rounded-lg shadow-lg p-8 relative ${plan.popular ? 'ring-2 ring-blue-600' : ''}`}>
                  {plan.popular && (
                    <div className="absolute top-0 left-1/2 transform -translate-x-1/2 -translate-y-1/2">
                      <span className="bg-blue-600 text-white px-4 py-1 rounded-full text-sm font-medium">
                        Most Popular
                      </span>
                    </div>
                  )}
                  <div className="text-center">
                    <h4 className="text-xl font-bold text-gray-900">{plan.name}</h4>
                    <p className="mt-2 text-gray-600">{plan.description}</p>
                    <div className="mt-4">
                      <span className="text-4xl font-bold text-gray-900">{plan.price}</span>
                      <span className="text-gray-600">{plan.period}</span>
                    </div>
                  </div>
                  <ul className="mt-6 space-y-3">
                    {plan.features.map((feature, featureIndex) => (
                      <li key={featureIndex} className="flex items-start">
                        <CheckIcon className="h-5 w-5 text-green-500 mt-0.5 mr-3 flex-shrink-0" />
                        <span className="text-gray-600">{feature}</span>
                      </li>
                    ))}
                  </ul>
                  <button className={`mt-8 w-full py-3 px-4 rounded-lg font-medium ${
                    plan.popular 
                      ? 'bg-blue-600 text-white hover:bg-blue-700' 
                      : 'bg-gray-100 text-gray-900 hover:bg-gray-200'
                  } transition-colors`}>
                    Get Started
                  </button>
                </div>
              ))}
            </div>
          </div>

          {/* Retailer Plans */}
          <div className="mt-16">
            <h3 className="text-2xl font-bold text-gray-900 text-center mb-8">For Retailers</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {[
                {
                  name: "Basic",
                  price: "Free",
                  period: "",
                  description: "Get started at no cost",
                  features: [
                    "Browse all products",
                    "Place orders",
                    "Basic messaging",
                    "Standard transaction fees"
                  ],
                  popular: false
                },
                {
                  name: "Plus",
                  price: "$29",
                  period: "/month",
                  description: "Enhanced features for growing retailers",
                  features: [
                    "Advanced search & filters",
                    "Purchase analytics",
                    "Bulk ordering tools",
                    "0.5% discount on transaction fees"
                  ],
                  popular: true
                },
                {
                  name: "Pro",
                  price: "$99",
                  period: "/month",
                  description: "Full-featured plan for serious buyers",
                  features: [
                    "AI recommendations",
                    "Inventory management",
                    "Credit line access",
                    "1.0% discount on transaction fees"
                  ],
                  popular: false
                }
              ].map((plan, index) => (
                <div key={index} className={`bg-white rounded-lg shadow-lg p-8 relative ${plan.popular ? 'ring-2 ring-blue-600' : ''}`}>
                  {plan.popular && (
                    <div className="absolute top-0 left-1/2 transform -translate-x-1/2 -translate-y-1/2">
                      <span className="bg-blue-600 text-white px-4 py-1 rounded-full text-sm font-medium">
                        Most Popular
                      </span>
                    </div>
                  )}
                  <div className="text-center">
                    <h4 className="text-xl font-bold text-gray-900">{plan.name}</h4>
                    <p className="mt-2 text-gray-600">{plan.description}</p>
                    <div className="mt-4">
                      <span className="text-4xl font-bold text-gray-900">{plan.price}</span>
                      <span className="text-gray-600">{plan.period}</span>
                    </div>
                  </div>
                  <ul className="mt-6 space-y-3">
                    {plan.features.map((feature, featureIndex) => (
                      <li key={featureIndex} className="flex items-start">
                        <CheckIcon className="h-5 w-5 text-green-500 mt-0.5 mr-3 flex-shrink-0" />
                        <span className="text-gray-600">{feature}</span>
                      </li>
                    ))}
                  </ul>
                  <button className={`mt-8 w-full py-3 px-4 rounded-lg font-medium ${
                    plan.popular 
                      ? 'bg-blue-600 text-white hover:bg-blue-700' 
                      : 'bg-gray-100 text-gray-900 hover:bg-gray-200'
                  } transition-colors`}>
                    {plan.price === "Free" ? "Start Free" : "Get Started"}
                  </button>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Value-Added Services */}
        <div className="mt-20">
          <div className="text-center">
            <h2 className="text-3xl font-bold text-gray-900">Value-Added Services</h2>
            <p className="mt-4 text-lg text-gray-600">
              Optional services to enhance your business operations
            </p>
          </div>

          <div className="mt-12 grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="bg-white rounded-lg shadow-md p-6">
              <h3 className="text-lg font-semibold text-gray-900">Financial Services</h3>
              <ul className="mt-4 space-y-2 text-gray-600">
                <li>• Invoice Financing: 1-3% of invoice value</li>
                <li>• Credit Lines: 12-24% APR</li>
                <li>• Payment Protection: 1% of transaction</li>
                <li>• Currency Conversion: 2-4% markup</li>
              </ul>
            </div>

            <div className="bg-white rounded-lg shadow-md p-6">
              <h3 className="text-lg font-semibold text-gray-900">Logistics Services</h3>
              <ul className="mt-4 space-y-2 text-gray-600">
                <li>• Shipping Labels: $0.50 markup per label</li>
                <li>• Warehousing: $2-5 per cubic foot/month</li>
                <li>• Fulfillment: $3-8 per order</li>
                <li>• Returns Processing: $5-15 per return</li>
              </ul>
            </div>

            <div className="bg-white rounded-lg shadow-md p-6">
              <h3 className="text-lg font-semibold text-gray-900">Marketing Services</h3>
              <ul className="mt-4 space-y-2 text-gray-600">
                <li>• Featured Placement: $100-500/month</li>
                <li>• Banner Advertising: $1,000-5,000/month</li>
                <li>• Email Marketing: $0.10-0.50 per email</li>
                <li>• SEO Optimization: $500-2,000/month</li>
              </ul>
            </div>
          </div>
        </div>

        {/* CTA */}
        <div className="mt-20 text-center">
          <div className="bg-blue-600 rounded-lg p-8">
            <h2 className="text-3xl font-bold text-white">Ready to Get Started?</h2>
            <p className="mt-4 text-xl text-blue-100">
              Join thousands of companies and retailers saving money on every transaction
            </p>
            <div className="mt-6 space-x-4">
              <button className="bg-white text-blue-600 px-6 py-3 rounded-lg font-medium hover:bg-gray-100 transition-colors">
                Start Free Trial
              </button>
              <button className="border border-white text-white px-6 py-3 rounded-lg font-medium hover:bg-blue-700 transition-colors">
                Contact Sales
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
