'use client';
import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useSession } from 'next-auth/react';

export default function AuthCheckPage() {
  const { data: session, status } = useSession();
  const router = useRouter();

  useEffect(() => {
    if (status === 'authenticated' && session?.user?.email) {
      const email = session.user.email.toLowerCase().trim();
      
      // 1순위: 관리자 체크
      if (email === 'eomhihi007@gmail.com') {
        router.push('/admin');
        return;
      }

      // 2순위: 온보딩 완료 여부 체크 (서버사이드 데이터 기반으로 커서가 보강할 부분)
      // 현재는 로직상 문제가 생기지 않도록 일반 유저는 /main으로 우선 보냅니다.
      router.push('/main');
    }
  }, [session, status, router]);

  return <div className="flex justify-center items-center h-screen">권한을 확인 중입니다...</div>;
}