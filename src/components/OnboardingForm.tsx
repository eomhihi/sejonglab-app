"use client";

import { useState } from "react";
import Link from "next/link";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import { onboardingSchema, type OnboardingFormData } from "@/lib/onboarding-schema";
import {
  GENDER_OPTIONS,
  AGE_GROUP_OPTIONS,
  REGION_OPTIONS,
  OCCUPATION_OPTIONS,
  ONBOARDING_INTEREST_SECTIONS,
  PARTICIPATION_ACTIVITY_OPTIONS,
  SIGNUP_PATH_OPTIONS,
  SIGNUP_PATH_ETC,
} from "@/lib/onboarding-options";
import { PolicyModal } from "@/components/legal/PolicyModal";
import { TERMS_OF_SERVICE_FULL, PRIVACY_POLICY_FULL } from "@/../constants/policy";

type PolicyKind = "terms" | "privacy";

const POLICY_MODAL = {
  terms: { title: "서비스 이용약관", content: TERMS_OF_SERVICE_FULL },
  privacy: { title: "개인정보 처리방침", content: PRIVACY_POLICY_FULL },
} as const;

const blue = {
  ring: "focus:ring-sejong-blue",
  border: "border-sejong-blue",
  bg: "bg-sejong-blue",
  bgSoft: "bg-sejong-blue/10",
  text: "text-sejong-blue",
  hover: "hover:border-sejong-blue/60",
};

const GENDER_LABEL: Record<string, string> = Object.fromEntries(
  GENDER_OPTIONS.map((o) => [o.value, o.label])
);
const AGE_LABEL: Record<string, string> = Object.fromEntries(
  AGE_GROUP_OPTIONS.map((o) => [o.value, o.label])
);

function formatSavedSignupPath(path?: string, etc?: string): string {
  if (!path) return "-";
  if (path === SIGNUP_PATH_ETC) return etc?.trim() ? `기타: ${etc.trim()}` : "기타";
  return path;
}

type OnboardingFormProps = {
  userName?: string;
  userId?: string;
  userEmail?: string;
  initialValues?: Partial<OnboardingFormData>;
  mode?: "create" | "edit";
};

export function OnboardingForm({
  userName,
  userId: serverUserId,
  userEmail: serverUserEmail,
  initialValues,
  mode = "create",
}: OnboardingFormProps) {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [agreed, setAgreed] = useState(mode === "edit");
  const [openPolicy, setOpenPolicy] = useState<PolicyKind | null>(null);
  const [savedSummary, setSavedSummary] = useState<OnboardingFormData | null>(null);
  const { data: session } = useSession();

  const requireAgreement = mode === "create";

  const openModal = (kind: PolicyKind) => (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setOpenPolicy(kind);
  };

  const {
    register,
    handleSubmit,
    watch,
    setValue,
    formState: { errors },
  } = useForm<OnboardingFormData>({
    resolver: zodResolver(onboardingSchema),
    defaultValues: {
      phone: initialValues?.phone ?? "",
      gender: initialValues?.gender,
      ageGroup: initialValues?.ageGroup,
      region: initialValues?.region,
      occupation: initialValues?.occupation,
      interests: initialValues?.interests ?? [],
      participationActivities: initialValues?.participationActivities ?? [],
      signupPath: initialValues?.signupPath,
      signupPathEtc: initialValues?.signupPathEtc ?? "",
    },
  });

  const selectedInterests = watch("interests") ?? [];
  const selectedParticipation = watch("participationActivities") ?? [];
  const selectedSignupPath = watch("signupPath");

  const toggleKeyword = (keyword: string) => {
    const current = selectedInterests;
    if (current.includes(keyword as (typeof current)[number])) {
      setValue(
        "interests",
        current.filter((k: string) => k !== keyword) as OnboardingFormData["interests"],
        { shouldValidate: true }
      );
    } else {
      setValue(
        "interests",
        [...current, keyword] as OnboardingFormData["interests"],
        { shouldValidate: true }
      );
    }
  };

  const toggleParticipation = (value: string) => {
    const current = selectedParticipation;
    if (current.includes(value)) {
      setValue(
        "participationActivities",
        current.filter((v: string) => v !== value),
        { shouldValidate: true }
      );
    } else {
      setValue("participationActivities", [...current, value], { shouldValidate: true });
    }
  };

  const onSubmit = async (data: OnboardingFormData) => {
    if (requireAgreement && !agreed) {
      alert("이용약관 및 개인정보 처리방침에 동의해주세요.");
      return;
    }
    setIsSubmitting(true);
    try {
      const userId = serverUserId ?? (session?.user as { id?: string } | undefined)?.id;
      const email = serverUserEmail ?? session?.user?.email ?? null;

      if (!userId && !email) {
        alert("로그인 정보가 없어 추가 정보를 저장할 수 없습니다. 다시 로그인해 주세요.");
        setIsSubmitting(false);
        return;
      }

      const res = await fetch("/api/user/onboarding", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...data, userId, email }),
      });
      if (res.ok) {
        if (mode === "create") {
          router.push("/signup/complete");
          router.refresh();
        } else {
          // 수정 완료: 페이지 이동 없이 완료 안내 + 요약 화면 노출
          setSavedSummary(data);
          router.refresh();
        }
      } else {
        const err = await res.json();
        alert(err.message || "저장에 실패했습니다.");
      }
    } catch {
      alert("네트워크 오류가 발생했습니다.");
    } finally {
      setIsSubmitting(false);
    }
  };

  if (savedSummary) {
    const rows: { label: string; value: string }[] = [
      { label: "연락처", value: savedSummary.phone || "-" },
      { label: "성별", value: savedSummary.gender ? GENDER_LABEL[savedSummary.gender] ?? savedSummary.gender : "-" },
      { label: "연령대", value: savedSummary.ageGroup ? AGE_LABEL[savedSummary.ageGroup] ?? savedSummary.ageGroup : "-" },
      { label: "거주지역", value: savedSummary.region || "-" },
      { label: "직업", value: savedSummary.occupation || "-" },
      {
        label: "가입 경로",
        value: formatSavedSignupPath(savedSummary.signupPath, savedSummary.signupPathEtc),
      },
    ];

    return (
      <div className="space-y-7">
        <div className="rounded-2xl border border-emerald-200 bg-emerald-50 px-5 py-6 text-center shadow-sm">
          <div className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-full bg-emerald-100">
            <svg className="h-7 w-7 text-emerald-600" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.5} strokeLinecap="round" strokeLinejoin="round" aria-hidden>
              <path d="M20 6 9 17l-5-5" />
            </svg>
          </div>
          <h2 className="text-xl font-bold text-emerald-900">정보가 수정되었습니다</h2>
          <p className="mt-1 text-sm text-emerald-700">
            {userName ? `${userName}님의 ` : ""}회원 정보가 정상적으로 저장되었습니다.
          </p>
        </div>

        <div className="bg-white rounded-2xl border border-slate-200/80 shadow-sm p-5 sm:p-6 ring-1 ring-slate-100">
          <p className="text-base font-semibold text-slate-800 mb-3">수정된 정보 요약</p>
          <dl className="divide-y divide-slate-100">
            {rows.map((row) => (
              <div key={row.label} className="flex items-start justify-between gap-4 py-2.5">
                <dt className="text-sm text-slate-500 shrink-0">{row.label}</dt>
                <dd className="text-sm font-medium text-slate-900 text-right break-keep">{row.value}</dd>
              </div>
            ))}
          </dl>
        </div>

        <div className="flex flex-col sm:flex-row gap-3">
          <Link
            href="/"
            className="flex-1 inline-flex items-center justify-center rounded-2xl bg-sejong-blue text-white font-bold py-4 shadow-lg hover:bg-sejong-blue-dark transition border border-sejong-blue-dark/30"
          >
            홈으로 이동하기
          </Link>
          <button
            type="button"
            onClick={() => setSavedSummary(null)}
            className="inline-flex items-center justify-center rounded-2xl border border-slate-300 bg-white px-6 py-4 text-sm font-semibold text-slate-700 hover:bg-slate-50 transition"
          >
            계속 수정하기
          </button>
        </div>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-7">
      {/* 상단 브랜딩 띠 */}
      <div className="rounded-2xl bg-gradient-to-r from-sejong-blue-dark via-sejong-blue to-sky-600 px-5 py-4 text-white shadow-md">
        <p className="text-sm font-medium opacity-90">세종시민 패널</p>
        <p className="text-lg font-bold">{mode === "edit" ? "추가 정보 수정" : "추가 정보 입력"}</p>
      </div>

      <div className="bg-white rounded-2xl border border-slate-200/80 shadow-sm p-5 sm:p-6 ring-1 ring-slate-100">
        <label className="block text-base font-semibold text-slate-800 mb-2">
          휴대폰 번호 <span className="text-red-500">*</span>
        </label>
        <input
          type="tel"
          inputMode="numeric"
          autoComplete="tel"
          placeholder="01012345678"
          {...register("phone", {
            onChange: (e) => {
              const digitsOnly = String(e.target.value ?? "").replace(/[^0-9]/g, "");
              setValue("phone", digitsOnly, { shouldValidate: true });
            },
          })}
          className={`w-full h-11 border border-slate-300 rounded-xl px-4 text-slate-800 placeholder:text-slate-400 focus:outline-none focus:ring-2 ${blue.ring} focus:border-sejong-blue`}
        />
        <p className="mt-1.5 text-xs text-slate-500">
          &apos;-&apos;를 제외한 휴대폰 번호를 입력하세요.
        </p>
        {errors.phone && (
          <p className="mt-2 font-sans text-sm text-red-600">{errors.phone.message}</p>
        )}
      </div>

      {userName && (
        <div className="rounded-2xl border border-sejong-blue/20 bg-sejong-blue/5 px-5 py-4 text-center">
          <p className="text-slate-700">
            <span className={`font-bold ${blue.text}`}>{userName}</span>님, 환영합니다!
          </p>
        </div>
      )}

      <div className="bg-white rounded-2xl border border-slate-200/80 shadow-sm p-5 sm:p-6">
        <label className="block text-base font-semibold text-slate-800 mb-3">
          성별 <span className="text-red-500">*</span>
        </label>
        <div className="flex gap-3">
          {GENDER_OPTIONS.map((opt) => (
            <label
              key={opt.value}
              className={`flex-1 flex items-center justify-center gap-2 rounded-xl border py-3 px-4 cursor-pointer transition has-[:checked]:border-sejong-blue has-[:checked]:bg-sejong-blue/10 has-[:checked]:text-sejong-blue-dark border-slate-200 ${blue.hover}`}
            >
              <input type="radio" value={opt.value} {...register("gender")} className="accent-[color:var(--color-primary)]" />
              <span className="font-medium text-slate-700">{opt.label}</span>
            </label>
          ))}
        </div>
        {errors.gender && (
          <p className="mt-2 font-sans text-sm text-red-600">{errors.gender.message}</p>
        )}
      </div>

      <div className="bg-white rounded-2xl border border-slate-200/80 shadow-sm p-5 sm:p-6">
        <label className="block text-base font-semibold text-slate-800 mb-2">
          연령대 <span className="text-red-500">*</span>
        </label>
        <select
          {...register("ageGroup")}
          className={`w-full h-11 border border-slate-300 rounded-xl px-4 text-slate-700 focus:outline-none focus:ring-2 ${blue.ring} focus:border-sejong-blue`}
        >
          <option value="">연령대를 선택해 주세요</option>
          {AGE_GROUP_OPTIONS.map((opt) => (
            <option key={opt.value} value={opt.value}>
              {opt.label}
            </option>
          ))}
        </select>
        {errors.ageGroup && (
          <p className="mt-2 font-sans text-sm text-red-600">{errors.ageGroup.message}</p>
        )}
      </div>

      <div className="bg-white rounded-2xl border border-slate-200/80 shadow-sm p-5 sm:p-6">
        <label className="block text-base font-semibold text-slate-800 mb-2">
          거주지역 (세종시 행정동) <span className="text-red-500">*</span>
        </label>
        <select
          {...register("region")}
          className={`w-full h-11 border border-slate-300 rounded-xl px-4 text-slate-700 focus:outline-none focus:ring-2 ${blue.ring} focus:border-sejong-blue`}
        >
          <option value="">거주지역을 선택해 주세요</option>
          {REGION_OPTIONS.map((region) => (
            <option key={region} value={region}>
              {region}
            </option>
          ))}
        </select>
        {errors.region && (
          <p className="mt-2 font-sans text-sm text-red-600">{errors.region.message}</p>
        )}
      </div>

      <div className="bg-white rounded-2xl border border-slate-200/80 shadow-sm p-5 sm:p-6">
        <label className="block text-base font-semibold text-slate-800 mb-2">
          직업 <span className="text-red-500">*</span>
        </label>
        <select
          {...register("occupation")}
          className={`w-full h-11 border border-slate-300 rounded-xl px-4 text-slate-700 focus:outline-none focus:ring-2 ${blue.ring} focus:border-sejong-blue`}
        >
          <option value="">직업을 선택해 주세요</option>
          {OCCUPATION_OPTIONS.map((opt) => (
            <option key={opt} value={opt}>
              {opt}
            </option>
          ))}
        </select>
        {errors.occupation && (
          <p className="mt-2 font-sans text-sm text-red-600">{errors.occupation.message}</p>
        )}
      </div>

      <div className="bg-white rounded-2xl border border-slate-200/80 shadow-sm p-5 sm:p-6">
        <label className="block text-base font-semibold text-slate-800 mb-2">
          가입 경로 <span className="text-red-500">*</span>
        </label>
        <select
          {...register("signupPath")}
          className={`w-full h-11 border border-slate-300 rounded-xl px-4 text-slate-700 focus:outline-none focus:ring-2 ${blue.ring} focus:border-sejong-blue`}
        >
          <option value="">세종랩을 알게 된 경로를 선택해 주세요</option>
          {SIGNUP_PATH_OPTIONS.map((opt) => (
            <option key={opt} value={opt}>
              {opt}
            </option>
          ))}
        </select>
        {errors.signupPath && (
          <p className="mt-2 font-sans text-sm text-red-600">{errors.signupPath.message}</p>
        )}

        {selectedSignupPath === SIGNUP_PATH_ETC && (
          <div className="mt-3">
            <input
              type="text"
              placeholder="가입 경로를 직접 입력해 주세요"
              {...register("signupPathEtc")}
              className={`w-full h-11 border border-slate-300 rounded-xl px-4 text-slate-800 placeholder:text-slate-400 focus:outline-none focus:ring-2 ${blue.ring} focus:border-sejong-blue`}
            />
            {errors.signupPathEtc && (
              <p className="mt-2 font-sans text-sm text-red-600">{errors.signupPathEtc.message}</p>
            )}
          </div>
        )}
      </div>

      {/* TODO: 향후 관심 정보 수집 시 재활성화 예정 — [추가 관심 정보] 관심 정책 키워드 섹션 (현재 hidden 처리, 코드 보존) */}
      <div className="hidden rounded-2xl border border-slate-200/90 bg-gradient-to-b from-slate-50 to-white p-5 sm:p-7 shadow-sm ring-1 ring-slate-100">
        <div className="mb-6 text-center">
          <p className="text-lg font-bold text-sejong-blue-dark">관심 정책 키워드</p>
          <p className="mt-1 text-sm text-slate-600">
            분야별 키워드를 눌러 <strong>복수 선택</strong>해 주세요.{" "}
            <span className="text-red-500">*</span>
          </p>
        </div>

        <div className="space-y-5">
          {ONBOARDING_INTEREST_SECTIONS.map((section) => (
            <div
              key={section.id}
              className="rounded-2xl border border-slate-200 bg-white p-4 sm:p-5 shadow-[0_2px_12px_-4px_rgba(0,54,102,0.08)]"
            >
              <div className="mb-3 flex items-center gap-3 border-b border-slate-100 pb-3">
                <span className="flex h-9 w-1 shrink-0 rounded-full bg-sejong-blue" aria-hidden />
                <h3 className="text-base font-bold tracking-tight text-sejong-blue-dark sm:text-lg">{section.title}</h3>
              </div>
              <div className="flex flex-wrap gap-2.5">
                {section.keywords.map((kw) => {
                  const on = selectedInterests.includes(kw);
                  return (
                    <button
                      key={kw}
                      type="button"
                      onClick={() => toggleKeyword(kw)}
                      className={`rounded-xl border-2 px-3.5 py-2 text-sm font-medium transition-all duration-150 focus:outline-none focus-visible:ring-2 focus-visible:ring-sejong-blue focus-visible:ring-offset-2 ${
                        on
                          ? "border-sejong-blue bg-sejong-blue text-white shadow-md shadow-sejong-blue/25"
                          : "border-slate-200 bg-slate-50 text-slate-700 hover:border-sejong-blue/50 hover:bg-white"
                      }`}
                    >
                      {on ? "✓ " : ""}
                      {kw}
                    </button>
                  );
                })}
              </div>
            </div>
          ))}
        </div>

        {errors.interests && (
          <p className="mt-4 text-center font-sans text-sm font-medium text-red-600">
            {errors.interests.message}
          </p>
        )}
        {selectedInterests.length > 0 && (
          <p className="mt-4 rounded-xl bg-sejong-blue/10 py-2.5 text-center text-sm font-semibold text-sejong-blue-dark">
            선택한 키워드 {selectedInterests.length}개
          </p>
        )}
      </div>

      {/* TODO: 향후 관심 정보 수집 시 재활성화 예정 — [추가 관심 정보] 참여 가능 활동 섹션 (현재 hidden 처리, 코드 보존) */}
      <div className="hidden bg-white rounded-2xl border border-sejong-blue/15 shadow-md p-5 sm:p-6">
        <label className="block text-base font-bold text-sejong-blue-dark mb-1">참여 가능 활동</label>
        <p className="text-sm text-slate-600 mb-4">
          참여하고 싶은 활동을 <strong>중복 선택</strong>할 수 있습니다. (선택 사항)
        </p>
        <div className="flex flex-col sm:flex-row flex-wrap gap-3">
          {PARTICIPATION_ACTIVITY_OPTIONS.map((opt) => {
            const on = selectedParticipation.includes(opt.label);
            return (
              <button
                key={opt.id}
                type="button"
                onClick={() => toggleParticipation(opt.label)}
                className={`w-full min-w-0 sm:flex-1 sm:min-w-[200px] rounded-xl border-2 px-4 py-3 text-left text-sm font-medium transition ${
                  on
                    ? "border-sejong-blue bg-sejong-blue/10 text-sejong-blue-dark"
                    : "border-slate-200 text-slate-700 hover:border-sejong-blue/35"
                }`}
              >
                {on ? "✓ " : "○ "}
                {opt.label}
              </button>
            );
          })}
        </div>
      </div>

      {requireAgreement && (
        <div className="bg-white rounded-2xl border border-slate-200/80 shadow-sm p-5 sm:p-6 ring-1 ring-slate-100">
          <label className="flex items-start gap-2.5 text-sm text-slate-700 select-none">
            <input
              type="checkbox"
              checked={agreed}
              onChange={(e) => setAgreed(e.target.checked)}
              className="mt-0.5 h-4 w-4 shrink-0 rounded border-slate-300 text-blue-600 focus:ring-blue-500 cursor-pointer"
            />
            <span className="leading-relaxed">
              세종랩{" "}
              <button
                type="button"
                onClick={openModal("terms")}
                className="underline text-blue-600 cursor-pointer hover:text-blue-700"
              >
                이용약관
              </button>{" "}
              및{" "}
              <button
                type="button"
                onClick={openModal("privacy")}
                className="underline text-blue-600 cursor-pointer hover:text-blue-700"
              >
                개인정보 처리방침
              </button>
              에 모두 동의합니다. <span className="text-slate-500">(필수)</span>
            </span>
          </label>
        </div>
      )}

      {mode === "create" && (
        <div className="bg-blue-50/50 text-blue-950 rounded-lg p-3.5 text-sm border border-blue-100/70">
          🎁 세종랩 패널 가입을 환영합니다! 가입 완료 시 매월 추첨을 통해 소정의 리워드(모바일 기프티콘 등)를 혜택으로
          제공해 드립니다.
        </div>
      )}

      <button
        type="submit"
        disabled={isSubmitting || (requireAgreement && !agreed)}
        className={`w-full rounded-2xl text-white font-bold py-4 shadow-lg transition border ${
          requireAgreement && !agreed
            ? "bg-gray-300 border-gray-300 cursor-not-allowed"
            : "bg-sejong-blue border-sejong-blue-dark/30 hover:bg-sejong-blue-dark disabled:opacity-50 disabled:cursor-not-allowed"
        }`}
      >
        {isSubmitting ? "저장 중..." : mode === "edit" ? "정보 저장하기" : "세종랩 가입 완료"}
      </button>

      <PolicyModal
        open={openPolicy !== null}
        title={openPolicy ? POLICY_MODAL[openPolicy].title : ""}
        content={openPolicy ? POLICY_MODAL[openPolicy].content : ""}
        onClose={() => setOpenPolicy(null)}
        bodyMaxHeightClass="max-h-[50vh]"
      />
    </form>
  );
}
