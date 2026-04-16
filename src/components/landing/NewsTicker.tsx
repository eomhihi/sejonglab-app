"use client";

import { useMemo, useState } from "react";
import { Newspaper, ExternalLink, Clock } from "lucide-react";

interface NewsItem {
  title: string;
  source: string;
  link: string;
  pubDate: string;
}

interface NewsTickerProps {
  initialNews: NewsItem[];
  error?: boolean;
  message?: string;
}

function formatTimeAgo(dateString: string): string {
  try {
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / (1000 * 60));
    const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
    const diffDays = Math.floor(diffHours / 24);

    if (diffDays > 0) return `${diffDays}일 전`;
    if (diffHours > 0) return `${diffHours}시간 전`;
    if (diffMins > 0) return `${diffMins}분 전`;
    return "방금 전";
  } catch {
    return "";
  }
}

export function NewsTicker({ initialNews, error = false, message }: NewsTickerProps) {
  const [news] = useState<NewsItem[]>(initialNews);
  const topNews = useMemo(() => news.slice(0, 5), [news]);

  const statusText = message || "최신 뉴스를 불러오는 중입니다";

  return (
    <section className="relative z-0 mt-14 bg-white/55 backdrop-blur-sm border-b border-slate-200/60 py-6 sm:py-7 overflow-hidden">
      <div className="max-w-7xl mx-auto px-4">
        <h2 className="text-2xl sm:text-3xl font-extrabold text-[#002D56] mb-6 leading-tight drop-shadow-sm">
          [오늘의 데이터 정책 뉴스]
        </h2>

        <div className="relative">
          {topNews.length === 0 ? (
            <p className="text-sm text-slate-700 font-medium">{statusText}</p>
          ) : (
            <div className="space-y-3">
              {topNews.map((item, index) => (
                <a
                  key={`${item.link}-${index}`}
                  href={
                    item.link?.trim()
                      ? item.link
                      : `https://search.naver.com/search.naver?where=news&query=${encodeURIComponent(item.title)}`
                  }
                  target="_blank"
                  rel="noopener noreferrer"
                  className="group block rounded-xl border border-slate-200/70 bg-white/70 px-4 py-3 hover:border-slate-300 hover:bg-white transition"
                >
                  <div className="flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">
                    <div className="min-w-0">
                      <p className="text-[15px] sm:text-base font-semibold text-[#002D56] leading-snug group-hover:text-[#0047AB] transition-colors">
                        {item.title}
                      </p>
                    </div>
                    <div className="flex flex-wrap items-center gap-2 sm:justify-end sm:flex-shrink-0">
                      <span className="text-[11px] px-2 py-1 rounded-md bg-slate-200/80 text-slate-800 font-bold uppercase tracking-wide">
                        {item.source}
                      </span>
                      <span className="inline-flex items-center gap-1 text-xs text-slate-600 font-medium tabular-nums">
                        <Clock className="w-3.5 h-3.5 text-slate-500" />
                        {formatTimeAgo(item.pubDate) || "—"}
                      </span>
                      <ExternalLink className="hidden sm:block w-4 h-4 text-slate-400 group-hover:text-[#0047AB] transition-colors" />
                    </div>
                  </div>
                </a>
              ))}
            </div>
          )}
        </div>
      </div>
    </section>
  );
}

export function NewsSection({ initialNews, error = false, message }: NewsTickerProps) {
  const statusText = message || "최신 뉴스를 불러오는 중입니다";

  return (
    <section className="bg-sky-50 py-10 border-y border-sky-100">
      <div className="max-w-7xl mx-auto px-4">
        <div className="flex flex-col lg:flex-row gap-6">
          <div className="lg:w-64 flex-shrink-0">
            <div className="flex items-center gap-3 mb-2">
              <div className="p-2 bg-[#004B8D] rounded-lg">
                <Newspaper className="w-6 h-6 text-white" />
              </div>
              <div>
                <h2 className="text-lg font-extrabold text-[#002D56]">
                  오늘의 데이터 정책 뉴스
                </h2>
                <p className="text-xs text-[#004B8D] font-bold">
                  데이터가 세상을 바꾼다
                </p>
              </div>
            </div>
          </div>

          <div
            className="flex-1"
            style={{
              scrollbarWidth: "auto",
              scrollbarColor: "auto",
            }}
          >
            {initialNews.length === 0 ? (
              <div className="flex items-center justify-center h-40 rounded-lg bg-white border border-sky-200 text-slate-600 font-medium">
                {statusText}
              </div>
            ) : (
              <div className="space-y-2">
                {initialNews.slice(0, 5).map((item, index) => (
                  <a
                    key={`${item.link || item.title}-${index}`}
                    href={
                      item.link?.trim()
                        ? item.link
                        : `https://search.naver.com/search.naver?where=news&query=${encodeURIComponent(item.title)}`
                    }
                    target="_blank"
                    rel="noopener noreferrer"
                    className={`flex items-center gap-4 p-4 rounded-lg bg-white transition-colors group border border-sky-200 shadow-sm ${
                      item.link?.trim() ? "hover:bg-sky-100" : "opacity-75"
                    }`}
                  >
                    <span className="text-xs px-2 py-1 bg-[#004B8D] text-white rounded font-bold min-w-[70px] text-center">
                      {item.source}
                    </span>
                    <span className="flex-1 text-sm text-[#002D56] font-medium group-hover:text-[#004B8D] transition-colors">
                      {item.title}
                    </span>
                    <div className="flex items-center gap-1 text-xs text-slate-500 flex-shrink-0 font-medium">
                      <Clock className="w-3 h-3" />
                      <span>{formatTimeAgo(item.pubDate)}</span>
                    </div>
                    <ExternalLink className="w-4 h-4 text-slate-400 group-hover:text-[#004B8D] transition-colors flex-shrink-0" />
                  </a>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}
