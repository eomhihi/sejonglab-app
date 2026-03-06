# Next App

Next.js + NextAuth.js + Tailwind CSS + Prisma + PostgreSQL 스택 기반 웹 앱입니다.

## 스택

- **Framework**: Next.js 14 (App Router, SEO·속도 최적화)
- **Auth**: NextAuth.js (카카오, 네이버 로그인)
- **Styling**: Tailwind CSS
- **Database**: Prisma + PostgreSQL

## 시작하기

### 1. 의존성 설치

```bash
cd next-app
npm install
```

### 2. 환경 변수 설정

`.env.example`을 복사해 `.env`를 만들고 값을 채웁니다.

```bash
copy .env.example .env
```

- **NEXTAUTH_URL**: 로컬 개발 시 `http://localhost:3003` / 운영(접속 사이트) `https://www.sejonglab.com`
- **NEXTAUTH_SECRET**: `openssl rand -base64 32` 등으로 32자 이상 생성
- **KAKAO_CLIENT_ID / KAKAO_CLIENT_SECRET**: [카카오 개발자 콘솔](https://developers.kakao.com)에서 앱 생성 후 발급
- **NAVER_CLIENT_ID / NAVER_CLIENT_SECRET**: [네이버 개발자 센터](https://developers.naver.com)에서 앱 생성 후 발급
- **DATABASE_URL**: PostgreSQL 연결 문자열 (예: `postgresql://user:pass@localhost:5432/mydb`)

### 3. DB 마이그레이션

```bash
npx prisma migrate dev --name init
```

### 4. 개발 서버 실행

```bash
npm run dev
```

브라우저에서 [http://localhost:3003](http://localhost:3003) 접속.  
운영 환경에서는 [https://www.sejonglab.com](https://www.sejonglab.com) 으로 접속.

## 프로젝트 구조

```
next-app/
├── prisma/
│   └── schema.prisma    # DB 스키마 (User, Account, Session)
├── src/
│   ├── app/
│   │   ├── api/auth/[...nextauth]/  # NextAuth API
│   │   ├── auth/signin/             # 로그인 페이지
│   │   ├── dashboard/               # 로그인 후 대시보드
│   │   ├── layout.tsx
│   │   └── page.tsx
│   ├── components/
│   ├── lib/
│   │   ├── auth.ts      # NextAuth 설정 (카카오, 네이버)
│   │   └── prisma.ts    # Prisma 클라이언트
│   └── types/
├── .env.example
└── package.json
```

## 카카오/네이버 앱 설정 요약

- **운영(www.sejonglab.com)**  
  - **카카오**: Redirect URI에 `https://www.sejonglab.com/api/auth/callback/kakao` 등록  
  - **네이버**: Callback URL에 `https://www.sejonglab.com/api/auth/callback/naver` 등록  
- **로컬 개발**  
  - **카카오**: Redirect URI에 `http://localhost:3003/api/auth/callback/kakao` 등록  
  - **네이버**: Callback URL에 `http://localhost:3003/api/auth/callback/naver` 등록

패널 등 추가 데이터는 `prisma/schema.prisma`에 모델을 정의한 뒤 `prisma migrate dev`로 마이그레이션하면 됩니다.
