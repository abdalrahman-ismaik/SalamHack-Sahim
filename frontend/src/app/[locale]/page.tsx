"use client";

import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { useLocale, useTranslations } from "next-intl";
import { searchStocks, ApiError } from "@/lib/api";
import type { SearchResult } from "@/lib/types";

export default function HomePage() {
  const t = useTranslations();
  const locale = useLocale();
  const router = useRouter();

  const [query, setQuery] = useState("");
  const [results, setResults] = useState<SearchResult[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [open, setOpen] = useState(false);

  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // 300ms debounce (T026)
  useEffect(() => {
    if (!query.trim()) {
      setResults([]);
      setOpen(false);
      setError(null);
      return;
    }

    if (debounceRef.current) clearTimeout(debounceRef.current);

    debounceRef.current = setTimeout(async () => {
      setLoading(true);
      setError(null);
      try {
        const data = await searchStocks(query);
        setResults(data);
        setOpen(true);
      } catch (err) {
        if (err instanceof ApiError) {
          if (err.status === 422) {
            // T027 — invalid ticker error state
            setError(t("errors.invalidTicker"));
          } else if (err.status === 503) {
            // T028 — service unavailable graceful degradation
            setError(t("errors.serviceUnavailable"));
          } else {
            setError(t("errors.generic"));
          }
        } else {
          setError(t("errors.serviceUnavailable"));
        }
        setResults([]);
        setOpen(false);
      } finally {
        setLoading(false);
      }
    }, 300);

    return () => {
      if (debounceRef.current) clearTimeout(debounceRef.current);
    };
  }, [query, t]);

  function handleSelect(ticker: string) {
    setOpen(false);
    router.push(`/${locale}/stock/${ticker}`);
  }

  return (
    <main className="min-h-screen flex flex-col items-center justify-center px-4 py-12 bg-gradient-to-b from-white to-gray-50">
      <div className="w-full max-w-xl">
        {/* Logo / title */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-2">سهم</h1>
          <p className="text-gray-500 text-sm">
            {t("score.disclaimer")}
          </p>
        </div>

        {/* Search box */}
        <div className="relative">
          <input
            type="search"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder={t("search.placeholder")}
            aria-label={t("search.placeholder")}
            className="w-full border-2 border-gray-300 rounded-xl px-4 py-3 text-lg focus:outline-none focus:border-blue-500 bg-white shadow-sm"
            autoComplete="off"
            dir="rtl"
          />
          {loading && (
            <span className="absolute inset-y-0 start-4 flex items-center text-gray-400 text-sm">
              {t("search.loading")}
            </span>
          )}
        </div>

        {/* Error */}
        {error && (
          <p
            role="alert"
            className="mt-2 text-red-600 text-sm px-1"
          >
            {error}
          </p>
        )}

        {/* Results dropdown */}
        {open && results.length > 0 && (
          <ul
            role="listbox"
            className="mt-1 bg-white border border-gray-200 rounded-xl shadow-lg overflow-hidden"
          >
            {results.map((r) => (
              <li
                key={r.ticker}
                role="option"
                aria-selected={false}
                className="flex items-center justify-between px-4 py-3 cursor-pointer hover:bg-gray-50 transition-colors"
                onClick={() => handleSelect(r.ticker)}
              >
                <div>
                  <span className="font-semibold text-gray-800">{r.ticker}</span>
                  <span className="ms-2 text-gray-500 text-sm">{r.name}</span>
                </div>
                <span className="text-xs text-gray-400">{r.exchange}</span>
              </li>
            ))}
          </ul>
        )}

        {open && results.length === 0 && !loading && !error && (
          <p className="mt-2 text-gray-400 text-sm text-center">
            {t("search.noResults")}
          </p>
        )}
      </div>
    </main>
  );
}
