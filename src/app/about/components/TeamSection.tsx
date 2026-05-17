'use client';

import React, { useEffect, useRef } from 'react';
import AppImage from '@/components/ui/AppImage';

const TEAM = [
{
  name: 'Dr. Elias Thorne',
  role: 'Chief Data Scientist',
  photo: "https://img.rocket.new/generatedImages/rocket_gen_img_1cb9d3445-1767783861537.png",
  alt: 'Professional man with glasses in dark suit, dark atmospheric studio background with subtle green tint, confident expression, low-key dramatic lighting'
},
{
  name: 'Sarah Jenks',
  role: 'Head of Community',
  photo: "https://img.rocket.new/generatedImages/rocket_gen_img_18a3c4e54-1777792537594.png",
  alt: 'Professional woman smiling warmly, bright modern office background with large windows, natural daylight, approachable and confident'
}];


export default function TeamSection() {
  const sectionRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.querySelectorAll('.section-reveal').forEach((el, i) => {
              setTimeout(() => el.classList.add('revealed'), i * 150);
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
      className="py-16 lg:py-24"
      style={{ background: 'var(--section-bg)' }}>
      
      <div className="max-w-6xl mx-auto px-4 sm:px-6">
        {/* Header */}
        <div className="text-center mb-12 section-reveal">
          <h2 className="text-display-lg text-foreground mb-3">The Team Behind the Data</h2>
          <p className="text-body-md text-muted-foreground max-w-2xl mx-auto">
            We are a dedicated group of data scientists, UX researchers, and urban planners committed
            to radical price transparency in local communities.
          </p>
        </div>

        {/* 2-column team cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 max-w-2xl mx-auto">
          {TEAM?.map((member, i) =>
          <div
            key={member?.name}
            className="section-reveal relative rounded-2xl overflow-hidden aspect-[3/4] group"
            style={{ transitionDelay: `${i * 150}ms` }}>
            
              <AppImage
              src={member?.photo}
              alt={member?.alt}
              fill
              className="object-cover group-hover:scale-105 transition-transform duration-500"
              sizes="(max-width: 640px) 100vw, 50vw" />
            
              {/* Overlay */}
              <div className="absolute inset-0 team-card-overlay" />
              {/* Name plate */}
              <div className="absolute bottom-0 left-0 right-0 p-5">
                <p className="text-title-sm text-primary font-bold">{member?.name}</p>
                <p className="text-label-caps text-white/80 mt-0.5">{member?.role}</p>
              </div>
            </div>
          )}
        </div>
      </div>
    </section>);

}