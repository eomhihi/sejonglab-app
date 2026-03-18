import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  // 삭제 순서 중요: FK 참조하는 테이블부터 제거
  const [sessionRes, accountRes, userRes] = await prisma.$transaction([
    prisma.session.deleteMany({}),
    prisma.account.deleteMany({}),
    prisma.user.deleteMany({}),
  ]);

  // 스키마에 VerificationToken이 존재할 때만 삭제
  let verificationTokens = "(n/a)";
  if (prisma.verificationToken?.deleteMany) {
    const res = await prisma.verificationToken.deleteMany({});
    verificationTokens = res.count;
  }

  console.log("[clear-auth] deleted:", {
    sessions: sessionRes.count,
    accounts: accountRes.count,
    users: userRes.count,
    verificationTokens,
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

