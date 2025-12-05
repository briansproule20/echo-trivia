'use client';

import { useEffect } from 'react';
import { useFontStore } from '@/lib/store';

export function FontProvider({ children }: { children: React.ReactNode }) {
  const font = useFontStore((state) => state.font);

  useEffect(() => {
    const body = document.body;
    body.classList.remove('font-serif', 'font-dyslexic', 'font-tech');
    if (font === 'serif') {
      body.classList.add('font-serif');
    } else if (font === 'dyslexic') {
      body.classList.add('font-dyslexic');
    } else if (font === 'tech') {
      body.classList.add('font-tech');
    }
  }, [font]);

  return <>{children}</>;
}
