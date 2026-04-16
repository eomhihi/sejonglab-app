"use client";

import { Fragment, useMemo } from "react";
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

function articleHref(item: NewsItem): string {
  if (item.link?.trim()) return item.link.trim();
  return `https://www.google.com/search?q=${encodeURIComponent(item.title)}&tbm=nws`;
}

/** 로고 바로 아래: 제목만 가로 흐름, 호버 시 정지, 클릭 시 기사 */
export function NewsTicker({ initialNews, error = false, message }: NewsTickerProps) {
  const topNews = useMemo(() => initialNews.slice(0, 5), [initialNews]);
  const statusText = message || "최신 뉴스를 불러오는 중입니다";

  return (
    <div
      className="mt-28 sm:mt-24 border-b border-slate-200/70 bg-white/75 backdrop-blur-sm"
      role="region"
      aria-label="데이터·변화 관련 뉴스"
    >
      <div className="group/ticker relative overflow-hidden motion-reduce:overflow-x-auto py-2.5 sm:py-3">
        {topNews.length === 0 ? (
          <p className="px-4 text-center text-sm font-medium text-slate-600">{statusText}</p>
        ) : (
          <div className="flex w-max motion-safe:animate-ticker motion-safe:group-hover/ticker:[animation-play-state:paused]">
            {[0, 1].map((track) => (
              <div
                key={track}
                className="flex shrink-0 items-stretch"
                aria-hidden={track === 1 || undefined}
              >
                {topNews.map((item, index) => (
                  <Fragment key={`${track}-${item.link}-${index}`}>
                    {index > 0 ? (
                      <span
                        className="mx-5 hidden shrink-0 self-center text-slate-300 sm:inline"
                        aria-hidden
                      >
                        ·
                      </span>
                    ) : null}
                    <a
                      href={articleHref(item)}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="max-w-[min(100vw-2rem,42rem)] shrink-0 truncate text-sm font-semibold text-primary-800 transition-colors hover:text-sejong-blue focus:outline-none focus-visible:ring-2 focus-visible:ring-sejong-blue/40 focus-visible:ring-offset-2 focus-visible:ring-offset-white sm:max-w-[min(72vw,36rem)]"
                      title={item.title}
                    >
                      {item.title}
                    </a>
                  </Fragment>
                ))}
              </div>
            ))}
          </div>
        )}
      </div>
      {error && topNews.length > 0 ? (
        <p className="sr-only">일부 뉴스는 대체 소스에서 표시될 수 있습니다.</p>
      ) : null}
    </div>
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
              <div className="p-2 bg-sejong-blue rounded-lg">
                <Newspaper className="w-6 h-6 text-white" />
              </div>
              <div>
                <h2 className="text-lg font-extrabold text-primary-800">오늘의 데이터 정책 뉴스</h2>
                <p className="text-xs text-sejong-blue font-bold">데이터가 세상을 바꾼다</p>
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
                    href={articleHref(item)}
                    target="_blank"
                    rel="noopener noreferrer"
                    className={`flex items-center gap-4 p-4 rounded-lg bg-white transition-colors group border border-sky-200 shadow-sm ${
                      item.link?.trim() ? "hover:bg-sky-100" : "opacity-75"
                    }`}
                  >
                    <span className="text-xs px-2 py-1 bg-sejong-blue text-white rounded font-bold min-w-[70px] text-center">
                      {item.source}
                    </span>
                    <span className="flex-1 text-sm text-primary-800 font-medium group-hover:text-sejong-blue transition-colors">
                      {item.title}
                    </span>
                    <div className="flex items-center gap-1 text-xs text-slate-500 flex-shrink-0 font-medium">
                      <Clock className="w-3 h-3" />
                      <span>{formatTimeAgo(item.pubDate)}</span>
                    </div>
                    <ExternalLink className="w-4 h-4 text-slate-400 group-hover:text-sejong-blue transition-colors flex-shrink-0" />
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
