import { z } from "zod";
import { ONBOARDING_INTEREST_KEYWORDS, OCCUPATION_VALUES } from "./onboarding-options";

/** 빈 값·null을 undefined로 통일해 required_error가 일관되게 동작하도록 함 */
function emptyToUndefined(val: unknown): unknown {
  if (val === "" || val === null || val === undefined) return undefined;
  return val;
}

const genderEnum = z.enum(["male", "female"], {
  required_error: "성별을 선택해 주세요.",
  invalid_type_error: "성별을 선택해 주세요.",
});

const occupationEnum = z.enum(OCCUPATION_VALUES, {
  required_error: "직업을 선택해 주세요.",
  invalid_type_error: "직업을 선택해 주세요.",
});

// 휴대폰 번호: 010-XXXX-XXXX 등 (필수 입력)
export const onboardingSchema = z.object({
  phone: z
    .string()
    .transform((val: string) => (val ?? "").trim())
    .pipe(
      z
        .string()
        .min(1, "연락처를 입력해 주세요.")
        .refine(
          (val: string) => {
            const digits = val.replace(/[^0-9]/g, "");
            return digits.length >= 10 && digits.length <= 11 && digits.startsWith("01");
          },
          "올바른 연락처 형식이 아닙니다.",
        ),
    ),
  gender: z.preprocess(emptyToUndefined, genderEnum),
  ageGroup: z.preprocess(
    emptyToUndefined,
    z
      .string({
        required_error: "연령대를 선택해 주세요.",
        invalid_type_error: "연령대를 선택해 주세요.",
      })
      .min(1, "연령대를 선택해 주세요."),
  ),
  region: z.preprocess(
    emptyToUndefined,
    z
      .string({
        required_error: "거주지역을 선택해 주세요.",
        invalid_type_error: "거주지역을 선택해 주세요.",
      })
      .min(1, "거주지역을 선택해 주세요."),
  ),
  occupation: z.preprocess(emptyToUndefined, occupationEnum),
  interests: z
    .array(z.enum(ONBOARDING_INTEREST_KEYWORDS, { message: "관심 키워드를 선택해 주세요." }))
    .min(1, "항목을 하나 이상 선택해 주세요."),
  participationActivities: z.array(z.string()).default([]),
});

export type OnboardingFormData = z.infer<typeof onboardingSchema>;
