import React from 'react';
import type { Metadata } from 'next';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import GasBot from '@/components/GasBot';
import MissionHero from './components/MissionHero';
import PriceVolatilitySection from './components/PriceVolatilitySection';
import TechnologicalCoreSection from './components/TechnologicalCoreSection';
import TeamSection from './components/TeamSection';
import CTABanner from './components/CTABanner';

export const metadata: Metadata = {
  title: 'About GasHub — Our Mission & Team',
  description:
    'Learn how GasHub uses AI forecasting and crowdsourced data to bring fuel price transparency to Davao City motorists.',
  alternates: { canonical: '/about' },
};

export default function AboutPage() {
  return (
    <>
      <Header />
      <main>
        <MissionHero />
        <PriceVolatilitySection />
        <TechnologicalCoreSection />
        <TeamSection />
        <CTABanner />
      </main>
      <Footer />
      <GasBot />
    </>
  );
}