import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";
import Link from "next/link";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { ArrowLeft, ShieldX, Users, ArrowUpDown, Search } from "lucide-react";

export const dynamic = "force-dynamic";
export const revalidate = 0;

// 기존 /admin 페이지와 동일한 관리자 이메일 사용
const ADMIN_EMAIL = "eomhihi007@gmail.com";

type SearchParams = {
  search?: string;
  order?: "asc" | "desc";
};

async function getUsers(search: string | undefined, order: "asc" | "desc") {
  if (!process.env.DATABASE_URL) return [];

  const where =
    search && search.trim().length > 0
      ? {
          OR: [
            { name: { contains: search.trim(), mode: "insensitive" as const } },
            { email: { contains: search.trim(), mode: "insensitive" as const } },
          ],
        }
      : undefined;

  const users = await prisma.user.findMany({
    where,
    orderBy: { createdAt: order },
    select: {
      id: true,
      name: true,
      email: true,
      createdAt: true,
      accounts: {
        select: {
          provider: true,
        },
      },
    },
  });

  return users.map((u) => ({
    ...u,
    provider: u.accounts[0]?.provider ?? "-",
  }));
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

export const metadata = {
  title: "관리자 | 사용자 목록",
};

export default async function AdminUsersPage({
  searchParams,
}: {
  searchParams: SearchParams;
}) {
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
            className="inline-flex items-center gap-2 px-4 py-2 text-sm font-medium text-white bg-sejong-blue hover:bg-sejong-blue-dark rounded-lg transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            홈으로 돌아가기
          </Link>
        </div>
      </div>
    );
  }

  const search = searchParams.search ?? "";
  const orderParam = searchParams.order === "asc" ? "asc" : "desc";

  const users = await getUsers(search, orderParam);

  const toggleOrder = orderParam === "asc" ? "desc" : "asc";

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-900 via-slate-800 to-slate-900">
      <header className="sticky top-0 z-40 bg-slate-900/95 backdrop-blur border-b border-slate-700">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center gap-3">
              <Link
                href="/admin"
                className="flex items-center gap-2 text-slate-300 hover:text-white transition-colors"
              >
                <ArrowLeft className="w-4 h-4" />
                <span className="text-sm font-medium">관리자 대시보드</span>
              </Link>
              <span className="text-slate-500">|</span>
              <div className="flex items-center gap-2">
                <Users className="w-5 h-5 text-[#60A5FA]" />
                <span className="font-bold text-white">가입 사용자 목록</span>
              </div>
            </div>
            <span className="text-sm text-slate-400 truncate max-w-[200px]">
              {session.user?.email}
            </span>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-4 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
          <form className="flex-1 max-w-md">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
              <input
                type="text"
                name="search"
                defaultValue={search}
                placeholder="이름 또는 이메일로 검색"
                className="w-full pl-9 pr-3 py-2 rounded-lg bg-slate-900/70 border border-slate-700 text-sm text-slate-100 placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-sky-500 focus:border-sky-500"
              />
            </div>
          </form>
          <div className="flex items-center gap-2 self-end">
            <span className="text-xs text-slate-400">
              총 {users.length.toLocaleString()}명
            </span>
            <Link
              href={{
                pathname: "/admin/users",
                query: { search, order: toggleOrder },
              }}
              className="inline-flex items-center gap-1 px-3 py-1.5 rounded-md border border-slate-600 text-xs font-medium text-slate-100 hover:bg-slate-800 transition-colors"
            >
              <ArrowUpDown className="w-3 h-3" />
              가입일 {orderParam === "asc" ? "오래된 순" : "최신 순"}
            </Link>
          </div>
        </div>

        <div className="rounded-xl bg-slate-800/50 border border-slate-700 overflow-hidden shadow-xl">
          <div className="px-6 py-4 border-b border-slate-700 flex items-center justify-between">
            <div>
              <h2 className="text-lg font-bold text-white">가입자 테이블</h2>
              <p className="text-sm text-slate-400 mt-0.5">
                이름, 이메일, 가입 경로, 가입일을 한눈에 확인할 수 있습니다.
              </p>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full min-w-[720px]">
              <thead>
                <tr className="bg-slate-700/50 border-b border-slate-600">
                  <th className="px-4 py-3 text-left text-xs font-semibold text-sky-200 uppercase tracking-wider">
                    이름
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-sky-200 uppercase tracking-wider">
                    이메일
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-sky-200 uppercase tracking-wider">
                    가입 경로
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-sky-200 uppercase tracking-wider whitespace-nowrap">
                    가입일
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-700">
                {users.length === 0 ? (
                  <tr>
                    <td
                      colSpan={4}
                      className="px-4 py-12 text-center text-slate-500 text-sm"
                    >
                      조건에 해당하는 사용자가 없거나 DB가 연결되지 않았습니다.
                    </td>
                  </tr>
                ) : (
                  users.map((user) => (
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
                      <td className="px-4 py-3 text-sm text-slate-300 capitalize">
                        {user.provider}
                      </td>
                      <td className="px-4 py-3 text-sm text-slate-300 whitespace-nowrap">
                        {formatDate(user.createdAt)}
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

