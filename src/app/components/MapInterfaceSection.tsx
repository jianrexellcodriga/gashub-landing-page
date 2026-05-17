'use client';

import React, { useEffect, useRef } from 'react';
import Icon from '@/components/ui/AppIcon';

const MAP_FEATURES = [
  {
    icon: 'MapIcon' as const,
    title: 'Interactive Zoning',
    body: 'Pan and zoom across high-resolution sector maps. Stations are clustered dynamically to prevent visual clutter, expanding as you drill down into specific neighborhoods.',
  },
  {
    icon: 'AdjustmentsHorizontalIcon' as const,
    title: 'Parametric Filtering',
    body: 'Isolate data points by fuel grade (Regular, Premium, Diesel), specific brand networks, or filter exclusively for stations offering the lowest bottom-line prices within a 5km radius.',
  },
  {
    icon: 'CameraIcon' as const,
    title: 'Crowdsourced Reporting',
    body: 'Contribute to the data pool directly from the map view. Snap a photo of a station\'s pylon sign; our backend pipeline will automatically verify and update the network ledger.',
  },
];

export default function MapInterfaceSection() {
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
    if (sectionRef.current) observer.observe(sectionRef.current);
    return () => observer.disconnect();
  }, []);

  return (
    <section ref={sectionRef} className="py-16 lg:py-24 bg-white" id="features">
      <div className="max-w-6xl mx-auto px-4 sm:px-6">
        {/* Header */}
        <div className="text-center mb-12 section-reveal">
          <h2 className="text-display-lg text-foreground mb-3">Mastering the Map Interface</h2>
          <p className="text-body-md text-muted-foreground max-w-xl mx-auto">
            A comprehensive guide to navigating our high-fidelity map system for optimal fuel savings.
          </p>
        </div>

        {/* 3-column card grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {MAP_FEATURES.map((feature, i) => (
            <div
              key={feature.title}
              className="section-reveal bg-white border border-border rounded-xl p-6 hover:elevation-1 hover:border-primary/20 transition-all duration-300 group"
              style={{ transitionDelay: `${i * 80}ms` }}
            >
              {/* Icon */}
              <div className="w-12 h-12 rounded-xl bg-primary/8 flex items-center justify-center mb-5 group-hover:bg-primary/15 transition-colors">
                <Icon name={feature.icon} size={22} className="text-primary" />
              </div>

              {/* Content */}
              <h3 className="text-title-sm text-foreground mb-3">{feature.title}</h3>
              <p className="text-body-sm text-muted-foreground leading-relaxed">{feature.body}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}