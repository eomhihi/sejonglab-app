import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { onboardingSchema } from "@/lib/onboarding-schema";

export async function POST(request: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.email) {
      return NextResponse.json({ message: "인증되지 않았습니다." }, { status: 401 });
    }

    const body = await request.json();
    const validation = onboardingSchema.safeParse(body);

    if (!validation.success) {
      return NextResponse.json(
        { message: "입력 데이터가 올바르지 않습니다.", errors: validation.error.flatten() },
        { status: 400 }
      );
    }

    const { gender, ageGroup, region, interestTopics } = validation.data;

    // DB가 연결되어 있지 않은 경우를 위한 처리
    if (!process.env.DATABASE_URL) {
      // DB 없이 세션 기반으로만 동작하는 경우 쿠키/로컬 처리 또는 임시 성공 반환
      // 실제 환경에서는 아래 Prisma 코드 사용
      console.log("온보딩 데이터 (DB 미연결):", { gender, ageGroup, region, interestTopics });
      return NextResponse.json({ success: true, message: "저장 완료 (테스트 모드)" });
    }

    // Prisma를 사용한 DB 업데이트
    const { prisma } = await import("@/lib/prisma");

    await prisma.user.update({
      where: { email: session.user.email },
      data: {
        gender,
        ageGroup,
        region,
        interestTopics,
        onboardingCompleted: true,
      },
    });

    return NextResponse.json({ success: true, message: "저장 완료" });
  } catch (error) {
    console.error("온보딩 저장 오류:", error);
    return NextResponse.json({ message: "서버 오류가 발생했습니다." }, { status: 500 });
  }
}

export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.email) {
      return NextResponse.json({ message: "인증되지 않았습니다." }, { status: 401 });
    }

    if (!process.env.DATABASE_URL) {
      return NextResponse.json({ onboardingCompleted: false });
    }

    const { prisma } = await import("@/lib/prisma");
    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
      select: { onboardingCompleted: true },
    });

    return NextResponse.json({ onboardingCompleted: user?.onboardingCompleted ?? false });
  } catch (error) {
    console.error("온보딩 상태 조회 오류:", error);
    return NextResponse.json({ message: "서버 오류가 발생했습니다." }, { status: 500 });
  }
}
