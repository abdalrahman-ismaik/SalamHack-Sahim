'use client';

import { useRef, useEffect, type ReactNode } from 'react';
import FocusTrap from 'focus-trap-react';
import { twMerge } from 'tailwind-merge';

export interface ModalProps {
  isOpen:           boolean;
  onClose?:         () => void;
  title:            string;
  description?:     string;
  role?:            'dialog' | 'alertdialog';
  initialFocusRef?: React.RefObject<HTMLElement>;
  children:         ReactNode;
  className?:       string;
}

export function Modal({
  isOpen,
  onClose,
  title,
  description,
  role = 'dialog',
  initialFocusRef,
  children,
  className,
}: ModalProps) {
  const titleId = 'modal-title';
  const descId  = 'modal-desc';
  const dismissible = Boolean(onClose);

  // Block Escape key when non-dismissible
  useEffect(() => {
    if (!isOpen || dismissible) return;
    const handler = (e: KeyboardEvent) => {
      if (e.key === 'Escape') e.preventDefault();
    };
    document.addEventListener('keydown', handler);
    return () => document.removeEventListener('keydown', handler);
  }, [isOpen, dismissible]);

  // Prevent body scroll when open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => { document.body.style.overflow = ''; };
  }, [isOpen]);

  if (!isOpen) return null;

  const focusTrapOptions = {
    ...(initialFocusRef ? { initialFocus: () => initialFocusRef.current! } : {}),
    escapeDeactivates: dismissible,
    clickOutsideDeactivates: false,
    onDeactivate: onClose,
  };

  return (
    <>
      {/* Backdrop with animated gradient */}
      <div
        className="fixed inset-0 z-40 bg-black/80 backdrop-blur-sm animate-[fade-in_0.3s_ease-out]"
        aria-hidden="true"
        onClick={dismissible ? onClose : undefined}
      />

      {/* Modal */}
      <FocusTrap focusTrapOptions={focusTrapOptions}>
        <div
          role={role}
          aria-modal="true"
          aria-labelledby={titleId}
          aria-describedby={description ? descId : undefined}
          className={twMerge(
            'fixed inset-x-4 top-1/2 z-50 -translate-y-1/2 mx-auto max-w-md',
            'rounded-xl bg-[#121212] border border-[#2A2A2A] p-6 shadow-[0_20px_80px_rgba(0,0,0,0.8)]',
            'focus:outline-none animate-[scale-in_0.3s_ease-out]',
            className
          )}
          tabIndex={-1}
        >
          {/* Gold accent line at top */}
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-1/3 h-0.5 bg-gradient-to-r from-transparent via-[#C5A059] to-transparent rounded-full" />

          <h2 id={titleId} className="text-xl font-bold text-white mb-2">
            {title}
          </h2>
          {description && (
            <p id={descId} className="text-sm text-gray-400 mb-4">
              {description}
            </p>
          )}
          {dismissible && (
            <button
              onClick={onClose}
              className="absolute top-4 end-4 text-gray-500 hover:text-white focus-visible:ring-2 focus-visible:ring-[#C5A059] rounded transition-colors"
              aria-label="Close"
            >
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          )}
          {children}
        </div>
      </FocusTrap>
    </>
  );
}
