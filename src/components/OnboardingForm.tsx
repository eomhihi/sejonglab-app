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
  SEJONG_POLICY_INTEREST_GROUPS,
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

  const toggleInterest = (title: string) => {
    const current = selectedInterests;
    if (current.includes(title)) {
      setValue(
        "interests",
        current.filter((t) => t !== title),
        { shouldValidate: true }
      );
    } else {
      setValue("interests", [...current, title], { shouldValidate: true });
    }
  };

  const toggleParticipation = (value: string) => {
    const current = selectedParticipation;
    if (current.includes(value)) {
      setValue(
        "participationActivities",
        current.filter((v) => v !== value),
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
          휴대폰 번호 <span className="text-slate-400 font-normal">(선택)</span>
        </label>
        <input
          type="tel"
          placeholder="010-1234-5678"
          {...register("phone")}
          className={`w-full border border-slate-300 rounded-xl px-4 py-3 text-slate-800 placeholder:text-slate-400 focus:outline-none focus:ring-2 ${blue.ring} focus:border-[#004B8D]`}
        />
        <p className="mt-1.5 text-xs text-slate-500">설문·연락 시 활용됩니다.</p>
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

      {/* 관심 정책 분야 */}
      <div className="bg-white rounded-2xl border border-[#004B8D]/15 shadow-md p-5 sm:p-6 bg-gradient-to-b from-white to-slate-50/80">
        <div className="flex items-start gap-2 mb-1">
          <span className="mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-[#004B8D] text-white text-sm font-bold">
            8
          </span>
          <div>
            <label className="block text-base font-bold text-[#003666]">
              관심 정책 분야 <span className="text-red-500">*</span>
            </label>
            <p className="text-sm text-slate-600 mt-0.5">
              세종시 정책 중 관심 있는 영역을 <strong>여러 개</strong> 선택해 주세요.
            </p>
          </div>
        </div>

        <div className="mt-5 grid grid-cols-1 sm:grid-cols-2 gap-3">
          {SEJONG_POLICY_INTEREST_GROUPS.map((group) => {
            const on = selectedInterests.includes(group.title);
            return (
              <button
                key={group.id}
                type="button"
                onClick={() => toggleInterest(group.title)}
                className={`text-left rounded-xl border-2 px-4 py-3 transition shadow-sm ${
                  on
                    ? "border-[#004B8D] bg-[#004B8D]/10 ring-1 ring-[#004B8D]/20"
                    : "border-slate-200 bg-white hover:border-[#004B8D]/40 hover:bg-slate-50"
                }`}
              >
                <div className="flex items-center justify-between gap-2">
                  <span className={`font-semibold ${on ? "text-[#003666]" : "text-slate-800"}`}>
                    {on ? "✓ " : ""}
                    {group.title}
                  </span>
                </div>
                <p className="mt-2 text-[11px] sm:text-xs leading-relaxed text-slate-500">
                  키워드: {group.keywords}
                </p>
              </button>
            );
          })}
        </div>
        {errors.interests && <p className="mt-3 text-sm text-red-600">{errors.interests.message}</p>}
        {selectedInterests.length > 0 && (
          <p className="mt-4 text-sm font-medium text-[#004B8D]">{selectedInterests.length}개 분야 선택됨</p>
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
