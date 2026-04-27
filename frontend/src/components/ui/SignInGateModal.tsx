'use client';

import { useTranslations } from 'next-intl';
import { useLocale } from 'next-intl';
import { useRef } from 'react';
import { Modal } from './Modal';
import { Button } from './Button';

interface SignInGateModalProps {
  returnTo: string;
}

export function SignInGateModal({ returnTo }: SignInGateModalProps) {
  const t        = useTranslations('gate');
  const locale   = useLocale();
  const encoded  = encodeURIComponent(returnTo);
  const firstRef = useRef<HTMLAnchorElement>(null);

  const signUpHref  = `/${locale}/auth/signup?returnTo=${encoded}`;
  const signInHref  = `/${locale}/auth/signin?returnTo=${encoded}`;

  return (
    <Modal
      isOpen={true}
      role="alertdialog"
      title={t('headline')}
      description={t('description')}
      initialFocusRef={firstRef as React.RefObject<HTMLElement>}
    >
      <div className="mt-6 flex flex-col gap-3">
        <a
          ref={firstRef}
          href={signUpHref}
          className="block w-full"
        >
          <Button variant="default" className="w-full">
            {t('signUp')}
          </Button>
        </a>
        <a href={signInHref} className="block w-full">
          <Button variant="outline" className="w-full">
            {t('signIn')}
          </Button>
        </a>
      </div>
      <p className="mt-4 text-xs text-gray-500 text-center">
        {t('halalDisclaimer')}
      </p>
    </Modal>
  );
}
