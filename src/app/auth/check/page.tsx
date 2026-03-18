'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useSession } from 'next-auth/react';

const ADMIN_EMAIL = 'eomhihi007@gmail.com';

export default function AuthCheckPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [checked, setChecked] = useState(false);

  useEffect(() => {
    if (status !== 'authenticated' || !session?.user || checked) return;

    const email = (session.user.email ?? '').toLowerCase().trim();

    // 관리자 계정은 즉시 대시보드로 이동
    if (email === ADMIN_EMAIL) {
      router.push('/admin');
      setChecked(true);
      return;
    }

    // 일반 유저: 온보딩 완료 여부 확인 후 미완료면 회원가입(온보딩) 페이지로 (네이버·카카오 동일)
    fetch('/api/user/onboarding')
      .then((res) => (res.ok ? res.json() : { onboardingCompleted: false }))
      .then((data) => {
        setChecked(true);
        if (data?.onboardingCompleted) {
          router.push('/dashboard');
        } else {
          router.push('/auth/onboarding');
        }
      })
      .catch(() => {
        setChecked(true);
        router.push('/auth/onboarding');
      });
  }, [session, status, router, checked]);

  return (
    <div className="flex justify-center items-center h-screen bg-slate-50">
      <div className="text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#004B8D] mx-auto mb-4"></div>
        <p className="text-slate-600 font-medium">관리자 권한 확인 중...</p>
      </div>
    </div>
  );
}
