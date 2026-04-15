type UserOnboardingData = {
  onboardingCompleted: boolean;
  gender: string | null;
  ageGroup: string | null;
  region: string | null;
  occupation: string | null;
  interestTopics: string[];
  interests: string[];
  participationActivities: string[];
};

export async function checkOnboardingStatus(
  email: string | null | undefined
): Promise<{ onboardingCompleted: boolean; userData: UserOnboardingData | null }> {
  if (!email) {
    return { onboardingCompleted: false, userData: null };
  }

  if (!process.env.DATABASE_URL) {
    return { onboardingCompleted: false, userData: null };
  }

  try {
    const { prisma } = await import("./prisma");
    const user = await prisma.user.findUnique({
      where: { email },
      select: {
        onboardingCompleted: true,
        gender: true,
        ageGroup: true,
        region: true,
        occupation: true,
        interestTopics: true,
        interests: true,
        participationActivities: true,
      },
    });

    if (!user) {
      return { onboardingCompleted: false, userData: null };
    }

    // 과거 데이터/수동 수정 등으로 null이 들어올 수 있어 렌더링 안전하게 정규화
    const normalized: UserOnboardingData = {
      onboardingCompleted: !!user.onboardingCompleted,
      gender: user.gender ?? null,
      ageGroup: user.ageGroup ?? null,
      region: user.region ?? null,
      occupation: user.occupation ?? null,
      interestTopics: Array.isArray(user.interestTopics) ? user.interestTopics : [],
      interests: Array.isArray(user.interests) ? user.interests : [],
      participationActivities: Array.isArray(user.participationActivities)
        ? user.participationActivities
        : [],
    };

    return {
      onboardingCompleted: normalized.onboardingCompleted,
      userData: normalized,
    };
  } catch (error) {
    console.error("온보딩 상태 확인 오류:", error);
    return { onboardingCompleted: false, userData: null };
  }
}
