import React from 'react';
import type { Metadata } from 'next';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import GasBot from '@/components/GasBot';
import HeroSection from './components/HeroSection';
import MapInterfaceSection from './components/MapInterfaceSection';
import AIIntelligenceSection from './components/AIIntelligenceSection';

export const metadata: Metadata = {
  title: 'GasHub — Fuel Price Intelligence for Davao Motorists',
  description:
    'GasHub gives Davao City drivers real-time fuel prices, AI-powered 7-day forecasts, and crowdsourced station data so you never overpay at the pump.',
  alternates: { canonical: '/' },
};

export default function FeaturesPage() {
  return (
    <>
      <Header />
      <main>
        <HeroSection />
        <MapInterfaceSection />
        <AIIntelligenceSection />
      </main>
      <Footer />
      <GasBot />
    </>
  );
}