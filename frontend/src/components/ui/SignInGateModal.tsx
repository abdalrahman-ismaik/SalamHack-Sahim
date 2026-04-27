'use client';

import { useTranslations } from 'next-intl';
import { useLocale } from 'next-intl';
import { useRef } from 'react';
import { motion } from 'framer-motion';
import { Modal } from './Modal';
import { Button } from './Button';

interface SignInGateModalProps {
  isOpen: boolean;
  returnTo: string;
}

export function SignInGateModal({ isOpen, returnTo }: SignInGateModalProps) {
  const t        = useTranslations('gate');
  const locale   = useLocale();
  const encoded  = encodeURIComponent(returnTo);
  const firstRef = useRef<HTMLAnchorElement>(null);

  const signUpHref  = `/${locale}/auth/signup?returnTo=${encoded}`;
  const signInHref  = `/${locale}/auth/signin?returnTo=${encoded}`;

  return (
    <Modal
      isOpen={isOpen}
      role="alertdialog"
      title={t('headline')}
      description={t('description')}
      initialFocusRef={firstRef as React.RefObject<HTMLElement>}
      className="max-w-sm border-[#C5A059]/30"
    >
      <motion.div 
        className="mt-6 flex flex-col gap-3"
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2, duration: 0.4 }}
      >
        <a
          ref={firstRef}
          href={signUpHref}
          className="block w-full"
        >
          <Button variant="gold" className="w-full">
            {t('signUp')}
          </Button>
        </a>
        <a href={signInHref} className="block w-full">
          <Button variant="outline" className="w-full">
            {t('signIn')}
          </Button>
        </a>
      </motion.div>
      <motion.p 
        className="mt-4 text-xs text-gray-500 text-center leading-relaxed"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.4 }}
      >
        {t('halalDisclaimer')}
      </motion.p>
    </Modal>
  );
}
