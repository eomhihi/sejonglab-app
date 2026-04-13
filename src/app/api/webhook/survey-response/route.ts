import { timingSafeEqual } from "crypto";
import { NextResponse } from "next/server";
import type { Prisma } from "@prisma/client";

export const runtime = "nodejs";

const API_KEY_HEADER = "x-api-key";

function getExpectedApiKey(): string | undefined {
  return process.env.SURVEY_WEBHOOK_API_KEY?.trim();
}

function extractApiKey(request: Request): string | null {
  const fromHeader = request.headers.get(API_KEY_HEADER)?.trim();
  if (fromHeader) return fromHeader;
  const auth = request.headers.get("authorization")?.trim();
  if (auth?.toLowerCase().startsWith("bearer ")) {
    return auth.slice(7).trim();
  }
  return null;
}

function verifyApiKey(request: Request): boolean {
  const expected = getExpectedApiKey();
  if (!expected || expected.length === 0) {
    return false;
  }
  const provided = extractApiKey(request);
  if (!provided) return false;
  try {
    const a = Buffer.from(provided, "utf8");
    const b = Buffer.from(expected, "utf8");
    if (a.length !== b.length) return false;
    return timingSafeEqual(a, b);
  } catch {
    return false;
  }
}

function normalizeAnswer(raw: unknown): Prisma.InputJsonValue {
  if (raw === undefined || raw === null) {
    return {};
  }
  if (typeof raw === "string") {
    try {
      const parsed = JSON.parse(raw) as unknown;
      return parsed as Prisma.InputJsonValue;
    } catch {
      return { text: raw };
    }
  }
  if (typeof raw === "object") {
    return raw as Prisma.InputJsonValue;
  }
  return { value: raw as Prisma.InputJsonValue };
}

/**
 * POST /api/webhook/survey-response
 * 헤더: X-API-Key: <SURVEY_WEBHOOK_API_KEY> (또는 Authorization: Bearer <key>)
 * 본문 예시:
 * {
 *   "answer": { "q1": "yes", "q2": 3 },
 *   "userId": "cuid...",        // 선택: User.id와 매칭
 *   "userEmail": "a@b.com",    // 선택: 이메일로 User 매칭
 *   "surveyId": "survey-001",
 *   "respondentId": "ext-123"
 * }
 */
export async function POST(request: Request) {
  if (!verifyApiKey(request)) {
    console.warn("[webhook/survey-response] API Key 검증 실패 또는 SURVEY_WEBHOOK_API_KEY 미설정");
    return NextResponse.json(
      { error: "Unauthorized", message: "Invalid or missing API key." },
      { status: 401 }
    );
  }

  if (!process.env.DATABASE_URL) {
    console.error("[webhook/survey-response] DATABASE_URL 없음");
    return NextResponse.json(
      { error: "Service Unavailable", message: "Database not configured." },
      { status: 503 }
    );
  }

  let body: Record<string, unknown>;
  try {
    body = (await request.json()) as Record<string, unknown>;
  } catch {
    console.warn("[webhook/survey-response] JSON 파싱 실패");
    return NextResponse.json({ error: "Bad Request", message: "Invalid JSON body." }, { status: 400 });
  }

  if (!("answer" in body)) {
    return NextResponse.json(
      { error: "Bad Request", message: "Missing required field: answer." },
      { status: 400 }
    );
  }

  const answerJson = normalizeAnswer(body.answer);

  try {
    const { prisma } = await import("@/lib/prisma");

    let userId: string | null = null;
    const uid = body.userId;
    if (typeof uid === "string" && uid.trim().length > 0) {
      const user = await prisma.user.findUnique({ where: { id: uid.trim() } });
      if (user) userId = user.id;
    }
    if (!userId && typeof body.userEmail === "string" && body.userEmail.trim().length > 0) {
      const user = await prisma.user.findUnique({
        where: { email: body.userEmail.trim().toLowerCase() },
      });
      if (user) userId = user.id;
    }

    const surveyId = typeof body.surveyId === "string" ? body.surveyId : null;
    const respondentId = typeof body.respondentId === "string" ? body.respondentId : null;

    const rawPayload: Prisma.InputJsonValue = body as Prisma.InputJsonValue;

    const row = await prisma.surveyResult.create({
      data: {
        userId,
        surveyId,
        respondentId,
        answer: answerJson,
        rawPayload,
      },
    });

    console.log("[webhook/survey-response] 수신·저장 성공", {
      id: row.id,
      userId: row.userId,
      surveyId: row.surveyId,
      respondentId: row.respondentId,
    });

    return NextResponse.json(
      {
        ok: true,
        id: row.id,
        userMatched: !!userId,
      },
      { status: 201 }
    );
  } catch (e) {
    console.error("[webhook/survey-response] DB 저장 오류:", e);
    return NextResponse.json(
      {
        error: "Internal Server Error",
        message: e instanceof Error ? e.message : "Failed to persist survey response.",
      },
      { status: 500 }
    );
  }
}

export async function GET() {
  return NextResponse.json(
    { message: "Method Not Allowed. Use POST with X-API-Key and JSON body containing answer." },
    { status: 405 }
  );
}
