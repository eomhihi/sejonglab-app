import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { onboardingSchema } from "@/lib/onboarding-schema";

export const runtime = "nodejs";

export async function POST(request: Request) {
  try {
    const body = (await request.json()) as Record<string, unknown>;
    const { userId, email, ...rest } = body;
    const validation = onboardingSchema.safeParse(rest);

    if (!validation.success) {
      return NextResponse.json(
        { message: "입력 데이터가 올바르지 않습니다.", errors: validation.error.flatten() },
        { status: 400 }
      );
    }

    const userEmail = typeof email === "string" ? email.toLowerCase().trim() : undefined;
    const userIdStr = typeof userId === "string" ? userId : undefined;

    if (!userIdStr && !userEmail) {
      console.log("[onboarding][POST] no userId/email in body");
      return NextResponse.json({ message: "인증되지 않았습니다." }, { status: 401 });
    }

    const { phone, gender, ageGroup, region, interests, participationActivities } = validation.data;
    const areaOrRegion = region ?? (body.area as string | undefined) ?? null;
    const activities = participationActivities ?? [];

    if (!process.env.DATABASE_URL) {
      console.log("온보딩 데이터 (DB 미연결):", { phone, gender, ageGroup, region: areaOrRegion, interests, activities });
      return NextResponse.json({ success: true, message: "저장 완료 (테스트 모드)" });
    }

    const { prisma } = await import("@/lib/prisma");

    await prisma.user.update({
      where: userIdStr ? { id: userIdStr } : { email: userEmail! },
      data: {
        phone: phone ?? null,
        region: areaOrRegion,
        gender,
        ageGroup,
        interests,
        participationActivities: activities,
        interestTopics: interests,
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
    console.log("[onboarding][GET] session:", JSON.stringify(session ?? null));

    const userFromSession = session?.user as { id?: string; email?: string } | undefined;
    const userId = userFromSession?.id;
    const userEmail = userFromSession?.email?.toLowerCase().trim();

    if (!session || (!userId && !userEmail)) {
      console.log("[onboarding][GET] no valid user in session");
      return NextResponse.json({ message: "인증되지 않았습니다." }, { status: 401 });
    }

    if (!process.env.DATABASE_URL) {
      return NextResponse.json({ onboardingCompleted: false });
    }

    const { prisma } = await import("@/lib/prisma");
    const user = await prisma.user.findUnique({
      where: userId ? { id: userId } : { email: userEmail! },
      select: { onboardingCompleted: true },
    });

    return NextResponse.json({ onboardingCompleted: user?.onboardingCompleted ?? false });
  } catch (error) {
    console.error("온보딩 상태 조회 오류:", error);
    return NextResponse.json({ message: "서버 오류가 발생했습니다." }, { status: 500 });
  }
}
