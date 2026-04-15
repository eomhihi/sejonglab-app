import { z } from "zod";
import { ONBOARDING_INTEREST_KEYWORDS, OCCUPATION_VALUES } from "./onboarding-options";

// 휴대폰 번호: 010-XXXX-XXXX 등 (필수 입력)
export const onboardingSchema = z.object({
  phone: z
    .string({ required_error: "휴대폰 번호를 입력해 주세요." })
    .transform((val: string) => val.trim())
    .pipe(
      z
        .string()
        .min(1, "휴대폰 번호를 입력해 주세요.")
        .refine(
          (val: string) => {
            const digits = val.replace(/[^0-9]/g, "");
            return digits.length >= 10 && digits.length <= 11 && digits.startsWith("01");
          },
          "올바른 휴대폰 번호를 입력해 주세요. (예: 010-1234-5678)"
        )
    ),
  gender: z.enum(["male", "female"], {
    required_error: "성별을 선택해 주세요.",
  }),
  ageGroup: z.string({
    required_error: "연령대를 선택해 주세요.",
  }).min(1, "연령대를 선택해 주세요."),
  region: z.string({
    required_error: "거주지역을 선택해 주세요.",
  }).min(1, "거주지역을 선택해 주세요."),
  occupation: z.enum(OCCUPATION_VALUES, {
    required_error: "직업을 선택해 주세요.",
    invalid_type_error: "직업을 선택해 주세요.",
  }),
  interests: z
    .array(z.enum(ONBOARDING_INTEREST_KEYWORDS))
    .min(1, "관심 키워드를 1개 이상 선택해 주세요."),
  participationActivities: z.array(z.string()).default([]),
});

export type OnboardingFormData = z.infer<typeof onboardingSchema>;
