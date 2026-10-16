'use client';

import { useEffect } from 'react';

const FADE_MS = 700;

function resolveScrollElements(target: EventTarget | null): Element[] {
  if (target instanceof Element) return [target];
  return [document.documentElement, document.body];
}

export function FadeScrollbar() {
  useEffect(() => {
    const timeouts = new WeakMap<Element, ReturnType<typeof setTimeout>>();

    const onScroll = (event: Event) => {
      const elements = resolveScrollElements(event.target);

      for (const element of elements) {
        element.classList.add('is-scrolling');

        const existing = timeouts.get(element);
        if (existing) clearTimeout(existing);

        timeouts.set(
          element,
          setTimeout(() => {
            element.classList.remove('is-scrolling');
            timeouts.delete(element);
          }, FADE_MS),
        );
      }
    };

    document.addEventListener('scroll', onScroll, { passive: true, capture: true });
    return () => document.removeEventListener('scroll', onScroll, { capture: true });
  }, []);

  return null;
}
