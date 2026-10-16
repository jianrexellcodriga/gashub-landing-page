import React from 'react';
import Icon from '@/components/ui/AppIcon';

const TECH_CARDS = [
  {
    icon: 'ChartBarIcon' as const,
    title: 'Prophet Forecasting',
    body: 'By utilizing advanced additive regression models, we analyze historical trends and seasonal effects to predict price drops up to 72 hours in advance with 94% accuracy.',
  },
  {
    icon: 'DocumentMagnifyingGlassIcon' as const,
    title: 'EasyOCR Pipeline',
    body: 'Our proprietary community verification system uses on-device optical character recognition to instantly validate fuel prices from pump photos, ensuring zero misinformation.',
  },
  {
    icon: 'ShieldCheckIcon' as const,
    title: 'Crowdsourced Validation',
    body: 'Our community-driven verification engine cross-references AI outputs with live user reports to guarantee 100% data integrity.',
  },
];

export default function TechnologicalCoreSection() {
  return (
    <section className="py-16 lg:py-24 bg-white">
      <div className="max-w-6xl mx-auto px-4 sm:px-6">
        {/* Header */}
        <div className="text-center mb-12 section-reveal revealed">
          <h2 className="text-display-lg text-foreground mb-2">Technological Core</h2>
          <p className="text-body-md text-muted-foreground">
            The intelligence engine powering OhMyGas
          </p>
        </div>

        {/* 3-column grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {TECH_CARDS.map((card, i) => (
            <div
              key={card.title}
              className="section-reveal revealed bg-white border border-border rounded-xl p-6 hover:elevation-1 hover:border-primary/20 transition-all duration-300 group"
              style={{ transitionDelay: `${i * 80}ms` }}
            >
              <div className="w-12 h-12 rounded-xl bg-primary/8 flex items-center justify-center mb-5 group-hover:bg-primary/15 transition-colors">
                <Icon name={card.icon} size={22} className="text-primary" />
              </div>
              <h3 className="text-title-sm text-foreground mb-3">{card.title}</h3>
              <p className="text-body-sm text-muted-foreground leading-relaxed">{card.body}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
