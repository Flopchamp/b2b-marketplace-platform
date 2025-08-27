"use client";

import { usePathname } from "next/navigation";
import Link from "next/link";
import { 
  BuildingOfficeIcon,
  EnvelopeIcon,
  PhoneIcon,
  MapPinIcon
} from "@heroicons/react/24/outline";

export function Footer() {
  const pathname = usePathname();
  
  // Don't show footer on dashboard pages
  if (pathname.startsWith('/dashboard')) {
    return null;
  }
  const footerSections = [
    {
      title: "Platform",
      links: [
        { name: "Features", href: "#features" },
        { name: "How it Works", href: "#how-it-works" },
        { name: "Pricing", href: "/pricing" },
        { name: "API Documentation", href: "/docs" },
      ],
    },
    {
      title: "For Companies",
      links: [
        { name: "List Your Products", href: "/company/register" },
        { name: "Manage Inventory", href: "/company/features" },
        { name: "Analytics Dashboard", href: "/company/analytics" },
        { name: "Integration Guide", href: "/company/integration" },
      ],
    },
    {
      title: "For Retailers",
      links: [
        { name: "Find Suppliers", href: "/retailer/suppliers" },
        { name: "Order Management", href: "/retailer/orders" },
        { name: "Credit Solutions", href: "/retailer/credit" },
        { name: "Mobile App", href: "/retailer/mobile" },
      ],
    },
    {
      title: "Support",
      links: [
        { name: "Help Center", href: "/help" },
        { name: "Contact Us", href: "/contact" },
        { name: "Live Chat", href: "/chat" },
        { name: "Training", href: "/training" },
      ],
    },
    {
      title: "Company",
      links: [
        { name: "About Us", href: "/about" },
        { name: "Careers", href: "/careers" },
        { name: "Press", href: "/press" },
        { name: "Partners", href: "/partners" },
      ],
    },
  ];

  return (
    <footer className="bg-gray-900 text-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-6 gap-8">
          {/* Company Info */}
          <div className="lg:col-span-2">
            <div className="flex items-center space-x-2 mb-4">
              <div className="w-8 h-8 bg-gradient-to-r from-blue-600 to-purple-600 rounded-lg flex items-center justify-center">
                <BuildingOfficeIcon className="h-5 w-5 text-white" />
              </div>
              <span className="text-xl font-bold">B2B Connect</span>
            </div>
            <p className="text-gray-300 mb-6 max-w-sm">
              Revolutionizing B2B commerce by eliminating middlemen and connecting 
              companies directly with retailers through our comprehensive marketplace platform.
            </p>
            <div className="space-y-2 text-sm text-gray-300">
              <div className="flex items-center space-x-2">
                <MapPinIcon className="h-4 w-4" />
                <span>123 Business Street, City, Country</span>
              </div>
              <div className="flex items-center space-x-2">
                <PhoneIcon className="h-4 w-4" />
                <span>+1 (555) 123-4567</span>
              </div>
              <div className="flex items-center space-x-2">
                <EnvelopeIcon className="h-4 w-4" />
                <span>hello@b2bconnect.com</span>
              </div>
            </div>
          </div>

          {/* Footer Links */}
          {footerSections.map((section) => (
            <div key={section.title}>
              <h3 className="text-lg font-semibold mb-4">{section.title}</h3>
              <ul className="space-y-2">
                {section.links.map((link) => (
                  <li key={link.name}>
                    <Link
                      href={link.href}
                      className="text-gray-300 hover:text-white transition-colors text-sm"
                    >
                      {link.name}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        {/* Bottom Section */}
        <div className="border-t border-gray-800 mt-12 pt-8">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <div className="flex space-x-6 text-sm text-gray-300 mb-4 md:mb-0">
              <Link href="/privacy" className="hover:text-white transition-colors">
                Privacy Policy
              </Link>
              <Link href="/terms" className="hover:text-white transition-colors">
                Terms of Service
              </Link>
              <Link href="/security" className="hover:text-white transition-colors">
                Security
              </Link>
              <Link href="/cookies" className="hover:text-white transition-colors">
                Cookie Policy
              </Link>
            </div>
            <div className="text-sm text-gray-300">
               2025 B2B Connect. All rights reserved.
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}
