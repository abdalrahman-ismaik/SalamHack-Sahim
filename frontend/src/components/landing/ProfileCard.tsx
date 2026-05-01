'use client';

import type { CSSProperties, PointerEvent } from 'react';
import { useCallback, useRef } from 'react';

type ProfileCardVars = CSSProperties & Record<`--${string}`, string>;

export interface ProfileCardProps {
  name: string;
  title: string;
  handle: string;
  status: string;
  contactText: string;
  initials: string;
  avatarUrl?: string;
  accent: string;
  gradient: string;
  className?: string;
  enableTilt?: boolean;
  onContactClick?: () => void;
}

export function ProfileCard({
  name,
  title,
  handle,
  status,
  contactText,
  initials,
  avatarUrl,
  accent,
  gradient,
  className = '',
  enableTilt = true,
  onContactClick,
}: ProfileCardProps) {
  const wrapperRef = useRef<HTMLDivElement>(null);
  const cardRef = useRef<HTMLElement>(null);

  const setPointerVars = useCallback((event: PointerEvent<HTMLElement>) => {
    const wrapper = wrapperRef.current;
    const card = cardRef.current;
    if (!wrapper || !card) return;

    const rect = card.getBoundingClientRect();
    const x = Math.max(0, Math.min(event.clientX - rect.left, rect.width));
    const y = Math.max(0, Math.min(event.clientY - rect.top, rect.height));
    const px = x / rect.width;
    const py = y / rect.height;

    wrapper.style.setProperty('--pc-x', `${Math.round(px * 100)}%`);
    wrapper.style.setProperty('--pc-y', `${Math.round(py * 100)}%`);

    if (enableTilt) {
      const rotateY = (px - 0.5) * 13;
      const rotateX = (0.5 - py) * 13;
      card.style.transform = `rotateX(${rotateX.toFixed(2)}deg) rotateY(${rotateY.toFixed(2)}deg) translateY(-6px)`;
    }
  }, [enableTilt]);

  const resetTilt = useCallback(() => {
    const wrapper = wrapperRef.current;
    const card = cardRef.current;
    if (!wrapper || !card) return;

    wrapper.style.setProperty('--pc-x', '50%');
    wrapper.style.setProperty('--pc-y', '50%');
    card.style.transform = 'rotateX(0deg) rotateY(0deg) translateY(0)';
  }, []);

  const vars: ProfileCardVars = {
    '--pc-x': '50%',
    '--pc-y': '50%',
    '--pc-accent': accent,
    '--pc-gradient': gradient,
  };

  return (
    <div
      ref={wrapperRef}
      className={`group relative h-[420px] [perspective:900px] ${className}`.trim()}
      style={vars}
    >
      <div
        className="pointer-events-none absolute -inset-4 rounded-[36px] opacity-0 blur-3xl transition-opacity duration-500 group-hover:opacity-70"
        style={{
          background:
            'radial-gradient(circle at var(--pc-x) var(--pc-y), color-mix(in srgb, var(--pc-accent) 78%, transparent), transparent 54%)',
        }}
      />

      <article
        ref={cardRef}
        aria-label={`${name}, ${title}`}
        onPointerMove={setPointerVars}
        onPointerLeave={resetTilt}
        className="relative h-full overflow-hidden rounded-[28px] border border-white/10 bg-[#090909] shadow-[0_28px_90px_rgba(0,0,0,0.45)] transition-transform duration-700 ease-out [transform-style:preserve-3d] will-change-transform"
      >
        <div
          className="absolute inset-0 opacity-95"
          style={{ background: 'var(--pc-gradient)' }}
        />
        <div
          className="absolute inset-0 opacity-35 mix-blend-screen transition-opacity duration-500 group-hover:opacity-55"
          style={{
            background:
              'radial-gradient(circle at var(--pc-x) var(--pc-y), rgba(255,255,255,0.55), transparent 24%), repeating-linear-gradient(115deg, rgba(255,255,255,0.0) 0 12px, rgba(255,255,255,0.12) 13px 14px, rgba(255,255,255,0.0) 15px 28px)',
          }}
        />
        <div className="absolute inset-0 bg-[linear-gradient(180deg,rgba(255,255,255,0.10),transparent_36%,rgba(0,0,0,0.62))]" />
        <div className="absolute inset-x-5 top-5 flex items-center justify-between text-[11px] font-semibold uppercase text-white/55">
          <span className="rounded-full border border-white/10 bg-white/[0.06] px-3 py-1">
            @{handle}
          </span>
          <span className="h-2.5 w-2.5 rounded-full bg-[var(--pc-accent)] shadow-[0_0_20px_var(--pc-accent)]" />
        </div>

        <div className="absolute inset-x-6 top-16 z-10 text-center">
          <h3 className="text-2xl font-semibold text-white">{name}</h3>
          <p className="mt-1 text-sm font-medium text-white/62">{title}</p>
        </div>

        <div className="absolute inset-x-0 bottom-20 top-28 flex items-end justify-center">
          <div className="relative h-56 w-56 transition-transform duration-700 group-hover:scale-[1.04]">
            <div className="absolute inset-8 rounded-full bg-black/30 blur-2xl" />
            <div className="absolute inset-x-7 bottom-0 h-28 rounded-[45%_45%_26px_26px] border border-white/10 bg-white/[0.10] backdrop-blur-xl" />
            <div className="absolute left-1/2 top-8 flex h-32 w-32 -translate-x-1/2 items-center justify-center overflow-hidden rounded-full border border-white/14 bg-black/25 text-4xl font-black text-white shadow-[inset_0_1px_0_rgba(255,255,255,0.18),0_24px_60px_rgba(0,0,0,0.35)]">
              {avatarUrl ? (
                <img
                  src={avatarUrl}
                  alt={`${name} avatar`}
                  loading="lazy"
                  className="h-full w-full object-cover"
                />
              ) : (
                <span className="bg-gradient-to-b from-white to-white/45 bg-clip-text text-transparent">
                  {initials}
                </span>
              )}
            </div>
            <div className="absolute left-1/2 top-6 h-36 w-36 -translate-x-1/2 rounded-full border border-white/10 bg-[radial-gradient(circle_at_30%_20%,rgba(255,255,255,0.28),transparent_28%),linear-gradient(145deg,var(--pc-accent),rgba(255,255,255,0.10))] opacity-55 mix-blend-screen" />
          </div>
        </div>

        <div className="absolute inset-x-5 bottom-5 z-20 flex items-center justify-between gap-3 rounded-2xl border border-white/10 bg-white/[0.095] p-3 text-start backdrop-blur-2xl">
          <div className="flex min-w-0 items-center gap-3">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center overflow-hidden rounded-full border border-white/10 bg-black/25 text-xs font-bold text-white">
              {avatarUrl ? (
                <img
                  src={avatarUrl}
                  alt={`${name} mini avatar`}
                  loading="lazy"
                  className="h-full w-full object-cover"
                />
              ) : (
                initials
              )}
            </div>
            <div className="min-w-0">
              <p className="truncate text-sm font-semibold text-white">@{handle}</p>
              <p className="truncate text-xs text-white/58">{status}</p>
            </div>
          </div>
          {onContactClick ? (
            <button
              type="button"
              onClick={onContactClick}
              className="shrink-0 rounded-lg border border-white/12 bg-white/[0.08] px-3 py-2 text-xs font-semibold text-white/88 transition hover:border-white/30 hover:bg-white/[0.14] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/45"
            >
              {contactText}
            </button>
          ) : (
            <span className="shrink-0 rounded-lg border border-white/12 bg-white/[0.08] px-3 py-2 text-xs font-semibold text-white/88">
              {contactText}
            </span>
          )}
        </div>
      </article>
    </div>
  );
}
