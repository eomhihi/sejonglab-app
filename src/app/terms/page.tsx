import Link from "next/link";
import { EFFECTIVE_DATE } from "@/../constants/policy";

export const metadata = {
  title: "이용약관 | 세종랩",
  description: "세종랩 이용약관",
};

export default function TermsPage() {
  return (
    <main className="min-h-screen bg-white">
      <div className="mx-auto max-w-3xl px-4 py-10 sm:py-14">
        <div className="mb-8 flex items-center justify-between">
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-slate-900">이용약관</h1>
          <Link href="/" className="text-sm font-medium text-slate-600 hover:text-slate-900">
            홈으로
          </Link>
        </div>

        <article className="max-w-none font-sans text-[15px] leading-7 text-slate-800 k-keep">
          <p className="text-sm font-semibold text-header-footer mb-6">I. 서비스 이용약관</p>

          <section className="space-y-3">
            <h2 className="text-base sm:text-lg font-bold text-header-footer">제1조 (목적 및 효력)</h2>
            <p>본 약관은 세종랩(이하 '회사')이 제공하는 온라인 패널 서비스의 이용 조건 및 절차를 규정합니다.</p>
            <div className="rounded-xl border border-brand-ash/60 bg-brand-light px-4 py-3">
              <p>
                회사는 약관을 변경할 경우 <span className="font-semibold text-sejong-blue">최소 7일 전</span>(패널에게 불리한 경우{" "}
                <span className="font-semibold text-sejong-blue">30일 전</span>)에 공지하며, 공지 후 서비스를 계속 이용하면 변경에
                동의한 것으로 간주합니다.
              </p>
            </div>
          </section>

          <section className="mt-8 space-y-3">
            <h2 className="text-base sm:text-lg font-bold text-header-footer">제2조 (패널 가입 및 자격)</h2>
            <div className="rounded-xl border border-brand-ash/60 bg-brand-light px-4 py-3">
              <ul className="list-disc pl-5 space-y-1.5">
                <li>
                  <span className="font-semibold text-header-footer">가입 연령</span>: 패널은 만 14세 이상부터 가입 가능하며, 가입 시
                  정확한 정보를 기재해야 합니다.
                </li>
                <li>
                  <span className="font-semibold text-header-footer">성실한 응답 의무</span>: 패널은 모든 설문에 정직하게 응답해야
                  하며, 허위 또는 중복 응답 시 리워드 지급이 제한될 수 있습니다.
                </li>
                <li>
                  <span className="font-semibold text-header-footer">비밀유지 의무</span>: 조사를 통해 알게 된 설문 내용이나 문항 등을
                  외부로 유출해서는 안 됩니다.
                </li>
              </ul>
            </div>
          </section>

          <section className="mt-8 space-y-3">
            <h2 className="text-base sm:text-lg font-bold text-header-footer">제3조 (회사의 의무 및 개인정보 보호)</h2>
            <p>회사는 관련 법령을 준수하며 지속적이고 안정적인 서비스를 제공합니다.</p>
            <div className="rounded-xl border border-brand-ash/60 bg-brand-light px-4 py-3">
              <p>
                <span className="font-semibold text-header-footer">개인정보 보호</span>: 패널의 개인정보는 별도의 '개인정보 처리방침'에
                따라 안전하게 관리하며, 설문 데이터는 통계 분석 목적으로만 익명화하여 활용합니다.
              </p>
            </div>
          </section>

          <section className="mt-8 space-y-3">
            <h2 className="text-base sm:text-lg font-bold text-header-footer">제4조 (리워드 지급 및 소멸)</h2>
            <p>리워드는 조사를 정상적으로 완료한 패널에게 지급되며, 조사별 상세 조건은 개별 공지합니다.</p>
            <div className="rounded-xl border border-brand-ash/60 bg-brand-light px-4 py-3">
              <ul className="list-disc pl-5 space-y-1.5">
                <li>
                  <span className="font-semibold text-header-footer">지급 시기</span>: 특별한 사유가 없는 한 조사 종료 후 영업일 기준
                  7일 이내에 지급합니다.
                </li>
                <li>
                  <span className="font-semibold text-header-footer">유효 기간</span>: 포인트 형태의 리워드는 지급일로부터 1년간 유효하며,
                  기간 내 미사용 시 소멸됩니다. (소멸 30일 전 안내)
                </li>
              </ul>
            </div>
          </section>

          <section className="mt-8 space-y-3">
            <h2 className="text-base sm:text-lg font-bold text-header-footer">제5조 (서비스의 이용 제한)</h2>
            <p>다음의 경우 회사는 패널의 자격을 정지하거나 강제 탈퇴 처리할 수 있습니다.</p>
            <div className="rounded-xl border border-brand-ash/60 bg-brand-light px-4 py-3">
              <ul className="list-disc pl-5 space-y-1.5">
                <li>타인의 정보를 도용하거나 허위 정보로 가입한 경우</li>
                <li>불성실 응답, 자동화 프로그램 이용 등 부정한 방법으로 참여한 경우</li>
                <li>설문 내용을 유출하여 조사의 신뢰도를 떨어뜨린 경우</li>
              </ul>
            </div>
          </section>

          <section className="mt-8 space-y-3">
            <h2 className="text-base sm:text-lg font-bold text-header-footer">제6조 (탈퇴 및 포인트 처리)</h2>
            <div className="rounded-xl border border-brand-ash/60 bg-brand-light px-4 py-3">
              <ul className="list-disc pl-5 space-y-1.5">
                <li>패널은 마이페이지를 통해 언제든지 자유롭게 탈퇴할 수 있습니다.</li>
                <li>탈퇴 완료 후 잔여 포인트 및 리워드는 즉시 소멸되며, 재가입 시 복구되지 않습니다.</li>
              </ul>
            </div>
          </section>

          <section className="mt-8 space-y-3">
            <h2 className="text-base sm:text-lg font-bold text-header-footer">제7조 (면책 및 분쟁 해결)</h2>
            <div className="rounded-xl border border-brand-ash/60 bg-brand-light px-4 py-3">
              <ul className="list-disc pl-5 space-y-1.5">
                <li>회사는 천재지변 등 불가항력적인 사유로 인한 서비스 중단에 대해서는 책임을 지지 않습니다.</li>
                <li>
                  본 약관과 관련된 분쟁은 상호 협의를 통해 해결하며, 해결되지 않을 경우 관할 법원은 민사소송법에 따릅니다.
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

