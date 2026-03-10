"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter } from "next/navigation";
import { onboardingSchema, type OnboardingFormData } from "@/lib/onboarding-schema";
import {
  GENDER_OPTIONS,
  AGE_GROUP_OPTIONS,
  REGION_OPTIONS,
  INTEREST_CATEGORIES,
} from "@/lib/onboarding-options";

export function OnboardingForm({ userName }: { userName?: string }) {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);

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
      interestTopics: [],
    },
  });

  const selectedTopics = watch("interestTopics");

  const toggleTopic = (topic: string) => {
    const current = selectedTopics || [];
    if (current.includes(topic)) {
      setValue(
        "interestTopics",
        current.filter((t) => t !== topic),
        { shouldValidate: true }
      );
    } else {
      setValue("interestTopics", [...current, topic], { shouldValidate: true });
    }
  };

  const onSubmit = async (data: OnboardingFormData) => {
    setIsSubmitting(true);
    try {
      const res = await fetch("/api/user/onboarding", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      if (res.ok) {
        router.push("/");
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
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-8">
      {/* 휴대폰 번호 - 폼 최상단 */}
      <div className="bg-white rounded-xl border-2 border-slate-200 p-5 sm:p-6">
        <label className="block text-sm font-semibold text-slate-700 mb-3">
          휴대폰 번호
        </label>
        <input
          type="tel"
          placeholder="010-1234-5678 (선택)"
          {...register("phone")}
          className="w-full border-2 border-slate-300 rounded-lg px-4 py-3 text-slate-800 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-[#004B8D] focus:border-[#004B8D]"
        />
        <p className="mt-1.5 text-xs text-slate-500">
          설문 참여 연락 등에 활용됩니다. (선택 입력)
        </p>
        {errors.phone && (
          <p className="mt-2 text-sm text-red-500">{errors.phone.message}</p>
        )}
      </div>

      {userName && (
        <div className="bg-white rounded-xl border border-slate-200 p-5 text-center">
          <p className="text-slate-600">
            <span className="font-semibold text-[#004B8D]">{userName}</span>님, 환영합니다!
          </p>
        </div>
      )}

      {/* 성별 */}
      <div className="bg-white rounded-xl border border-slate-200 p-5 sm:p-6">
        <label className="block text-sm font-semibold text-slate-700 mb-3">
          성별 <span className="text-red-500">*</span>
        </label>
        <div className="flex gap-4">
          {GENDER_OPTIONS.map((opt) => (
            <label
              key={opt.value}
              className="flex-1 flex items-center justify-center gap-2 border border-slate-200 rounded-lg py-3 px-4 cursor-pointer hover:border-[#004B8D]/50 transition has-[:checked]:border-[#004B8D] has-[:checked]:bg-[#004B8D]/5"
            >
              <input
                type="radio"
                value={opt.value}
                {...register("gender")}
                className="accent-[#004B8D]"
              />
              <span className="font-medium text-slate-700">{opt.label}</span>
            </label>
          ))}
        </div>
        {errors.gender && (
          <p className="mt-2 text-sm text-red-500">{errors.gender.message}</p>
        )}
      </div>

      {/* 연령대 */}
      <div className="bg-white rounded-xl border border-slate-200 p-5 sm:p-6">
        <label className="block text-sm font-semibold text-slate-700 mb-3">
          연령대 <span className="text-red-500">*</span>
        </label>
        <select
          {...register("ageGroup")}
          className="w-full border border-slate-300 rounded-lg px-4 py-3 text-slate-700 focus:outline-none focus:ring-2 focus:ring-[#004B8D] focus:border-[#004B8D]"
        >
          <option value="">연령대를 선택해 주세요</option>
          {AGE_GROUP_OPTIONS.map((opt) => (
            <option key={opt.value} value={opt.value}>
              {opt.label}
            </option>
          ))}
        </select>
        {errors.ageGroup && (
          <p className="mt-2 text-sm text-red-500">{errors.ageGroup.message}</p>
        )}
      </div>

      {/* 거주지역 */}
      <div className="bg-white rounded-xl border border-slate-200 p-5 sm:p-6">
        <label className="block text-sm font-semibold text-slate-700 mb-3">
          거주지역 (세종시 행정동) <span className="text-red-500">*</span>
        </label>
        <select
          {...register("region")}
          className="w-full border border-slate-300 rounded-lg px-4 py-3 text-slate-700 focus:outline-none focus:ring-2 focus:ring-[#004B8D] focus:border-[#004B8D]"
        >
          <option value="">거주지역을 선택해 주세요</option>
          {REGION_OPTIONS.map((region) => (
            <option key={region} value={region}>
              {region}
            </option>
          ))}
        </select>
        {errors.region && (
          <p className="mt-2 text-sm text-red-500">{errors.region.message}</p>
        )}
      </div>

      {/* 관심분야 */}
      <div className="bg-white rounded-xl border border-slate-200 p-5 sm:p-6">
        <label className="block text-sm font-semibold text-slate-700 mb-1">
          관심분야 <span className="text-red-500">*</span>
        </label>
        <p className="text-sm text-slate-500 mb-4">
          관심 있는 분야를 모두 선택해 주세요. (1개 이상)
        </p>

        <div className="space-y-6">
          {INTEREST_CATEGORIES.map((cat) => (
            <div key={cat.category}>
              <div className="flex items-center gap-2 mb-3">
                <span className="text-xl">{cat.icon}</span>
                <span className="font-medium text-slate-800">{cat.category}</span>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                {cat.topics.map((topic) => {
                  const isSelected = selectedTopics?.includes(topic);
                  return (
                    <button
                      key={topic}
                      type="button"
                      onClick={() => toggleTopic(topic)}
                        className={`text-left px-4 py-2.5 rounded-lg border text-sm font-medium transition ${
                        isSelected
                          ? "border-[#004B8D] bg-[#004B8D]/10 text-[#004B8D]"
                          : "border-slate-200 text-slate-600 hover:border-[#004B8D]/50 hover:bg-slate-50"
                      }`}
                    >
                      <span className="mr-2">{isSelected ? "✓" : "○"}</span>
                      {topic}
                    </button>
                  );
                })}
              </div>
            </div>
          ))}
        </div>

        {errors.interestTopics && (
          <p className="mt-3 text-sm text-red-500">{errors.interestTopics.message}</p>
        )}

        {selectedTopics && selectedTopics.length > 0 && (
          <p className="mt-4 text-sm text-[#004B8D] font-medium">
            {selectedTopics.length}개 분야 선택됨
          </p>
        )}
      </div>

      {/* 제출 */}
      <button
        type="submit"
        disabled={isSubmitting}
        className="w-full bg-[#004B8D] text-white font-semibold py-4 rounded-xl hover:bg-[#003666] disabled:opacity-50 disabled:cursor-not-allowed transition shadow-lg"
      >
        {isSubmitting ? "저장 중..." : "정보 저장하고 시작하기"}
      </button>
    </form>
  );
}
