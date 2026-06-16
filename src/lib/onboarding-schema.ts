import { z } from "zod";
import {
  OCCUPATION_VALUES,
  SIGNUP_PATH_VALUES,
  SIGNUP_PATH_ETC,
} from "./onboarding-options";

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

const signupPathEnum = z.enum(SIGNUP_PATH_VALUES, {
  required_error: "가입 경로를 선택해 주세요.",
  invalid_type_error: "가입 경로를 선택해 주세요.",
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
  // TODO: 향후 관심 정보 수집 시 재활성화 예정 — 관심 키워드를 다시 필수로 받으려면 아래 enum/.min(1) 버전으로 교체
  // interests: z
  //   .array(z.enum(ONBOARDING_INTEREST_KEYWORDS, { message: "관심 키워드를 선택해 주세요." }))
  //   .min(1, "항목을 하나 이상 선택해 주세요."),
  // 현재 숨김·선택 항목이라 enum 제약을 두지 않음(기존에 저장된 옛 키워드 값도 그대로 통과·보존).
  interests: z.array(z.string()).default([]),
  participationActivities: z.array(z.string()).default([]),
  signupPath: z.preprocess(emptyToUndefined, signupPathEnum),
  signupPathEtc: z.preprocess(emptyToUndefined, z.string().optional()),
}).superRefine((data, ctx) => {
  // '기타 (직접 입력)' 선택 시 직접 입력값 필수
  if (data.signupPath === SIGNUP_PATH_ETC && !data.signupPathEtc?.trim()) {
    ctx.addIssue({
      code: z.ZodIssueCode.custom,
      path: ["signupPathEtc"],
      message: "가입 경로를 직접 입력해 주세요.",
    });
  }
});

export type OnboardingFormData = z.infer<typeof onboardingSchema>;
