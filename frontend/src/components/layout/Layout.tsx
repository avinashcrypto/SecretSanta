import type { ReactNode } from 'react';
import { Header } from './Header';
import { Footer } from './Footer';

interface LayoutProps {
  children: ReactNode;
}

export function Layout({ children }: LayoutProps) {
  return (
    <div className="flex flex-col min-h-screen relative">
      {/* Snowflake decorations */}
      {[...Array(10)].map((_, i) => (
        <span key={i} className="snowflake" aria-hidden="true">
          ❄️
        </span>
      ))}

      <Header />
      <main className="flex-1 container mx-auto px-4 py-8 relative z-10">{children}</main>
      <Footer />
    </div>
  );
}
