// Dashboard pages handle their own layout in the ConditionalLayout component
// This file is kept for potential dashboard-specific metadata or other configurations

import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Dashboard - B2B Marketplace Platform",
  description: "Manage your B2B marketplace account",
};

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  // No wrapper needed - ConditionalLayout handles this
  return <>{children}</>;
}
