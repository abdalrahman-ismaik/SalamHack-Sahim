'use client';

import { useTranslations } from 'next-intl';
import { useLocale } from 'next-intl';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { safeReturnTo } from '@/lib/safe-return';
import { Button } from '@/components/ui/Button';
import { motion } from 'framer-motion';
import { createUserWithEmailAndPassword, updateProfile, signInWithPopup, GoogleAuthProvider } from 'firebase/auth';
import { auth } from '@/lib/firebase';
import { setAuthCookie, setStoredTier, flagPostSignIn, setStoredProfile } from '@/lib/firebase-session';
import { ensureUserDocument } from '@/lib/firestore-user';

const schema = z.object({
  name:     z.string().min(1),
  email:    z.string().email(),
  password: z.string().min(8),
});

type Fields = z.infer<typeof schema>;

interface Props {
  returnTo: string;
  plan:     string;
}

export function SignUpForm({ returnTo, plan }: Props) {
  const t      = useTranslations('auth.signUp');
  const tErr   = useTranslations('auth.errors');
  const locale = useLocale();

  const {
    register,
    handleSubmit,
    setError,
    formState: { errors, isSubmitting },
  } = useForm<Fields>({ resolver: zodResolver(schema) });

  async function onSubmit(data: Fields) {
    try {
      const cred = await createUserWithEmailAndPassword(auth, data.email, data.password);
      await updateProfile(cred.user, { displayName: data.name });
      setAuthCookie();
      setStoredProfile({ name: data.name, photoURL: cred.user.photoURL });
      setStoredTier('free'); // New accounts always start on free
      await ensureUserDocument(cred.user, { tier: 'free', locale: locale as 'ar' | 'en', name: data.name })
        .catch(error => console.warn('[SignUpForm] Firestore user sync failed:', error));
      flagPostSignIn();
      const safe = safeReturnTo(returnTo, window.location.origin);
      window.location.href = safe || `/${locale}/dashboard`;
    } catch (err: unknown) {
      const code = (err as { code?: string }).code ?? '';
      if (code === 'auth/email-already-in-use') {
        setError('email', { message: tErr('emailTaken') });
      } else {
        setError('root', { message: tErr('generic') });
      }
    }
  }

  async function onGoogleSignIn() {
    try {
      const cred = await signInWithPopup(auth, new GoogleAuthProvider());
      setAuthCookie();
      setStoredProfile({ name: cred.user.displayName, photoURL: cred.user.photoURL });
      setStoredTier('free');
      await ensureUserDocument(cred.user, { tier: 'free', locale: locale as 'ar' | 'en' })
        .catch(error => console.warn('[SignUpForm] Firestore user sync failed:', error));
      flagPostSignIn();
      const safe = safeReturnTo(returnTo, window.location.origin);
      window.location.href = safe || `/${locale}/dashboard`;
    } catch {
      setError('root', { message: tErr('generic') });
    }
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} noValidate className="space-y-5">
      {errors.root && (
        <motion.p 
          role="alert" 
          className="text-sm text-[#FF1744] flex items-center gap-2 bg-[#FF1744]/10 border border-[#FF1744]/20 rounded-lg px-3 py-2"
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <svg className="w-4 h-4 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"/></svg>
          {errors.root.message}
        </motion.p>
      )}

      <div>
        <label htmlFor="name" className="block text-sm font-medium text-gray-400 mb-2">
          {t('nameLabel')}
        </label>
        <input
          id="name"
          type="text"
          autoComplete="name"
          className="w-full rounded-lg bg-[#0a0a0a] border border-[#2A2A2A] px-4 py-3 text-sm text-white placeholder-gray-600 focus:outline-none focus:ring-2 focus:ring-[#C5A059] focus:border-transparent transition-all"
          {...register('name')}
          aria-invalid={errors.name ? 'true' : 'false'}
        />
        {errors.name && (
          <p role="alert" className="mt-1.5 text-xs text-[#FF1744]">{errors.name.message}</p>
        )}
      </div>

      <div>
        <label htmlFor="email" className="block text-sm font-medium text-gray-400 mb-2">
          {t('emailLabel')}
        </label>
        <input
          id="email"
          type="email"
          autoComplete="email"
          className="w-full rounded-lg bg-[#0a0a0a] border border-[#2A2A2A] px-4 py-3 text-sm text-white placeholder-gray-600 focus:outline-none focus:ring-2 focus:ring-[#C5A059] focus:border-transparent transition-all"
          {...register('email')}
          aria-invalid={errors.email ? 'true' : 'false'}
        />
        {errors.email && (
          <p role="alert" className="mt-1.5 text-xs text-[#FF1744]">{errors.email.message}</p>
        )}
      </div>

      <div>
        <label htmlFor="password" className="block text-sm font-medium text-gray-400 mb-2">
          {t('passwordLabel')}
        </label>
        <input
          id="password"
          type="password"
          autoComplete="new-password"
          className="w-full rounded-lg bg-[#0a0a0a] border border-[#2A2A2A] px-4 py-3 text-sm text-white placeholder-gray-600 focus:outline-none focus:ring-2 focus:ring-[#C5A059] focus:border-transparent transition-all"
          {...register('password')}
          aria-invalid={errors.password ? 'true' : 'false'}
        />
        {errors.password && (
          <p role="alert" className="mt-1.5 text-xs text-[#FF1744]">{errors.password.message}</p>
        )}
      </div>

      <Button type="submit" variant="gold" className="w-full" loading={isSubmitting}>
        {t('submit')}
      </Button>

      <div className="relative flex items-center gap-3">
        <div className="flex-1 border-t border-[#2A2A2A]" />
        <span className="text-xs text-gray-600">or</span>
        <div className="flex-1 border-t border-[#2A2A2A]" />
      </div>

      <button
        type="button"
        onClick={onGoogleSignIn}
        className="w-full flex items-center justify-center gap-3 rounded-lg border border-[#2A2A2A] bg-[#0a0a0a] px-4 py-3 text-sm text-white hover:border-[#C5A059]/50 hover:bg-white/5 transition-all"
      >
        <svg className="w-4 h-4" viewBox="0 0 24 24" aria-hidden="true">
          <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
          <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
          <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z"/>
          <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
        </svg>
        {t('googleSignIn')}
      </button>
    </form>
  );
}
