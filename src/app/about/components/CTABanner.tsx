import React from 'react';
import Link from 'next/link';
import Icon from '@/components/ui/AppIcon';
import { APK_DOWNLOAD_PATH } from '@/lib/apk-download';

export default function CTABanner() {
  return (
    <section className="py-12 lg:py-16 px-4 sm:px-6">
      <div className="max-w-6xl mx-auto">
        <div
          className="rounded-2xl px-8 py-12 lg:py-16 text-center section-reveal revealed"
          style={{ background: 'linear-gradient(135deg, #1a3d2b 0%, #0d2b1a 60%, #1a4a2a 100%)' }}
        >
          <h2 className="text-display-lg text-white mb-4">Stop overpaying for fuel today.</h2>
          <p className="text-body-md text-white/70 max-w-lg mx-auto mb-8">
            Join over 500,000 drivers using GasHub to Locate Gas Stations In Davao City and navigate price spikes.
          </p>
          <div className="flex flex-wrap items-center justify-center gap-3">
            <a
              href={APK_DOWNLOAD_PATH}
              className="inline-flex items-center gap-2 bg-primary text-primary-foreground px-6 py-3 rounded-md font-semibold text-body-sm hover:bg-primary-container transition-colors elevation-1 focus:outline-none focus-visible:ring-2 focus-visible:ring-white min-h-[44px]"
            >
              <Icon
                name="ArrowDownTrayIcon"
                size={16}
                variant="solid"
                className="text-primary-foreground"
              />
              Get the App
            </a>
          </div>
        </div>
      </div>
    </section>
  );
}
