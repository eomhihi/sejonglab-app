import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";
import Link from "next/link";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import {
  Users,
  UserPlus,
  ShieldX,
  LayoutDashboard,
  ArrowLeft,
  Table2,
  CheckCircle2,
} from "lucide-react";
import { isAdminEmail, isFullAdminEmail } from "@/lib/admin";
import { AdminDashboard, type AdminDashboardData } from "@/components/admin/AdminDashboard";
import { GENDER_OPTIONS, AGE_GROUP_OPTIONS } from "@/lib/onboarding-options";

export const dynamic = "force-dynamic";
export const revalidate = 0;

export const metadata = {
  title: "관리자 | 세종랩",
  description: "세종랩 관리자 대시보드",
};

const GENDER_LABEL: Record<string, string> = Object.fromEntries(
  GENDER_OPTIONS.map((o) => [o.value, o.label])
);
const AGE_LABEL: Record<string, string> = Object.fromEntries(
  AGE_GROUP_OPTIONS.map((o) => [o.value, o.label])
);

async function getStats() {
  if (!process.env.DATABASE_URL) return { total: 0, todayNew: 0, weekNew: 0, onboardingCompleted: 0 };
  try {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const weekAgo = new Date();
    weekAgo.setDate(weekAgo.getDate() - 7);

    const [total, todayNew, weekNew, onboardingCompleted] = await Promise.all([
      prisma.user.count(),
      prisma.user.count({ where: { createdAt: { gte: today } } }),
      prisma.user.count({ where: { createdAt: { gte: weekAgo } } }),
      prisma.user.count({ where: { onboardingCompleted: true } }),
    ]);
    return { total, todayNew, weekNew, onboardingCompleted };
  } catch {
    return { total: 0, todayNew: 0, weekNew: 0, onboardingCompleted: 0 };
  }
}

/** 대시보드 집계 (개인정보 미포함 — 분포/추이만) */
async function getDashboardData(total: number, onboardingCompleted: number): Promise<AdminDashboardData | null> {
  if (!process.env.DATABASE_URL) return null;
  try {
    const [genderG, ageG, regionG, occG, pathG, providerG, createdRows] = await Promise.all([
      prisma.user.groupBy({ by: ["gender"], _count: { _all: true } }),
      prisma.user.groupBy({ by: ["ageGroup"], _count: { _all: true } }),
      prisma.user.groupBy({ by: ["region"], _count: { _all: true } }),
      prisma.user.groupBy({ by: ["occupation"], _count: { _all: true } }),
      prisma.user.groupBy({ by: ["signupPath"], _count: { _all: true } }),
      prisma.account.groupBy({ by: ["provider"], _count: { _all: true } }),
      prisma.user.findMany({ select: { createdAt: true } }),
    ]);

    const toEntries = (
      rows: { _count: { _all: number } }[],
      pick: (r: never) => string | null,
      labelMap?: Record<string, string>
    ) =>
      rows
        .map((r) => {
          const raw = pick(r as never);
          const key = raw ?? "미입력";
          return { label: labelMap?.[key] ?? key, value: r._count._all };
        })
        .filter((e) => e.value > 0)
        .sort((a, b) => b.value - a.value);

    const gender = toEntries(genderG, (r: { gender: string | null }) => r.gender, GENDER_LABEL);

    // 연령대는 정의된 순서대로 정렬
    const ageRaw = toEntries(ageG, (r: { ageGroup: string | null }) => r.ageGroup, AGE_LABEL);
    const ageOrder = AGE_GROUP_OPTIONS.map((o) => o.label);
    const ageGroup = [...ageRaw].sort(
      (a, b) => ageOrder.indexOf(a.label as string) - ageOrder.indexOf(b.label as string)
    );

    const region = toEntries(regionG, (r: { region: string | null }) => r.region).slice(0, 8);
    const occupation = toEntries(occG, (r: { occupation: string | null }) => r.occupation).slice(0, 8);
    const signupPath = toEntries(pathG, (r: { signupPath: string | null }) => r.signupPath);
    const provider = toEntries(providerG, (r: { provider: string | null }) => r.provider);

    // 최근 14일 일자별 신규 가입 집계
    const days = 14;
    const buckets: { date: string; count: number }[] = [];
    const keyToIdx = new Map<string, number>();
    for (let i = days - 1; i >= 0; i--) {
      const d = new Date();
      d.setHours(0, 0, 0, 0);
      d.setDate(d.getDate() - i);
      const key = `${d.getFullYear()}-${d.getMonth()}-${d.getDate()}`;
      const label = `${String(d.getMonth() + 1).padStart(2, "0")}/${String(d.getDate()).padStart(2, "0")}`;
      keyToIdx.set(key, buckets.length);
      buckets.push({ date: label, count: 0 });
    }
    for (const row of createdRows) {
      const d = new Date(row.createdAt);
      d.setHours(0, 0, 0, 0);
      const key = `${d.getFullYear()}-${d.getMonth()}-${d.getDate()}`;
      const idx = keyToIdx.get(key);
      if (idx !== undefined) buckets[idx].count += 1;
    }

    return {
      total,
      onboardingCompleted,
      daily: buckets,
      gender,
      ageGroup,
      region,
      occupation,
      signupPath,
      provider,
    };
  } catch (e) {
    console.error("[admin dashboard] 집계 오류:", e);
    return null;
  }
}

export default async function AdminPage() {
  const session = await getServerSession(authOptions);
  if (!session) redirect("/auth/signin");

  const isAdmin = isAdminEmail(session.user?.email);

  if (!isAdmin) {
    return (
      <div className="min-h-screen bg-slate-900 flex items-center justify-center p-4">
        <div className="max-w-md w-full rounded-2xl bg-slate-800 border border-slate-700 p-8 text-center shadow-xl">
          <div className="w-16 h-16 rounded-full bg-red-500/20 flex items-center justify-center mx-auto mb-4">
            <ShieldX className="w-8 h-8 text-red-400" />
          </div>
          <h1 className="text-xl font-bold text-white mb-2">접근 제한</h1>
          <p className="text-slate-400 text-sm mb-6">
            관리자 권한이 없어 이 페이지에 접근할 수 없습니다.
          </p>
          <Link
            href="/"
            className="inline-flex items-center gap-2 px-4 py-2 text-sm font-medium text-white bg-sejong-blue hover:bg-sejong-blue-dark rounded-lg transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            홈으로 돌아가기
          </Link>
        </div>
      </div>
    );
  }

  const isFullAdmin = isFullAdminEmail(session.user?.email);
  const stats = await getStats();
  // 분포/추이 차트는 전체 권한 관리자에게만 노출 (통계 전용 계정은 가입자 수 카드만)
  const dashboardData = isFullAdmin
    ? await getDashboardData(stats.total, stats.onboardingCompleted)
    : null;

  const completionRate =
    stats.total > 0 ? Math.round((stats.onboardingCompleted / stats.total) * 100) : 0;

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-900 via-slate-800 to-slate-900">
      {/* 헤더 */}
      <header className="sticky top-0 z-50 bg-slate-900/95 backdrop-blur border-b border-slate-700">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center gap-3">
              <Link
                href="/"
                className="flex items-center gap-2 text-slate-300 hover:text-white transition-colors"
              >
                <ArrowLeft className="w-4 h-4" />
                <span className="text-sm font-medium">홈</span>
              </Link>
              <span className="text-slate-500">|</span>
              <div className="flex items-center gap-2">
                <LayoutDashboard className="w-5 h-5 text-[#60A5FA]" />
                <span className="font-bold text-white">관리자 대시보드</span>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <Link
                href="/api/auth/signout?callbackUrl=/"
                className="text-xs text-slate-400 hover:text-sky-400 transition-colors"
              >
                세션 종료
              </Link>
              <span className="text-sm text-slate-400 truncate max-w-[200px]">
                {session.user?.email}
              </span>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* 요약 카드 */}
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          <div className="rounded-xl bg-gradient-to-br from-sejong-blue to-sejong-blue-dark p-6 border border-slate-600/50 shadow-lg">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-lg bg-white/10 flex items-center justify-center">
                <Users className="w-6 h-6 text-sky-300" />
              </div>
              <div>
                <p className="text-sm font-medium text-sky-200/90">총 가입자 수</p>
                <p className="text-2xl sm:text-3xl font-extrabold text-white tabular-nums">
                  {stats.total.toLocaleString()}명
                </p>
              </div>
            </div>
          </div>
          <div className="rounded-xl bg-gradient-to-br from-sky-600 to-sejong-blue p-6 border border-slate-600/50 shadow-lg">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-lg bg-white/10 flex items-center justify-center">
                <UserPlus className="w-6 h-6 text-sky-200" />
              </div>
              <div>
                <p className="text-sm font-medium text-sky-200/90">오늘 신규 가입</p>
                <p className="text-2xl sm:text-3xl font-extrabold text-white tabular-nums">
                  {stats.todayNew.toLocaleString()}명
                </p>
              </div>
            </div>
          </div>
          <div className="rounded-xl bg-slate-800/60 p-6 border border-slate-700 shadow-lg">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-lg bg-white/5 flex items-center justify-center">
                <UserPlus className="w-6 h-6 text-emerald-300" />
              </div>
              <div>
                <p className="text-sm font-medium text-slate-300">최근 7일 신규</p>
                <p className="text-2xl sm:text-3xl font-extrabold text-white tabular-nums">
                  {stats.weekNew.toLocaleString()}명
                </p>
              </div>
            </div>
          </div>
          <div className="rounded-xl bg-slate-800/60 p-6 border border-slate-700 shadow-lg">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-lg bg-white/5 flex items-center justify-center">
                <CheckCircle2 className="w-6 h-6 text-violet-300" />
              </div>
              <div>
                <p className="text-sm font-medium text-slate-300">온보딩 완료율</p>
                <p className="text-2xl sm:text-3xl font-extrabold text-white tabular-nums">{completionRate}%</p>
              </div>
            </div>
          </div>
        </div>

        {isFullAdmin ? (
          <>
            {/* 전체 데이터 테이블 + 엑셀 다운로드 페이지로 이동 */}
            <div className="mb-6 flex justify-end">
              <Link
                href="/admin/users"
                className="inline-flex items-center gap-2 px-4 py-2.5 rounded-lg font-medium text-sm bg-slate-700 hover:bg-slate-600 text-white shadow-md transition-colors border border-slate-600"
              >
                <Table2 className="w-4 h-4" />
                회원 목록 · 엑셀 다운로드
              </Link>
            </div>

            {dashboardData ? (
              <AdminDashboard data={dashboardData} />
            ) : (
              <div className="rounded-xl bg-slate-800/50 border border-slate-700 px-6 py-8 shadow-xl text-center text-sm text-slate-400">
                집계 데이터를 불러오지 못했습니다. (DB 연결을 확인해 주세요)
              </div>
            )}
          </>
        ) : (
          <div className="rounded-xl bg-slate-800/50 border border-slate-700 px-6 py-8 shadow-xl text-center">
            <p className="text-sm text-slate-300">
              이 계정은 <span className="font-semibold text-sky-300">가입자 수 통계 열람</span> 권한만 부여되어 있습니다.
            </p>
            <p className="text-xs text-slate-500 mt-1.5">
              상세 분석 대시보드·회원 목록·엑셀 다운로드는 전체 권한 관리자만 이용할 수 있습니다.
            </p>
          </div>
        )}
      </main>
    </div>
  );
}
