export default function DashboardLoading() {
  return (
    <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center gap-4 px-4">
      <div
        className="h-10 w-10 rounded-full border-2 border-primary-600 border-t-transparent animate-spin"
        aria-hidden
      />
      <p className="text-sm font-medium text-slate-600">대시보드를 불러오는 중입니다…</p>
    </div>
  );
}
