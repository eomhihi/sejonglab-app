import { z } from "zod";

export const onboardingSchema = z.object({
  gender: z.enum(["male", "female"], {
    required_error: "성별을 선택해 주세요.",
  }),
  ageGroup: z.string({
    required_error: "연령대를 선택해 주세요.",
  }).min(1, "연령대를 선택해 주세요."),
  region: z.string({
    required_error: "거주지역을 선택해 주세요.",
  }).min(1, "거주지역을 선택해 주세요."),
  interestTopics: z.array(z.string()).min(1, "관심 분야를 1개 이상 선택해 주세요."),
});

export type OnboardingFormData = z.infer<typeof onboardingSchema>;
