import { z } from "zod";

// 휴대폰 번호: 010-XXXX-XXXX 등 (선택 입력)
export const onboardingSchema = z.object({
  phone: z
    .string()
    .optional()
    .transform((val) => (val?.trim() === "" ? undefined : val))
    .refine((val) => {
      if (!val) return true;
      const digits = val.replace(/[^0-9]/g, "");
      return digits.length >= 10 && digits.length <= 11 && digits.startsWith("01");
    }, "올바른 휴대폰 번호를 입력해 주세요. (예: 010-1234-5678)"),
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
