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

  if (!isOpen) return null;

  const focusTrapOptions = {
    ...(initialFocusRef ? { initialFocus: () => initialFocusRef.current! } : {}),
    escapeDeactivates: dismissible,
    clickOutsideDeactivates: false,
    onDeactivate: onClose,
  };

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 z-40 bg-black/50"
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
            'fixed inset-x-4 top-1/2 z-50 -translate-y-1/2 mx-auto max-w-md rounded-xl bg-white p-6 shadow-xl',
            'focus:outline-none',
            className
          )}
          tabIndex={-1}
        >
          <h2 id={titleId} className="text-xl font-bold text-gray-900 mb-2">
            {title}
          </h2>
          {description && (
            <p id={descId} className="text-sm text-gray-600 mb-4">
              {description}
            </p>
          )}
          {dismissible && (
            <button
              onClick={onClose}
              className="absolute top-4 end-4 text-gray-400 hover:text-gray-600 focus-visible:ring-2 focus-visible:ring-emerald-500 rounded"
              aria-label="Close"
            >
              ✕
            </button>
          )}
          {children}
        </div>
      </FocusTrap>
    </>
  );
}
