import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";
import { authOptions } from "@/lib/auth";
import { checkOnboardingStatus } from "@/lib/check-onboarding";

export default async function AuthCheckPage() {
  const session = await getServerSession(authOptions);
  
  if (!session) {
    redirect("/auth/signin");
  }

  const { onboardingCompleted } = await checkOnboardingStatus(session.user?.email);

  if (onboardingCompleted) {
    redirect("/dashboard");
  } else {
    redirect("/auth/onboarding");
  }
}
