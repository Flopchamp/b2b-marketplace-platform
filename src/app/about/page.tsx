import { Metadata } from "next";
import { CheckIcon, TrendingUpIcon, UsersIcon, ShieldCheckIcon, GlobeIcon } from "lucide-react";

export const metadata: Metadata = {
  title: "About Us - DirectConnect B2B Marketplace",
  description: "Learn about DirectConnect's mission to eliminate middlemen and create direct connections between manufacturers and retailers.",
};

export default function AboutPage() {
  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hero Section */}
      <div className="bg-blue-600 text-white py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h1 className="text-4xl md:text-6xl font-bold">About DirectConnect</h1>
            <p className="mt-6 text-xl md:text-2xl text-blue-100 max-w-4xl mx-auto">
              Revolutionizing B2B commerce by creating direct, technology-enabled connections 
              between manufacturers and retailers.
            </p>
          </div>
        </div>
      </div>

      {/* Mission Section */}
      <div className="py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div>
              <h2 className="text-3xl font-bold text-gray-900">Our Mission</h2>
              <p className="mt-4 text-lg text-gray-600">
                We believe that middlemen add unnecessary costs and complexity to B2B commerce. 
                Our mission is to eliminate inefficient intermediaries by creating direct, 
                technology-enabled connections between manufacturers and retailers.
              </p>
              <p className="mt-4 text-lg text-gray-600">
                By reducing costs by 15-30% for retailers while increasing margins by 20-40% 
                for manufacturers, we create value for all participants in the supply chain.
              </p>
            </div>
            <div className="bg-white rounded-lg shadow-lg p-8">
              <h3 className="text-xl font-semibold text-gray-900 mb-6">Impact by Numbers</h3>
              <div className="space-y-4">
                <div className="flex justify-between">
                  <span className="text-gray-600">Cost Savings for Retailers</span>
                  <span className="font-bold text-green-600">15-30%</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Margin Increase for Manufacturers</span>
                  <span className="font-bold text-green-600">20-40%</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Target Market Size</span>
                  <span className="font-bold text-blue-600">$7.9T</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Platform Transaction Fee</span>
                  <span className="font-bold text-blue-600">1.5-2.5%</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Vision Section */}
      <div className="bg-white py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h2 className="text-3xl font-bold text-gray-900">Our Vision</h2>
            <p className="mt-4 text-lg text-gray-600 max-w-3xl mx-auto">
              Building the future of B2B commerce, one direct connection at a time.
            </p>
          </div>

          <div className="mt-12 grid grid-cols-1 md:grid-cols-4 gap-8">
            {[
              {
                icon: TrendingUpIcon,
                title: "Growth-Focused",
                description: "Enabling sustainable growth for both manufacturers and retailers through direct relationships."
              },
              {
                icon: UsersIcon,
                title: "User-Centric",
                description: "Every feature serves real user needs, creating value for all participants in our marketplace."
              },
              {
                icon: ShieldCheckIcon,
                title: "Trust & Security",
                description: "Enterprise-grade security and verification processes ensure safe, reliable transactions."
              },
              {
                icon: GlobeIcon,
                title: "Global Scale",
                description: "Building a worldwide network of direct B2B connections across all industries."
              }
            ].map((value, index) => (
              <div key={index} className="text-center">
                <div className="inline-flex items-center justify-center w-16 h-16 bg-blue-100 rounded-lg">
                  <value.icon className="h-8 w-8 text-blue-600" />
                </div>
                <h3 className="mt-4 text-lg font-semibold text-gray-900">{value.title}</h3>
                <p className="mt-2 text-gray-600">{value.description}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Problem & Solution */}
      <div className="py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
            {/* Problem */}
            <div className="bg-red-50 rounded-lg p-8">
              <h2 className="text-2xl font-bold text-gray-900 mb-6">The Problem</h2>
              <div className="space-y-4">
                {[
                  "Traditional distributors add 25-50% markup to products",
                  "Retailers have limited access to diverse product ranges",
                  "60-90 day payment terms strain cash flow",
                  "Hidden pricing and lack of transparency",
                  "Dependence on distributor relationships creates risk"
                ].map((problem, index) => (
                  <div key={index} className="flex items-start">
                    <div className="w-2 h-2 bg-red-500 rounded-full mt-3 mr-3 flex-shrink-0"></div>
                    <p className="text-gray-700">{problem}</p>
                  </div>
                ))}
              </div>
            </div>

            {/* Solution */}
            <div className="bg-green-50 rounded-lg p-8">
              <h2 className="text-2xl font-bold text-gray-900 mb-6">Our Solution</h2>
              <div className="space-y-4">
                {[
                  "Direct connections eliminate distributor markups",
                  "Access to global network of verified manufacturers",
                  "Faster payments and flexible terms (15-30 days)",
                  "Transparent pricing and real-time inventory",
                  "Technology-enabled trust and verification systems"
                ].map((solution, index) => (
                  <div key={index} className="flex items-start">
                    <CheckIcon className="h-5 w-5 text-green-500 mt-0.5 mr-3 flex-shrink-0" />
                    <p className="text-gray-700">{solution}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Market Validation */}
      <div className="bg-white py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h2 className="text-3xl font-bold text-gray-900">Market Validation</h2>
            <p className="mt-4 text-lg text-gray-600">
              Extensive research validates the need for our platform
            </p>
          </div>

          <div className="mt-12 grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="text-center">
              <div className="text-4xl font-bold text-blue-600">125</div>
              <div className="text-sm text-gray-600 mt-2">Customer Interviews</div>
              <p className="mt-4 text-gray-600">
                In-depth interviews with manufacturers and retailers across multiple industries
              </p>
            </div>
            
            <div className="text-center">
              <div className="text-4xl font-bold text-blue-600">1,247</div>
              <div className="text-sm text-gray-600 mt-2">Survey Responses</div>
              <p className="mt-4 text-gray-600">
                Comprehensive market research validating pain points and willingness to adopt
              </p>
            </div>
            
            <div className="text-center">
              <div className="text-4xl font-bold text-blue-600">73%</div>
              <div className="text-sm text-gray-600 mt-2">Willing to Switch</div>
              <p className="mt-4 text-gray-600">
                Of surveyed businesses are open to trying a new B2B marketplace platform
              </p>
            </div>
          </div>

          {/* Key Findings */}
          <div className="mt-12 bg-gray-50 rounded-lg p-8">
            <h3 className="text-xl font-semibold text-gray-900 mb-6">Key Research Findings</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <h4 className="font-medium text-gray-900">For Manufacturers:</h4>
                <ul className="mt-2 space-y-1 text-gray-600">
                  <li>• 88% struggle with distributor margins eating profits</li>
                  <li>• 76% want direct retailer relationships</li>
                  <li>• 92% interested in better market insights</li>
                </ul>
              </div>
              <div>
                <h4 className="font-medium text-gray-900">For Retailers:</h4>
                <ul className="mt-2 space-y-1 text-gray-600">
                  <li>• 94% cite high wholesale costs as top challenge</li>
                  <li>• 82% want access to more diverse products</li>
                  <li>• 89% interested in direct manufacturer relationships</li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Technology */}
      <div className="py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h2 className="text-3xl font-bold text-gray-900">Our Technology</h2>
            <p className="mt-4 text-lg text-gray-600">
              Built with modern, scalable technology for enterprise performance
            </p>
          </div>

          <div className="mt-12 grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="bg-white rounded-lg shadow-md p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Frontend</h3>
              <ul className="space-y-2 text-gray-600">
                <li>• Next.js 14 with App Router</li>
                <li>• TypeScript for type safety</li>
                <li>• Tailwind CSS for responsive design</li>
                <li>• Real-time updates</li>
              </ul>
            </div>

            <div className="bg-white rounded-lg shadow-md p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Backend</h3>
              <ul className="space-y-2 text-gray-600">
                <li>• PostgreSQL database</li>
                <li>• Prisma ORM</li>
                <li>• GraphQL + REST APIs</li>
                <li>• Microservices architecture</li>
              </ul>
            </div>

            <div className="bg-white rounded-lg shadow-md p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Infrastructure</h3>
              <ul className="space-y-2 text-gray-600">
                <li>• Cloud-native deployment</li>
                <li>• 99.9% uptime SLA</li>
                <li>• Enterprise security</li>
                <li>• Global CDN</li>
              </ul>
            </div>
          </div>
        </div>
      </div>

      {/* Timeline */}
      <div className="bg-white py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h2 className="text-3xl font-bold text-gray-900">Our Journey</h2>
            <p className="mt-4 text-lg text-gray-600">
              From concept to platform, building the future of B2B commerce
            </p>
          </div>

          <div className="mt-12">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
              {[
                {
                  phase: "Phase 1",
                  title: "Research & Validation",
                  period: "Q1-Q2 2025",
                  description: "Market research, customer interviews, and prototype development"
                },
                {
                  phase: "Phase 2",
                  title: "MVP Development",
                  period: "Q3-Q4 2025",
                  description: "Core platform features, beta testing, and initial user onboarding"
                },
                {
                  phase: "Phase 3",
                  title: "Market Launch",
                  period: "Q1 2026",
                  description: "Public launch, marketing campaigns, and user acquisition"
                },
                {
                  phase: "Phase 4",
                  title: "Scale & Expand",
                  period: "Q2+ 2026",
                  description: "Geographic expansion, new features, and strategic partnerships"
                }
              ].map((milestone, index) => (
                <div key={index} className="relative">
                  <div className="bg-blue-100 rounded-lg p-6">
                    <div className="text-sm font-medium text-blue-600 mb-2">{milestone.phase}</div>
                    <h3 className="text-lg font-semibold text-gray-900">{milestone.title}</h3>
                    <div className="text-sm text-gray-600 mt-2">{milestone.period}</div>
                    <p className="text-gray-600 mt-3">{milestone.description}</p>
                  </div>
                  {index < 3 && (
                    <div className="hidden md:block absolute top-1/2 right-0 transform translate-x-1/2 -translate-y-1/2">
                      <div className="w-8 h-0.5 bg-blue-300"></div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* CTA */}
      <div className="py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="bg-blue-600 rounded-lg p-8 text-center">
            <h2 className="text-3xl font-bold text-white">Join the Revolution</h2>
            <p className="mt-4 text-xl text-blue-100">
              Be part of the future of B2B commerce. Connect directly and save money.
            </p>
            <div className="mt-6 space-x-4">
              <a
                href="/auth/signin"
                className="inline-block bg-white text-blue-600 px-6 py-3 rounded-lg font-medium hover:bg-gray-100 transition-colors"
              >
                Get Started Free
              </a>
              <a
                href="/contact"
                className="inline-block border border-white text-white px-6 py-3 rounded-lg font-medium hover:bg-blue-700 transition-colors"
              >
                Contact Us
              </a>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
