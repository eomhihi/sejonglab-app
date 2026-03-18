"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import { onboardingSchema, type OnboardingFormData } from "@/lib/onboarding-schema";
import {
  GENDER_OPTIONS,
  AGE_GROUP_OPTIONS,
  REGION_OPTIONS,
  ONBOARDING_INTEREST_COLUMNS,
  PARTICIPATION_ACTIVITY_OPTIONS,
} from "@/lib/onboarding-options";

const blue = {
  ring: "focus:ring-[#004B8D]",
  border: "border-[#004B8D]",
  bg: "bg-[#004B8D]",
  bgSoft: "bg-[#004B8D]/08",
  text: "text-[#004B8D]",
  hover: "hover:border-[#004B8D]/60",
};

type OnboardingFormProps = {
  userName?: string;
  userId?: string;
  userEmail?: string;
};

export function OnboardingForm({ userName, userId: serverUserId, userEmail: serverUserEmail }: OnboardingFormProps) {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { data: session } = useSession();

  const {
    register,
    handleSubmit,
    watch,
    setValue,
    formState: { errors },
  } = useForm<OnboardingFormData>({
    resolver: zodResolver(onboardingSchema),
    defaultValues: {
      phone: "",
      interests: [],
      participationActivities: [],
    },
  });

  const selectedInterests = watch("interests") ?? [];
  const selectedParticipation = watch("participationActivities") ?? [];

  const toggleInterest = (topic: string) => {
    const current = selectedInterests;
    if (current.includes(topic)) {
      setValue(
        "interests",
        current.filter((t: string) => t !== topic),
        { shouldValidate: true }
      );
    } else {
      setValue("interests", [...current, topic], { shouldValidate: true });
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
        router.push("/main");
        router.refresh();
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

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-7">
      {/* 상단 브랜딩 띠 */}
      <div className="rounded-2xl bg-gradient-to-r from-[#003666] via-[#004B8D] to-[#005a9e] px-5 py-4 text-white shadow-md">
        <p className="text-sm font-medium opacity-90">세종시민 패널</p>
        <p className="text-lg font-bold">추가 정보 입력</p>
      </div>

      <div className="bg-white rounded-2xl border border-slate-200/80 shadow-sm p-5 sm:p-6 ring-1 ring-slate-100">
        <label className="block text-sm font-semibold text-slate-800 mb-2">
          휴대폰 번호 <span className="text-red-500">*</span>
        </label>
        <input
          type="tel"
          placeholder="010-1234-5678"
          {...register("phone")}
          className={`w-full border border-slate-300 rounded-xl px-4 py-3 text-slate-800 placeholder:text-slate-400 focus:outline-none focus:ring-2 ${blue.ring} focus:border-[#004B8D]`}
        />
        <p className="mt-1.5 text-xs text-slate-500">리서치 참여 연락 등에 활용됩니다.</p>
        {errors.phone && <p className="mt-2 text-sm text-red-600">{errors.phone.message}</p>}
      </div>

      {userName && (
        <div className="rounded-2xl border border-[#004B8D]/20 bg-[#004B8D]/5 px-5 py-4 text-center">
          <p className="text-slate-700">
            <span className={`font-bold ${blue.text}`}>{userName}</span>님, 환영합니다!
          </p>
        </div>
      )}

      <div className="bg-white rounded-2xl border border-slate-200/80 shadow-sm p-5 sm:p-6">
        <label className="block text-sm font-semibold text-slate-800 mb-3">
          성별 <span className="text-red-500">*</span>
        </label>
        <div className="flex gap-3">
          {GENDER_OPTIONS.map((opt) => (
            <label
              key={opt.value}
              className={`flex-1 flex items-center justify-center gap-2 rounded-xl border py-3 px-4 cursor-pointer transition has-[:checked]:border-[#004B8D] has-[:checked]:bg-[#004B8D]/10 has-[:checked]:text-[#003666] border-slate-200 ${blue.hover}`}
            >
              <input type="radio" value={opt.value} {...register("gender")} className="accent-[#004B8D]" />
              <span className="font-medium text-slate-700">{opt.label}</span>
            </label>
          ))}
        </div>
        {errors.gender && <p className="mt-2 text-sm text-red-600">{errors.gender.message}</p>}
      </div>

      <div className="bg-white rounded-2xl border border-slate-200/80 shadow-sm p-5 sm:p-6">
        <label className="block text-sm font-semibold text-slate-800 mb-2">
          연령대 <span className="text-red-500">*</span>
        </label>
        <select
          {...register("ageGroup")}
          className={`w-full border border-slate-300 rounded-xl px-4 py-3 text-slate-700 focus:outline-none focus:ring-2 ${blue.ring} focus:border-[#004B8D]`}
        >
          <option value="">연령대를 선택해 주세요</option>
          {AGE_GROUP_OPTIONS.map((opt) => (
            <option key={opt.value} value={opt.value}>
              {opt.label}
            </option>
          ))}
        </select>
        {errors.ageGroup && <p className="mt-2 text-sm text-red-600">{errors.ageGroup.message}</p>}
      </div>

      <div className="bg-white rounded-2xl border border-slate-200/80 shadow-sm p-5 sm:p-6">
        <label className="block text-sm font-semibold text-slate-800 mb-2">
          거주지역 (세종시 행정동) <span className="text-red-500">*</span>
        </label>
        <select
          {...register("region")}
          className={`w-full border border-slate-300 rounded-xl px-4 py-3 text-slate-700 focus:outline-none focus:ring-2 ${blue.ring} focus:border-[#004B8D]`}
        >
          <option value="">거주지역을 선택해 주세요</option>
          {REGION_OPTIONS.map((region) => (
            <option key={region} value={region}>
              {region}
            </option>
          ))}
        </select>
        {errors.region && <p className="mt-2 text-sm text-red-600">{errors.region.message}</p>}
      </div>

      {/* 관심 분야: 2컬럼, 상위 카테고리(선택 안함) 아래 하위 분야 */}
      <div className="bg-white rounded-2xl border border-[#004B8D]/15 shadow-md p-5 sm:p-6">
        <p className="text-center text-slate-700 font-medium mb-1">관심 분야를 선택해 주세요</p>
        <p className="text-center text-sm text-slate-500 mb-5">
          해당되는 하위 분야를 눌러 선택할 수 있습니다. <span className="text-red-500">*</span>
        </p>

        <div className="grid grid-cols-2 gap-6">
          {ONBOARDING_INTEREST_COLUMNS.map((col) => (
            <div key={col.upperLabel} className="flex flex-col rounded-xl border border-slate-200 bg-slate-50/50 p-4">
              <p className="text-xs font-semibold uppercase tracking-wide text-slate-500 mb-1">
                상위 카테고리 (선택 안함)
              </p>
              <p className="text-sm font-bold text-[#003666] mb-3">{col.upperLabel}</p>
              <div className="space-y-2">
                {col.items.map((cat) => {
                  const on = selectedInterests.includes(cat.label);
                  return (
                    <button
                      key={cat.id}
                      type="button"
                      onClick={() => toggleInterest(cat.label)}
                      className={`w-full flex items-center gap-2 rounded-lg border-2 px-3 py-2.5 text-left text-sm font-medium transition ${
                        on
                          ? "border-[#004B8D] bg-[#004B8D]/10 text-[#003666]"
                          : "border-slate-200 bg-white text-slate-700 hover:border-[#004B8D]/40 hover:bg-slate-50"
                      }`}
                    >
                      <span
                        className={`flex h-5 w-5 shrink-0 items-center justify-center rounded border-2 text-xs ${
                          on ? "border-[#004B8D] bg-[#004B8D] text-white" : "border-slate-300 bg-white"
                        }`}
                      >
                        {on ? "✓" : ""}
                      </span>
                      {cat.label}
                    </button>
                  );
                })}
              </div>
            </div>
          ))}
        </div>
        {errors.interests && <p className="mt-3 text-center text-sm text-red-600">{errors.interests.message}</p>}
        {selectedInterests.length > 0 && (
          <p className="mt-4 text-center text-sm font-medium text-[#004B8D]">
            {selectedInterests.length}개 선택됨
          </p>
        )}
      </div>

      {/* 참여 가능 활동 */}
      <div className="bg-white rounded-2xl border border-[#004B8D]/15 shadow-md p-5 sm:p-6">
        <label className="block text-base font-bold text-[#003666] mb-1">참여 가능 활동</label>
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
                className={`flex-1 min-w-[200px] rounded-xl border-2 px-4 py-3 text-left text-sm font-medium transition ${
                  on
                    ? "border-[#004B8D] bg-[#004B8D]/10 text-[#003666]"
                    : "border-slate-200 text-slate-700 hover:border-[#004B8D]/35"
                }`}
              >
                {on ? "✓ " : "○ "}
                {opt.label}
              </button>
            );
          })}
        </div>
      </div>

      <button
        type="submit"
        disabled={isSubmitting}
        className="w-full rounded-2xl bg-[#004B8D] text-white font-bold py-4 shadow-lg hover:bg-[#003666] disabled:opacity-50 disabled:cursor-not-allowed transition border border-[#003666]/30"
      >
        {isSubmitting ? "저장 중..." : "정보 저장하고 시작하기"}
      </button>
    </form>
  );
}
