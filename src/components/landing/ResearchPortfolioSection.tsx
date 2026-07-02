"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import type { LucideIcon } from "lucide-react";
import {
  Building2,
  Car,
  ClipboardList,
  FileSearch,
  GraduationCap,
  HeartPulse,
  Landmark,
  Network,
  Scale,
  Video,
  Cpu,
} from "lucide-react";
import { sejongLabProjects, type SejongLabProject } from "@/lib/sejong-lab-projects";

const CARDS_VISIBLE = 3;
const ROTATE_MS = 2000;

const ICON_BOX = "bg-white border-2 border-brand-secondary/70";
const ICON_COLOR = "text-brand-secondary";

function pickProjectIcon(project: SejongLabProject): LucideIcon {
  const text = `${project.title} ${project.client}`;

  if (text.includes("자율주행")) return Car;
  if (text.includes("방송") || text.includes("미디어") || text.includes("영상")) return Video;
  if (text.includes("인권")) return Scale;
  if (text.includes("마음건강") || text.includes("상담")) return HeartPulse;
  if (text.includes("RISE") || text.includes("대학") || text.includes("대학교")) return Building2;
  if (text.includes("연구원") || text.includes("테크노파크") || text.includes("교육청")) return Landmark;
  if (text.includes("산학") || text.includes("협의체") || text.includes("연합회")) return Network;
  if (text.includes("SW") || text.includes("융합")) return Cpu;
  if (text.includes("평생") || text.includes("학습") || text.includes("교육")) return GraduationCap;
  if (text.includes("설문") || text.includes("프로그램")) return ClipboardList;

  return FileSearch;
}

function ProjectCard({ project }: { project: SejongLabProject }) {
  const Icon = pickProjectIcon(project);

  return (
    <article className="group relative flex min-h-[240px] flex-col rounded-2xl border border-slate-100 bg-white p-6 shadow-sm transition-all duration-300 hover:-translate-y-1 hover:border-sejong-blue/20 hover:shadow-xl hover:shadow-sejong-blue/5 sm:min-h-[260px] sm:p-8">
      <div className="mb-5 flex items-start justify-between gap-3">
        <div
          className={`inline-flex h-14 w-14 shrink-0 items-center justify-center rounded-xl ${ICON_BOX}`}
        >
          <Icon className={`h-7 w-7 ${ICON_COLOR}`} aria-hidden />
        </div>
        <time
          dateTime={project.date.replace(/\.$/, "")}
          className="shrink-0 pt-1 text-xs font-medium tabular-nums tracking-tight text-slate-400 sm:text-sm"
        >
          {project.date}
        </time>
      </div>

      <h3 className="mb-4 flex-grow text-base font-bold leading-snug text-[#002D56] break-keep k-keep transition-colors group-hover:text-sejong-blue sm:text-lg">
        {project.title}
      </h3>

      <p className="text-sm font-medium text-slate-500 break-keep k-keep">{project.client}</p>

      <div className="absolute bottom-0 left-0 right-0 h-1 rounded-b-2xl bg-gradient-to-r from-sejong-blue via-brand-secondary to-brand-ash opacity-0 transition-opacity group-hover:opacity-100" />
    </article>
  );
}

export function ResearchPortfolioSection() {
  const [startIndex, setStartIndex] = useState(0);
  const [paused, setPaused] = useState(false);
  const touchPauseTimerRef = useRef<number | null>(null);

  const total = sejongLabProjects.length;

  const pauseForTouch = () => {
    setPaused(true);
    if (touchPauseTimerRef.current !== null) {
      window.clearTimeout(touchPauseTimerRef.current);
    }
    touchPauseTimerRef.current = window.setTimeout(() => {
      setPaused(false);
      touchPauseTimerRef.current = null;
    }, 5000);
  };

  useEffect(() => {
    return () => {
      if (touchPauseTimerRef.current !== null) {
        window.clearTimeout(touchPauseTimerRef.current);
      }
    };
  }, []);

  useEffect(() => {
    if (paused || total <= CARDS_VISIBLE) return;

    const timer = window.setInterval(() => {
      setStartIndex((prev) => (prev + 1) % total);
    }, ROTATE_MS);

    return () => window.clearInterval(timer);
  }, [paused, total]);

  const visibleProjects = useMemo(
    () =>
      Array.from({ length: CARDS_VISIBLE }, (_, offset) => {
        const index = (startIndex + offset) % total;
        return { project: sejongLabProjects[index], index };
      }),
    [startIndex, total]
  );

  return (
    <section
      id="research-portfolio"
      className="bg-gradient-to-b from-brand-light/55 to-white py-16 sm:py-24"
    >
      <div className="mx-auto max-w-6xl px-4 sm:px-6">
        <div className="mb-12 text-center sm:mb-14">
          <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-brand-ash/60 bg-brand-light px-3 py-1.5">
            <FileSearch className="h-4 w-4 text-sejong-blue" aria-hidden />
            <span className="text-sm font-bold text-sejong-blue k-keep">연구 실적 현황</span>
          </div>
          <h2 className="mb-4 text-2xl font-extrabold text-[#002D56] drop-shadow-sm sm:text-3xl lg:text-4xl k-keep">
            공공·지산학 핵심 정책 연구 수행 실적
          </h2>
          <p className="mx-auto max-w-2xl text-base font-medium text-[#002D56] sm:text-lg k-keep leading-relaxed">
            세종랩은 지역 사회의 발전을 위해 공신력 있는 기관들과 함께 깊이 있는 데이터 연구를
            수행합니다.
          </p>
        </div>

        <div
          className="grid gap-6 sm:grid-cols-3 sm:gap-8"
          onMouseEnter={() => setPaused(true)}
          onMouseLeave={() => setPaused(false)}
          onTouchStart={pauseForTouch}
        >
          {visibleProjects.map(({ project, index }, slot) => (
            <div
              key={`${startIndex}-${index}-${slot}`}
              className="research-card-enter"
              style={{ animationDelay: `${slot * 60}ms` }}
            >
              <ProjectCard project={project} />
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
