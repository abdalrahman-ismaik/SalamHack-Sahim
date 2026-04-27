'use client';

import { useState, useEffect } from 'react';

interface DataFreshnessLabelProps {
  label: string;
}

export function DataFreshnessLabel({ label }: DataFreshnessLabelProps) {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => setVisible(true), 500);
    return () => clearTimeout(timer);
  }, []);

  return (
    <p 
      className={`text-xs text-gray-600 mt-1 font-mono transition-opacity duration-500 ${visible ? 'opacity-100' : 'opacity-0'}`}
      aria-label={label}
    >
      <span className="inline-flex items-center gap-1.5">
        <span className="w-1.5 h-1.5 rounded-full bg-[#00E676] animate-pulse" />
        {label}
      </span>
    </p>
  );
}
