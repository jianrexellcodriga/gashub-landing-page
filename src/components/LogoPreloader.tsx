'use client';

import Image from 'next/image';
import { AnimatePresence, LazyMotion, m, useReducedMotion } from 'framer-motion';
import { useEffect, useState } from 'react';

const LOGO_SRC = '/assets/images/GASHUB_LOGO.png';
const PRELOADER_DURATION_MS = 2600;
const REDUCED_MOTION_DURATION_MS = 700;

const loadMotionFeatures = () => import('./motionFeatures').then((mod) => mod.default);

export default function LogoPreloader() {
  const prefersReducedMotion = useReducedMotion();
  const [isVisible, setIsVisible] = useState(true);

  useEffect(() => {
    const timeout = window.setTimeout(
      () => setIsVisible(false),
      prefersReducedMotion ? REDUCED_MOTION_DURATION_MS : PRELOADER_DURATION_MS
    );

    document.body.style.overflow = 'hidden';

    return () => {
      window.clearTimeout(timeout);
      document.body.style.overflow = '';
    };
  }, [prefersReducedMotion]);

  useEffect(() => {
    if (!isVisible) {
      document.body.style.overflow = '';
    }
  }, [isVisible]);

  return (
    <LazyMotion features={loadMotionFeatures} strict>
      <AnimatePresence>
        {isVisible && (
          <m.div
            className="fixed inset-0 z-[9999] flex items-center justify-center overflow-hidden bg-hero-bg"
            initial={{ opacity: 1 }}
            exit={{
              opacity: 0,
              filter: prefersReducedMotion ? 'none' : 'blur(10px)',
              transition: { duration: 0.55, ease: [0.76, 0, 0.24, 1] },
            }}
            aria-label="GasHub loading"
            role="status"
          >
            <m.div
              className="absolute inset-0 bg-[radial-gradient(circle_at_30%_25%,rgba(119,221,106,0.55),transparent_34%),radial-gradient(circle_at_70%_72%,rgba(34,139,34,0.36),transparent_32%),linear-gradient(135deg,var(--hero-bg)_0%,var(--background)_48%,rgba(119,221,106,0.42)_100%)]"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.45, ease: 'easeOut' }}
            />
            <m.div
              className="absolute inset-0 bg-[linear-gradient(115deg,transparent_0%,rgba(255,255,255,0.44)_45%,transparent_72%)]"
              initial={{ x: '-120%' }}
              animate={{ x: '120%' }}
              transition={{
                duration: prefersReducedMotion ? 0.7 : 1.8,
                ease: [0.76, 0, 0.24, 1],
              }}
            />
            <m.div
              className="absolute inset-x-0 bottom-0 h-1 bg-primary"
              initial={{ scaleX: 0, transformOrigin: '0% 50%' }}
              animate={{ scaleX: 1 }}
              transition={{
                duration: prefersReducedMotion ? 0.45 : 2.15,
                ease: [0.76, 0, 0.24, 1],
              }}
            />

            {!prefersReducedMotion && (
              <>
                <m.div
                  className="absolute h-44 w-44 rounded-full border border-primary/25"
                  initial={{ opacity: 0, scale: 0.72 }}
                  animate={{ opacity: [0, 1, 0], scale: [0.72, 1.28, 1.52] }}
                  transition={{ duration: 1.9, ease: 'easeOut', repeat: 1, repeatDelay: 0.05 }}
                />
                <m.div
                  className="absolute h-32 w-32 rounded-full bg-accent/20 blur-2xl"
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: [0, 0.8, 0.2], scale: [0.8, 1.2, 1.05] }}
                  transition={{ duration: 2.2, ease: [0.76, 0, 0.24, 1] }}
                />
              </>
            )}

            <m.div
              className="relative flex flex-col items-center gap-5"
              initial={{ opacity: 0, y: prefersReducedMotion ? 0 : 18, scale: 0.92 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
            >
              <m.div
                className="relative grid h-28 w-28 place-items-center overflow-hidden rounded-[28px] bg-card shadow-2xl ring-1 ring-border sm:h-32 sm:w-32"
                animate={
                  prefersReducedMotion
                    ? undefined
                    : {
                        y: [0, -5, 0],
                        boxShadow: [
                          '0 20px 50px rgba(34, 139, 34, 0.18)',
                          '0 28px 70px rgba(34, 139, 34, 0.28)',
                          '0 20px 50px rgba(34, 139, 34, 0.18)',
                        ],
                      }
                }
                transition={{
                  duration: 1.65,
                  ease: 'easeInOut',
                  repeat: prefersReducedMotion ? 0 : Infinity,
                }}
              >
                <m.div
                  className="absolute inset-0 bg-gradient-to-br from-primary/15 via-transparent to-accent/20"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.2, duration: 0.45 }}
                />
                <m.div
                  className="relative h-20 w-20 sm:h-24 sm:w-24"
                  initial={
                    prefersReducedMotion
                      ? { opacity: 0 }
                      : { opacity: 0, clipPath: 'inset(100% 0 0 0)', scale: 0.96 }
                  }
                  animate={
                    prefersReducedMotion
                      ? { opacity: 1 }
                      : { opacity: 1, clipPath: 'inset(0% 0 0 0)', scale: 1 }
                  }
                  transition={{ delay: 0.28, duration: 0.9, ease: [0.76, 0, 0.24, 1] }}
                >
                  <Image
                    src={LOGO_SRC}
                    alt="GasHub"
                    fill
                    priority
                    sizes="96px"
                    className="object-contain"
                  />
                </m.div>
              </m.div>

              <m.div
                className="h-1.5 w-28 overflow-hidden rounded-full bg-outline-variant"
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.5, duration: 0.45, ease: 'easeOut' }}
              >
                <m.div
                  className="h-full rounded-full bg-primary"
                  initial={{ x: '-100%' }}
                  animate={{ x: '100%' }}
                  transition={{
                    duration: prefersReducedMotion ? 0.55 : 1.15,
                    ease: [0.76, 0, 0.24, 1],
                    repeat: prefersReducedMotion ? 0 : 1,
                  }}
                />
              </m.div>
            </m.div>
          </m.div>
        )}
      </AnimatePresence>
    </LazyMotion>
  );
}
