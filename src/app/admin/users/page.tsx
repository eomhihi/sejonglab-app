import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";
import Link from "next/link";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { ArrowLeft, ShieldX, Users } from "lucide-react";
import { isFullAdminEmail, isMemberListAdminEmail } from "@/lib/admin";
import { ExcelDownloadButton } from "@/components/admin/ExcelDownloadButton";
import { MembersTable } from "@/components/admin/MembersTable";

export const dynamic = "force-dynamic";
export const revalidate = 0;

export const metadata = {
  title: "관리자 | 회원 목록",
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
        occupation: true,
        interestTopics: true,
        interests: true,
        participationActivities: true,
        signupPath: true,
        signupPathEtc: true,
        createdAt: true,
      },
    });
    return users;
  } catch {
    return [];
  }
}

export default async function AdminUsersPage() {
  const session = await getServerSession(authOptions);
  if (!session) redirect("/auth/signin");

  // 회원 목록·엑셀: 엑셀 다운로드 권한 이상. 수정·삭제는 전체 관리자만
  const canAccessMemberList = isMemberListAdminEmail(session.user?.email);
  const canManageMembers = isFullAdminEmail(session.user?.email);
  if (!canAccessMemberList) {
    return (
      <div className="min-h-screen bg-slate-900 flex items-center justify-center p-4">
        <div className="max-w-md w-full rounded-2xl bg-slate-800 border border-slate-700 p-8 text-center shadow-xl">
          <div className="w-16 h-16 rounded-full bg-red-500/20 flex items-center justify-center mx-auto mb-4">
            <ShieldX className="w-8 h-8 text-red-400" />
          </div>
          <h1 className="text-xl font-bold text-white mb-2">접근 제한</h1>
          <p className="text-slate-400 text-sm mb-6">
            회원 상세 목록·엑셀 다운로드 권한이 없습니다.
          </p>
          <Link
            href="/admin"
            className="inline-flex items-center gap-2 px-4 py-2 text-sm font-medium text-white bg-sejong-blue hover:bg-sejong-blue-dark rounded-lg transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            관리자 대시보드로
          </Link>
        </div>
      </div>
    );
  }

  const members = await getMembers();
  const membersForClient = members.map((m) => ({
    ...m,
    createdAt: m.createdAt.toISOString(),
  }));

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
                <span className="font-bold text-white">회원 목록</span>
              </div>
            </div>
            <span className="text-sm text-slate-400 truncate max-w-[200px]">
              {session.user?.email}
            </span>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
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

          <MembersTable initialMembers={membersForClient} canManageMembers={canManageMembers} />
        </div>
      </main>
    </div>
  );
}
