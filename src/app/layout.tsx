import React from 'react';
import type { Metadata, Viewport } from 'next';
import { Plus_Jakarta_Sans } from 'next/font/google';
import Script from 'next/script';
import { FadeScrollbar } from '@/components/FadeScrollbar';
import LazyGasBot from '@/components/LazyGasBot';
import LogoPreloader from '@/components/LogoPreloader';
import { getSiteUrl } from '@/lib/site-url';
import '@/styles/tailwind.css';

// Variable font: one file covers every weight instead of five separate downloads.
const plusJakartaSans = Plus_Jakarta_Sans({
  subsets: ['latin'],
  variable: '--font-plus-jakarta-sans',
  display: 'swap',
});

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
};

export const metadata: Metadata = {
  metadataBase: new URL(getSiteUrl()),
  title: 'GasHub',
  description:
    'GasHub gives Davao City drivers real-time fuel prices, AI-powered 7-day forecasts, and crowdsourced station data so you never overpay at the pump.',
  icons: {
    icon: [{ url: '/assets/images/GASHUB_LOGO.png', type: 'image/png' }],
  },
  openGraph: {
    title: 'GasHub',
    description: 'Real-time fuel prices and AI forecasts for Davao motorists.',
    images: [{ url: '/assets/images/GASHUB_LOGO.png', width: 1200, height: 630 }],
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={plusJakartaSans.variable}
      data-scroll-behavior="smooth"
      suppressHydrationWarning
    >
      <body className={plusJakartaSans.className} suppressHydrationWarning>
        <LogoPreloader />
        <FadeScrollbar />
        {children}
        <LazyGasBot />
      </body>
    </html>
  );
}
