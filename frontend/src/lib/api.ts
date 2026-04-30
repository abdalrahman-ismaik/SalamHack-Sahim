/**
 * Typed fetch wrappers for all backend API endpoints.
 * Base URL is read from NEXT_PUBLIC_API_URL (fallback: http://localhost:8000).
 */

import type {
  SearchResult,
  InvestmentReadinessScore,
  RiskMetrics,
  HalalVerdict,
  NewsAnalysis,
  ArimaForecast,
  SectorComparison,
  AllocationResult,
  SupportChatRequest,
  SupportChatResponse,
} from "./types";

const BASE_URL =
  process.env.NEXT_PUBLIC_API_URL ?? "http://127.0.0.1:8000";

async function apiFetch<T>(path: string, options?: RequestInit): Promise<T> {
  const url = `${BASE_URL}${path}`;
  const method = (options?.method ?? "GET").toUpperCase();
  // Do not send Content-Type on GET/HEAD — it triggers a CORS preflight the API must answer;
  // JSON bodies only need it on mutating methods.
  const needsJsonContentType =
    method !== "GET" && method !== "HEAD" && method !== "OPTIONS";
  const t0 = typeof performance !== "undefined" ? performance.now() : Date.now();
  console.debug("[api] →", path);
  const res = await fetch(url, {
    ...options,
    headers: {
      ...(needsJsonContentType ? { "Content-Type": "application/json" } : {}),
      ...options?.headers,
    },
  });

  if (!res.ok) {
    let errorBody: unknown;
    try {
      errorBody = await res.json();
    } catch {
      errorBody = { error: res.statusText };
    }
    const err = new ApiError(res.status, errorBody);
    console.warn("[api] error", path, res.status, errorBody);
    throw err;
  }

  const data = res.json() as Promise<T>;
  const durationMs = (typeof performance !== "undefined" ? performance.now() : Date.now()) - t0;
  console.debug("[api] ←", path, res.status, `${durationMs.toFixed(1)}ms`);
  return data;
}

export class ApiError extends Error {
  constructor(
    public readonly status: number,
    public readonly body: unknown
  ) {
    super(`API error ${status}`);
    this.name = "ApiError";
  }
}

// ---------------------------------------------------------------------------
// Endpoints
// ---------------------------------------------------------------------------

export async function searchStocks(query: string): Promise<SearchResult[]> {
  const encoded = encodeURIComponent(query.trim());
  return apiFetch<SearchResult[]>(`/api/search?q=${encoded}`);
}

export async function getScore(ticker: string): Promise<InvestmentReadinessScore> {
  return apiFetch<InvestmentReadinessScore>(
    `/api/stock/${encodeURIComponent(ticker)}/score`
  );
}

export async function getRisk(ticker: string): Promise<RiskMetrics> {
  return apiFetch<RiskMetrics>(
    `/api/stock/${encodeURIComponent(ticker)}/risk`
  );
}

export async function getHalal(ticker: string): Promise<HalalVerdict> {
  return apiFetch<HalalVerdict>(
    `/api/stock/${encodeURIComponent(ticker)}/halal`
  );
}

export async function getNews(ticker: string): Promise<NewsAnalysis> {
  return apiFetch<NewsAnalysis>(
    `/api/stock/${encodeURIComponent(ticker)}/news`
  );
}

export async function getArima(ticker: string): Promise<ArimaForecast> {
  return apiFetch<ArimaForecast>(
    `/api/stock/${encodeURIComponent(ticker)}/forecast`
  );
}

export async function getSectors(ticker: string): Promise<SectorComparison> {
  return apiFetch<SectorComparison>(`/api/sectors/${encodeURIComponent(ticker)}`);
}

export async function getAllocation(
  payload: { tickers: string[]; budget: number }
): Promise<AllocationResult> {
  const { tickers, budget } = payload;
  return apiFetch<AllocationResult>("/api/allocate", {
    method: "POST",
    body: JSON.stringify({ tickers, budget }),
  });
}

export async function sendSupportChatMessage(
  payload: SupportChatRequest
): Promise<SupportChatResponse> {
  return apiFetch<SupportChatResponse>("/api/support/chat", {
    method: "POST",
    body: JSON.stringify(payload),
  });
}
