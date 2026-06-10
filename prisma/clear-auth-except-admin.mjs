import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

// 관리자 계정 목록 (src/lib/admin.ts 와 동일하게 유지)
const ADMIN_EMAILS = ["eomhihi007@gmail.com", "mobiro1@naver.com"];

async function main() {
  const adminEmailsLower = ADMIN_EMAILS.map((e) => e.toLowerCase().trim());

  const admins = await prisma.user.findMany({
    where: { email: { in: adminEmailsLower, mode: "insensitive" } },
    select: { id: true, email: true },
  });

  let nonAdminIds;
  if (admins.length > 0) {
    const adminIds = admins.map((a) => a.id);
    const nonAdminUsers = await prisma.user.findMany({
      where: { id: { notIn: adminIds } },
      select: { id: true },
    });
    nonAdminIds = nonAdminUsers.map((u) => u.id);
  } else {
    console.log("[clear-auth-except-admin] 관리자 계정 없음 → 전체 회원 삭제 진행.");
    const all = await prisma.user.findMany({ select: { id: true } });
    nonAdminIds = all.map((u) => u.id);
  }

  if (nonAdminIds.length === 0) {
    console.log("[clear-auth-except-admin] 삭제할 회원 없음.");
    return;
  }

  const [sessionRes, accountRes, userRes] = await prisma.$transaction([
    prisma.session.deleteMany({ where: { userId: { in: nonAdminIds } } }),
    prisma.account.deleteMany({ where: { userId: { in: nonAdminIds } } }),
    prisma.user.deleteMany({ where: { id: { in: nonAdminIds } } }),
  ]);

  console.log("[clear-auth-except-admin] 완료:", {
    sessions: sessionRes.count,
    accounts: accountRes.count,
    users: userRes.count,
    keptAdmins: admins.length > 0 ? admins.map((a) => a.email) : "(없음)",
  });
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
