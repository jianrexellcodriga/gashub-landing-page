'use client';

import dynamic from 'next/dynamic';

const GasBot = dynamic(() => import('@/components/GasBot'), {
  ssr: false,
});

export default function LazyGasBot() {
  return <GasBot />;
}
