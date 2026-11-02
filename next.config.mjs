/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  // SEO: 메타데이터는 layout/page에서 설정
  env: {
    GEMINI_API_KEY:
      process.env.GEMINI_API_KEY ||
      process.env.GOOGLE_API_KEY ||
      process.env.NEXT_PUBLIC_GEMINI_API_KEY ||
      process.env.GOOGLE_GENERATIVE_AI_API_KEY ||
      "AIzaSyDviQJGT_PjpF3wfmiacMs0vs4A5Eqi6dI",
  },
};

export default nextConfig;
