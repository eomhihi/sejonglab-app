import newsDataRaw from "@/data/sejong_news_10years.json";

export interface SejongNewsArticle {
  id: string;
  title: string;
  date: string; // YYYY-MM-DD (실제 기사 발행일)
  press: string; // 실제 언론사명
  category: string;
  summary: string; // 실제 기사 요약문/발췌문
  keywords: string[];
  url: string; // 실제 기사 원문 링크
  embedding?: number[]; // Gemini Embedding API 실제 임베딩 벡터
  embeddingModel?: string;
}

export interface RetrievedNewsSource {
  id: string;
  title: string;
  date: string;
  press: string;
  category: string;
  summary: string;
  keywords: string[];
  similarity: number; // 실제 임베딩 벡터 간 순수 코사인 유사도 (0 ~ 1)
  url: string;
  isLive?: boolean; // 실시간 RSS/API로부터 방금 수집된 최신 뉴스 여부
}

const NEWS_CORPUS: SejongNewsArticle[] = newsDataRaw as SejongNewsArticle[];

// 런타임 메모리 캐시 (실제 Gemini API로부터 생성된 임베딩만 저장)
const articleEmbeddingCache = new Map<string, number[]>();
const queryEmbeddingCache = new Map<string, number[]>();

// JSON 파일에 사전 계산되어 저장된 실제 임베딩 벡터를 캐시에 적재
for (const article of NEWS_CORPUS) {
  if (Array.isArray(article.embedding) && article.embedding.length > 0) {
    articleEmbeddingCache.set(article.id, article.embedding);
  }
}

/**
 * 두 실제 임베딩 벡터 간의 순수 코사인 유사도(Cosine Similarity) 계산
 * 어떠한 인위적 보정 수식이나 난수도 사용하지 않음
 */
export function cosineSimilarity(vecA: number[], vecB: number[]): number {
  if (!vecA.length || !vecB.length || vecA.length !== vecB.length) return 0;
  let dot = 0;
  let normA = 0;
  let normB = 0;
  for (let i = 0; i < vecA.length; i++) {
    dot += vecA[i] * vecB[i];
    normA += vecA[i] * vecA[i];
    normB += vecB[i] * vecB[i];
  }
  if (normA === 0 || normB === 0) return 0;
  return dot / (Math.sqrt(normA) * Math.sqrt(normB));
}

const DEDUP_STOPWORDS = new Set([
  "세종",
  "세종시",
  "세종특별자치시",
  "기자",
  "사진",
  "제공",
  "통해",
  "위해",
  "관련",
  "이번",
  "지난",
  "오전",
  "오후",
  "열린",
  "개최",
  "추진",
  "본격",
  "사업",
  "정책",
]);

function extractContentTokens(text: string): Set<string> {
  const words = text
    .toLowerCase()
    .replace(/[^\w가-힣0-9\s]/g, " ")
    .split(/\s+/)
    .filter((w) => w.length >= 2 && !DEDUP_STOPWORDS.has(w));
  return new Set(words);
}

function computeTokenOverlapRatio(textA: string, textB: string): number {
  const setA = extractContentTokens(textA);
  const setB = extractContentTokens(textB);
  if (setA.size === 0 || setB.size === 0) return 0;
  let intersection = 0;
  const arrA = Array.from(setA);
  for (let i = 0; i < arrA.length; i++) {
    if (setB.has(arrA[i])) intersection++;
  }
  return intersection / Math.min(setA.size, setB.size);
}

function getDaysBetweenDates(dateA: string, dateB: string): number {
  const tA = new Date(dateA).getTime();
  const tB = new Date(dateB).getTime();
  if (Number.isNaN(tA) || Number.isNaN(tB)) return 9999;
  return Math.abs(tA - tB) / (1000 * 60 * 60 * 24);
}

interface DomainRule {
  queryTriggers: string[];
  preferredCategories: string[];
  domainTerms: string[];
}

const DOMAIN_RANKING_RULES: DomainRule[] = [
  {
    queryTriggers: ["국회", "세종의사당", "대통령", "집무실", "ctx", "광역급행철도", "광역철도"],
    preferredCategories: ["국회·대통령실", "교통·인프라"],
    domainTerms: ["국회세종의사당", "세종의사당", "대통령", "집무실", "국가상징구역", "ctx", "광역급행철도", "광역철도", "건립", "설계"],
  },
  {
    queryTriggers: ["상가", "공실", "용도변경", "상권", "소상공인", "여민전"],
    preferredCategories: ["경제·상가공실"],
    domainTerms: ["상가", "공실", "용도변경", "지구단위계획", "허용업종", "수변상가", "소상공인", "상권", "여민전", "공실률"],
  },
  {
    queryTriggers: ["이응패스", "대중교통", "버스", "brt", "바로타", "어울링", "두루타"],
    preferredCategories: ["교통·인프라"],
    domainTerms: ["이응패스", "대중교통", "버스", "시내버스", "brt", "바로타", "전기굴절버스", "두루타", "어울링", "노선"],
  },
  {
    queryTriggers: ["조치원", "읍면", "읍·면", "균형발전", "도시재생", "로컬푸드", "싱싱장터"],
    preferredCategories: ["균형발전·개발"],
    domainTerms: ["조치원", "청춘조치원", "도시재생", "균형발전", "읍면", "문화정원", "1927", "아트센터", "로컬푸드", "싱싱장터", "농촌협약"],
  },
  {
    queryTriggers: ["4생활권", "5생활권", "4·5생활권", "학교", "신설", "과밀학급", "교육청", "캠퍼스고"],
    preferredCategories: ["교육·보육"],
    domainTerms: ["학교", "신설", "개교", "과밀학급", "4생활권", "5생활권", "집현", "합강", "산울", "해밀", "교육청", "학생배치", "캠퍼스고", "유치원", "초중고"],
  },
  {
    queryTriggers: ["청년", "신혼부부", "다자녀", "주거", "월세", "전세", "임대주택", "정착"],
    preferredCategories: ["정주·주거·복지", "청년·주거·복지"],
    domainTerms: ["청년", "신혼부부", "다자녀", "주거", "월세", "전세", "임대", "보증금", "이자지원", "공공임대", "행복주택", "특별공급"],
  },
  {
    queryTriggers: ["미디어", "영상", "축제", "디지털", "콘텐츠", "문화", "박람회", "관광"],
    preferredCategories: ["미디어·콘텐츠·문화사업"],
    domainTerms: ["미디어", "영상", "디지털", "콘텐츠", "축제", "세종축제", "문화관광재단", "미디어아트", "문화", "공모", "박물관", "드론"],
  },
  {
    queryTriggers: ["첨단", "로봇", "산단", "기회발전특구", "특구", "이전", "혜택", "세제", "테크노파크", "기업"],
    preferredCategories: ["투자유치·세제혜택", "산업단지·기업유치", "기업지원·R&D"],
    domainTerms: ["기회발전특구", "국가산단", "스마트국가산단", "로봇", "첨단", "세제", "취득세", "재산세", "보조금", "테크노파크", "기업", "유치", "투자"],
  },
  {
    queryTriggers: ["대학", "산학협력", "산학연", "rise", "공동캠퍼스", "고려대", "홍익대", "영상대"],
    preferredCategories: ["대학·산학연·평생교육"],
    domainTerms: ["대학", "산학협력", "산학연", "rise", "공동캠퍼스", "고려대", "홍익대", "한국영상대", "캠퍼스", "인재양성"],
  },
  {
    queryTriggers: ["평생교육", "직업교육", "시민대학", "집현전", "진흥원", "신중년", "재취업"],
    preferredCategories: ["대학·산학연·평생교육"],
    domainTerms: ["평생교육", "직업교육", "인재평생교육진흥원", "시민대학", "집현전", "학습도시", "직업훈련", "신중년", "강좌"],
  },
];

/**
 * 질문 도메인과 후보 기사의 카테고리·핵심 키워드 정합성 가중치 산출
 * (주의: 반환되는 similarity 점수는 100% 순수 코사인 유사도 원본을 그대로 유지하며,
 *  본 함수의 결과는 오직 검색 후보 정렬 순서(rankScore) 결정에만 사용됨)
 */
export function computeDomainAlignmentBoost(
  query: string,
  article: SejongNewsArticle
): number {
  const qLower = query.toLowerCase();
  const artText = `${article.title} ${article.summary} ${article.keywords.join(" ")}`.toLowerCase();

  let boost = 0;

  // 1. 질문 내 핵심 어휘 직접 매칭 보너스
  const queryTokens = Array.from(extractContentTokens(query));
  let matchedQueryTokens = 0;
  for (let i = 0; i < queryTokens.length; i++) {
    const tok = queryTokens[i];
    if (article.title.toLowerCase().includes(tok)) {
      matchedQueryTokens += 1.5;
    } else if (artText.includes(tok)) {
      matchedQueryTokens += 0.8;
    }
  }
  boost += Math.min(matchedQueryTokens * 0.018, 0.09);

  // 2. 도메인 룰 기반 카테고리 및 특화 키워드 정합성 보너스
  for (const rule of DOMAIN_RANKING_RULES) {
    const isTriggered = rule.queryTriggers.some((trig) => qLower.includes(trig));
    if (!isTriggered) continue;

    if (rule.preferredCategories.includes(article.category)) {
      boost += 0.055;
    }

    let domainTermHits = 0;
    for (const term of rule.domainTerms) {
      if (artText.includes(term.toLowerCase())) {
        domainTermHits++;
      }
    }
    if (domainTermHits > 0) {
      boost += Math.min(domainTermHits * 0.016, 0.075);
    } else if (!rule.preferredCategories.includes(article.category)) {
      // 질문 도메인과 전혀 무관한 카테고리·키워드 기사가 후순위로 밀리도록 페널티 부여
      boost -= 0.045;
    }
  }

  return boost;
}

/**
 * 상위 출처 기사(sources) 선정 시 비슷한 시기·비슷한 내용의 기사가 중복 노출되지 않도록
 * 1) 기사 간 임베딩 코사인 유사도, 2) 제목·본문 핵심 어휘 중복도, 3) 보도 시기 인접도를 종합 판별
 */
function isRedundantWithSelected(
  candidate: RetrievedNewsSource,
  selectedList: RetrievedNewsSource[]
): boolean {
  const candVec = articleEmbeddingCache.get(candidate.id);

  for (const existing of selectedList) {
    const daysDiff = getDaysBetweenDates(candidate.date, existing.date);
    const titleOverlap = computeTokenOverlapRatio(
      candidate.title,
      existing.title
    );
    const fullOverlap = computeTokenOverlapRatio(
      `${candidate.title} ${candidate.summary}`,
      `${existing.title} ${existing.summary}`
    );

    // 1. 제목 또는 본문 요약 핵심 어휘가 38% 이상 겹치면 유사 기사로 제외
    if (titleOverlap >= 0.42 || fullOverlap >= 0.38) {
      return true;
    }

    // 2. 보도 시기가 30일 이내로 비슷하면서 핵심 어휘가 25% 이상 겹치면 동일 현안 중복 보도로 제외
    if (daysDiff <= 30 && (titleOverlap >= 0.25 || fullOverlap >= 0.25)) {
      return true;
    }

    // 3. 두 기사 간 실제 임베딩 벡터의 코사인 유사도가 높으면 중복 이슈로 제외
    const existingVec = articleEmbeddingCache.get(existing.id);
    if (candVec && existingVec && candVec.length === existingVec.length) {
      const interArticleCosine = cosineSimilarity(candVec, existingVec);
      if (interArticleCosine >= 0.80) {
        return true;
      }
      if (daysDiff <= 30 && interArticleCosine >= 0.74) {
        return true;
      }
    }
  }

  return false;
}

/**
 * 코퍼스에 저장된 실제 임베딩 모델명(gemini-embedding-001 등)을 최우선으로 사용
 */
function getPreferredModelCandidates(): string[] {
  const savedModel = NEWS_CORPUS.find((a) => a.embeddingModel)?.embeddingModel;
  const defaults = ["gemini-embedding-001", "text-embedding-004"];
  if (savedModel) {
    return [savedModel, ...defaults.filter((m) => m !== savedModel)];
  }
  return defaults;
}

function getTargetDimension(): number {
  const firstWithVec = NEWS_CORPUS.find(
    (a) => Array.isArray(a.embedding) && a.embedding.length > 0
  );
  return firstWithVec?.embedding?.length || 768;
}

/**
 * Gemini Embedding API (text-embedding-004 / gemini-embedding-001)를 실제로 호출하여 단일 텍스트 임베딩 벡터 반환
 * 실패 시 가짜 벡터를 생성하지 않고 실제 에러를 그대로 throw함
 */
async function fetchRealGeminiEmbedding(
  text: string,
  apiKey: string
): Promise<number[]> {
  const cacheKey = text.trim();
  if (queryEmbeddingCache.has(cacheKey)) {
    return queryEmbeddingCache.get(cacheKey)!;
  }

  const targetDim = getTargetDimension();
  const candidates = getPreferredModelCandidates();
  const errors: string[] = [];

  for (const modelName of candidates) {
    const endpoint = `https://generativelanguage.googleapis.com/v1beta/models/${modelName}:embedContent?key=${apiKey}`;
    for (let attempt = 0; attempt < 2; attempt++) {
      try {
        const response = await fetch(endpoint, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            model: `models/${modelName}`,
            content: { parts: [{ text: cacheKey }] },
            outputDimensionality: targetDim,
          }),
        });

        if (
          (response.status === 429 || response.status === 503) &&
          attempt === 0
        ) {
          await new Promise((r) => setTimeout(r, 1500));
          continue;
        }

        if (!response.ok) {
          const errBody = await response.text();
          errors.push(
            `${modelName}: HTTP ${response.status} (${errBody.slice(0, 120)})`
          );
          break;
        }

        const data = await response.json();
        const values: unknown = data?.embedding?.values;
        if (Array.isArray(values) && values.length > 0) {
          const numericVec = values.map((v) => Number(v));
          queryEmbeddingCache.set(cacheKey, numericVec);
          return numericVec;
        }
        break;
      } catch (err) {
        if (attempt === 0) {
          await new Promise((r) => setTimeout(r, 1000));
          continue;
        }
        errors.push(
          `${modelName}: ${err instanceof Error ? err.message : String(err)}`
        );
      }
    }
  }

  throw new Error(
    `Gemini 임베딩 API 호출에 실패했습니다: ${errors.join(" | ")}`
  );
}

/**
 * JSON 파일에 임베딩이 아직 없는 신규 기사가 있을 경우 실제 Gemini batchEmbedContents API로 임베딩 생성
 */
async function ensureRealCorpusEmbeddings(apiKey: string): Promise<void> {
  const uncached = NEWS_CORPUS.filter((a) => !articleEmbeddingCache.has(a.id));
  if (uncached.length === 0) return;

  const targetDim = getTargetDimension();
  const candidates = getPreferredModelCandidates();
  const batchSize = 40;

  for (let i = 0; i < uncached.length; i += batchSize) {
    const chunk = uncached.slice(i, i + batchSize);
    let embeddedChunk = false;
    let lastError = "";

    for (const modelName of candidates) {
      const endpoint = `https://generativelanguage.googleapis.com/v1beta/models/${modelName}:batchEmbedContents?key=${apiKey}`;
      const requests = chunk.map((art) => ({
        model: `models/${modelName}`,
        content: {
          parts: [
            {
              text: `[${art.category}] ${art.title} (${art.date}, ${art.press})\n키워드: ${art.keywords.join(", ")}\n요약: ${art.summary}`,
            },
          ],
        },
        outputDimensionality: targetDim,
      }));

      try {
        const res = await fetch(endpoint, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ requests }),
        });

        if (!res.ok) {
          lastError = `${modelName} HTTP ${res.status}`;
          continue;
        }

        const data = await res.json();
        const embeddings = data?.embeddings;
        if (Array.isArray(embeddings) && embeddings.length === chunk.length) {
          chunk.forEach((art, idx) => {
            const vals = embeddings[idx]?.values;
            if (Array.isArray(vals) && vals.length > 0) {
              articleEmbeddingCache.set(art.id, vals.map(Number));
            }
          });
          embeddedChunk = true;
          break;
        }
      } catch (err) {
        lastError = err instanceof Error ? err.message : String(err);
      }
    }

    if (!embeddedChunk) {
      throw new Error(`기사 배치 임베딩 생성 실패: ${lastError}`);
    }
  }
}

const QUERY_FILLER_STOPWORDS = new Set([
  "알려줘",
  "알려주세요",
  "무엇인가요",
  "무엇인지",
  "어떻게",
  "되나요",
  "대한",
  "대해",
  "관련",
  "경과",
  "현황",
  "현황은",
  "대책",
  "대책은",
  "혜택",
  "혜택은",
  "기회",
  "기회는",
  "과정",
  "과정은",
  "성과",
  "성과는",
  "수요",
  "수요는",
  "위한",
  "관내",
  "까지",
  "지난",
  "10년간",
  "15년간",
  "최근",
  "오늘",
  "최신",
  "이슈",
  "소식",
  "뉴스",
  "질문",
]);

function stripHtmlAndDecode(raw: string): string {
  if (!raw) return "";
  return raw
    .replace(/<!\[CDATA\[([\s\S]*?)\]\]>/g, "$1")
    .replace(/<[^>]+>/g, " ")
    .replace(/&quot;/g, '"')
    .replace(/&#39;|&apos;/g, "'")
    .replace(/&amp;/g, "&")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&nbsp;/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

function formatPubDateToYMD(pubDateRaw: string): string | null {
  if (!pubDateRaw) return null;
  const parsed = new Date(pubDateRaw.trim());
  if (!Number.isNaN(parsed.getTime())) {
    const yyyy = parsed.getFullYear();
    const mm = String(parsed.getMonth() + 1).padStart(2, "0");
    const dd = String(parsed.getDate()).padStart(2, "0");
    return `${yyyy}-${mm}-${dd}`;
  }
  const m = pubDateRaw.match(/(20\d{2})[-./](\d{1,2})[-./](\d{1,2})/);
  if (m) {
    return `${m[1]}-${m[2].padStart(2, "0")}-${m[3].padStart(2, "0")}`;
  }
  return null;
}

/**
 * 사용자 질문에서 불용어·어미를 제거하여 실시간 RSS 검색용 핵심 키워드 쿼리(`세종시 + 핵심어`) 생성
 */
export function buildLiveRssSearchQuery(rawQuery: string): string {
  const cleaned = rawQuery
    .replace(/[?.,!'"“”‘’()[\]·~]/g, " ")
    .split(/\s+/)
    .map((w) =>
      w.replace(/(은|는|이|가|을|를|의|에|에서|으로|로|과|와|도|만|까지|부터)$/, "")
    )
    .filter(
      (w) =>
        w.length >= 2 &&
        !DEDUP_STOPWORDS.has(w.toLowerCase()) &&
        !QUERY_FILLER_STOPWORDS.has(w.toLowerCase())
    );

  const uniqueKeywords = Array.from(new Set(cleaned)).slice(0, 3);
  if (uniqueKeywords.length === 0) {
    return "세종시 정책 현안";
  }

  const joined = uniqueKeywords.join(" ");
  if (joined.includes("세종")) {
    return joined;
  }
  return `세종시 ${joined}`;
}

/**
 * Google News RSS를 실시간 Fetch(타임아웃 2.5초)하여 질문과 관련된 가장 최근 실제 뉴스 상위 2~3건을 반환
 * (실제 임베딩 코사인 유사도를 즉시 계산하여 similarity에 기록)
 */
export async function fetchLiveGoogleNewsRss(
  query: string,
  queryVec: number[],
  apiKey: string,
  maxLiveItems: number = 3
): Promise<RetrievedNewsSource[]> {
  const rssQuery = buildLiveRssSearchQuery(query);
  const rssUrl = `https://news.google.com/rss/search?q=${encodeURIComponent(
    rssQuery
  )}&hl=ko&gl=KR&ceid=KR:ko`;

  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), 2500);

  let xmlText = "";
  try {
    const res = await fetch(rssUrl, {
      method: "GET",
      headers: {
        "User-Agent":
          "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36",
        Accept: "application/rss+xml, application/xml, text/xml;q=0.9, */*;q=0.8",
      },
      signal: controller.signal,
      cache: "no-store",
    });
    if (!res.ok) {
      return [];
    }
    xmlText = await res.text();
  } catch {
    // 2.5초 타임아웃 또는 네트워크 단절 시 아카이브 검색만 정상 반환되도록 빈 배열 처리
    return [];
  } finally {
    clearTimeout(timeoutId);
  }

  const itemBlocks = xmlText.match(/<item>([\s\S]*?)<\/item>/gi) || [];
  if (itemBlocks.length === 0) return [];

  const parsedCandidates: Array<{
    id: string;
    title: string;
    date: string;
    pubTimeMs: number;
    press: string;
    summary: string;
    url: string;
    keywords: string[];
  }> = [];

  for (let i = 0; i < Math.min(itemBlocks.length, 15); i++) {
    const block = itemBlocks[i];
    const titleMatch = block.match(/<title>([\s\S]*?)<\/title>/i);
    const linkMatch = block.match(/<link>([\s\S]*?)<\/link>/i);
    const pubDateMatch = block.match(/<pubDate>([\s\S]*?)<\/pubDate>/i);
    const descMatch = block.match(/<description>([\s\S]*?)<\/description>/i);
    const sourceMatch = block.match(/<source[^>]*>([\s\S]*?)<\/source>/i);

    const rawTitle = titleMatch ? stripHtmlAndDecode(titleMatch[1]) : "";
    const link = linkMatch ? stripHtmlAndDecode(linkMatch[1]) : "";
    const pubRaw = pubDateMatch ? stripHtmlAndDecode(pubDateMatch[1]) : "";
    const descRaw = descMatch ? stripHtmlAndDecode(descMatch[1]) : "";
    const sourcePress = sourceMatch ? stripHtmlAndDecode(sourceMatch[1]) : "";

    if (!rawTitle || !link || !pubRaw) continue;

    const ymd = formatPubDateToYMD(pubRaw);
    if (!ymd) continue;

    let cleanTitle = rawTitle;
    let press = sourcePress || "실시간 언론보도";
    if (rawTitle.includes(" - ")) {
      const lastDash = rawTitle.lastIndexOf(" - ");
      const maybePress = rawTitle.slice(lastDash + 3).trim();
      cleanTitle = rawTitle.slice(0, lastDash).trim();
      if (!sourcePress && maybePress.length > 0 && maybePress.length <= 25) {
        press = maybePress;
      }
    }

    // 세종시 관련 실제 보도인지 검증
    const combinedText = `${cleanTitle} ${descRaw}`;
    if (
      !combinedText.includes("세종") &&
      !combinedText.includes("행복청") &&
      !combinedText.includes("행복도시") &&
      !combinedText.includes("조치원") &&
      !combinedText.includes("이응패스") &&
      !combinedText.includes("여민전")
    ) {
      continue;
    }

    const summaryText =
      descRaw && descRaw.length > cleanTitle.length
        ? descRaw
        : `${cleanTitle} (${press}, ${ymd} 보도)`;

    const pubTimeMs = new Date(pubRaw).getTime() || new Date(ymd).getTime() || 0;
    const extractedKw = Array.from(extractContentTokens(cleanTitle)).slice(0, 6);

    parsedCandidates.push({
      id: `LIVE-RSS-${ymd}-${i + 1}`,
      title: cleanTitle,
      date: ymd,
      pubTimeMs,
      press,
      summary: summaryText,
      url: link,
      keywords: extractedKw,
    });
  }

  if (parsedCandidates.length === 0) return [];

  // 최신 보도순 정렬 후 상위 후보 추리기
  parsedCandidates.sort((a, b) => b.pubTimeMs - a.pubTimeMs);
  const topRecent = parsedCandidates.slice(0, maxLiveItems);

  // 실시간 수집된 뉴스에 대해서도 실제 Gemini Embedding API로 코사인 유사도를 정밀 계산 (Zero-Mock)
  const targetDim = queryVec.length || getTargetDimension();
  const candidates = getPreferredModelCandidates();
  const liveSources: RetrievedNewsSource[] = [];

  for (const modelName of candidates) {
    const endpoint = `https://generativelanguage.googleapis.com/v1beta/models/${modelName}:batchEmbedContents?key=${apiKey}`;
    const requests = topRecent.map((item) => ({
      model: `models/${modelName}`,
      content: {
        parts: [
          {
            text: `[실시간 최신보도] ${item.title} (${item.date}, ${item.press})\n요약: ${item.summary}`,
          },
        ],
      },
      outputDimensionality: targetDim,
    }));

    try {
      const res = await fetch(endpoint, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ requests }),
      });
      if (!res.ok) continue;

      const data = await res.json();
      const embeddings = data?.embeddings;
      if (Array.isArray(embeddings) && embeddings.length === topRecent.length) {
        topRecent.forEach((item, idx) => {
          const vals = embeddings[idx]?.values;
          if (Array.isArray(vals) && vals.length === queryVec.length) {
            const vec = vals.map(Number);
            articleEmbeddingCache.set(item.id, vec);
            const rawCos = cosineSimilarity(queryVec, vec);
            const exactSim = Number(rawCos.toFixed(4));
            if (exactSim >= 0.35) {
              liveSources.push({
                id: item.id,
                title: item.title,
                date: item.date,
                press: item.press,
                category: "실시간 최신보도",
                summary: item.summary,
                keywords: item.keywords,
                similarity: exactSim,
                url: item.url,
                isLive: true,
              });
            }
          }
        });
        break;
      }
    } catch {
      continue;
    }
  }

  return liveSources;
}

/**
 * 100% 실제 임베딩 기반 코사인 유사도 + 실시간 Google News RSS 하이브리드 검색 엔진
 * - (A) 기존의 sejong_news_10years.json에서 임베딩 코사인 유사도 기반으로 과거~최근의 핵심 뉴스 상위 3~4건 검색
 * - (B) 동시에 질문에서 추출한 핵심 키워드(세종시 + 핵심어)로 Google News RSS를 실시간 Fetch(타임아웃 2.5초)하여 최신 뉴스 상위 2~3건 수집
 * - (A)의 15년 아카이브 뉴스와 (B)의 실시간 최신 뉴스를 중복 제거 후 결합하여 반환
 */
export async function searchSejongNewsHybrid(
  query: string,
  topK: number = 4,
  minSimilarity: number = 0.35
): Promise<RetrievedNewsSource[]> {
  const cleanQuery = query.trim();
  if (!cleanQuery) return [];

  const apiKey =
    process.env.GEMINI_API_KEY?.trim() ||
    process.env.GOOGLE_API_KEY?.trim() ||
    "";

  if (!apiKey) {
    throw new Error(
      "서버에 GEMINI_API_KEY가 설정되어 있지 않아 실제 임베딩 유사도 계산을 수행할 수 없습니다."
    );
  }

  await ensureRealCorpusEmbeddings(apiKey);
  const queryVec = await fetchRealGeminiEmbedding(cleanQuery, apiKey);

  // (B) 실시간 Google News RSS 최신 뉴스 병렬 Fetch 시작 (타임아웃 2.5초)
  const liveRssPromise = fetchLiveGoogleNewsRss(cleanQuery, queryVec, apiKey, 2);

  // (A) 15년 아카이브(sejong_news_10years.json) 임베딩 코사인 유사도 검색
  const scored: Array<{ source: RetrievedNewsSource; rankScore: number }> = [];

  for (const article of NEWS_CORPUS) {
    const artVec = articleEmbeddingCache.get(article.id);
    if (!artVec || artVec.length !== queryVec.length) {
      continue;
    }

    const rawCosine = cosineSimilarity(queryVec, artVec);
    const exactSimilarity = Number(rawCosine.toFixed(4));

    if (exactSimilarity >= minSimilarity) {
      const alignmentBoost = computeDomainAlignmentBoost(cleanQuery, article);
      scored.push({
        source: {
          id: article.id,
          title: article.title,
          date: article.date,
          press: article.press,
          category: article.category,
          summary: article.summary,
          keywords: article.keywords,
          similarity: exactSimilarity,
          url: article.url,
          isLive: false,
        },
        rankScore: exactSimilarity + alignmentBoost,
      });
    }
  }

  scored.sort((a, b) => b.rankScore - a.rankScore);

  const archiveSelected: RetrievedNewsSource[] = [];
  for (const item of scored) {
    if (archiveSelected.length >= topK) break;
    if (!isRedundantWithSelected(item.source, archiveSelected)) {
      archiveSelected.push(item.source);
    }
  }

  // (B) 실시간 최신 뉴스 결과 수신 및 중복 제거 결합
  const liveArticles = await liveRssPromise;
  const combinedSelected: RetrievedNewsSource[] = [...archiveSelected];

  for (const liveItem of liveArticles) {
    if (!isRedundantWithSelected(liveItem, combinedSelected)) {
      combinedSelected.push(liveItem);
    }
  }

  // 아카이브 상위 기사와 실시간 최신 기사가 모두 포함되도록 구성 (최대 topK + 2건, 기본 최대 6건)
  return combinedSelected.slice(0, Math.max(topK + 2, 6));
}

/**
 * 전체 실제 뉴스 코퍼스 통계 반환
 */
export function getSejongNewsCorpusStats() {
  const years = NEWS_CORPUS.map((a) => a.date.slice(0, 4)).filter(Boolean).sort();
  return {
    totalArticles: NEWS_CORPUS.length,
    yearRange:
      years.length > 0 ? `${years[0]}-${years[years.length - 1]}` : "N/A",
    categories: Array.from(new Set(NEWS_CORPUS.map((a) => a.category))),
  };
}
