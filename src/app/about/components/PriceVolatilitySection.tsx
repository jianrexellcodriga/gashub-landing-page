'use client';

import React, { useEffect, useRef } from 'react';
import Icon from '@/components/ui/AppIcon';

export default function PriceVolatilitySection() {
  const sectionRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.querySelectorAll('.section-reveal').forEach((el, i) => {
              setTimeout(() => el.classList.add('revealed'), i * 120);
            });
          }
        });
      },
      { threshold: 0.1 }
    );
    if (sectionRef?.current) observer?.observe(sectionRef?.current);
    return () => observer?.disconnect();
  }, []);

  return (
    <section
      ref={sectionRef}
      className="py-16 lg:py-20"
      style={{ background: 'var(--section-bg)' }}
    >
      <div className="max-w-6xl mx-auto px-4 sm:px-6">
        <div className="grid lg:grid-cols-2 gap-10 lg:gap-16 items-start">
          {/* Left — Text */}
          <div className="space-y-5 section-reveal">
            <div className="inline-flex items-center px-3 py-1.5 rounded-full border border-primary/30 bg-primary/8">
              <span className="text-label-caps text-primary">The Core Challenge</span>
            </div>
            <h2 className="text-display-lg text-foreground">Price Volatility &amp; Asymmetry</h2>
            <p className="text-body-sm text-muted-foreground leading-relaxed">
              For decades, the fuel market has operated behind a veil of opacity. Prices fluctuate
              wildly based on global shifts that individual drivers can neither predict nor control.
            </p>
            <p className="text-body-sm text-muted-foreground leading-relaxed">
              This creates a profound &quot;information asymmetry&quot; where consumers are left to
              guess the best time to fuel, often losing significant household income to avoidable
              price spikes.
            </p>
          </div>

          {/* Right — Market Index Card */}
          <div className="section-reveal">
            <div className="bg-white rounded-xl p-6 border border-border elevation-1">
              <div className="flex items-center justify-between mb-4">
                <p className="text-body-sm font-semibold text-foreground">Market Volatility Index</p>
                <div className="flex items-center gap-1 text-primary">
                  <Icon name="ArrowTrendingUpIcon" size={16} className="text-primary" />
                  <span className="text-headline-md font-bold text-primary">+18.4% YoY</span>
                </div>
              </div>

              {/* Sparkline */}
              <div className="mb-4">
                <svg viewBox="0 0 200 50" className="w-full h-12" xmlns="http://www.w3.org/2000/svg">
                  <polyline
                    points="0,40 20,35 40,38 60,28 80,32 100,20 120,24 140,15 160,18 180,10 200,12"
                    fill="none"
                    stroke="#228B22"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                  <polyline
                    points="0,40 20,35 40,38 60,28 80,32 100,20 120,24 140,15 160,18 180,10 200,12"
                    fill="url(#sparkGrad)"
                    stroke="none"
                    opacity="0.15"
                  />
                  <defs>
                    <linearGradient id="sparkGrad" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="#228B22" />
                      <stop offset="100%" stopColor="#228B22" stopOpacity="0" />
                    </linearGradient>
                  </defs>
                </svg>
              </div>

              <p className="text-body-sm text-muted-foreground leading-relaxed">
                Global fuel markets currently exhibit the highest levels of price unpredictability
                since 2008, impacting the logistics chain and everyday commuters alike.
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}