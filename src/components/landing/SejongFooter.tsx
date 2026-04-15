import Link from "next/link";
import { MapPin, Mail } from "lucide-react";

type SejongFooterProps = {
  isAdmin?: boolean;
};

export function SejongFooter({ isAdmin = false }: SejongFooterProps) {
  return (
    <footer className="bg-slate-900 text-slate-300">
      <div className="max-w-7xl mx-auto px-4 py-12 sm:py-16">
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-8 lg:gap-12">
          {/* 브랜드 */}
          <div className="sm:col-span-2 lg:col-span-1">
            <div className="flex items-center gap-3 mb-4">
              <div className="px-2.5 py-1.5 rounded-lg bg-gradient-to-br from-[#004B8D] to-sky-500 flex items-center justify-center">
                <span className="text-white font-bold text-xs whitespace-nowrap">Sejong Lab</span>
              </div>
              <div className="flex flex-col">
                <span className="font-bold text-white">세종랩</span>
                <span className="text-xs text-slate-500">Data Research</span>
              </div>
            </div>
            <p className="text-sm text-slate-400 leading-relaxed mb-4">
              데이터가 세상을 바꾼다.<br />
              세종시민과 함께 만드는 스마트 시티
            </p>
            <div className="flex items-center gap-2 text-xs text-slate-500">
              <MapPin className="w-4 h-4" />
              <span>세종특별자치시</span>
            </div>
          </div>

          {/* 서비스 */}
          <div>
            <h4 className="font-semibold text-white mb-4">서비스</h4>
            <ul className="space-y-2 text-sm">
              <li>
                <Link href="#features" className="hover:text-sky-400 transition-colors">
                  행정동별 분석
                </Link>
              </li>
              <li>
                <Link href="#features" className="hover:text-sky-400 transition-colors">
                  시민 체감도 조사
                </Link>
              </li>
              <li>
                <Link href="#features" className="hover:text-sky-400 transition-colors">
                  신사업 실증
                </Link>
              </li>
            </ul>
          </div>

          {/* 참여 */}
          <div>
            <h4 className="font-semibold text-white mb-4">참여하기</h4>
            <ul className="space-y-2 text-sm">
              <li>
                <Link href="/auth/signin" className="hover:text-sky-400 transition-colors">
                  패널 신청
                </Link>
              </li>
              <li>
                <Link href="/dashboard" className="hover:text-sky-400 transition-colors">
                  마이페이지
                </Link>
              </li>
              <li>
                <Link href="#benefits" className="hover:text-sky-400 transition-colors">
                  참여 혜택
                </Link>
              </li>
            </ul>
          </div>

          {/* 문의 */}
          <div>
            <h4 className="font-semibold text-white mb-4">문의</h4>
            <ul className="space-y-3 text-sm">
              <li className="flex items-center gap-2">
                <Mail className="w-4 h-4 text-sky-400" />
                <span>info@sjr.co.kr</span>
              </li>
            </ul>
          </div>
        </div>

        <div className="mt-12 pt-8 border-t border-slate-800 flex flex-col sm:flex-row items-center justify-between gap-4">
          <p className="text-xs text-slate-500">
            © 2026 세종랩. Powered by AirBBot
          </p>
          <div className="flex items-center gap-4 text-xs text-slate-500">
            <Link
              href="/api/auth/signout?callbackUrl=/"
              className="hover:text-sky-400 transition-colors"
            >
              세션 종료 (로그아웃)
            </Link>
            {isAdmin && (
              <Link href="/admin" className="hover:text-sky-400 transition-colors">
                관리자
              </Link>
            )}
            <div className="flex items-center gap-2 text-xs">
              <Link href="/terms" className="hover:text-sky-400 transition-colors">
                이용약관
              </Link>
              <span className="text-slate-700/60">|</span>
              <Link href="/privacy" className="hover:text-sky-400 transition-colors">
                개인정보 처리방침
              </Link>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}
