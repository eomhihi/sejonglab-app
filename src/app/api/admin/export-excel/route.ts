// 패키지 설치 안내: 터미널에서 npm install xlsx 를 실행하세요.
import { getServerSession } from "next-auth";
import { NextResponse } from "next/server";
import * as XLSX from "xlsx";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

const ADMIN_EMAIL = "eomhihi007@gmail.com";

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

/** Prisma 유저 목록을 엑셀 행 배열로 변환 */
function usersToExcelRows(
  users: Array<{
    id: string;
    name: string | null;
    email: string | null;
    phone: string | null;
    gender: string | null;
    ageGroup: string | null;
    region: string | null;
    occupation: string | null;
    interestTopics: string[];
    interests: string[];
    participationActivities: string[];
    createdAt: Date;
    accounts: { provider: string }[];
  }>
) {
  return users.map((u) => {
    const provider = u.accounts?.[0]?.provider ?? "-";
    const interestTags =
      u.interests?.length > 0 ? u.interests : u.interestTopics ?? [];
    const 관심사 =
      Array.isArray(interestTags) && interestTags.length > 0
        ? interestTags.join(", ")
        : "-";
    const 참여활동 =
      Array.isArray(u.participationActivities) &&
      u.participationActivities.length > 0
        ? u.participationActivities.join(", ")
        : "-";
    return {
      이름: u.name ?? "-",
      이메일: u.email ?? "-",
      가입경로: provider,
      전화번호: u.phone ?? "-",
      성별: formatGender(u.gender),
      연령대: u.ageGroup ?? "-",
      거주지: u.region ?? "-",
      직업: u.occupation ?? "-",
      관심사,
      참여활동,
      가입일: formatDate(u.createdAt),
    };
  });
}

export async function GET() {
  const session = await getServerSession(authOptions);
  if (!session?.user?.email || session.user.email !== ADMIN_EMAIL) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  if (!process.env.DATABASE_URL) {
    return NextResponse.json(
      { error: "DATABASE_URL not configured" },
      { status: 500 }
    );
  }

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
        createdAt: true,
        accounts: { select: { provider: true } },
      },
    });

    const rows = usersToExcelRows(users as Parameters<typeof usersToExcelRows>[0]);
    const sheet = XLSX.utils.json_to_sheet(rows);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, sheet, "패널목록");
    const buf = XLSX.write(wb, { type: "buffer", bookType: "xlsx" });

    const filename = "세종랩_패널목록.xlsx";
    return new NextResponse(buf, {
      status: 200,
      headers: {
        "Content-Type":
          "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
        "Content-Disposition": `attachment; filename="${encodeURIComponent(filename)}"`,
      },
    });
  } catch (e) {
    console.error("[admin export-excel]", e);
    return NextResponse.json(
      { error: e instanceof Error ? e.message : "Export failed" },
      { status: 500 }
    );
  }
}
