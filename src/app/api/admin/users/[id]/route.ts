import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export const runtime = "nodejs";

const ADMIN_EMAIL = "eomhihi007@gmail.com";

function forbidden() {
  return NextResponse.json({ error: "Forbidden" }, { status: 403 });
}

function badRequest(message: string) {
  return NextResponse.json({ error: message }, { status: 400 });
}

function normalizeString(v: unknown): string | null | undefined {
  if (v === undefined) return undefined;
  if (v === null) return null;
  if (typeof v !== "string") return undefined;
  const t = v.trim();
  return t.length === 0 ? null : t;
}

export async function PATCH(
  request: Request,
  { params }: { params: { id: string } }
) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.email || session.user.email !== ADMIN_EMAIL) return forbidden();
  if (!process.env.DATABASE_URL) {
    return NextResponse.json({ error: "DATABASE_URL not configured" }, { status: 500 });
  }

  const id = params.id;
  if (!id) return badRequest("Missing id");

  const body = (await request.json()) as Record<string, unknown>;

  const gender =
    body.gender === undefined
      ? undefined
      : body.gender === null || body.gender === ""
        ? null
        : body.gender === "male" || body.gender === "female"
          ? body.gender
          : undefined;
  if (body.gender !== undefined && gender === undefined) {
    return badRequest("Invalid gender");
  }

  const interests =
    body.interests === undefined
      ? undefined
      : Array.isArray(body.interests) && body.interests.every((x) => typeof x === "string")
        ? (body.interests as string[]).map((s) => s.trim()).filter(Boolean)
        : undefined;
  if (body.interests !== undefined && interests === undefined) {
    return badRequest("Invalid interests");
  }

  const participationActivities =
    body.participationActivities === undefined
      ? undefined
      : Array.isArray(body.participationActivities) &&
          body.participationActivities.every((x) => typeof x === "string")
        ? (body.participationActivities as string[]).map((s) => s.trim()).filter(Boolean)
        : undefined;
  if (body.participationActivities !== undefined && participationActivities === undefined) {
    return badRequest("Invalid participationActivities");
  }

  const data = {
    name: normalizeString(body.name),
    email: normalizeString(body.email),
    phone: normalizeString(body.phone),
    gender,
    ageGroup: normalizeString(body.ageGroup),
    region: normalizeString(body.region),
    occupation: normalizeString(body.occupation),
    interests,
    participationActivities,
  } as const;

  try {
    const updated = await prisma.user.update({
      where: { id },
      data,
      select: {
        id: true,
        name: true,
        email: true,
        phone: true,
        gender: true,
        ageGroup: true,
        region: true,
        occupation: true,
        interests: true,
        participationActivities: true,
      },
    });
    return NextResponse.json({ ok: true, user: updated });
  } catch (e) {
    const msg = e instanceof Error ? e.message : String(e);
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}

export async function DELETE(
  _request: Request,
  { params }: { params: { id: string } }
) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.email || session.user.email !== ADMIN_EMAIL) return forbidden();
  if (!process.env.DATABASE_URL) {
    return NextResponse.json({ error: "DATABASE_URL not configured" }, { status: 500 });
  }

  const id = params.id;
  if (!id) return badRequest("Missing id");

  try {
    await prisma.user.delete({ where: { id } });
    return NextResponse.json({ ok: true });
  } catch (e) {
    const msg = e instanceof Error ? e.message : String(e);
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}

