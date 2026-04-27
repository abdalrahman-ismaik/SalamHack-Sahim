'use client';

import { useState, useEffect } from 'react';

/**
 * Fires the soft sign-in gate once, via setTimeout(fn, 0),
 * after the teaser content renders. The gate is non-dismissible.
 */
export function useSoftGate(): { gateOpen: boolean } {
  const [gateOpen, setGateOpen] = useState(false);

  useEffect(() => {
    const id = setTimeout(() => {
      console.debug('[useSoftGate] gate opening');
      setGateOpen(true);
    }, 0);
    return () => clearTimeout(id);
  }, []);

  return { gateOpen };
}
