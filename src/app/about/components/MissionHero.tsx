import React from 'react';

export default function MissionHero() {
  return (
    <section className="pt-16 bg-white">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 pt-16 pb-10 text-center">
        <h1 className="text-hero-xl text-foreground mb-4 section-reveal revealed">
          Our Mission: <span className="text-primary">Transparency</span> in Every Liter.
        </h1>
        <p className="text-body-md text-muted-foreground max-w-2xl mx-auto section-reveal revealed">
          We leverage state-of-the-art AI forecasting and real-time community data to eliminate the
          guesswork from refueling, stabilizing fuel costs for drivers worldwide.
        </p>
      </div>

      {/* Full-width gas station photo */}
      <div className="max-w-6xl mx-auto px-4 sm:px-6 pb-12">
        <div className="rounded-2xl overflow-hidden relative h-80 sm:h-96 lg:h-[40rem] section-reveal revealed">
          <picture className="absolute inset-0">
            <source srcSet="/assets/images/image1.avif" type="image/avif" />
            <source srcSet="/assets/images/image1.webp" type="image/webp" />
            <img
              src="/assets/images/image1.webp"
              alt="Modern gas station at night with bright green overhead canopy lighting, dark sky background, clean concrete forecourt, atmospheric low-key industrial lighting"
              fetchPriority="high"
              decoding="async"
              className="h-full w-full object-cover"
            />
          </picture>

          <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent" />
        </div>
      </div>
    </section>
  );
}
