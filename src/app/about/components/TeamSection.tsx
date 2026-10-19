import React from 'react';

type TeamMember = {
  name: string;
  role: string;
  alt: string;
  /** Optional photo. Add `team 2.avif` / `team 2.webp` to public/assets/images, then fill this in. */
  photo?: { avif: string; webp: string };
};

const TEAM: TeamMember[] = [
  {
    name: 'Jian Rexell Codriga',
    role: 'Full Stack Developer/ UI/UX Designer',
    alt: 'Jian Rexell Codriga, Full Stack Front-End Developer',
    photo: {
      avif: '/assets/images/team 1.avif',
      webp: '/assets/images/team 1.webp',
    },
  },
  {
    name: 'Noriel Jore',
    role: 'Lead Researcher',
    alt: 'Noriel Jore, Research Lead',
    photo: {
      avif: '/assets/images/team 2.avif',
      webp: '/assets/images/team 2.webp',
    },
  },
];

const getInitials = (name: string) =>
  name
    .split(' ')
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part.charAt(0).toUpperCase())
    .join('');

export default function TeamSection() {
  return (
    <section className="py-16 lg:py-24" style={{ background: 'var(--section-bg)' }}>
      <div className="max-w-6xl mx-auto px-4 sm:px-6">
        {/* Header */}
        <div className="text-center mb-12 section-reveal revealed">
          <h2 className="text-display-lg text-foreground mb-3">The Team Behind the Data</h2>
          <p className="text-body-md text-muted-foreground max-w-2xl mx-auto">
            We are a dedicated group of data scientists, UX researchers, and urban planners
            committed to radical price transparency in local communities.
          </p>
        </div>

        {/* 2-column team cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 max-w-2xl mx-auto">
          {TEAM.map((member, i) => (
            <div
              key={member.name}
              className="section-reveal revealed relative rounded-2xl overflow-hidden aspect-[3/4] group"
              style={{ transitionDelay: `${i * 150}ms` }}
            >
              {member.photo ? (
                <picture className="absolute inset-0">
                  <source srcSet={member.photo.avif} type="image/avif" />
                  <source srcSet={member.photo.webp} type="image/webp" />
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={member.photo.webp}
                    alt={member.alt}
                    loading="lazy"
                    decoding="async"
                    className="h-full w-full object-cover group-hover:scale-105 transition-transform duration-500"
                  />
                </picture>
              ) : (
                // No photo yet: render a local placeholder instead of requesting a missing file.
                <div
                  role="img"
                  aria-label={member.alt}
                  className="absolute inset-0 flex items-center justify-center bg-gradient-to-br from-primary-container to-primary"
                >
                  <span className="text-hero-xl text-white/90 select-none">
                    {getInitials(member.name)}
                  </span>
                </div>
              )}

              {/* Overlay */}
              <div className="absolute inset-0 team-card-overlay" />
              {/* Name plate */}
              <div className="absolute bottom-0 left-0 right-0 p-5">
                <p className="text-title-sm text-primary font-bold">{member.name}</p>
                <p className="text-label-caps text-white/80 mt-0.5">{member.role}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
