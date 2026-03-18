"use client";

import { useState } from "react";
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
    const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
    const diffDays = Math.floor(diffHours / 24);

    if (diffDays > 0) return `${diffDays}일 전`;
    if (diffHours > 0) return `${diffHours}시간 전`;
    return "방금 전";
  } catch {
    return "";
  }
}

export function NewsTicker({ initialNews, error = false, message }: NewsTickerProps) {
  const [isPaused, setIsPaused] = useState(false);
  const [news] = useState<NewsItem[]>(initialNews);

  const duplicatedNews = [...news, ...news];

  const statusText = message || "최신 뉴스를 불러오는 중입니다";

  return (
    <section className="bg-sky-50 border-b border-sky-100 py-3 overflow-hidden">
      <div className="max-w-7xl mx-auto px-4">
        <div className="flex items-center gap-4">
          <div className="flex-shrink-0 flex items-center gap-2 pr-4 border-r border-sky-200">
            <Newspaper className="w-5 h-5 text-[#004B8D]" />
            <span className="font-bold text-sm whitespace-nowrap text-[#004B8D]">
              오늘의 데이터 정책 뉴스
            </span>
          </div>

          <div
            className="flex-1 overflow-hidden relative"
            onMouseEnter={() => setIsPaused(true)}
            onMouseLeave={() => setIsPaused(false)}
          >
            {error || news.length === 0 ? (
              <p className="text-sm text-slate-600 font-medium">{statusText}</p>
            ) : (
              <div
                className={`flex gap-8 ${isPaused ? "" : "animate-ticker"}`}
                style={{ width: "max-content" }}
              >
                {duplicatedNews.map((item, index) => (
                  <a
                    key={`${item.link}-${index}`}
                    href={
                      item.link?.trim()
                        ? item.link
                        : `https://search.naver.com/search.naver?where=news&query=${encodeURIComponent(item.title)}`
                    }
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-3 group whitespace-nowrap hover:text-[#004B8D] transition-colors"
                  >
                    <span className="text-xs px-2 py-0.5 bg-[#004B8D] rounded text-white font-bold group-hover:bg-[#003666] transition-colors">
                      {item.source}
                    </span>
                    <span className="text-sm font-medium text-[#002D56]">{item.title}</span>
                    <ExternalLink className="w-3 h-3 opacity-0 group-hover:opacity-100 transition-opacity text-[#004B8D]" />
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
            className="flex-1 min-h-[10rem] overflow-y-auto pr-2 scrollbar-thin"
            style={{
              scrollbarWidth: "thin",
              scrollbarColor: "#004B8D #e0f2fe",
            }}
          >
            {error || initialNews.length === 0 ? (
              <div className="flex items-center justify-center h-40 rounded-lg bg-white border border-sky-200 text-slate-600 font-medium">
                {statusText}
              </div>
            ) : (
              <div className="space-y-2">
                {initialNews.map((item, index) => (
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
