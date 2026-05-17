'use client';

import React, { useEffect, useRef } from 'react';
import Icon from '@/components/ui/AppIcon';

export default function HeroSection() {
  const heroRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = heroRef?.current;
    if (!el) return;
    el?.classList?.add('revealed');
  }, []);

  return (
    <section
      className="pt-16 min-h-[calc(100vh-0px)] flex items-center"
      style={{ background: 'var(--hero-bg)' }}
      aria-label="Hero"
    >
      <div className="max-w-6xl mx-auto px-4 sm:px-6 w-full py-12 lg:py-20">
        <div className="grid lg:grid-cols-2 gap-12 lg:gap-16 items-center">
          {/* Left Content */}
          <div className="space-y-6 section-reveal revealed">
            {/* Tag */}
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full border border-primary/30 bg-primary/8">
              <span className="text-label-caps text-primary">The Future of Fueling</span>
            </div>

            {/* Headline */}
            <h1 className="text-hero-xl text-foreground">
              Revolutionizing Fuel Management for Davao Motorists.
            </h1>

            {/* Subtext */}
            <p className="text-body-md text-muted-foreground max-w-md leading-relaxed">
              Navigate the volatility of gas prices with precision. Our AI-driven engine provides
              real-time updates and 7-day forecasts to ensure you never overpay again.
            </p>

            {/* CTAs */}
            <div id="download" className="flex flex-wrap items-center gap-3 pt-2">
              <a
                href="#"
                className="inline-flex items-center gap-2 bg-primary text-primary-foreground px-5 py-3 rounded-md font-semibold text-body-sm hover:bg-primary-container transition-colors elevation-1 focus:outline-none focus-visible:ring-2 focus-visible:ring-primary min-h-[44px]"
              >
                <Icon name="ArrowDownTrayIcon" size={16} variant="solid" className="text-primary-foreground" />
                Download App
              </a>
              <a
                href="#"
                className="inline-flex items-center gap-2 border border-foreground/20 text-foreground px-5 py-3 rounded-md font-semibold text-body-sm hover:bg-foreground/5 transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-primary min-h-[44px]"
              >
                <Icon name="PlayCircleIcon" size={16} className="text-foreground" />
                Watch Demo
              </a>
            </div>
          </div>

          {/* Right — Phone Mockup */}
          <div className="flex justify-center lg:justify-end animate-float">
            <div className="relative">
              {/* Phone Frame */}
              <div
                className="relative w-64 sm:w-72 rounded-[3rem] overflow-hidden border-[10px] border-gray-800 elevation-3"
                style={{ background: 'var(--primary-container)' }}
              >
                {/* Notch */}
                <div className="absolute top-0 left-1/2 -translate-x-1/2 w-24 h-6 bg-gray-800 rounded-b-2xl z-10" />

                {/* Screen */}
                <div className="phone-mockup-screen min-h-[500px] sm:min-h-[560px] relative overflow-hidden">
                  {/* Map Header */}
                  <div className="pt-8 px-4 pb-3 flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div className="w-6 h-6 rounded bg-white/10 flex items-center justify-center">
                        <Icon name="ChevronLeftIcon" size={12} className="text-white" />
                      </div>
                      <span className="text-white text-xs font-semibold">Davao City</span>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <div className="w-6 h-6 rounded bg-white/10 flex items-center justify-center">
                        <Icon name="MagnifyingGlassIcon" size={12} className="text-white" />
                      </div>
                      <div className="w-6 h-6 rounded bg-white/10 flex items-center justify-center">
                        <Icon name="AdjustmentsHorizontalIcon" size={12} className="text-white" />
                      </div>
                    </div>
                  </div>

                  {/* Map Area */}
                  <div className="mx-3 rounded-xl overflow-hidden relative" style={{ height: '320px', background: 'linear-gradient(135deg, #1a3d2b 0%, #0d2b1a 50%, #1a4a2a 100%)' }}>
                    {/* Grid lines */}
                    <svg className="absolute inset-0 w-full h-full opacity-20" xmlns="http://www.w3.org/2000/svg">
                      <defs>
                        <pattern id="grid" width="30" height="30" patternUnits="userSpaceOnUse">
                          <path d="M 30 0 L 0 0 0 30" fill="none" stroke="#4ade80" strokeWidth="0.5" />
                        </pattern>
                      </defs>
                      <rect width="100%" height="100%" fill="url(#grid)" />
                    </svg>

                    {/* Roads */}
                    <svg className="absolute inset-0 w-full h-full" xmlns="http://www.w3.org/2000/svg">
                      <path d="M 30 60 Q 100 80 180 50 Q 240 30 280 70" fill="none" stroke="#4ade80" strokeWidth="2" opacity="0.4" />
                      <path d="M 0 120 Q 80 110 160 130 Q 220 145 280 120" fill="none" stroke="#4ade80" strokeWidth="1.5" opacity="0.3" />
                      <path d="M 60 0 Q 70 80 80 160 Q 85 220 90 300" fill="none" stroke="#4ade80" strokeWidth="1.5" opacity="0.3" />
                      <path d="M 160 0 Q 155 80 150 160 Q 148 220 145 300" fill="none" stroke="#4ade80" strokeWidth="1.5" opacity="0.3" />
                      <path d="M 0 200 Q 100 190 200 210 Q 250 215 280 200" fill="none" stroke="#4ade80" strokeWidth="1" opacity="0.25" />
                    </svg>

                    {/* Map pins */}
                    {[
                      { x: '25%', y: '20%' },
                      { x: '55%', y: '30%' },
                      { x: '70%', y: '15%' },
                      { x: '40%', y: '50%' },
                      { x: '20%', y: '60%' },
                      { x: '65%', y: '55%' },
                      { x: '45%', y: '75%' },
                      { x: '80%', y: '70%' },
                    ]?.map((pin, i) => (
                      <div
                        key={i}
                        className="absolute flex flex-col items-center"
                        style={{ left: pin?.x, top: pin?.y, transform: 'translate(-50%, -50%)' }}
                      >
                        <div className="w-5 h-5 rounded-full bg-primary flex items-center justify-center shadow-lg animate-pulse-dot">
                          <div className="w-2 h-2 rounded-full bg-white" />
                        </div>
                        <div className="w-0.5 h-2 bg-primary opacity-60" />
                      </div>
                    ))}
                  </div>

                  {/* Bottom Sheet */}
                  <div className="mx-3 mt-3 bg-white/10 backdrop-blur-sm rounded-xl px-4 py-3">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-white text-xs font-semibold">Nearest Station</p>
                        <p className="text-white/60 text-xs">0.8 km away</p>
                      </div>
                      <div className="bg-primary px-3 py-1.5 rounded-lg">
                        <p className="text-white text-xs font-bold">₱65.50</p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Floating price badge */}
              <div className="absolute -right-4 top-16 bg-white rounded-xl px-3 py-2 elevation-2 border border-border">
                <p className="text-label-caps text-muted-foreground">Regular</p>
                <p className="text-headline-md text-primary font-bold">₱65.50</p>
              </div>

              {/* Floating update badge */}
              <div className="absolute -left-6 bottom-24 bg-white rounded-xl px-3 py-2 elevation-2 border border-border flex items-center gap-2">
                <div className="w-6 h-6 rounded-full bg-primary/10 flex items-center justify-center">
                  <Icon name="ArrowTrendingUpIcon" size={12} className="text-primary" />
                </div>
                <div>
                  <p className="text-label-caps text-muted-foreground">7-day forecast</p>
                  <p className="text-caption font-semibold text-foreground">94% accurate</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}