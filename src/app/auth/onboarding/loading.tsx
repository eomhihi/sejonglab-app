export default function OnboardingLoading() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 to-slate-100 flex flex-col items-center justify-center gap-4 px-4 py-16">
      <div
        className="h-10 w-10 rounded-full border-2 border-sejong-blue border-t-transparent animate-spin"
        aria-hidden
      />
      <p className="text-sm font-medium text-slate-600 text-center">
        추가 정보 입력 화면을 불러오는 중입니다…
      </p>
    </div>
  );
}
