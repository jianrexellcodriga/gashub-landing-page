'use client';

import React, { useEffect, useRef, useState } from 'react';
import Icon from '@/components/ui/AppIcon';

const BAR_DATA = [
  { height: 40, active: false },
  { height: 55, active: false },
  { height: 45, active: false },
  { height: 70, active: true },
  { height: 60, active: false },
  { height: 80, active: true },
  { height: 65, active: true },
  { height: 90, active: true },
  { height: 75, active: true },
  { height: 85, active: true },
];

export default function AIIntelligenceSection() {
  const sectionRef = useRef<HTMLDivElement>(null);
  const [barsVisible, setBarsVisible] = useState(false);

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.querySelectorAll('.section-reveal').forEach((el, i) => {
              setTimeout(() => el.classList.add('revealed'), i * 120);
            });
            setTimeout(() => setBarsVisible(true), 400);
          }
        });
      },
      { threshold: 0.15 }
    );
    if (sectionRef?.current) observer?.observe(sectionRef?.current);
    return () => observer?.disconnect();
  }, []);

  return (
    <section
      ref={sectionRef}
      className="py-16 lg:py-24"
      style={{ background: 'var(--section-bg)' }}
    >
      <div className="max-w-6xl mx-auto px-4 sm:px-6">
        {/* Header */}
        <div className="text-center mb-12 section-reveal">
          <h2 className="text-display-lg text-foreground mb-3">Precision-Engineered Intelligence</h2>
          <p className="text-body-md text-muted-foreground max-w-xl mx-auto">
            How our proprietary AI ecosystem transforms raw data into actionable savings for your daily commute.
          </p>
        </div>

        {/* 2-column layout */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Left — EasyOCR Pipeline */}
          <div className="section-reveal bg-white rounded-xl p-8 border border-border hover:elevation-1 transition-all duration-300 flex flex-col">
            <div className="w-12 h-12 rounded-xl bg-primary/8 flex items-center justify-center mb-5">
              <Icon name="DocumentMagnifyingGlassIcon" size={22} className="text-primary" />
            </div>
            <h3 className="text-headline-md text-foreground mb-3">EasyOCR Pipeline</h3>
            <p className="text-body-sm text-muted-foreground leading-relaxed mb-8 flex-1">
              Our edge-computing vision model automatically extracts real-time pricing from gas station
              boards via crowdsourced images, ensuring 99.8% accuracy without manual entry errors.
            </p>

            {/* Pipeline Diagram */}
            <div className="bg-muted rounded-xl p-4">
              <div className="flex items-center gap-2 flex-wrap">
                {['Image Capture', 'OCR Processing', 'Global Validation']?.map((step, i) => (
                  <React.Fragment key={step}>
                    <div className="flex items-center gap-2">
                      <div className="w-5 h-5 rounded-full bg-primary text-primary-foreground flex items-center justify-center text-xs font-bold flex-shrink-0">
                        {i + 1}
                      </div>
                      <span className="text-caption font-medium text-foreground">{step}</span>
                    </div>
                    {i < 2 && (
                      <Icon name="ArrowRightIcon" size={12} className="text-muted-foreground flex-shrink-0" />
                    )}
                  </React.Fragment>
                ))}
              </div>
            </div>
          </div>

          {/* Right — Prophet Forecasting */}
          <div className="section-reveal bg-white rounded-xl p-8 border border-border hover:elevation-1 transition-all duration-300 flex flex-col">
            <div className="w-12 h-12 rounded-xl bg-primary/8 flex items-center justify-center mb-5">
              <Icon name="ChartBarIcon" size={22} className="text-primary" />
            </div>
            <h3 className="text-headline-md text-foreground mb-3">Prophet Forecasting</h3>
            <p className="text-body-sm text-muted-foreground leading-relaxed mb-8 flex-1">
              Utilizing additive models where non-linear trends are fit with yearly, weekly, and daily
              seasonality, plus holiday effects. We predict the next 7 days of price shifts with
              professional rigor.
            </p>

            {/* Bar Chart */}
            <div className="bg-muted rounded-xl p-4">
              <div className="flex items-end gap-1.5 h-20 mb-3">
                {BAR_DATA?.map((bar, i) => (
                  <div
                    key={i}
                    className={`flex-1 rounded-t transition-all duration-700 ${
                      bar?.active ? 'bg-primary' : 'bg-outline-variant'
                    }`}
                    style={{
                      height: barsVisible ? `${bar?.height}%` : '4px',
                      transitionDelay: `${i * 60}ms`,
                    }}
                  />
                ))}
              </div>
              {/* Confidence badge */}
              <div className="flex items-center gap-2">
                <div className="flex-1 h-1.5 rounded-full bg-outline-variant overflow-hidden">
                  <div
                    className="h-full rounded-full bg-primary transition-all duration-1000"
                    style={{ width: barsVisible ? '94%' : '0%' }}
                  />
                </div>
                <span className="text-caption font-semibold text-primary whitespace-nowrap">
                  Confidence Interval: 94% Accuracy
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}