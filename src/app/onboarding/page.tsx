'use client';
import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useSession } from 'next-auth/react';

export default function OnboardingPage() {
  const { data: session } = useSession();
  const router = useRouter();
  const [phone, setPhone] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    
    // 여기서 실제로 DB 저장 API를 호출하게 됩니다.
    // 지금은 로직 확인을 위해 1초 뒤 메인으로 이동시킵니다.
    setTimeout(() => {
      setLoading(false);
      router.push('/main');
    }, 1000);
  };

  return (
    <div className="min-h-screen bg-slate-50 py-12 px-4">
      <div className="max-w-md mx-auto bg-white shadow-xl rounded-2xl overflow-hidden border border-slate-100">
        <div className="bg-[#004B8D] p-6 text-white">
          <h1 className="text-2xl font-bold">반갑습니다!</h1>
          <p className="opacity-90 mt-1">리서치 참여를 위한 필수 정보를 확인해주세요.</p>
        </div>
        
        <form onSubmit={handleSubmit} className="p-8 space-y-6">
          {/* 1. 휴대폰 번호를 가장 위로 배치 (리서처님 요청사항) */}
          <div>
            <label className="block text-sm font-bold text-slate-700 mb-2">휴대폰 번호 (필수)</label>
            <input 
              required
              type="tel" 
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              placeholder="010-1234-5678"
              className="w-full p-4 border-2 border-[#004B8D] rounded-xl focus:ring-4 focus:ring-blue-100 outline-none transition-all placeholder:text-slate-300 text-lg"
            />
            <p className="mt-2 text-xs text-slate-400">* 리서치 사례금 지급 및 본인 확인을 위해 사용됩니다.</p>
          </div>

          {/* 기타 정보 입력칸 (예시) */}
          <div>
            <label className="block text-sm font-bold text-slate-700 mb-2">거주 행정동</label>
            <select className="w-full p-3 border border-slate-200 rounded-lg outline-none focus:border-[#004B8D]">
              <option>도담동</option>
              <option>아름동</option>
              <option>보람동</option>
              <option>조치원읍</option>
            </select>
          </div>
          
          <button 
            type="submit"
            disabled={loading}
            className="w-full py-4 bg-[#004B8D] text-white font-bold rounded-xl shadow-lg hover:bg-[#003d75] active:scale-[0.98] transition-all disabled:opacity-50"
          >
            {loading ? "저장 중..." : "정보 저장하고 시작하기"}
          </button>

          {session?.user?.email === 'eomhihi007@gmail.com' && (
            <div className="pt-4 border-t border-dashed border-slate-200">
              <button 
                type="button"
                onClick={() => router.push('/admin')}
                className="w-full py-2 bg-slate-100 text-slate-600 text-sm rounded-lg hover:bg-slate-200 transition-colors"
              >
                관리자이신가요? 대시보드로 바로가기
              </button>
            </div>
          )}
        </form>
      </div>
    </div>
  );
}
  