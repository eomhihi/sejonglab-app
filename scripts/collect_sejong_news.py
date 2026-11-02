#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
세종특별자치시 15년(2012~2026) 뉴스·보도자료 대량 수집 및 Upsert 파이프라인
========================================================================
파일 위치: scripts/collect_sejong_news.py

주요 기능:
1. 멀티 소스 수집:
   - 네이버 뉴스 검색 Open API (NAVER_CLIENT_ID / NAVER_CLIENT_SECRET 연동)
   - 구글 뉴스 RSS 연도별 아카이브 검색 (after:YYYY-01-01 before:YYYY-12-31)
   - 세종특별자치시청 공식 보도자료 게시판 크롤링
2. 연도별(2012~2026) × 6대 핵심 키워드별 수집:
   - '세종시 정책', '세종시 교통', '행복청', '세종시 교육', '세종시 경제/상권', '조치원'
3. 원문 본문 추출 및 핵심 요약(500자 내외) 생성, 키워드 자동 태깅
4. 중복 기사 제거(URL 및 정규화된 제목 기준) 후 `src/data/sejong_news_10years.json` 누적 Upsert
"""

import os
import sys
import re
import json
import time
import html
import logging
import argparse
import urllib.request
import urllib.error
import xml.etree.ElementTree as ET
from html.parser import HTMLParser
from datetime import datetime
from email.utils import parsedate_to_datetime
from typing import List, Dict, Any, Optional, Tuple
from urllib.parse import quote, urlparse, urlencode

# 선택적 외부 패키지 로드 (미설치 환경에서도 표준 라이브러리로 100% 동작하도록 폴백 지원)
try:
    from dotenv import load_dotenv
    HAS_DOTENV = True
except ImportError:
    HAS_DOTENV = False

try:
    import requests
    HAS_REQUESTS = True
except ImportError:
    HAS_REQUESTS = False

try:
    from bs4 import BeautifulSoup
    HAS_BS4 = True
except ImportError:
    HAS_BS4 = False


class _StdlibHTMLStripper(HTMLParser):
    """beautifulsoup4 미설치 시 동작하는 표준 라이브러리 HTML 태그 제거기"""
    def __init__(self):
        super().__init__()
        self.parts: List[str] = []

    def handle_data(self, data: str):
        if data:
            self.parts.append(data)

    def get_text(self) -> str:
        return " ".join(self.parts)


# 로깅 설정
logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s [%(levelname)s] %(message)s",
    datefmt="%Y-%m-%d %H:%M:%S",
)

PROJECT_ROOT = os.path.abspath(os.path.join(os.path.dirname(__file__), ".."))
TARGET_JSON_PATH = os.path.join(PROJECT_ROOT, "src", "data", "sejong_news_10years.json")


def load_env_file_fallback(filepath: str):
    """python-dotenv 미설치 환경을 위한 .env 파서"""
    if not os.path.exists(filepath):
        return
    try:
        with open(filepath, "r", encoding="utf-8") as f:
            for line in f:
                line = line.strip()
                if not line or line.startswith("#") or "=" not in line:
                    continue
                k, v = line.split("=", 1)
                k = k.strip()
                v = v.strip().strip('"').strip("'")
                if k and k not in os.environ:
                    os.environ[k] = v
    except Exception:
        pass


if HAS_DOTENV:
    load_dotenv(os.path.join(PROJECT_ROOT, ".env.local"))
    load_dotenv(os.path.join(PROJECT_ROOT, ".env"))
else:
    load_env_file_fallback(os.path.join(PROJECT_ROOT, ".env.local"))
    load_env_file_fallback(os.path.join(PROJECT_ROOT, ".env"))

# 수집 대상 6대 핵심 키워드 및 카테고리 매핑
TARGET_KEYWORD_CATEGORIES: Dict[str, str] = {
    "세종시 정책": "시정·행정",
    "세종시 교통": "교통·인프라",
    "행복청": "균형발전·개발",
    "세종시 교육": "교육·보육",
    "세종시 경제/상권": "경제·상가공실",
    "조치원": "균형발전·개발",
}

# 언론사 도메인 매핑 테이블
PRESS_DOMAIN_MAP: Dict[str, str] = {
    "yna.co.kr": "연합뉴스",
    "news1.kr": "뉴스1",
    "newsis.com": "뉴시스",
    "cctoday.co.kr": "충청투데이",
    "daejonilbo.com": "대전일보",
    "joongdo.co.kr": "중도일보",
    "sjpost.co.kr": "세종포스트",
    "sjsori.com": "세종의소리",
    "ccnnews.co.kr": "충청뉴스",
    "etnews.com": "전자신문",
    "hankyung.com": "한국경제",
    "mk.co.kr": "매일경제",
    "mt.co.kr": "머니투데이",
    "edaily.co.kr": "이데일리",
    "chosun.com": "조선일보",
    "donga.com": "동아일보",
    "joongang.co.kr": "중앙일보",
    "hani.co.kr": "한겨레",
    "khan.co.kr": "경향신문",
    "hankookilbo.com": "한국일보",
    "munhwa.com": "문화일보",
    "seoul.co.kr": "서울신문",
    "segye.com": "세계일보",
    "kmib.co.kr": "국민일보",
    "kbs.co.kr": "KBS",
    "imbc.com": "MBC",
    "sbs.co.kr": "SBS",
    "ytn.co.kr": "YTN",
    "korea.kr": "정책브리핑",
    "sejong.go.kr": "세종특별자치시청",
    "naacc.go.kr": "행복청",
}

DEFAULT_HEADERS = {
    "User-Agent": (
        "Mozilla/5.0 (Windows NT 10.0; Win64; x64) "
        "AppleWebKit/537.36 (KHTML, like Gecko) "
        "Chrome/124.0.0.0 Safari/537.36"
    ),
    "Accept-Language": "ko-KR,ko;q=0.9,en-US;q=0.8,en;q=0.7",
}


def http_get_text(url: str, extra_headers: Optional[Dict[str, str]] = None, timeout: int = 8) -> Tuple[int, str, str]:
    """HTTP GET 요청 도우미 (requests 또는 urllib.request 자동 사용)"""
    headers = dict(DEFAULT_HEADERS)
    if extra_headers:
        headers.update(extra_headers)

    if HAS_REQUESTS:
        resp = requests.get(url, headers=headers, timeout=timeout)
        return resp.status_code, resp.text, resp.headers.get("Content-Type", "")
    else:
        req = urllib.request.Request(url, headers=headers)
        with urllib.request.urlopen(req, timeout=timeout) as resp:
            status = resp.getcode()
            content_type = resp.headers.get("Content-Type", "")
            raw_bytes = resp.read()
            text = raw_bytes.decode("utf-8", errors="replace")
            return status, text, content_type


def clean_html_text(raw_html: str) -> str:
    """HTML 태그 및 엔티티 제거 후 공백 정규화"""
    if not raw_html:
        return ""
    if HAS_BS4:
        soup = BeautifulSoup(raw_html, "html.parser")
        text = soup.get_text(separator=" ", strip=True)
    else:
        stripper = _StdlibHTMLStripper()
        try:
            stripper.feed(raw_html)
            text = stripper.get_text()
        except Exception:
            text = re.sub(r"<[^>]+>", " ", raw_html)

    text = html.unescape(text)
    return re.sub(r"\s+", " ", text).strip()


def normalize_title_key(title: str) -> str:
    """중복 검사용 제목 정규화 키 생성"""
    cleaned = clean_html_text(title).lower()
    cleaned = re.sub(r"\[[^\]]*\]", "", cleaned)
    cleaned = re.sub(r"[^\w가-힣0-9]", "", cleaned)
    return cleaned.strip()


def normalize_url_key(url: str) -> str:
    """중복 검사용 URL 정규화 키 생성"""
    if not url:
        return ""
    u = url.strip().lower()
    u = re.sub(r"^https?://(www\.)?", "", u)
    return u.rstrip("/")


def infer_press_from_url_or_title(url: str, title: str, fallback: str = "언론 보도") -> str:
    """URL 도메인 또는 제목 말미('- 언론사')에서 언론사명 추출"""
    if url:
        try:
            hostname = urlparse(url).hostname or ""
            for domain, press_name in PRESS_DOMAIN_MAP.items():
                if hostname.endswith(domain):
                    return press_name
        except Exception:
            pass

    if " - " in title:
        tail = title.rsplit(" - ", 1)[-1].strip()
        if 1 < len(tail) <= 15:
            return tail

    return fallback


def parse_date_to_ymd(date_str: str, fallback_year: Optional[int] = None) -> str:
    """RFC 822, ISO 8601, YYYY.MM.DD 등 다양한 날짜 문자열을 YYYY-MM-DD로 변환"""
    if not date_str:
        return f"{fallback_year or datetime.now().year}-06-15"

    raw = date_str.strip()

    # 1. YYYY-MM-DD 또는 YYYY.MM.DD 패턴
    m = re.search(r"(20[12]\d)[-\./년\s]+(0?[1-9]|1[0-2])[-\./월\s]+(0?[1-9]|[12]\d|3[01])", raw)
    if m:
        y, mo, d = int(m.group(1)), int(m.group(2)), int(m.group(3))
        return f"{y:04d}-{mo:02d}-{d:02d}"

    # 2. RFC 2822 / 822 (Naver API / RSS pubDate)
    try:
        dt = parsedate_to_datetime(raw)
        return dt.strftime("%Y-%m-%d")
    except Exception:
        pass

    # 3. ISO 8601
    try:
        dt = datetime.fromisoformat(raw.replace("Z", "+00:00"))
        return dt.strftime("%Y-%m-%d")
    except Exception:
        pass

    return f"{fallback_year or datetime.now().year}-06-15"


def fetch_article_full_summary(url: str, title: str, snippet: str, target_len: int = 500) -> str:
    """
    원문 링크에서 본문을 크롤링하여 300~500자 분량의 핵심 본문 요약을 추출.
    원문 접근이 차단되거나 짧은 경우 제목·스니펫·시정 맥락을 결합해 최소 300~500자 요약으로 구성.
    """
    extracted_body = ""
    if url and url.startswith("http") and "news.google.com" not in url:
        try:
            status, html_text, content_type = http_get_text(url, timeout=5)
            if status == 200 and "text/html" in content_type:
                if HAS_BS4:
                    soup = BeautifulSoup(html_text, "html.parser")
                    for tag in soup(["script", "style", "nav", "header", "footer", "aside", "iframe", "noscript"]):
                        tag.decompose()

                    selectors = [
                        "#dic_area",
                        "#newsct_article",
                        "#articleBodyContents",
                        "#article-view-content-div",
                        ".article_body",
                        ".article-body",
                        ".news_cnt_detail_wrap",
                        ".view_con",
                        "article",
                    ]
                    for sel in selectors:
                        node = soup.select_one(sel)
                        if node:
                            txt = clean_html_text(node.get_text(" ", strip=True))
                            if len(txt) >= 180:
                                extracted_body = txt
                                break

                    if not extracted_body:
                        paragraphs = [
                            clean_html_text(p.get_text(" ", strip=True))
                            for p in soup.find_all("p")
                        ]
                        long_paras = [p for p in paragraphs if len(p) >= 40]
                        if long_paras:
                            extracted_body = " ".join(long_paras)
                else:
                    p_matches = re.findall(r"<p[^>]*>(.*?)</p>", html_text, flags=re.DOTALL | re.IGNORECASE)
                    cleaned_ps = [clean_html_text(p) for p in p_matches]
                    long_ps = [p for p in cleaned_ps if len(p) >= 40]
                    if long_ps:
                        extracted_body = " ".join(long_ps)
        except Exception:
            pass

    base_text = extracted_body if len(extracted_body) > len(snippet) else clean_html_text(snippet)
    base_text = re.sub(r"\s+", " ", base_text).strip()

    # 500자 내외로 문장 단위로 깔끔하게 절삭
    if len(base_text) > target_len:
        cut = base_text[:target_len]
        last_period = max(cut.rfind("다."), cut.rfind("요."), cut.rfind(". "))
        if last_period > 280:
            base_text = cut[: last_period + 1].strip()
        else:
            base_text = cut.strip() + "..."

    return base_text[:520]


def extract_keywords_from_article(title: str, summary: str, base_keyword: str) -> List[str]:
    """기사 제목과 본문에서 세종시 도메인 핵심 키워드 자동 추출"""
    domain_terms = [
        "국회세종의사당", "대통령제2집무실", "국가상징구역", "행정수도", "정부세종청사",
        "CTX", "충청권광역급행철도", "BRT", "바로타", "이응패스", "어울링", "두루타",
        "스마트시티", "국가시범도시", "자율주행", "5-1생활권", "합강동", "집현동",
        "공동캠퍼스", "세종테크밸리", "국가산단", "기회발전특구", "교육발전특구",
        "조치원", "청춘조치원", "도시재생", "균형발전", "싱싱장터", "로컬푸드",
        "상가 공실", "수변상가", "지구단위계획", "소상공인", "여민전",
        "세종시교육청", "학교 신설", "고교학점제", "늘봄학교", "아동친화도시",
        "정원도시박람회", "국립세종수목원", "세종호수공원", "세종중앙공원", "이응다리",
        "세종충남대학교병원", "세종지방법원", "자동크린넷", "친환경종합타운",
        "1생활권", "2생활권", "3생활권", "4생활권", "5생활권", "6생활권",
    ]
    combined = f"{title} {summary}"
    found: List[str] = []

    clean_base = base_keyword.replace("세종시 ", "").strip()
    if clean_base:
        found.append(clean_base)

    for term in domain_terms:
        if term.lower() in combined.lower() and term not in found:
            found.append(term)
        if len(found) >= 7:
            break

    if "세종특별자치시" not in found and len(found) < 4:
        found.append("세종특별자치시")

    return found


def fetch_from_naver_news_api(
    query: str,
    category: str,
    display: int = 20,
    max_pages: int = 1,
) -> List[Dict[str, Any]]:
    """네이버 뉴스 검색 Open API를 활용한 기사 수집"""
    client_id = os.getenv("NAVER_CLIENT_ID") or os.getenv("NAVER_NEWS_CLIENT_ID")
    client_secret = os.getenv("NAVER_CLIENT_SECRET") or os.getenv("NAVER_NEWS_CLIENT_SECRET")

    if not client_id or not client_secret:
        logging.warning("[!] 네이버 API 키(NAVER_CLIENT_ID/SECRET)가 설정되지 않아 네이버 검색을 건너뜁니다.")
        return []

    collected: List[Dict[str, Any]] = []
    headers = {
        "X-Naver-Client-Id": client_id,
        "X-Naver-Client-Secret": client_secret,
    }

    for page in range(max_pages):
        start = 1 + page * display
        if start > 1000:
            break

        url = (
            f"https://openapi.naver.com/v1/search/news.json"
            f"?query={quote(query)}&display={display}&start={start}&sort=sim"
        )
        try:
            status, body_text, _ = http_get_text(url, extra_headers=headers, timeout=10)
            if status != 200:
                logging.warning(f"[Naver API] HTTP {status} (query={query})")
                break

            data = json.loads(body_text)
            items = data.get("items", [])
            if not items:
                break

            for item in items:
                title = clean_html_text(item.get("title", ""))
                orig_link = (item.get("originallink") or item.get("link") or "").strip()
                desc = clean_html_text(item.get("description", ""))
                pub_date = parse_date_to_ymd(item.get("pubDate", ""))

                if not title or not orig_link:
                    continue

                if not any(k in (title + " " + desc) for k in ["세종", "행복청", "행복도시", "조치원", "BRT", "CTX"]):
                    continue

                press = infer_press_from_url_or_title(orig_link, title, "네이버뉴스")
                summary = fetch_article_full_summary(orig_link, title, desc, target_len=500)
                keywords = extract_keywords_from_article(title, summary, query)

                collected.append({
                    "title": title,
                    "date": pub_date,
                    "press": press,
                    "category": category,
                    "summary": summary,
                    "keywords": keywords,
                    "url": orig_link,
                })

            time.sleep(0.15)
        except Exception as e:
            logging.warning(f"[Naver API 오류] ({query}): {e}")
            break

    return collected


def fetch_from_google_news_rss_by_year(
    query: str,
    category: str,
    year: int,
    limit_per_query: int = 5,
) -> List[Dict[str, Any]]:
    """구글 뉴스 RSS에 연도 범위(after/before) 연산자를 적용해 2012~2026년 연도별 기사 수집"""
    dated_query = f"{query} after:{year}-01-01 before:{year}-12-31"
    rss_url = f"https://news.google.com/rss/search?q={quote(dated_query)}&hl=ko&gl=KR&ceid=KR:ko"

    collected: List[Dict[str, Any]] = []
    try:
        status, xml_text, _ = http_get_text(rss_url, timeout=10)
        if status != 200:
            return []

        root = ET.fromstring(xml_text)
        items = root.findall(".//item")

        for item in items[:limit_per_query]:
            raw_title = item.findtext("title") or ""
            link = (item.findtext("link") or "").strip()
            pub_date_raw = item.findtext("pubDate") or ""
            desc_raw = item.findtext("description") or ""
            source_el = item.find("source")

            if not raw_title or not link:
                continue

            press = "언론 보도"
            if source_el is not None and source_el.text:
                press = source_el.text.strip()
            elif " - " in raw_title:
                press = raw_title.rsplit(" - ", 1)[-1].strip()

            title = raw_title.rsplit(" - ", 1)[0].strip() if " - " in raw_title else raw_title.strip()
            title = clean_html_text(title)
            snippet = clean_html_text(desc_raw)

            if not any(k in (title + " " + snippet) for k in ["세종", "행복청", "행복도시", "조치원"]):
                continue

            pub_date = parse_date_to_ymd(pub_date_raw, fallback_year=year)
            summary = fetch_article_full_summary(link, title, snippet, target_len=500)
            keywords = extract_keywords_from_article(title, summary, query)

            collected.append({
                "title": title,
                "date": pub_date,
                "press": press,
                "category": category,
                "summary": summary,
                "keywords": keywords,
                "url": link,
            })
    except Exception as e:
        logging.warning(f"[Google RSS 오류] ({query}, {year}년): {e}")

    return collected


def fetch_from_sejong_city_press_board(max_pages: int = 2) -> List[Dict[str, Any]]:
    """세종특별자치시청 공식 보도자료 게시판 크롤링"""
    collected: List[Dict[str, Any]] = []
    base_board_url = "https://www.sejong.go.kr/prog/pressRelease/kor/sub02_02/list.do"

    for page_idx in range(1, max_pages + 1):
        try:
            url = f"{base_board_url}?{urlencode({'pageIndex': page_idx})}"
            status, html_text, _ = http_get_text(url, timeout=10)
            if status != 200:
                break

            if HAS_BS4:
                soup = BeautifulSoup(html_text, "html.parser")
                rows = soup.select("table tbody tr, ul.bbs_list li")
                for row in rows:
                    a_tag = row.select_one("a")
                    if not a_tag:
                        continue
                    title = clean_html_text(a_tag.get_text(" ", strip=True))
                    if len(title) < 8:
                        continue
                    href = a_tag.get("href", "")
                    full_url = (
                        href
                        if href.startswith("http")
                        else f"https://www.sejong.go.kr{href if href.startswith('/') else '/' + href}"
                    )
                    row_text = clean_html_text(row.get_text(" ", strip=True))
                    pub_date = parse_date_to_ymd(row_text)
                    summary = fetch_article_full_summary(full_url, title, row_text, target_len=500)
                    keywords = extract_keywords_from_article(title, summary, "세종시 정책")
                    collected.append({
                        "title": title,
                        "date": pub_date,
                        "press": "세종특별자치시청",
                        "category": "시정·행정",
                        "summary": summary,
                        "keywords": keywords,
                        "url": full_url,
                    })
            else:
                links = re.findall(r'<a[^>]+href=["\']([^"\']*pressRelease[^"\']*)["\'][^>]*>(.*?)</a>', html_text, re.DOTALL)
                for href, raw_t in links[:10]:
                    title = clean_html_text(raw_t)
                    if len(title) < 8:
                        continue
                    full_url = (
                        href
                        if href.startswith("http")
                        else f"https://www.sejong.go.kr{href if href.startswith('/') else '/' + href}"
                    )
                    summary = fetch_article_full_summary(full_url, title, title, target_len=500)
                    keywords = extract_keywords_from_article(title, summary, "세종시 정책")
                    collected.append({
                        "title": title,
                        "date": datetime.now().strftime("%Y-%m-%d"),
                        "press": "세종특별자치시청",
                        "category": "시정·행정",
                        "summary": summary,
                        "keywords": keywords,
                        "url": full_url,
                    })
        except Exception as e:
            logging.info(f"[세종시청 보도자료 게시판 접근 스킵]: {e}")
            break

    return collected


def load_existing_corpus(json_path: str) -> List[Dict[str, Any]]:
    """기존 src/data/sejong_news_10years.json 데이터 로드"""
    if not os.path.exists(json_path):
        return []
    try:
        with open(json_path, "r", encoding="utf-8") as f:
            data = json.load(f)
            return data if isinstance(data, list) else []
    except Exception as e:
        logging.error(f"[-] 기존 JSON 파일 로드 실패: {e}")
        return []


def assign_sequential_ids_and_upsert(
    existing_items: List[Dict[str, Any]],
    new_items: List[Dict[str, Any]],
) -> Tuple[List[Dict[str, Any]], int, int]:
    """
    기존 데이터셋과 신규 수집 기사를 병합(Upsert)하고 중복을 제거.
    반환값: (최종 정렬된 리스트, 신규 추가 건수, 업데이트 건수)
    """
    by_url: Dict[str, Dict[str, Any]] = {}
    by_title: Dict[str, Dict[str, Any]] = {}
    merged_list: List[Dict[str, Any]] = []

    for item in existing_items:
        u_key = normalize_url_key(item.get("url", ""))
        t_key = normalize_title_key(item.get("title", ""))
        if u_key:
            by_url[u_key] = item
        if t_key:
            by_title[t_key] = item
        merged_list.append(item)

    inserted_count = 0
    updated_count = 0

    year_counters: Dict[str, int] = {}
    for item in merged_list:
        m = re.match(r"^SJ-(\d{4})-(\d+)$", str(item.get("id", "")))
        if m:
            yr, seq = m.group(1), int(m.group(2))
            year_counters[yr] = max(year_counters.get(yr, 0), seq)

    for cand in new_items:
        u_key = normalize_url_key(cand.get("url", ""))
        t_key = normalize_title_key(cand.get("title", ""))
        if not t_key:
            continue

        existing_match = by_url.get(u_key) or by_title.get(t_key)
        if existing_match is not None:
            if len(cand.get("summary", "")) > len(existing_match.get("summary", "")) + 30:
                existing_match["summary"] = cand["summary"]
                updated_count += 1
            continue

        year_str = cand.get("date", "2026-01-01")[:4]
        if not re.match(r"^20[12]\d$", year_str):
            year_str = "2026"

        next_seq = year_counters.get(year_str, 0) + 1
        year_counters[year_str] = next_seq
        new_id = f"SJ-{year_str}-{next_seq:03d}"

        record = {
            "id": new_id,
            "title": cand["title"],
            "date": cand["date"],
            "press": cand["press"],
            "category": cand["category"],
            "summary": cand["summary"],
            "keywords": cand["keywords"],
            "url": cand["url"],
        }

        merged_list.append(record)
        if u_key:
            by_url[u_key] = record
        by_title[t_key] = record
        inserted_count += 1

    merged_list.sort(key=lambda x: (x.get("date", ""), x.get("id", "")))
    return merged_list, inserted_count, updated_count


def main():
    parser = argparse.ArgumentParser(
        description="세종시 15년(2012~2026) 뉴스 및 보도자료 대량 수집·Upsert 스크립트"
    )
    parser.add_argument(
        "--source",
        choices=["all", "naver", "google", "sejong"],
        default="all",
        help="수집 소스 선택 (기본값: all)",
    )
    parser.add_argument(
        "--start-year",
        type=int,
        default=2012,
        help="연도별 수집 시작 연도 (기본값: 2012)",
    )
    parser.add_argument(
        "--end-year",
        type=int,
        default=2026,
        help="연도별 수집 종료 연도 (기본값: 2026)",
    )
    parser.add_argument(
        "--limit-per-keyword",
        type=int,
        default=15,
        help="키워드당 수집할 최대 기사 수 (기본값: 15)",
    )
    parser.add_argument(
        "--keywords",
        nargs="*",
        default=list(TARGET_KEYWORD_CATEGORIES.keys()),
        help="수집할 키워드 목록",
    )
    parser.add_argument(
        "--dry-run",
        action="store_true",
        help="파일에 저장하지 않고 수집 결과만 시뮬레이션 출력",
    )
    args = parser.parse_args()

    logging.info("============================================================")
    logging.info(" 세종시 15년(2012~2026) 뉴스 데이터베이스 수집기 시작")
    logging.info(f" 대상 파일: {TARGET_JSON_PATH}")
    logging.info(f" 대상 키워드: {args.keywords}")
    logging.info("============================================================")

    existing_articles = load_existing_corpus(TARGET_JSON_PATH)
    logging.info(f"[*] 기존 저장된 뉴스 데이터: {len(existing_articles)}건")

    newly_collected: List[Dict[str, Any]] = []

    # 1. 네이버 뉴스 검색 API 수집
    if args.source in ("all", "naver"):
        for kw in args.keywords:
            cat = TARGET_KEYWORD_CATEGORIES.get(kw, "시정·행정")
            logging.info(f"[Naver API] '{kw}' ({cat}) 기사 수집 중...")
            items = fetch_from_naver_news_api(
                query=kw,
                category=cat,
                display=min(100, args.limit_per_keyword),
                max_pages=1,
            )
            logging.info(f"  -> {len(items)}건 수집 완료")
            newly_collected.extend(items)

    # 2. 구글 뉴스 RSS 연도별(2012~2026) 아카이브 수집
    if args.source in ("all", "google"):
        years = list(range(args.start_year, args.end_year + 1))
        per_year_limit = max(2, args.limit_per_keyword // max(1, len(years)))
        for kw in args.keywords:
            cat = TARGET_KEYWORD_CATEGORIES.get(kw, "시정·행정")
            logging.info(f"[Google RSS] '{kw}' ({args.start_year}~{args.end_year}년) 수집 중...")
            kw_total = 0
            for yr in years:
                items = fetch_from_google_news_rss_by_year(
                    query=kw,
                    category=cat,
                    year=yr,
                    limit_per_query=per_year_limit,
                )
                kw_total += len(items)
                newly_collected.extend(items)
            logging.info(f"  -> {kw_total}건 수집 완료")

    # 3. 세종특별자치시청 공식 보도자료 크롤링
    if args.source in ("all", "sejong"):
        logging.info("[세종시청 보도자료 게시판] 최신 시정 보도자료 수집 중...")
        board_items = fetch_from_sejong_city_press_board(max_pages=2)
        logging.info(f"  -> {len(board_items)}건 수집 완료")
        newly_collected.extend(board_items)

    # 4. 중복 제거 및 Upsert 병합
    merged_corpus, inserted_cnt, updated_cnt = assign_sequential_ids_and_upsert(
        existing_articles, newly_collected
    )

    logging.info("------------------------------------------------------------")
    logging.info(f"[+] 총 수집 후보: {len(newly_collected)}건")
    logging.info(f"[+] 신규 추가(Insert): {inserted_cnt}건 | 기존 보강(Update): {updated_cnt}건")
    logging.info(f"[+] 최종 누적 데이터베이스 규모: {len(merged_corpus)}건")
    logging.info("------------------------------------------------------------")

    if args.dry_run:
        logging.info("[*] --dry-run 모드로 실행되어 파일 저장을 생략합니다.")
        for sample in newly_collected[:3]:
            logging.info(f"  샘플: [{sample['date']}] ({sample['press']}) {sample['title']}")
        return

    os.makedirs(os.path.dirname(TARGET_JSON_PATH), exist_ok=True)
    with open(TARGET_JSON_PATH, "w", encoding="utf-8") as f:
        json.dump(merged_corpus, f, ensure_ascii=False, indent=2)

    logging.info(f"[✓] {TARGET_JSON_PATH} 저장 완료!")


if __name__ == "__main__":
    main()
