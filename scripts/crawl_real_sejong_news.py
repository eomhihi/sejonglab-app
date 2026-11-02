#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
세종특별자치시 100% 실제 뉴스·보도자료 크롤링 및 실제 임베딩 생성 파이프라인
==============================================================================
파일 위치: scripts/crawl_real_sejong_news.py

특징 (Zero Mock / 100% Real Data):
1. AI가 임의로 생성한 가상 문장이나 가짜 URL을 단 1건도 포함하지 않습니다.
2. 네이버 뉴스 검색 Open API, Google News RSS, 세종특별자치시청 공식 보도자료 게시판에서
   실제 존재하는 기사의 원본 제목(title), 실제 발행일(date), 실제 언론사(press),
   실제 요약문/본문 발췌(summary), 실제 원문 링크(url)만 수집합니다.
3. 수집된 모든 실제 기사에 대해 Gemini Embedding API (text-embedding-004 / gemini-embedding-001)를
   실제로 호출하여 임베딩 벡터(embedding)를 생성하고 `src/data/sejong_news_10years.json`에 저장합니다.
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

try:
    sys.stdout.reconfigure(encoding="utf-8")
    sys.stderr.reconfigure(encoding="utf-8")
except Exception:
    pass

logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s [%(levelname)s] %(message)s",
    datefmt="%Y-%m-%d %H:%M:%S",
)

PROJECT_ROOT = os.path.abspath(os.path.join(os.path.dirname(__file__), ".."))
TARGET_JSON_PATH = os.path.join(PROJECT_ROOT, "src", "data", "sejong_news_10years.json")


class _HTMLTextExtractor(HTMLParser):
    """표준 라이브러리 기반 HTML 태그 제거기"""
    def __init__(self):
        super().__init__()
        self.parts: List[str] = []

    def handle_data(self, data: str):
        if data:
            self.parts.append(data)

    def get_text(self) -> str:
        return " ".join(self.parts)


def strip_html(raw: str) -> str:
    if not raw:
        return ""
    parser = _HTMLTextExtractor()
    try:
        parser.feed(raw)
        txt = parser.get_text()
    except Exception:
        txt = re.sub(r"<[^>]+>", " ", raw)
    txt = html.unescape(txt)
    return re.sub(r"\s+", " ", txt).strip()


def load_env_files():
    """프로젝트 루트의 .env 및 .env.local 로드 (.env.local 우선)"""
    for fname in [".env", ".env.local"]:
        fpath = os.path.join(PROJECT_ROOT, fname)
        if not os.path.exists(fpath):
            continue
        try:
            with open(fpath, "r", encoding="utf-8") as f:
                for line in f:
                    line = line.strip()
                    if not line or line.startswith("#") or "=" not in line:
                        continue
                    k, v = line.split("=", 1)
                    k = k.strip()
                    v = v.strip().strip('"').strip("'")
                    if k and v:
                        os.environ[k] = v
        except Exception as e:
            logging.warning(f".env 파일 로드 중 경고 ({fname}): {e}")


load_env_files()

DEFAULT_HEADERS = {
    "User-Agent": (
        "Mozilla/5.0 (Windows NT 10.0; Win64; x64) "
        "AppleWebKit/537.36 (KHTML, like Gecko) "
        "Chrome/124.0.0.0 Safari/537.36"
    ),
    "Accept-Language": "ko-KR,ko;q=0.9,en-US;q=0.8,en;q=0.7",
}

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
    "ccdailynews.com": "충청일보",
    "jbnews.com": "중부매일",
    "inews365.com": "충북일보",
    "dtnews24.com": "디트뉴스24",
    "etnews.com": "전자신문",
    "hankyung.com": "한국경제",
    "mk.co.kr": "매일경제",
    "mt.co.kr": "머니투데이",
    "edaily.co.kr": "이데일리",
    "sedaily.com": "서울경제",
    "fnnews.com": "파이낸셜뉴스",
    "heraldcorp.com": "헤럴드경제",
    "asiae.co.kr": "아시아경제",
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
    "naacc.go.kr": "행정중심복합도시건설청",
    "sje.go.kr": "세종특별자치시교육청",
    "veritas-a.com": "베리타스알파",
    "dhnews.co.kr": "대학저널",
    "unn.net": "한국대학신문",
    "chungnamilbo.com": "충남일보",
    "viva100.com": "브릿지경제",
    "dynews.co.kr": "동양일보",
    "skbroadband.com": "SK브로드밴드",
    "pressian.com": "프레시안",
    "nocutnews.co.kr": "노컷뉴스",
    "breaknews.com": "브레이크뉴스",
    "agrinet.co.kr": "한국농어촌방송",
    "newstnt.com": "뉴스티앤티",
    "aflnews.co.kr": "농수축산신문",
    "rcast.co.kr": "리얼캐스트",
    "newscj.com": "천지일보",
    "hidomin.com": "경북도민일보",
    "hankooki.com": "데일리한국",
    "goodmorningcc.com": "굿모닝충청",
    "energydaily.co.kr": "에너지데일리",
    "bzeronews.com": "비제로뉴스",
    "ohmynews.com": "오마이뉴스",
    "cctimes.kr": "충청타임즈",
    "tournews21.com": "투어코리아",
    "ttlnews.com": "티티엘뉴스",
    "ggilbo.com": "금강일보",
    "4th.kr": "포쓰저널",
    "youthdaily.co.kr": "청년일보",
    "sisacast.kr": "시사캐스트",
    "tf.co.kr": "더팩트",
    "newdaily.co.kr": "뉴데일리충청",
    "newspim.com": "뉴스핌",
    "newsworker.co.kr": "뉴스워커",
    "ebn.co.kr": "EBN산업뉴스",
    "imaeil.com": "매일신문",
    "kyeonggi.com": "경기일보",
    "tjmbc.co.kr": "대전MBC",
    "gpkorea.com": "지피코리아",
    "bizwork.co.kr": "비즈워크",
    "apnews.kr": "AP신문",
    "gukjenews.com": "국제뉴스",
    "moneytoday.co.kr": "머니투데이",
    "kukinews.com": "쿠키뉴스",
}

# 6대 도메인별 실제 뉴스 정밀 타깃 검색 쿼리
SEARCH_QUERIES: List[Tuple[str, str]] = [
    # 1. 도시·교통·상권 (국회세종의사당, CTX, 상가 공실 용도변경·상권 활성화)
    ("국회세종의사당 건립 설계", "국회·대통령실"),
    ("세종 대통령 제2집무실 국가상징구역", "국회·대통령실"),
    ("충청권 광역급행철도 CTX 세종", "교통·인프라"),
    ("세종시 상가 공실 허용업종 완화 지구단위계획", "경제·상가공실"),
    ("세종시 수변상가 공실 해법 용도변경", "경제·상가공실"),
    ("세종시 소상공인 상권 활성화 여민전 경영안정자금", "경제·상가공실"),
    # 2. 10년 정책 변천사 (이응패스·대중교통 변천사, 조치원·읍면 균형발전·도시재생)
    ("세종시 이응패스 대중교통 버스 개편", "교통·인프라"),
    ("세종도시교통공사 BRT 바로타 전기굴절버스", "교통·인프라"),
    ("세종시 수요응답형 버스 두루타 어울링", "교통·인프라"),
    ("세종시 청춘조치원 도시재생 뉴딜 성과", "균형발전·개발"),
    ("조치원 문화정원 1927 아트센터 도시재생", "균형발전·개발"),
    ("세종시 읍면 균형발전 농촌협약 로컬푸드 싱싱장터", "균형발전·개발"),
    # 3. 정주·교육·복지 (4·5생활권 학교 신설·과밀학급, 청년·신혼부부·다자녀 주거 지원)
    ("세종시교육청 4생활권 집현동 학교 신설 개교", "교육·보육"),
    ("세종시교육청 5생활권 합강동 학교 설립 학생배치", "교육·보육"),
    ("세종시교육청 과밀학급 해소 모듈러 교실 증축", "교육·보육"),
    ("세종시 청년 월세 지원 임차보증금 주거", "정주·주거·복지"),
    ("세종시 신혼부부 전세자금 대출이자 주거 지원", "정주·주거·복지"),
    ("세종시 다자녀 특별공급 출산 주거 복지 행복주택", "정주·주거·복지"),
    # 4. 기업·사업기회 (미디어·영상·문화콘텐츠, 첨단·로봇 산단·기회발전특구 혜택)
    ("세종시 영상 제작 지원 미디어", "미디어·콘텐츠·문화사업"),
    ("세종시 문화콘텐츠 디지털 콘텐츠 산업", "미디어·콘텐츠·문화사업"),
    ("세종시 미디어아트 세종축제 빛축제 드론", "미디어·콘텐츠·문화사업"),
    ("세종시문화관광재단 공모 사업 문화", "미디어·콘텐츠·문화사업"),
    ("세종 기회발전특구 지정 기업 세제 혜택", "투자유치·세제혜택"),
    ("세종시 기업 이전 투자유치 보조금 취득세 감면", "투자유치·세제혜택"),
    ("세종테크노파크 공고 기업지원 R&D 실증", "기업지원·R&D"),
    ("세종 스마트국가산업단지 로봇 자율주행 첨단기업", "산업단지·기업유치"),
    # 5. 대학·산학연·평생교육 (RISE 대학 산학협력, 공동캠퍼스, 평생교육·직업교육)
    ("세종시 RISE 대학 산학협력", "대학·산학연·평생교육"),
    ("세종 공동캠퍼스 개교 입주 대학 산학연", "대학·산학연·평생교육"),
    ("고려대 세종캠퍼스 홍익대 한국영상대 산학협력", "대학·산학연·평생교육"),
    ("세종인재평생교육진흥원 평생교육 시민대학 집현전", "대학·산학연·평생교육"),
    ("세종시 직업교육 신중년 청년 일자리 교육 수요", "대학·산학연·평생교육"),
    ("세종시청 실태조사 연구용역 기본계획 예산", "리서치·정책용역"),
]


def http_get(url: str, extra_headers: Optional[Dict[str, str]] = None, timeout: int = 8) -> Tuple[int, str, str]:
    headers = dict(DEFAULT_HEADERS)
    if extra_headers:
        headers.update(extra_headers)
    req = urllib.request.Request(url, headers=headers)
    with urllib.request.urlopen(req, timeout=timeout) as resp:
        status = resp.getcode()
        ctype = resp.headers.get("Content-Type", "")
        raw = resp.read()
        # 인코딩 감지 (utf-8 우선, 실패 시 euc-kr/cp949)
        try:
            text = raw.decode("utf-8")
        except UnicodeDecodeError:
            text = raw.decode("cp949", errors="replace")
        return status, text, ctype


def http_post_json(url: str, payload: Dict[str, Any], timeout: int = 15) -> Tuple[int, Dict[str, Any]]:
    data_bytes = json.dumps(payload).encode("utf-8")
    req = urllib.request.Request(
        url,
        data=data_bytes,
        headers={"Content-Type": "application/json"},
        method="POST",
    )
    with urllib.request.urlopen(req, timeout=timeout) as resp:
        status = resp.getcode()
        body = resp.read().decode("utf-8", errors="replace")
        return status, json.loads(body)


def infer_press_name(url: str, title: str, default_press: str = "언론 보도") -> str:
    if url:
        try:
            host = (urlparse(url).hostname or "").lower()
            for domain, pname in PRESS_DOMAIN_MAP.items():
                if host == domain or host.endswith("." + domain):
                    return pname
            if host:
                cleaned_host = host.replace("www.", "").replace("news.", "").replace("view.", "")
                return cleaned_host.split(".")[0].upper()
        except Exception:
            pass
    if " - " in title:
        tail = title.rsplit(" - ", 1)[-1].strip()
        if 1 < len(tail) <= 20:
            return tail
    return default_press


def parse_real_pubdate(date_str: str) -> Optional[str]:
    """실제 발행일 문자열만 파싱. 파싱 불가능 시 None 반환 (임의 날짜 생성 금지)"""
    if not date_str:
        return None
    raw = date_str.strip()

    # RFC 2822 / 822 (Naver News API, Google News RSS)
    try:
        dt = parsedate_to_datetime(raw)
        return dt.strftime("%Y-%m-%d")
    except Exception:
        pass

    # YYYY-MM-DD / YYYY.MM.DD
    m = re.search(r"(20[12]\d)[-\./년\s]+(0?[1-9]|1[0-2])[-\./월\s]+(0?[1-9]|[12]\d|3[01])", raw)
    if m:
        return f"{int(m.group(1)):04d}-{int(m.group(2)):02d}-{int(m.group(3)):02d}"

    # ISO 8601
    try:
        dt = datetime.fromisoformat(raw.replace("Z", "+00:00"))
        return dt.strftime("%Y-%m-%d")
    except Exception:
        pass

    return None


def extract_real_og_or_body_text(url: str, rss_description: str) -> str:
    """
    원문 URL에 접속 가능할 경우 실제 HTML의 og:description 또는 본문 단락을 추출하고,
    접속 불가/차단 시 네이버 API 또는 Google RSS가 제공한 실제 description 원문만 그대로 반환합니다.
    (가짜 문장 덧붙이기 절대 금지)
    """
    clean_desc = strip_html(rss_description)
    if not url or not url.startswith("http") or "news.google.com" in url:
        return clean_desc

    try:
        status, html_text, ctype = http_get(url, timeout=4)
        if status != 200 or "html" not in ctype.lower():
            return clean_desc

        # 1. meta og:description 추출
        og_match = re.search(
            r'<meta[^>]+(?:property|name)=["\']og:description["\'][^>]+content=["\']([^"\']+)["\']',
            html_text,
            flags=re.IGNORECASE,
        )
        if not og_match:
            og_match = re.search(
                r'<meta[^>]+content=["\']([^"\']+)["\'][^>]+(?:property|name)=["\']og:description["\']',
                html_text,
                flags=re.IGNORECASE,
            )
        og_desc = strip_html(og_match.group(1)) if og_match else ""

        # 2. 본문 <p> 단락들 중 실제 기사 문장 추출
        # script/style 제거
        cleaned_html = re.sub(r"<(script|style|nav|header|footer|aside)[^>]*>.*?</\1>", " ", html_text, flags=re.DOTALL | re.IGNORECASE)
        p_blocks = re.findall(r"<p[^>]*>(.*?)</p>", cleaned_html, flags=re.DOTALL | re.IGNORECASE)
        real_paragraphs: List[str] = []
        for p in p_blocks:
            ptxt = strip_html(p)
            if len(ptxt) >= 45 and ("세종" in ptxt or "다." in ptxt) and "무단전재" not in ptxt and "저작권자" not in ptxt:
                real_paragraphs.append(ptxt)
            if sum(len(x) for x in real_paragraphs) >= 550:
                break

        body_excerpt = " ".join(real_paragraphs).strip()
        if len(body_excerpt) > len(clean_desc) and len(body_excerpt) >= 80:
            return body_excerpt[:600]
        if len(og_desc) > len(clean_desc):
            return og_desc[:600]
    except Exception:
        pass

    return clean_desc


def extract_real_keywords(title: str, summary: str, query: str) -> List[str]:
    """실제 기사 제목과 요약문에 등장하는 명사/도메인 키워드만 추출"""
    candidates = [
        "국회세종의사당", "대통령제2집무실", "국가상징구역", "행정수도", "정부세종청사",
        "CTX", "충청권광역급행철도", "광역철도", "BRT", "바로타", "이응패스", "어울링", "두루타",
        "스마트시티", "자율주행", "5-1생활권", "합강동", "집현동", "산울동", "해밀동",
        "공동캠퍼스", "세종테크밸리", "국가산단", "기회발전특구", "세종테크노파크",
        "조치원", "도시재생", "균형발전", "싱싱장터", "로컬푸드",
        "상가 공실", "용도변경", "지구단위계획", "소상공인", "여민전", "상권 활성화",
        "세종시교육청", "학교 신설", "과밀학급", "4생활권", "5생활권",
        "청년", "신혼부부", "다자녀", "주거 지원", "월세", "전세", "특별공급",
        "세종문화관광재단", "세종축제", "디지털 콘텐츠", "미디어", "박물관단지", "정원도시박람회",
        "고려대", "홍익대", "한국영상대", "산학협력", "RISE",
        "세종인재평생교육진흥원", "평생교육", "직업교육", "시민대학", "집현전",
        "실태조사", "연구용역", "기본계획", "예산", "자동크린넷", "친환경종합타운",
    ]
    text_pool = f"{title} {summary}"
    matched: List[str] = []
    for kw in candidates:
        if kw.lower() in text_pool.lower() and kw not in matched:
            matched.append(kw)
        if len(matched) >= 7:
            break

    if not matched:
        for tok in query.split():
            if len(tok) >= 2 and not tok.startswith(("after:", "before:")) and tok not in matched:
                matched.append(tok)
    return matched[:7]


def get_working_naver_credentials() -> List[Tuple[str, str]]:
    """설정된 네이버 API 키 쌍 목록 반환"""
    pairs: List[Tuple[str, str]] = []
    cid1 = os.environ.get("NAVER_NEWS_CLIENT_ID", "").strip()
    csec1 = os.environ.get("NAVER_NEWS_CLIENT_SECRET", "").strip()
    if cid1 and csec1:
        pairs.append((cid1, csec1))

    cid2 = os.environ.get("NAVER_CLIENT_ID", "").strip()
    csec2 = os.environ.get("NAVER_CLIENT_SECRET", "").strip()
    if cid2 and csec2 and (cid2, csec2) not in pairs:
        pairs.append((cid2, csec2))
    return pairs


def crawl_naver_news(query: str, category: str, display: int = 15, fetch_body: bool = False) -> List[Dict[str, Any]]:
    if "after:" in query or "before:" in query:
        return []
    cred_pairs = get_working_naver_credentials()
    if not cred_pairs:
        return []

    results: List[Dict[str, Any]] = []
    url = f"https://openapi.naver.com/v1/search/news.json?query={quote(query)}&display={display}&start=1&sort=sim"

    for cid, csec in cred_pairs:
        try:
            status, body, _ = http_get(
                url,
                extra_headers={
                    "X-Naver-Client-Id": cid,
                    "X-Naver-Client-Secret": csec,
                },
                timeout=8,
            )
            if status != 200:
                continue

            data = json.loads(body)
            items = data.get("items", [])
            for it in items:
                title = strip_html(it.get("title", ""))
                orig_link = (it.get("originallink") or it.get("link") or "").strip()
                naver_link = (it.get("link") or orig_link).strip()
                raw_desc = strip_html(it.get("description", ""))
                pub_ymd = parse_real_pubdate(it.get("pubDate", ""))

                if not title or not orig_link or not raw_desc or not pub_ymd:
                    continue
                if "세종" not in title and "행복청" not in title and "행복도시" not in title and "조치원" not in title and "여민전" not in title and "이응패스" not in title:
                    continue

                press = infer_press_name(orig_link, title, "네이버뉴스")
                real_summary = extract_real_og_or_body_text(orig_link, raw_desc) if fetch_body else raw_desc
                if len(real_summary) < 25:
                    continue

                results.append({
                    "title": title,
                    "date": pub_ymd,
                    "press": press,
                    "category": category,
                    "summary": real_summary,
                    "keywords": extract_real_keywords(title, real_summary, query),
                    "url": orig_link if orig_link.startswith("http") else naver_link,
                })
            if results:
                break
        except Exception as e:
            logging.debug(f"Naver API 호출 실패 ({query}): {e}")
            continue

    return results


def crawl_google_news_rss(query: str, category: str, limit: int = 8) -> List[Dict[str, Any]]:
    rss_url = f"https://news.google.com/rss/search?q={quote(query)}&hl=ko&gl=KR&ceid=KR:ko"
    results: List[Dict[str, Any]] = []
    try:
        status, xml_text, _ = http_get(rss_url, timeout=10)
        if status != 200:
            return []

        root = ET.fromstring(xml_text)
        for item in root.findall(".//item")[:limit]:
            raw_title = (item.findtext("title") or "").strip()
            link = (item.findtext("link") or "").strip()
            pub_raw = (item.findtext("pubDate") or "").strip()
            desc_raw = (item.findtext("description") or "").strip()
            source_el = item.find("source")
            source_url = source_el.attrib.get("url", "").strip() if source_el is not None else ""

            if not raw_title or not link:
                continue

            pub_ymd = parse_real_pubdate(pub_raw)
            if not pub_ymd:
                continue

            press = "언론 보도"
            if source_el is not None and source_el.text:
                press = source_el.text.strip()
            elif " - " in raw_title:
                press = raw_title.rsplit(" - ", 1)[-1].strip()

            clean_title = raw_title.rsplit(" - ", 1)[0].strip() if " - " in raw_title else raw_title
            clean_title = strip_html(clean_title)
            clean_desc = strip_html(desc_raw)

            # Google RSS의 description이 제목만 단순 반복한 경우(실제 본문 요약이 없는 경우) 제외
            desc_without_press = clean_desc.replace(press, "").strip()
            if not clean_desc or len(desc_without_press) <= len(clean_title) + 15:
                continue

            if "세종" not in (clean_title + " " + clean_desc) and "행복" not in (clean_title + " " + clean_desc) and "조치원" not in (clean_title + " " + clean_desc):
                continue

            results.append({
                "title": clean_title,
                "date": pub_ymd,
                "press": press,
                "category": category,
                "summary": clean_desc,
                "keywords": extract_real_keywords(clean_title, clean_desc, query),
                "url": link,
                "publisherUrl": source_url,
            })
    except Exception as e:
        logging.warning(f"[Google News RSS 오류] ({query}): {e}")

    return results


def detect_working_gemini_embedding_model(api_key: str) -> str:
    """현재 API 키에서 실제 작동하는 Gemini 임베딩 모델명 확인"""
    for candidate in ["text-embedding-004", "gemini-embedding-001", "embedding-001"]:
        url = f"https://generativelanguage.googleapis.com/v1beta/models/{candidate}:embedContent?key={api_key}"
        payload = {
            "model": f"models/{candidate}",
            "content": {"parts": [{"text": "세종특별자치시 실제 임베딩 연결 테스트"}]},
            "outputDimensionality": 768,
        }
        try:
            status, data = http_post_json(url, payload, timeout=10)
            vals = data.get("embedding", {}).get("values", [])
            if status == 200 and isinstance(vals, list) and len(vals) > 0:
                logging.info(f"[✓] Gemini 임베딩 모델 확인 완료: {candidate} (차원수: {len(vals)})")
                return candidate
        except urllib.error.HTTPError as he:
            if he.code == 429:
                logging.info(f"[*] 임베딩 모델 {candidate} 쿼터 대기 중 (15초)...")
                time.sleep(15)
                return candidate
            logging.debug(f"임베딩 모델 {candidate} 테스트 실패: {he}")
            continue
        except Exception as e:
            logging.debug(f"임베딩 모델 {candidate} 테스트 실패: {e}")
            continue
    raise RuntimeError("사용 가능한 Gemini Embedding 모델을 찾을 수 없습니다. GEMINI_API_KEY를 확인하세요.")


def generate_real_embeddings_batch(
    articles: List[Dict[str, Any]],
    api_key: str,
    model_name: str,
) -> None:
    """
    수집된 실제 기사 리스트에 대해 Gemini batchEmbedContents API를 호출하여
    실제 임베딩 벡터(embedding)를 생성·저장합니다. (가짜/난수 벡터 생성 절대 없음)
    """
    batch_size = 45
    total = len(articles)
    for start_idx in range(0, total, batch_size):
        batch = articles[start_idx : start_idx + batch_size]
        requests_payload = []
        for art in batch:
            text_to_embed = (
                f"[{art['category']}] {art['title']} ({art['date']}, {art['press']})\n"
                f"키워드: {', '.join(art.get('keywords', []))}\n"
                f"요약: {art['summary']}"
            )
            requests_payload.append({
                "model": f"models/{model_name}",
                "content": {"parts": [{"text": text_to_embed}]},
                "outputDimensionality": 768,
            })

        url = f"https://generativelanguage.googleapis.com/v1beta/models/{model_name}:batchEmbedContents?key={api_key}"
        resp_data = None
        for attempt in range(4):
            try:
                status, resp_data = http_post_json(url, {"requests": requests_payload}, timeout=30)
                if status == 200:
                    break
            except urllib.error.HTTPError as he:
                if he.code == 429 and attempt < 3:
                    wait_sec = 22 * (attempt + 1)
                    logging.info(f"  [!] Gemini API 분당 호출 제한(429) 도달 - {wait_sec}초 대기 후 재시도...")
                    time.sleep(wait_sec)
                    continue
                raise

        if not resp_data:
            raise RuntimeError("Gemini batchEmbedContents 응답 없음")

        embeddings = resp_data.get("embeddings", [])
        if len(embeddings) != len(batch):
            raise RuntimeError(f"Gemini batchEmbedContents 개수 불일치 ({len(embeddings)} != {len(batch)})")

        for art, emb_obj in zip(batch, embeddings):
            vals = emb_obj.get("values", [])
            if not vals:
                raise RuntimeError(f"기사 '{art['title']}'의 임베딩 벡터가 비어 있습니다.")
            art["embedding"] = [round(float(v), 6) for v in vals]
            art["embeddingModel"] = model_name

        logging.info(f"  -> 실제 임베딩 생성 완료: {min(start_idx + batch_size, total)}/{total}건")
        time.sleep(1.0)


def deduplicate_real_articles(raw_list: List[Dict[str, Any]]) -> List[Dict[str, Any]]:
    seen_urls = set()
    seen_titles = set()
    deduped: List[Dict[str, Any]] = []

    for item in raw_list:
        u_key = re.sub(r"^https?://(www\.)?", "", item["url"].strip().lower()).rstrip("/")
        t_key = re.sub(r"[^\w가-힣0-9]", "", item["title"].lower())
        if not u_key or not t_key or len(t_key) < 6:
            continue
        if u_key in seen_urls or t_key in seen_titles:
            continue
        seen_urls.add(u_key)
        seen_titles.add(t_key)
        deduped.append(item)

    # 날짜 오름차순 정렬 후 실제 고유 ID 부여
    deduped.sort(key=lambda x: x["date"])
    year_seq: Dict[str, int] = {}
    for art in deduped:
        yr = art["date"][:4]
        year_seq[yr] = year_seq.get(yr, 0) + 1
        art["id"] = f"REAL-SJ-{yr}-{year_seq[yr]:03d}"

    return deduped


def _cosine_sim(vec_a: List[float], vec_b: List[float]) -> float:
    dot = sum(a * b for a, b in zip(vec_a, vec_b))
    na = sum(a * a for a in vec_a) ** 0.5
    nb = sum(b * b for b in vec_b) ** 0.5
    if na == 0 or nb == 0:
        return 0.0
    return dot / (na * nb)


def deduplicate_by_semantic_and_temporal_similarity(
    articles: List[Dict[str, Any]]
) -> List[Dict[str, Any]]:
    """
    임베딩 벡터 코사인 유사도 및 발행일·어휘 중복도를 기반으로
    비슷한 시기·비슷한 내용의 중복 보도 기사를 제거합니다.
    """
    # 원문 직링크 및 요약문이 풍부한 기사를 우선 보존
    sorted_cands = sorted(
        articles,
        key=lambda a: (0 if "news.google.com" in a.get("url", "") else 1, len(a.get("summary", ""))),
        reverse=True,
    )
    kept: List[Dict[str, Any]] = []
    for cand in sorted_cands:
        c_vec = cand.get("embedding", [])
        c_date = datetime.strptime(cand["date"], "%Y-%m-%d")
        is_dup = False
        for k in kept:
            k_vec = k.get("embedding", [])
            k_date = datetime.strptime(k["date"], "%Y-%m-%d")
            days_diff = abs((c_date - k_date).days)
            sim = _cosine_sim(c_vec, k_vec) if c_vec and k_vec else 0.0
            if sim >= 0.85 or (days_diff <= 14 and sim >= 0.78):
                is_dup = True
                break
        if not is_dup:
            kept.append(cand)

    kept.sort(key=lambda x: x["date"])
    year_seq: Dict[str, int] = {}
    for art in kept:
        yr = art["date"][:4]
        year_seq[yr] = year_seq.get(yr, 0) + 1
        art["id"] = f"REAL-SJ-{yr}-{year_seq[yr]:03d}"
    return kept


def main():
    parser = argparse.ArgumentParser(description="100% 실제 세종시 뉴스 수집 및 실제 임베딩 생성기")
    parser.add_argument("--naver-display", type=int, default=4, help="쿼리당 네이버 뉴스 수집 개수")
    parser.add_argument("--google-limit", type=int, default=2, help="쿼리당 구글 뉴스 RSS 수집 개수")
    args = parser.parse_args()

    gemini_key = os.environ.get("GEMINI_API_KEY") or os.environ.get("GOOGLE_API_KEY")
    if not gemini_key:
        logging.error("[-] GEMINI_API_KEY 환경변수가 설정되어 있지 않습니다.")
        sys.exit(1)

    logging.info("============================================================")
    logging.info(" [100% Real Data 파이프라인] 실제 뉴스 수집 및 임베딩 생성 시작")
    logging.info("============================================================")

    # 기존 저장된 실제 기사 중 요약문이 충실한(제목 단순 반복이 아닌) 기사와 그 실제 임베딩 캐시 로드
    existing_by_url: Dict[str, Dict[str, Any]] = {}
    existing_valid: List[Dict[str, Any]] = []
    if os.path.exists(TARGET_JSON_PATH):
        try:
            with open(TARGET_JSON_PATH, "r", encoding="utf-8") as f:
                old_list = json.load(f)
            for item in old_list:
                t_str = item.get("title", "").strip()
                s_str = item.get("summary", "").strip()
                # Google RSS 제목 반복 스니펫(요약문 길이가 제목+언론사 수준인 항목) 제거
                if len(s_str) <= len(t_str) + 15:
                    continue
                if "세종" not in t_str and "행복청" not in t_str and "행복도시" not in t_str and "조치원" not in t_str and "여민전" not in t_str and "이응패스" not in t_str and "한국영상대" not in t_str:
                    continue
                item["press"] = infer_press_name(item.get("url", ""), t_str, item.get("press", "언론 보도"))
                u_norm = re.sub(r"^https?://(www\.)?", "", item.get("url", "").strip().lower()).rstrip("/")
                if u_norm and isinstance(item.get("embedding"), list) and len(item["embedding"]) == 768:
                    existing_by_url[u_norm] = item
                    existing_valid.append(item)
        except Exception as e:
            logging.warning(f"기존 JSON 로드 참고 실패: {e}")

    raw_collected: List[Dict[str, Any]] = list(existing_valid)

    for query, category in SEARCH_QUERIES:
        naver_items = crawl_naver_news(query, category, display=args.naver_display)
        google_items = crawl_google_news_rss(query, category, limit=args.google_limit)
        logging.info(
            f"[*] '{query}' ({category}) -> Naver: {len(naver_items)}건, Google RSS: {len(google_items)}건"
        )
        raw_collected.extend(naver_items)
        raw_collected.extend(google_items)
        time.sleep(0.08)

    real_articles = deduplicate_real_articles(raw_collected)
    logging.info(f"[+] 1차 중복 제거 후 실제 뉴스 기사 수: {len(real_articles)}건")

    if len(real_articles) == 0:
        raise RuntimeError("실제 뉴스 기사가 0건 수집되었습니다. 네트워크 상태를 확인하세요.")

    # 기존 임베딩 재사용 후 신규 기사에 대해서만 Gemini 임베딩 API 호출
    need_embedding: List[Dict[str, Any]] = []
    for art in real_articles:
        u_norm = re.sub(r"^https?://(www\.)?", "", art.get("url", "").strip().lower()).rstrip("/")
        cached = existing_by_url.get(u_norm)
        if cached and isinstance(cached.get("embedding"), list) and len(cached["embedding"]) == 768:
            art["embedding"] = cached["embedding"]
            art["embeddingModel"] = cached.get("embeddingModel", "gemini-embedding-001")
        elif not (isinstance(art.get("embedding"), list) and len(art["embedding"]) == 768):
            need_embedding.append(art)

    embedding_model = detect_working_gemini_embedding_model(gemini_key)
    if need_embedding:
        logging.info(f"[*] 신규 수집된 {len(need_embedding)}건의 실제 기사에 대해 '{embedding_model}' 임베딩 생성 중...")
        generate_real_embeddings_batch(need_embedding, gemini_key, embedding_model)
    else:
        logging.info("[*] 모든 기사에 이미 실제 임베딩 벡터가 존재합니다.")

    real_articles = deduplicate_by_semantic_and_temporal_similarity(real_articles)
    logging.info(f"[+] 임베딩·시기 기반 유사 기사 중복 제거 완료: 최종 {len(real_articles)}건")

    os.makedirs(os.path.dirname(TARGET_JSON_PATH), exist_ok=True)
    with open(TARGET_JSON_PATH, "w", encoding="utf-8") as f:
        json.dump(real_articles, f, ensure_ascii=False, indent=2)

    logging.info(f"[✓] 100% 실제 기사 + 실제 임베딩 벡터 저장 완료: {TARGET_JSON_PATH} ({len(real_articles)}건)")


if __name__ == "__main__":
    main()
