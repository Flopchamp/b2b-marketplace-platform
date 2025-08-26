import { Metadata } from "next";
import { ArrowRightIcon, CheckIcon, ShoppingCartIcon, TrendingDownIcon, CreditCardIcon, SearchIcon } from "lucide-react";

export const metadata: Metadata = {
  title: "For Retailers - DirectConnect B2B Marketplace",
  description: "Save 15-30% on procurement costs by buying directly from manufacturers. Access thousands of products with flexible payment terms.",
};

export default function RetailersPage() {
  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hero Section */}
      <div className="bg-green-600 text-white py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div>
              <h1 className="text-4xl md:text-6xl font-bold">
                Buy Direct.
                <br />
                <span className="text-green-200">Save More.</span>
              </h1>
              <p className="mt-6 text-xl text-green-100">
                Eliminate distributor markups and save 15-30% on procurement costs. 
                Access thousands of products directly from verified manufacturers.
              </p>
              <div className="mt-8 flex flex-col sm:flex-row gap-4">
                <a
                  href="/auth/signin?type=retailer"
                  className="inline-flex items-center justify-center bg-white text-green-600 px-6 py-3 rounded-lg font-medium hover:bg-gray-100 transition-colors"
                >
                  Start Shopping
                  <ArrowRightIcon className="ml-2 h-5 w-5" />
                </a>
                <a
                  href="/contact"
                  className="inline-flex items-center justify-center border border-white text-white px-6 py-3 rounded-lg font-medium hover:bg-green-700 transition-colors"
                >
                  Request Demo
                </a>
              </div>
            </div>
            <div className="bg-white/10 backdrop-blur-sm rounded-lg p-8">
              <h3 className="text-xl font-semibold mb-6">Why Retailers Choose DirectConnect</h3>
              <div className="space-y-4">
                <div className="flex items-center">
                  <CheckIcon className="h-5 w-5 text-green-400 mr-3" />
                  <span>15-30% cost savings</span>
                </div>
                <div className="flex items-center">
                  <CheckIcon className="h-5 w-5 text-green-400 mr-3" />
                  <span>Access to 10,000+ products</span>
                </div>
                <div className="flex items-center">
                  <CheckIcon className="h-5 w-5 text-green-400 mr-3" />
                  <span>Flexible payment terms</span>
                </div>
                <div className="flex items-center">
                  <CheckIcon className="h-5 w-5 text-green-400 mr-3" />
                  <span>No minimum order requirements</span>
                </div>
                <div className="flex items-center">
                  <CheckIcon className="h-5 w-5 text-green-400 mr-3" />
                  <span>Direct manufacturer relationships</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Benefits Section */}
      <div className="py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h2 className="text-3xl font-bold text-gray-900">Why Retailers Love DirectConnect</h2>
            <p className="mt-4 text-lg text-gray-600 max-w-3xl mx-auto">
              Break free from distributor constraints and unlock better pricing and selection
            </p>
          </div>

          <div className="mt-12 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {[
              {
                icon: TrendingDownIcon,
                title: "Lower Costs",
                description: "Save 15-30% on procurement by eliminating distributor markups. Pay only a small platform fee.",
                stat: "15-30% savings"
              },
              {
                icon: ShoppingCartIcon,
                title: "More Products",
                description: "Access thousands of products from verified manufacturers across multiple categories.",
                stat: "10,000+ products"
              },
              {
                icon: CreditCardIcon,
                title: "Flexible Terms",
                description: "Enjoy better payment terms and credit options tailored to your business needs.",
                stat: "Net 30+ terms"
              },
              {
                icon: SearchIcon,
                title: "Easy Discovery",
                description: "Find exactly what you need with advanced search, filters, and AI-powered recommendations.",
                stat: "Smart search"
              }
            ].map((benefit, index) => (
              <div key={index} className="bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition-shadow">
                <div className="inline-flex items-center justify-center w-12 h-12 bg-green-100 rounded-lg">
                  <benefit.icon className="h-6 w-6 text-green-600" />
                </div>
                <h3 className="mt-4 text-xl font-semibold text-gray-900">{benefit.title}</h3>
                <p className="mt-2 text-gray-600">{benefit.description}</p>
                <div className="mt-4 text-green-600 font-semibold">{benefit.stat}</div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Cost Comparison */}
      <div className="bg-white py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h2 className="text-3xl font-bold text-gray-900">See How Much You Can Save</h2>
            <p className="mt-4 text-lg text-gray-600">
              Compare traditional wholesale pricing with DirectConnect
            </p>
          </div>

          <div className="mt-12 bg-gray-50 rounded-lg p-8">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              {/* Traditional Wholesale */}
              <div className="bg-red-50 rounded-lg p-6">
                <h3 className="text-xl font-semibold text-red-800 mb-6">Traditional Wholesale</h3>
                <div className="space-y-4">
                  {[
                    "25-50% distributor markup",
                    "Limited product selection",
                    "High minimum order quantities",
                    "60-90 day payment terms",
                    "No direct manufacturer contact",
                    "Regional availability only",
                    "Hidden fees and costs"
                  ].map((item, index) => (
                    <div key={index} className="flex items-start">
                      <div className="w-2 h-2 bg-red-500 rounded-full mt-3 mr-3 flex-shrink-0"></div>
                      <span className="text-red-800">{item}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* DirectConnect */}
              <div className="bg-green-50 rounded-lg p-6">
                <h3 className="text-xl font-semibold text-green-800 mb-6">DirectConnect Platform</h3>
                <div className="space-y-4">
                  {[
                    "Manufacturer pricing + small fee",
                    "Thousands of products available",
                    "Flexible order quantities",
                    "Net 15-30 payment terms",
                    "Direct manufacturer relationships",
                    "Global product sourcing",
                    "Transparent, upfront pricing"
                  ].map((item, index) => (
                    <div key={index} className="flex items-start">
                      <CheckIcon className="h-5 w-5 text-green-500 mt-0.5 mr-3 flex-shrink-0" />
                      <span className="text-green-800">{item}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Savings Calculator */}
            <div className="mt-8 bg-white rounded-lg p-6 border-2 border-green-200">
              <h3 className="text-xl font-semibold text-gray-900 mb-4">Monthly Savings Example</h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-center">
                <div>
                  <div className="text-2xl font-bold text-red-600">$10,000</div>
                  <div className="text-sm text-gray-600">Traditional Wholesale Cost</div>
                  <div className="text-sm text-red-600 mt-1">($7,500 product + $2,500 markup)</div>
                </div>
                <div className="flex items-center justify-center">
                  <ArrowRightIcon className="h-8 w-8 text-green-600" />
                </div>
                <div>
                  <div className="text-2xl font-bold text-green-600">$7,650</div>
                  <div className="text-sm text-gray-600">DirectConnect Cost</div>
                  <div className="text-sm text-green-600 mt-1">($7,500 product + $150 platform fee)</div>
                </div>
              </div>
              <div className="mt-6 text-center">
                <div className="text-3xl font-bold text-green-600">$2,350/month</div>
                <div className="text-gray-600">Monthly savings with DirectConnect</div>
                <div className="text-xl font-bold text-green-600 mt-2">$28,200/year savings</div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Product Categories */}
      <div className="py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h2 className="text-3xl font-bold text-gray-900">Shop from Top Categories</h2>
            <p className="mt-4 text-lg text-gray-600">
              Discover products across multiple industries and categories
            </p>
          </div>

          <div className="mt-12 grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-6">
            {[
              { name: "Electronics", count: "2,500+ products", image: "📱" },
              { name: "Fashion", count: "1,800+ products", image: "👔" },
              { name: "Home & Garden", count: "3,200+ products", image: "🏠" },
              { name: "Sports & Outdoors", count: "1,200+ products", image: "⚽" },
              { name: "Beauty & Health", count: "950+ products", image: "💄" },
              { name: "Automotive", count: "1,500+ products", image: "🚗" }
            ].map((category, index) => (
              <div key={index} className="bg-white rounded-lg shadow-md p-4 text-center hover:shadow-lg transition-shadow cursor-pointer">
                <div className="text-4xl mb-3">{category.image}</div>
                <h3 className="font-semibold text-gray-900">{category.name}</h3>
                <p className="text-sm text-gray-600 mt-1">{category.count}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Features Section */}
      <div className="bg-white py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h2 className="text-3xl font-bold text-gray-900">Platform Features for Retailers</h2>
            <p className="mt-4 text-lg text-gray-600">
              Everything you need to streamline your procurement process
            </p>
          </div>

          <div className="mt-12 grid grid-cols-1 md:grid-cols-2 gap-8">
            {[
              {
                title: "Smart Product Discovery",
                features: [
                  "Advanced search and filtering",
                  "AI-powered product recommendations",
                  "Category-based browsing",
                  "Supplier verification badges",
                  "Real-time availability updates"
                ]
              },
              {
                title: "Streamlined Ordering",
                features: [
                  "One-click reordering",
                  "Bulk order management",
                  "Custom pricing negotiations",
                  "Order tracking and updates",
                  "Digital invoicing"
                ]
              },
              {
                title: "Business Intelligence",
                features: [
                  "Purchase history analytics",
                  "Spending insights and reports",
                  "Supplier performance metrics",
                  "Market price comparisons",
                  "Demand forecasting"
                ]
              },
              {
                title: "Financial Tools",
                features: [
                  "Flexible payment options",
                  "Credit line applications",
                  "Invoice financing",
                  "Expense categorization",
                  "Tax reporting assistance"
                ]
              }
            ].map((feature, index) => (
              <div key={index} className="bg-gray-50 rounded-lg p-6">
                <h3 className="text-xl font-semibold text-gray-900 mb-4">{feature.title}</h3>
                <ul className="space-y-2">
                  {feature.features.map((item, itemIndex) => (
                    <li key={itemIndex} className="flex items-start">
                      <CheckIcon className="h-5 w-5 text-green-500 mt-0.5 mr-3 flex-shrink-0" />
                      <span className="text-gray-600">{item}</span>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Success Stories */}
      <div className="py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h2 className="text-3xl font-bold text-gray-900">Retailer Success Stories</h2>
            <p className="mt-4 text-lg text-gray-600">
              See how retailers are saving money and growing their businesses
            </p>
          </div>

          <div className="mt-12 grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              {
                business: "Metro Electronics Store",
                type: "Electronics Retailer",
                results: "22% cost reduction, 40% more suppliers",
                quote: "DirectConnect opened up a world of suppliers we never had access to. Our margins improved significantly and we can offer more variety to customers."
              },
              {
                business: "Boutique Fashion Hub",
                type: "Fashion Retailer",
                results: "18% savings, exclusive products",
                quote: "We found unique fashion brands that our competitors don't have access to. The direct relationships with designers have been game-changing."
              },
              {
                business: "Home & Garden Plus",
                type: "Home Goods Retailer",
                results: "25% cost savings, faster restocking",
                quote: "No more waiting for distributors. We order directly from manufacturers and get our inventory faster while paying significantly less."
              }
            ].map((story, index) => (
              <div key={index} className="bg-white rounded-lg shadow-md p-6">
                <div className="text-green-600 font-semibold">{story.business}</div>
                <div className="text-sm text-gray-600 mt-1">{story.type}</div>
                <div className="text-lg font-semibold text-blue-600 mt-4">{story.results}</div>
                <p className="text-gray-600 mt-4 italic">&ldquo;{story.quote}&rdquo;</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Getting Started */}
      <div className="bg-white py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h2 className="text-3xl font-bold text-gray-900">Start Shopping in 3 Easy Steps</h2>
            <p className="mt-4 text-lg text-gray-600">
              Join thousands of retailers already saving money
            </p>
          </div>

          <div className="mt-12 grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              {
                step: "1",
                title: "Create Your Account",
                description: "Sign up for free and complete our quick business verification. Start browsing immediately while verification is in progress."
              },
              {
                step: "2",
                title: "Browse & Compare",
                description: "Explore thousands of products from verified manufacturers. Compare prices, read reviews, and contact suppliers directly."
              },
              {
                step: "3",
                title: "Order & Save",
                description: "Place your first order and start saving immediately. Enjoy flexible payment terms and direct manufacturer relationships."
              }
            ].map((step, index) => (
              <div key={index} className="text-center">
                <div className="inline-flex items-center justify-center w-16 h-16 bg-green-600 text-white rounded-full text-xl font-bold">
                  {step.step}
                </div>
                <h3 className="mt-4 text-xl font-semibold text-gray-900">{step.title}</h3>
                <p className="mt-2 text-gray-600">{step.description}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Pricing Plans */}
      <div className="py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h2 className="text-3xl font-bold text-gray-900">Choose Your Plan</h2>
            <p className="mt-4 text-lg text-gray-600">
              Flexible options to fit your business needs
            </p>
          </div>

          <div className="mt-12 grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              {
                name: "Basic",
                price: "Free",
                period: "Forever",
                description: "Perfect for getting started",
                features: [
                  "Browse all products",
                  "Place unlimited orders",
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
              <div key={index} className={`bg-white rounded-lg shadow-lg p-8 relative ${plan.popular ? 'ring-2 ring-green-600' : ''}`}>
                {plan.popular && (
                  <div className="absolute top-0 left-1/2 transform -translate-x-1/2 -translate-y-1/2">
                    <span className="bg-green-600 text-white px-4 py-1 rounded-full text-sm font-medium">
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
                    ? 'bg-green-600 text-white hover:bg-green-700' 
                    : 'bg-gray-100 text-gray-900 hover:bg-gray-200'
                } transition-colors`}>
                  {plan.price === "Free" ? "Start Free" : "Get Started"}
                </button>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* CTA */}
      <div className="bg-green-600 py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl font-bold text-white">Ready to Start Saving?</h2>
          <p className="mt-4 text-xl text-green-100">
            Join thousands of retailers already benefiting from direct manufacturer relationships
          </p>
          <div className="mt-8 flex flex-col sm:flex-row justify-center gap-4">
            <a
              href="/auth/signin?type=retailer"
              className="inline-flex items-center justify-center bg-white text-green-600 px-8 py-3 rounded-lg font-medium hover:bg-gray-100 transition-colors"
            >
              Start Shopping Free
              <ArrowRightIcon className="ml-2 h-5 w-5" />
            </a>
            <a
              href="/contact"
              className="inline-flex items-center justify-center border border-white text-white px-8 py-3 rounded-lg font-medium hover:bg-green-700 transition-colors"
            >
              Request Demo
            </a>
          </div>
          <p className="mt-4 text-green-200 text-sm">
            Free to join • No monthly fees on Basic plan • Cancel anytime
          </p>
        </div>
      </div>
    </div>
  );
}
