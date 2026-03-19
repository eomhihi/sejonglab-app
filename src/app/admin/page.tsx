// 엑셀 다운로드 기능 사용 시 터미널에서: npm install xlsx
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
} from "lucide-react";
import { ExcelDownloadButton } from "@/components/admin/ExcelDownloadButton";

// 이 이메일만 /admin 접근 및 헤더 「관리자」 링크 노출 (유일한 관리자 계정)
const ADMIN_EMAIL = "eomhihi007@gmail.com";

export const metadata = {
  title: "관리자 | 세종랩",
  description: "세종랩 관리자 대시보드",
};

async function getMembers() {
  if (!process.env.DATABASE_URL) return [];
  try {
    const users = await prisma.user.findMany({
      orderBy: { createdAt: "desc" },
      select: {
        id: true,
        name: true,
        email: true,
        phone: true,
        gender: true,
        ageGroup: true,
        region: true,
        interestTopics: true,
        interests: true,
        participationActivities: true,
        createdAt: true,
      },
    });
    return users;
  } catch {
    return [];
  }
}

async function getStats() {
  if (!process.env.DATABASE_URL)
    return { total: 0, todayNew: 0 };
  try {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const [total, todayNew] = await Promise.all([
      prisma.user.count(),
      prisma.user.count({
        where: { createdAt: { gte: today } },
      }),
    ]);
    return { total, todayNew };
  } catch {
    return { total: 0, todayNew: 0 };
  }
}

function formatGender(g: string | null): string {
  if (!g) return "-";
  if (g === "male") return "남성";
  if (g === "female") return "여성";
  return g;
}

function formatDate(d: Date): string {
  return new Intl.DateTimeFormat("ko-KR", {
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
  }).format(d);
}

export default async function AdminPage() {
  const session = await getServerSession(authOptions);
  if (!session) redirect("/auth/signin");

  const isAdmin = session.user?.email === ADMIN_EMAIL;

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
            className="inline-flex items-center gap-2 px-4 py-2 text-sm font-medium text-white bg-[#004B8D] hover:bg-[#003666] rounded-lg transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            홈으로 돌아가기
          </Link>
        </div>
      </div>
    );
  }

  const [members, stats] = await Promise.all([getMembers(), getStats()]);

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
        <div className="grid sm:grid-cols-2 gap-4 mb-8">
          <div className="rounded-xl bg-gradient-to-br from-[#004B8D] to-[#003666] p-6 border border-slate-600/50 shadow-lg">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-lg bg-white/10 flex items-center justify-center">
                <Users className="w-6 h-6 text-sky-300" />
              </div>
              <div>
                <p className="text-sm font-medium text-sky-200/90">총 가입자 수</p>
                <p className="text-2xl sm:text-3xl font-extrabold text-white">
                  {stats.total.toLocaleString()}명
                </p>
              </div>
            </div>
          </div>
          <div className="rounded-xl bg-gradient-to-br from-sky-600 to-[#004B8D] p-6 border border-slate-600/50 shadow-lg">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-lg bg-white/10 flex items-center justify-center">
                <UserPlus className="w-6 h-6 text-sky-200" />
              </div>
              <div>
                <p className="text-sm font-medium text-sky-200/90">오늘 신규 가입</p>
                <p className="text-2xl sm:text-3xl font-extrabold text-white">
                  {stats.todayNew.toLocaleString()}명
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* 회원 목록 테이블 */}
        <div className="rounded-xl bg-slate-800/50 border border-slate-700 overflow-hidden shadow-xl">
          <div className="px-6 py-4 border-b border-slate-700 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
            <div>
              <h2 className="text-lg font-bold text-white">가입 회원 목록</h2>
              <p className="text-sm text-slate-400 mt-0.5">
                DB 실시간 연동 · {members.length}명
              </p>
            </div>
            <div className="flex-shrink-0">
              <ExcelDownloadButton />
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full min-w-[900px]">
              <thead>
                <tr className="bg-slate-700/50 border-b border-slate-600">
                  <th className="px-4 py-3 text-left text-xs font-semibold text-sky-200 uppercase tracking-wider">
                    이름
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-sky-200 uppercase tracking-wider">
                    이메일
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-sky-200 uppercase tracking-wider">
                    전화번호
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-sky-200 uppercase tracking-wider">
                    성별
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-sky-200 uppercase tracking-wider">
                    연령대
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-sky-200 uppercase tracking-wider">
                    가입일
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-sky-200 uppercase tracking-wider">
                    관심·참여
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-sky-200 uppercase tracking-wider">
                    거주지
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-700">
                {members.length === 0 ? (
                  <tr>
                    <td
                      colSpan={8}
                      className="px-4 py-12 text-center text-slate-500 text-sm"
                    >
                      DB가 연결되지 않았거나 등록된 회원이 없습니다.
                    </td>
                  </tr>
                ) : (
                  members.map((user) => (
                    <tr
                      key={user.id}
                      className="hover:bg-slate-700/30 transition-colors"
                    >
                      <td className="px-4 py-3 text-sm font-medium text-white">
                        {user.name ?? "-"}
                      </td>
                      <td className="px-4 py-3 text-sm text-slate-300">
                        {user.email ?? "-"}
                      </td>
                      <td className="px-4 py-3 text-sm text-slate-300">
                        {user.phone ?? "-"}
                      </td>
                      <td className="px-4 py-3 text-sm text-slate-300">
                        {formatGender(user.gender)}
                      </td>
                      <td className="px-4 py-3 text-sm text-slate-300">
                        {user.ageGroup ?? "-"}
                      </td>
                      <td className="px-4 py-3 text-sm text-slate-300 whitespace-nowrap">
                        {formatDate(user.createdAt)}
                      </td>
                      <td className="px-4 py-3 max-w-[280px]">
                        {(() => {
                          const tags =
                            user.interests?.length > 0 ? user.interests : user.interestTopics ?? [];
                          return tags.length > 0 ? (
                            <div className="flex flex-wrap gap-1 mb-1">
                              {tags.map((topic) => (
                                <span
                                  key={topic}
                                  className="px-2 py-0.5 text-xs bg-sky-500/20 text-sky-200 rounded"
                                >
                                  {topic}
                                </span>
                              ))}
                            </div>
                          ) : null;
                        })()}
                        {user.participationActivities && user.participationActivities.length > 0 ? (
                          <div className="flex flex-wrap gap-1 mt-1">
                            {user.participationActivities.map((a) => (
                              <span
                                key={a}
                                className="px-2 py-0.5 text-[10px] bg-emerald-500/15 text-emerald-200 rounded"
                              >
                                {a}
                              </span>
                            ))}
                          </div>
                        ) : null}
                        {(!user.interests?.length && !user.interestTopics?.length) &&
                        !user.participationActivities?.length ? (
                          <span className="text-slate-500">-</span>
                        ) : null}
                      </td>
                      <td className="px-4 py-3 text-sm text-slate-300">
                        {user.region ?? "-"}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </main>
    </div>
  );
}
