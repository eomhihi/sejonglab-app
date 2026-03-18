import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

const ADMIN_EMAIL = "eomhihi007@gmail.com";

async function main() {
  const adminEmailLower = ADMIN_EMAIL.toLowerCase().trim();

  const admin = await prisma.user.findFirst({
    where: { email: { equals: adminEmailLower, mode: "insensitive" } },
    select: { id: true, email: true },
  });

  let nonAdminIds;
  if (admin) {
    const nonAdminUsers = await prisma.user.findMany({
      where: { id: { not: admin.id } },
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
    keptAdmin: admin ? admin.email : "(없음)",
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
