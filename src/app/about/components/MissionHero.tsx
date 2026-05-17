'use client';

import React, { useEffect, useRef } from 'react';
import AppImage from '@/components/ui/AppImage';

export default function MissionHero() {
  const sectionRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = sectionRef?.current;
    if (!el) return;
    el?.querySelectorAll('.section-reveal')?.forEach((node) => node?.classList?.add('revealed'));
  }, []);

  return (
    <section ref={sectionRef} className="pt-16 bg-white">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 pt-16 pb-10 text-center">
        <h1 className="text-hero-xl text-foreground mb-4 section-reveal">
          Our Mission:{' '}
          <span className="text-primary">Transparency</span> in Every Liter.
        </h1>
        <p className="text-body-md text-muted-foreground max-w-2xl mx-auto section-reveal">
          We leverage state-of-the-art AI forecasting and real-time community data to eliminate the
          guesswork from refueling, stabilizing fuel costs for drivers worldwide.
        </p>
      </div>

      {/* Full-width gas station photo */}
      <div className="max-w-6xl mx-auto px-4 sm:px-6 pb-12">
        <div className="rounded-2xl overflow-hidden relative h-64 sm:h-80 lg:h-96 section-reveal">
          <AppImage
            src="https://images.unsplash.com/photo-1632671414008-d3ea7df1dc4d"
            alt="Modern gas station at night with bright green overhead canopy lighting, dark sky background, clean concrete forecourt, atmospheric low-key industrial lighting"
            fill
            className="object-cover"
            priority />
          
          <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent" />
        </div>
      </div>
    </section>);

}