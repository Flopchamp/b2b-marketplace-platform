"use client";

import { usePathname } from 'next/navigation';
import { Header } from './Header';
import { Footer } from './Footer';

export function ConditionalLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  
  // Check if we're on a dashboard page
  const isDashboard = pathname.startsWith('/dashboard');
  
  if (isDashboard) {
    // Dashboard pages handle their own layout
    return <>{children}</>;
  }
  
  // Default layout for all other pages
  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <main className="flex-1">
        {children}
      </main>
      <Footer />
    </div>
  );
}
