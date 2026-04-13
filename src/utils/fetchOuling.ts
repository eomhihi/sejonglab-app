/**
 * 어울링 히어로 지표용 표시 문자열.
 *
 * 공공데이터포털 서비스키는 서버에서만 쓰는 것을 권장합니다.
 * 로컬/배포 `.env` 또는 `.env.local` 예시:
 *
 *   # 공공데이터포털(data.go.kr) 활용신청 후 발급 키 (인코딩된 키 그대로 넣어도 됨)
 *   NEXT_PUBLIC_DATA_GO_KR_API_KEY=""
 *   # 또는 서버 전용(클라이언트 번들에 노출되지 않음)
 *   DATA_GO_KR_API_KEY=""
 *
 * 누적 이용 건수 전용 JSON 엔드포인트가 있으면 우선 사용:
 *   OULING_STATS_API_URL="https://example.com/ouling-stats.json"
 * 응답 예: { "display": "1,523만+" } 또는 { "cumulativeTrips": 15230000 }
 *
 * 히어로 문구를 수동으로 고정하려면:
 *   OULING_HERO_DISPLAY="1,500만+"
 */

const FALLBACK_DISPLAY = "1,500만+";

const DEFAULT_DATA_GO_KR_ENDPOINT =
  "https://apis.data.go.kr/15091421/openapi/service/BikeStationInfoService/getStationList";

function getServiceKey(): string | undefined {
  const k =
    process.env.DATA_GO_KR_API_KEY?.trim() || process.env.NEXT_PUBLIC_DATA_GO_KR_API_KEY?.trim();
  return k || undefined;
}

/** 누적 이용 건수(건) → "1,500만+" 형식 */
export function formatTripsToManPlus(totalTrips: number): string {
  if (!Number.isFinite(totalTrips) || totalTrips <= 0) return FALLBACK_DISPLAY;
  const man = totalTrips / 10000;
  const rounded = man >= 100 ? Math.round(man) : Math.round(man * 10) / 10;
  return `${rounded.toLocaleString("ko-KR")}만+`;
}

type StatsJson = {
  display?: string;
  cumulativeTrips?: number;
};

function parseStatsJson(data: unknown): string | null {
  if (!data || typeof data !== "object") return null;
  const o = data as StatsJson;
  if (typeof o.display === "string" && o.display.trim()) return o.display.trim();
  if (typeof o.cumulativeTrips === "number") return formatTripsToManPlus(o.cumulativeTrips);
  return null;
}

function normalizeItemList(items: unknown): unknown[] {
  if (Array.isArray(items)) return items;
  if (items && typeof items === "object" && "item" in items) {
    const it = (items as { item: unknown }).item;
    if (Array.isArray(it)) return it;
    if (it != null) return [it];
  }
  return [];
}

/** data.go.kr JSON에서 누적/통계 필드를 최대한 탐색 (엔드포인트마다 상이) */
function parseDataGoKrBody(json: unknown): string | null {
  try {
    const r = json as {
      response?: {
        body?: {
          items?: unknown;
        };
      };
    };
    const body = r?.response?.body;
    if (!body?.items) return null;

    const list = normalizeItemList(body.items);

    for (const row of list) {
      if (!row || typeof row !== "object") continue;
      const rec = row as Record<string, unknown>;
      for (const key of [
        "cumulUseCnt",
        "cumulativeUseCnt",
        "totUseCnt",
        "totalRentCnt",
        "누적이용건수",
        "누적대여건수",
      ]) {
        const v = rec[key];
        if (typeof v === "number" && v > 0) return formatTripsToManPlus(v);
        if (typeof v === "string" && /^\d+$/.test(v)) return formatTripsToManPlus(Number(v));
      }
    }
  } catch {
    /* noop */
  }
  return null;
}

/**
 * 공공데이터포털(또는 OULING_STATS_API_URL)에서 어울링 관련 수치를 가져와
 * 히어로에 쓸 짧은 문자열로 반환. 실패 시 "1,500만+".
 * ISR: 24시간마다 재검증(data.go.kr 호출 빈도 제한).
 */
export async function getOulingData(): Promise<string> {
  const manual = process.env.OULING_HERO_DISPLAY?.trim();
  if (manual) return manual;

  const statsUrl = process.env.OULING_STATS_API_URL?.trim();
  if (statsUrl) {
    try {
      const res = await fetch(statsUrl, {
        next: { revalidate: 86400 },
        headers: { Accept: "application/json" },
      });
      if (res.ok) {
        const data = await res.json();
        const parsed = parseStatsJson(data);
        if (parsed) return parsed;
      }
    } catch {
      /* fall through */
    }
  }

  const serviceKey = getServiceKey();
  if (!serviceKey) return FALLBACK_DISPLAY;

  try {
    const endpoint = process.env.OULING_DATA_GO_KR_ENDPOINT?.trim() || DEFAULT_DATA_GO_KR_ENDPOINT;
    const url = new URL(endpoint);
    url.searchParams.set("serviceKey", serviceKey);
    url.searchParams.set("numOfRows", "200");
    url.searchParams.set("pageNo", "1");
    url.searchParams.set("_type", "json");

    const res = await fetch(url.toString(), {
      next: { revalidate: 86400 },
      headers: { Accept: "application/json" },
    });

    if (!res.ok) return FALLBACK_DISPLAY;

    const json = await res.json();
    const fromBody = parseDataGoKrBody(json);
    if (fromBody) return fromBody;
  } catch {
    return FALLBACK_DISPLAY;
  }

  return FALLBACK_DISPLAY;
}
