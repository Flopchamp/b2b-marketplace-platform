import { Metadata } from "next";
import { ArrowRightIcon, CheckIcon, TrendingUpIcon, BarChart3Icon, ShieldCheckIcon, ClockIcon } from "lucide-react";

export const metadata: Metadata = {
  title: "For Companies - DirectConnect B2B Marketplace",
  description: "Increase your margins by 20-40% and build direct relationships with retailers. Eliminate distributor markups and expand your market reach.",
};

export default function CompaniesPage() {
  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hero Section */}
      <div className="bg-blue-600 text-white py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div>
              <h1 className="text-4xl md:text-6xl font-bold">
                Sell Direct.
                <br />
                <span className="text-blue-200">Earn More.</span>
              </h1>
              <p className="mt-6 text-xl text-blue-100">
                Eliminate distributor markups and increase your margins by 20-40%. 
                Connect directly with retailers and build lasting business relationships.
              </p>
              <div className="mt-8 flex flex-col sm:flex-row gap-4">
                <a
                  href="/auth/signin?type=company"
                  className="inline-flex items-center justify-center bg-white text-blue-600 px-6 py-3 rounded-lg font-medium hover:bg-gray-100 transition-colors"
                >
                  Start Selling
                  <ArrowRightIcon className="ml-2 h-5 w-5" />
                </a>
                <a
                  href="/contact"
                  className="inline-flex items-center justify-center border border-white text-white px-6 py-3 rounded-lg font-medium hover:bg-blue-700 transition-colors"
                >
                  Schedule Demo
                </a>
              </div>
            </div>
            <div className="bg-white/10 backdrop-blur-sm rounded-lg p-8">
              <h3 className="text-xl font-semibold mb-6">Why Companies Choose DirectConnect</h3>
              <div className="space-y-4">
                <div className="flex items-center">
                  <CheckIcon className="h-5 w-5 text-green-400 mr-3" />
                  <span>20-40% margin increase</span>
                </div>
                <div className="flex items-center">
                  <CheckIcon className="h-5 w-5 text-green-400 mr-3" />
                  <span>Direct retailer relationships</span>
                </div>
                <div className="flex items-center">
                  <CheckIcon className="h-5 w-5 text-green-400 mr-3" />
                  <span>Faster payment cycles (15-30 days)</span>
                </div>
                <div className="flex items-center">
                  <CheckIcon className="h-5 w-5 text-green-400 mr-3" />
                  <span>Real-time market insights</span>
                </div>
                <div className="flex items-center">
                  <CheckIcon className="h-5 w-5 text-green-400 mr-3" />
                  <span>Global market reach</span>
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
            <h2 className="text-3xl font-bold text-gray-900">Why Manufacturers Choose DirectConnect</h2>
            <p className="mt-4 text-lg text-gray-600 max-w-3xl mx-auto">
              Break free from distributor constraints and unlock your business potential
            </p>
          </div>

          <div className="mt-12 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {[
              {
                icon: TrendingUpIcon,
                title: "Increased Margins",
                description: "Eliminate 25-50% distributor markups and keep more of your revenue. Our 1.5-2.5% platform fee means significant savings.",
                stat: "20-40% margin increase"
              },
              {
                icon: BarChart3Icon,
                title: "Market Insights",
                description: "Access real-time demand data, pricing analytics, and customer behavior insights to optimize your business strategy.",
                stat: "Real-time analytics"
              },
              {
                icon: ShieldCheckIcon,
                title: "Verified Buyers",
                description: "All retailers go through our KYC process. Trade with confidence knowing your buyers are legitimate businesses.",
                stat: "100% verified retailers"
              },
              {
                icon: ClockIcon,
                title: "Faster Payments",
                description: "Reduce payment cycles from 60-90 days to just 15-30 days. Improve your cash flow significantly.",
                stat: "15-30 day payments"
              }
            ].map((benefit, index) => (
              <div key={index} className="bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition-shadow">
                <div className="inline-flex items-center justify-center w-12 h-12 bg-blue-100 rounded-lg">
                  <benefit.icon className="h-6 w-6 text-blue-600" />
                </div>
                <h3 className="mt-4 text-xl font-semibold text-gray-900">{benefit.title}</h3>
                <p className="mt-2 text-gray-600">{benefit.description}</p>
                <div className="mt-4 text-blue-600 font-semibold">{benefit.stat}</div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Comparison Section */}
      <div className="bg-white py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h2 className="text-3xl font-bold text-gray-900">Traditional vs. DirectConnect</h2>
            <p className="mt-4 text-lg text-gray-600">
              See how much you can save by eliminating middlemen
            </p>
          </div>

          <div className="mt-12 bg-gray-50 rounded-lg p-8">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              {/* Traditional */}
              <div className="bg-red-50 rounded-lg p-6">
                <h3 className="text-xl font-semibold text-red-800 mb-6">Traditional Distribution</h3>
                <div className="space-y-4">
                  {[
                    "25-50% distributor markup",
                    "60-90 day payment terms",
                    "Limited market insights",
                    "No direct customer relationships",
                    "Geographic restrictions",
                    "Inventory holding costs",
                    "Risk of distributor dependency"
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
                    "1.5-2.5% platform fee only",
                    "15-30 day payment terms",
                    "Real-time market analytics",
                    "Direct retailer relationships",
                    "Global market access",
                    "No inventory requirements",
                    "Diversified customer base"
                  ].map((item, index) => (
                    <div key={index} className="flex items-start">
                      <CheckIcon className="h-5 w-5 text-green-500 mt-0.5 mr-3 flex-shrink-0" />
                      <span className="text-green-800">{item}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* ROI Calculator */}
            <div className="mt-8 bg-white rounded-lg p-6 border-2 border-blue-200">
              <h3 className="text-xl font-semibold text-gray-900 mb-4">Potential Savings Calculator</h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-center">
                <div>
                  <div className="text-2xl font-bold text-red-600">$100K</div>
                  <div className="text-sm text-gray-600">Monthly Sales via Distributors</div>
                  <div className="text-lg text-red-600 mt-2">-$35K distributor markup</div>
                </div>
                <div className="flex items-center justify-center">
                  <ArrowRightIcon className="h-8 w-8 text-blue-600" />
                </div>
                <div>
                  <div className="text-2xl font-bold text-green-600">$100K</div>
                  <div className="text-sm text-gray-600">Same Sales via DirectConnect</div>
                  <div className="text-lg text-green-600 mt-2">-$2K platform fee</div>
                </div>
              </div>
              <div className="mt-6 text-center">
                <div className="text-3xl font-bold text-green-600">+$33K/month</div>
                <div className="text-gray-600">Additional profit with DirectConnect</div>
                <div className="text-xl font-bold text-green-600 mt-2">$396K/year savings</div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Features Section */}
      <div className="py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h2 className="text-3xl font-bold text-gray-900">Platform Features for Companies</h2>
            <p className="mt-4 text-lg text-gray-600">
              Everything you need to manage and grow your B2B sales
            </p>
          </div>

          <div className="mt-12 grid grid-cols-1 md:grid-cols-2 gap-8">
            {[
              {
                title: "Product Catalog Management",
                features: [
                  "Unlimited product listings",
                  "Rich media support (images, videos, docs)",
                  "Dynamic pricing and bulk discounts",
                  "Real-time inventory sync",
                  "SEO-optimized product pages"
                ]
              },
              {
                title: "Order Management",
                features: [
                  "Automated order processing",
                  "Custom approval workflows",
                  "Shipping integration",
                  "Order tracking and updates",
                  "Invoice generation"
                ]
              },
              {
                title: "Customer Relationship Tools",
                features: [
                  "Direct messaging with retailers",
                  "Customer profile management",
                  "Order history and analytics",
                  "Custom pricing for VIP customers",
                  "Communication templates"
                ]
              },
              {
                title: "Analytics & Reporting",
                features: [
                  "Sales performance dashboards",
                  "Customer behavior insights",
                  "Inventory turnover reports",
                  "Market demand forecasting",
                  "Custom report generation"
                ]
              }
            ].map((feature, index) => (
              <div key={index} className="bg-white rounded-lg shadow-md p-6">
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
      <div className="bg-white py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h2 className="text-3xl font-bold text-gray-900">Success Stories</h2>
            <p className="mt-4 text-lg text-gray-600">
              See how companies like yours are thriving on DirectConnect
            </p>
          </div>

          <div className="mt-12 grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              {
                company: "TechGear Manufacturing",
                industry: "Electronics",
                results: "+35% margins, 200+ new retailers",
                quote: "DirectConnect eliminated our distributor dependency. We now have direct relationships with retailers across 15 states and our margins have increased by 35%."
              },
              {
                company: "Urban Fashion Co.",
                industry: "Apparel",
                results: "+28% revenue, 50% faster payments",
                quote: "The platform helped us reach boutique stores we never could access through traditional channels. Our cash flow improved dramatically."
              },
              {
                company: "HomeStyle Products",
                industry: "Home Goods",
                results: "+42% profit, global expansion",
                quote: "We went from regional to international sales in 6 months. The analytics helped us identify high-demand products and optimize pricing."
              }
            ].map((story, index) => (
              <div key={index} className="bg-gray-50 rounded-lg p-6">
                <div className="text-blue-600 font-semibold">{story.company}</div>
                <div className="text-sm text-gray-600 mt-1">{story.industry}</div>
                <div className="text-lg font-semibold text-green-600 mt-4">{story.results}</div>
                <p className="text-gray-600 mt-4 italic">"{story.quote}"</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Getting Started */}
      <div className="py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h2 className="text-3xl font-bold text-gray-900">Get Started in 3 Simple Steps</h2>
            <p className="mt-4 text-lg text-gray-600">
              Join thousands of companies already selling on DirectConnect
            </p>
          </div>

          <div className="mt-12 grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              {
                step: "1",
                title: "Sign Up & Verify",
                description: "Create your company account and complete our quick verification process. Most companies are approved within 24-48 hours."
              },
              {
                step: "2",
                title: "Create Your Catalog",
                description: "Upload your products with our easy-to-use tools. Add descriptions, images, pricing, and inventory levels."
              },
              {
                step: "3",
                title: "Start Selling",
                description: "Connect with verified retailers, receive orders, and start earning higher margins immediately."
              }
            ].map((step, index) => (
              <div key={index} className="text-center">
                <div className="inline-flex items-center justify-center w-16 h-16 bg-blue-600 text-white rounded-full text-xl font-bold">
                  {step.step}
                </div>
                <h3 className="mt-4 text-xl font-semibold text-gray-900">{step.title}</h3>
                <p className="mt-2 text-gray-600">{step.description}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* CTA */}
      <div className="bg-blue-600 py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl font-bold text-white">Ready to Increase Your Margins?</h2>
          <p className="mt-4 text-xl text-blue-100">
            Join thousands of companies already saving money and building direct relationships
          </p>
          <div className="mt-8 flex flex-col sm:flex-row justify-center gap-4">
            <a
              href="/auth/signin?type=company"
              className="inline-flex items-center justify-center bg-white text-blue-600 px-8 py-3 rounded-lg font-medium hover:bg-gray-100 transition-colors"
            >
              Start Selling Today
              <ArrowRightIcon className="ml-2 h-5 w-5" />
            </a>
            <a
              href="/contact"
              className="inline-flex items-center justify-center border border-white text-white px-8 py-3 rounded-lg font-medium hover:bg-blue-700 transition-colors"
            >
              Schedule Demo
            </a>
          </div>
          <p className="mt-4 text-blue-200 text-sm">
            No setup fees • 14-day free trial • Cancel anytime
          </p>
        </div>
      </div>
    </div>
  );
}
