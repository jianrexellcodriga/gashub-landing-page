import React from 'react';
import Link from 'next/link';
import AppLogo from '@/components/ui/AppLogo';

export default function Footer() {
  return (
    <footer className="border-t border-border bg-white">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 py-8">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          {/* Logo + Copyright */}
          <div className="flex flex-col gap-1">
            <div className="flex items-center gap-2">
              <AppLogo size={24} />
              <span className="font-bold text-base text-foreground">GasHub</span>
            </div>
            <p className="text-caption text-muted-foreground">
              © 2026 GasHub Sjp2cd Capstone System. All rights reserved.
            </p>
          </div>

          {/* Links */}
          <nav className="flex items-center gap-6" aria-label="Footer navigation">
            <Link
              href="/privacy"
              className="text-body-sm font-medium text-muted-foreground hover:text-foreground transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-primary rounded min-h-[44px] flex items-center"
            >
              Privacy Policy
            </Link>
            <Link
              href="/terms"
              className="text-body-sm font-medium text-muted-foreground hover:text-foreground transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-primary rounded min-h-[44px] flex items-center"
            >
              Terms
            </Link>
          </nav>
        </div>
      </div>
    </footer>
  );
}