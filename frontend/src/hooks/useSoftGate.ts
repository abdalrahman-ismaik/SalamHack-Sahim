'use client';

import { useState, useEffect } from 'react';

/**
 * Fires the soft sign-in gate once, via setTimeout(fn, 0),
 * after the teaser content renders. The gate is non-dismissible.
 */
export function useSoftGate(trigger = true): { gateOpen: boolean } {
  const [gateOpen, setGateOpen] = useState(false);

  useEffect(() => {
    if (!trigger) return;
    const id = setTimeout(() => {
      console.debug('[useSoftGate] gate opening');
      setGateOpen(true);
    }, 0);
    return () => clearTimeout(id);
  }, [trigger]);

  return { gateOpen };
}
