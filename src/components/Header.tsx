'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import AppLogo from '@/components/ui/AppLogo';
import Icon from '@/components/ui/AppIcon';
import { APK_DOWNLOAD_PATH } from '@/lib/apk-download';

export default function Header() {
  const pathname = usePathname();
  const [menuOpen, setMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 8);
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  useEffect(() => {
    setMenuOpen(false);
  }, [pathname]);

  const navLinks = [
    { href: '/', label: 'Features' },
    { href: '/about', label: 'About' },
  ];

  return (
    <header
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        scrolled ? 'bg-white/90 backdrop-blur-md elevation-1 border-b border-border' : 'transparent'
      }`}
    >
      <nav className="max-w-6xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
        {/* Logo */}
        <Link
          href="/"
          className="flex items-center gap-2 focus:outline-none focus-visible:ring-2 focus-visible:ring-primary rounded-md"
        >
          <AppLogo size={32} />
          <span className="font-bold text-xl tracking-tight text-primary">GasHub</span>
        </Link>

        {/* Desktop Nav */}
        <div className="hidden md:flex items-center gap-8">
          {navLinks?.map((link) => (
            <Link
              key={link?.href}
              href={link?.href}
              className={`text-body-sm font-semibold transition-colors hover:text-primary focus:outline-none focus-visible:ring-2 focus-visible:ring-primary ${
                pathname === link?.href
                  ? 'text-primary border-b-2 border-primary pb-0.5'
                  : 'text-muted-foreground'
              }`}
            >
              {link?.label}
            </Link>
          ))}
        </div>

        {/* CTA + Hamburger */}
        <div className="flex items-center gap-3">
          <a
            href={APK_DOWNLOAD_PATH}
            className="hidden md:inline-flex items-center gap-2 bg-primary text-primary-foreground px-4 py-2 rounded-md text-body-sm font-semibold hover:bg-primary-container transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-primary"
          >
            <Icon name="ArrowDownTrayIcon" size={16} variant="solid" />
            Download App
          </a>
          <button
            className="md:hidden p-2 rounded-md text-muted-foreground hover:text-foreground focus:outline-none focus-visible:ring-2 focus-visible:ring-primary"
            onClick={() => setMenuOpen(!menuOpen)}
            aria-label={menuOpen ? 'Close menu' : 'Open menu'}
          >
            <Icon name={menuOpen ? 'XMarkIcon' : 'Bars3Icon'} size={22} />
          </button>
        </div>
      </nav>
      {/* Mobile Menu */}
      {menuOpen && (
        <div className="md:hidden bg-white/95 backdrop-blur-md border-t border-border px-4 py-4 flex flex-col gap-4">
          {navLinks?.map((link) => (
            <Link
              key={link?.href}
              href={link?.href}
              className={`text-body-md font-semibold py-2 transition-colors ${
                pathname === link?.href ? 'text-primary' : 'text-muted-foreground'
              }`}
            >
              {link?.label}
            </Link>
          ))}
          <a
            href={APK_DOWNLOAD_PATH}
            onClick={() => setMenuOpen(false)}
            className="inline-flex items-center justify-center gap-2 bg-primary text-primary-foreground px-4 py-3 rounded-md text-body-sm font-semibold hover:bg-primary-container transition-colors min-h-[44px]"
          >
            <Icon name="ArrowDownTrayIcon" size={16} variant="solid" />
            Download App
          </a>
        </div>
      )}
    </header>
  );
}
