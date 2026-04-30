'use client';

import { FormEvent, useMemo, useRef, useState } from 'react';
import { useLocale, useTranslations } from 'next-intl';
import { Bot, Loader2, MessageCircle, Send, X } from 'lucide-react';
import { sendSupportChatMessage } from '@/lib/api';
import type { SupportChatMessage } from '@/lib/types';

export function DashboardSupportChat() {
  const t = useTranslations('dashboard.support');
  const locale = useLocale();
  const [open, setOpen] = useState(false);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [messages, setMessages] = useState<SupportChatMessage[]>([
    { role: 'assistant', content: t('welcome') },
  ]);
  const inputRef = useRef<HTMLInputElement>(null);

  const visibleHistory = useMemo(() => messages.slice(-8), [messages]);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const message = input.trim();
    if (!message || loading) return;

    const nextMessages: SupportChatMessage[] = [...messages, { role: 'user', content: message }];
    setMessages(nextMessages);
    setInput('');
    setLoading(true);

    try {
      const response = await sendSupportChatMessage({
        message,
        locale,
        history: visibleHistory,
      });
      setMessages(prev => [...prev, { role: 'assistant', content: response.reply }]);
    } catch {
      setMessages(prev => [...prev, { role: 'assistant', content: t('fallback') }]);
    } finally {
      setLoading(false);
      requestAnimationFrame(() => inputRef.current?.focus());
    }
  }

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="fixed bottom-5 end-5 z-40 flex h-14 w-14 items-center justify-center rounded-2xl border border-[#C5A059]/35 bg-[#C5A059] text-black shadow-[0_18px_50px_rgba(197,160,89,0.3)] transition-transform hover:-translate-y-0.5 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white"
        aria-label={t('open')}
      >
        <MessageCircle className="h-6 w-6" aria-hidden="true" />
      </button>

      {open && (
        <section
          aria-label={t('title')}
          className="fixed bottom-24 end-5 z-50 flex h-[min(620px,calc(100vh-8rem))] w-[min(420px,calc(100vw-2rem))] flex-col overflow-hidden rounded-3xl border border-white/10 bg-[#0F0F0F]/95 shadow-[0_26px_90px_rgba(0,0,0,0.6)] backdrop-blur-xl"
        >
          <div className="flex items-center justify-between border-b border-white/10 p-4">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl border border-[#C5A059]/25 bg-[#C5A059]/10 text-[#E8D4B0]">
                <Bot className="h-5 w-5" aria-hidden="true" />
              </div>
              <div>
                <h2 className="text-sm font-semibold text-white">{t('title')}</h2>
                <p className="text-xs text-white/45">{t('subtitle')}</p>
              </div>
            </div>
            <button
              type="button"
              onClick={() => setOpen(false)}
              className="rounded-lg p-2 text-white/45 transition-colors hover:bg-white/10 hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#C5A059]"
              aria-label={t('close')}
            >
              <X className="h-4 w-4" aria-hidden="true" />
            </button>
          </div>

          <div className="flex-1 space-y-3 overflow-y-auto p-4">
            {messages.map((message, index) => (
              <div
                key={`${message.role}-${index}`}
                className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
              >
                <div
                  className={`max-w-[82%] rounded-2xl px-4 py-3 text-sm leading-6 ${
                    message.role === 'user'
                      ? 'bg-[#C5A059] text-black'
                      : 'border border-white/10 bg-white/[0.045] text-white/72'
                  }`}
                >
                  {message.content}
                </div>
              </div>
            ))}
            {loading && (
              <div className="flex justify-start">
                <div className="flex items-center gap-2 rounded-2xl border border-white/10 bg-white/[0.045] px-4 py-3 text-sm text-white/60">
                  <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" />
                  {t('thinking')}
                </div>
              </div>
            )}
          </div>

          <form onSubmit={handleSubmit} className="border-t border-white/10 p-3">
            <div className="flex items-center gap-2 rounded-2xl border border-white/10 bg-white/[0.04] p-2">
              <input
                ref={inputRef}
                value={input}
                onChange={(event) => setInput(event.target.value)}
                placeholder={t('placeholder')}
                className="min-w-0 flex-1 bg-transparent px-2 text-sm text-white outline-none placeholder:text-white/35"
              />
              <button
                type="submit"
                disabled={loading || !input.trim()}
                className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#C5A059] text-black transition-opacity disabled:cursor-not-allowed disabled:opacity-40 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white"
                aria-label={t('send')}
              >
                <Send className="h-4 w-4" aria-hidden="true" />
              </button>
            </div>
            <p className="mt-2 px-2 text-[11px] leading-5 text-white/35">{t('disclaimer')}</p>
          </form>
        </section>
      )}
    </>
  );
}
