"use client";

import { Fragment, useMemo } from "react";
import { Newspaper } from "lucide-react";

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

function articleHref(item: NewsItem): string {
  if (item.link?.trim()) return item.link.trim();
  return `https://search.naver.com/search.naver?where=news&query=${encodeURIComponent(item.title)}`;
}

/** 로고 바로 아래: 제목만 가로 흐름, 호버 시 정지, 클릭 시 기사 */
export function NewsTicker({ initialNews, error = false, message }: NewsTickerProps) {
  const topNews = useMemo(() => initialNews.slice(0, 5), [initialNews]);
  const statusText = message || "최신 뉴스를 불러오는 중입니다";

  return (
    <div
      className="hidden md:block mt-28 sm:mt-24 border-b border-slate-200/70 bg-white/75 backdrop-blur-sm"
      role="region"
      aria-label="데이터·변화 관련 뉴스"
    >
      <div className="max-w-7xl mx-auto px-4 pt-3">
        <div className="inline-flex items-center gap-2 px-3 py-1.5 bg-slate-100 rounded-full">
          <Newspaper className="w-4 h-4 text-oxford" />
          <span className="text-sm font-bold text-oxford k-keep">오늘의 데이터 정책 뉴스</span>
        </div>
      </div>

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
                      <span className="mr-2 inline-flex items-center rounded-md bg-slate-100 px-2 py-0.5 text-[11px] font-semibold text-oxford">
                        {item.source || "뉴스"}
                      </span>
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
