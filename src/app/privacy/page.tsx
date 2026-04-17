import Link from "next/link";
import { EFFECTIVE_DATE } from "@/../constants/policy";

export const metadata = {
  title: "개인정보 처리방침 | 세종랩",
  description: "세종랩 개인정보 처리방침",
};

export default function PrivacyPage() {
  return (
    <main className="min-h-screen bg-white">
      <div className="mx-auto max-w-3xl px-4 py-10 sm:py-14">
        <div className="mb-8 flex items-center justify-between">
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-slate-900">
            개인정보 처리방침
          </h1>
          <Link href="/" className="text-sm font-medium text-slate-600 hover:text-slate-900">
            홈으로
          </Link>
        </div>

        <article className="max-w-none font-sans text-[15px] leading-7 text-slate-800 k-keep">
          <p className="text-sm font-semibold text-header-footer mb-6">II. 개인정보 처리방침</p>

          <section className="space-y-3">
            <h2 className="text-base sm:text-lg font-bold text-header-footer">제1조 (수집 항목 및 목적)</h2>
            <p>
              회사는 리서치의 정확성을 위해 필요한 최소한의 정보만 수집하며, 명시된 목적 이외의 용도로는 절대 사용하지
              않습니다.
            </p>
            <div className="rounded-xl border border-brand-ash/60 bg-brand-light px-4 py-3">
              <ul className="list-disc pl-5 space-y-1.5">
                <li>
                  <span className="font-semibold text-header-footer">수집 항목</span>: 성명, 휴대폰 번호, 직업(코드), 관심분야(텍스트)
                </li>
                <li>
                  <span className="font-semibold text-header-footer">수집 방법</span>: 웹사이트 회원가입 양식
                </li>
                <li>
                  <span className="font-semibold text-header-footer">목적</span>: 본인 확인, 맞춤형 설문 대상 선정, 리워드(쿠폰 등) 발송
                </li>
              </ul>
              <div className="mt-3 border-t border-brand-ash/50 pt-3">
                <ul className="list-disc pl-5 space-y-1.5">
                  <li>
                    <span className="font-semibold text-header-footer">자동 수집</span>: IP 주소, 접속 로그, 쿠키 등
                  </li>
                  <li>
                    <span className="font-semibold text-header-footer">목적</span>: 서비스 부정 이용 방지 및 통계 분석
                  </li>
                </ul>
              </div>
            </div>
          </section>

          <section className="mt-8 space-y-3">
            <h2 className="text-base sm:text-lg font-bold text-header-footer">제2조 (보유 및 이용 기간)</h2>
            <div className="rounded-xl border border-brand-ash/60 bg-brand-light px-4 py-3">
              <ul className="list-disc pl-5 space-y-1.5">
                <li>패널의 개인정보는 회원 탈퇴 시까지 보유하며, 탈퇴 시 지체 없이 파기합니다.</li>
                <li>
                  단, 관련 법령(전자상거래법 등)에 따라 계약 및 리워드 지급 관련 기록은{" "}
                  <span className="font-semibold text-sejong-blue">최대 1년간</span> 보관합니다.
                </li>
              </ul>
            </div>
          </section>

          <section className="mt-8 space-y-3">
            <h2 className="text-base sm:text-lg font-bold text-header-footer">제3조 (개인정보의 파기)</h2>
            <div className="rounded-xl border border-brand-ash/60 bg-brand-light px-4 py-3">
              <p>
                보유 기간이 경과하거나 처리 목적이 달성된 정보는 복구가 불가능한 기술적 방법(전자적 파일) 또는 분쇄(종이
                문서)를 통해 즉시 파기합니다.
              </p>
            </div>
          </section>

          <section className="mt-8 space-y-3">
            <h2 className="text-base sm:text-lg font-bold text-header-footer">제4조 (제3자 제공 및 업무 위탁)</h2>
            <div className="rounded-xl border border-brand-ash/60 bg-brand-light px-4 py-3">
              <ul className="list-disc pl-5 space-y-1.5">
                <li>
                  <span className="font-semibold text-header-footer">제3자 제공</span>: 회사는 패널의 동의 없이 개인정보를 외부에
                  제공하지 않습니다. (통계 결과는 개인을 식별할 수 없는 형태로만 제공)
                </li>
                <li>
                  <span className="font-semibold text-header-footer">업무 위탁</span>: 리워드 발송 및 시스템 관리를 위해 전문 업체에
                  업무를 위탁하며, 수탁업체가 안전하게 정보를 관리하도록 철저히 감독합니다.
                </li>
              </ul>
            </div>
          </section>

          <section className="mt-8 space-y-3">
            <h2 className="text-base sm:text-lg font-bold text-header-footer">제5조 (정보주체의 권리)</h2>
            <div className="rounded-xl border border-brand-ash/60 bg-brand-light px-4 py-3">
              <ul className="list-disc pl-5 space-y-1.5">
                <li>패널은 언제든지 마이페이지를 통해 자신의 정보를 열람, 수정, 삭제 요청할 수 있습니다.</li>
                <li>회사는 패널의 요청이 있을 경우 10일 이내에 조치 결과를 안내합니다.</li>
              </ul>
            </div>
          </section>

          <section className="mt-8 space-y-3">
            <h2 className="text-base sm:text-lg font-bold text-header-footer">제6조 (안전성 확보 조치)</h2>
            <p>회사는 패널의 정보를 보호하기 위해 다음과 같은 보안 대책을 시행합니다.</p>
            <div className="rounded-xl border border-brand-ash/60 bg-brand-light px-4 py-3">
              <ul className="list-disc pl-5 space-y-1.5">
                <li>
                  <span className="font-semibold text-header-footer">기술적 조치</span>: 데이터 암호화 통신(SSL/TLS) 적용, 보안 프로그램
                  설치
                </li>
                <li>
                  <span className="font-semibold text-header-footer">관리적 조치</span>: 개인정보 접근 권한 최소화 및 정기적 보안 교육
                </li>
              </ul>
            </div>
          </section>

          <p className="mt-6 text-sm text-slate-600">시행일자: {EFFECTIVE_DATE}</p>
        </article>
      </div>
    </main>
  );
}

