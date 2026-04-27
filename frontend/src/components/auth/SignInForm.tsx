'use client';

import { useTranslations } from 'next-intl';
import { useLocale } from 'next-intl';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { safeReturnTo } from '@/middleware';
import { Button } from '@/components/ui/Button';
import { motion } from 'framer-motion';

const schema = z.object({
  email:    z.string().email(),
  password: z.string().min(1),
});

type Fields = z.infer<typeof schema>;

interface Props {
  returnTo: string;
}

export function SignInForm({ returnTo }: Props) {
  const t      = useTranslations('auth.signIn');
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
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/api/auth/signin`,
        {
          method:      'POST',
          headers:     { 'Content-Type': 'application/json' },
          body:        JSON.stringify(data),
          credentials: 'include',
        }
      );

      if (!res.ok) {
        setError('root', { message: tErr('invalidCredentials') });
        return;
      }

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
          autoComplete="current-password"
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
    </form>
  );
}
