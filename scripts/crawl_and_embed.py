#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
세종시 뉴스 수집 및 Gemini text-embedding-004 벡터 DB 저장 파이프라인
-------------------------------------------------------------
1. BeautifulSoup 기반 세종시 관련 뉴스 / 보도자료 수집 (제목, 날짜, 요약, 원문 URL, 언론사)
2. 본문/요약 텍스트 500자 단위 청크(Chunk) 분할
3. Gemini API (text-embedding-004, 768차원) 임베딩 벡터 생성
4. Supabase pgvector (`sejong_news_embeddings` 테이블) 또는 로컬 벡터 JSON DB Upsert
"""

import os
import sys
import json
import time
import re
import argparse
import logging
import hashlib
import math
from dataclasses import dataclass, asdict
from typing import List, Optional
from urllib.parse import quote

from dotenv import load_dotenv

try:
    import requests
    from requests.exceptions import RequestException, Timeout
except ImportError:
    print("[-] requests 라이브러리가 필요합니다: pip install requests")
    sys.exit(1)

try:
    from bs4 import BeautifulSoup
    HAS_BS4 = True
except ImportError:
    HAS_BS4 = False
    from html.parser import HTMLParser

    class SimpleHTMLStripper(HTMLParser):
        def __init__(self):
            super().__init__()
            self.reset()
            self.fed = []
        def handle_data(self, d):
            self.fed.append(d)
        def get_data(self):
            return "".join(self.fed)

# 로깅 설정
logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s [%(levelname)s] %(message)s",
    datefmt="%Y-%m-%d %H:%M:%S"
)

SUPABASE_SCHEMA_SQL = """
-- Supabase (pgvector) 테이블 생성 및 인덱스 설정 SQL 생략 (기존과 동일)
"""

# .env 파일 로드
load_dotenv()

# [AI-101] 환경변수에서 URL 가져오기 (하드코딩 제거)
API_BASE_URL = os.getenv("API_BASE_URL", "https://default.news.url.com")
TARGET_NEWS_URL = os.getenv("TARGET_NEWS_URL", f"{API_BASE_URL}/article1")

# [ARC-208] DTO 역할을 하는 Dataclass 정의 (Dict[str, Any] 대체)
@dataclass
class NewsArticle:
    title: str
    source: str
    pub_date: str
    url: str
    summary: str

@dataclass
class NewsChunkRecord:
    title: str
    source: str
    url: str
    pub_date: str
    chunk_index: int
    content: str
    embedding: List[float]


def load_archive_news_dataset() -> List[NewsArticle]:
    """src/data/sejong_news_10years.json에 구축된 15년 치 뉴스 데이터셋 로드"""
    dataset_path = os.path.join(os.path.dirname(os.path.dirname(__file__)), "src", "data", "sejong_news_10years.json")
    if not os.path.exists(dataset_path):
        return []
    with open(dataset_path, "r", encoding="utf-8") as f:
        raw_items = json.load(f)
    return [
        NewsArticle(
            title=item.get("title", ""),
            source=item.get("press", "세종시 보도자료"),
            pub_date=item.get("date", ""),
            url=item.get("url", ""),
            summary=item.get("summary", "")
        )
        for item in raw_items
    ]

def scrape_sejong_news(query: str = "세종시", max_pages: int = 2, limit: int = 10) -> List[NewsArticle]:
    """BeautifulSoup을 활용하여 세종시 뉴스/보도자료 수집"""
    logging.info(f"[*] 뉴스 수집 시작 - 검색어: '{query}', 대상 페이지 수: {max_pages}")
    articles: List[NewsArticle] = []
    
    headers = {
        "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36"
    }

    try:
        encoded_query = quote(query)
        rss_url = f"https://news.google.com/rss/search?q={encoded_query}&hl=ko&gl=KR&ceid=KR:ko"
        
        resp = requests.get(rss_url, headers=headers, timeout=10)
        resp.raise_for_status()

        if HAS_BS4:
            soup = BeautifulSoup(resp.content, "xml")
            items = soup.find_all("item")
            
            for item in items[:limit]:
                title = item.title.text if item.title else "제목 없음"
                link = item.link.text if item.link else ""
                pub_date = item.pubDate.text if item.pubDate else ""
                description = item.description.text if item.description else ""
                clean_summary = BeautifulSoup(description, "html.parser").get_text(strip=True)
                
                source = "언론 보도"
                if item.source:
                    source = item.source.text
                elif "-" in title:
                    source = title.split("-")[-1].strip()

                articles.append(NewsArticle(
                    title=title,
                    source=source,
                    pub_date=pub_date,
                    url=link,
                    summary=clean_summary if len(clean_summary) > 20 else f"{title} 관련 정책 보도 내용입니다."
                ))
        else:
            item_blocks = re.findall(r'<item>(.*?)</item>', resp.text, re.DOTALL)
            for block in item_blocks[:limit]:
                title_m = re.search(r'<title>(.*?)</title>', block, re.DOTALL)
                link_m = re.search(r'<link>(.*?)</link>', block, re.DOTALL)
                date_m = re.search(r'<pubDate>(.*?)</pubDate>', block, re.DOTALL)
                desc_m = re.search(r'<description>(.*?)</description>', block, re.DOTALL)
                
                title = title_m.group(1) if title_m else "제목 없음"
                link = link_m.group(1) if link_m else ""
                pub_date = date_m.group(1) if date_m else ""
                desc = desc_m.group(1) if desc_m else ""
                clean_summary = re.sub(r'<[^>]+>', '', desc).strip()
                
                articles.append(NewsArticle(
                    title=re.sub(r'<[^>]+>', '', title).strip(),
                    source="언론 보도",
                    pub_date=pub_date,
                    url=link,
                    summary=clean_summary if len(clean_summary) > 20 else "관련 보도 내용입니다."
                ))
    # [IL-304] 구체적 예외 처리 적용
    except (RequestException, Timeout) as e:
        # 1. 에러의 근원(스택 트레이스)을 포함하여 심각한 오류로 기록 (exc_info=True)
        logging.error(f"[-] 네트워크/요청 오류가 발생하여 크롤링을 중단합니다: {e}", exc_info=True)
        # 2. 예외를 조용히 덮지 않고(은폐 방지) 상위로 명시적으로 에러를 다시 던집니다.
        raise RuntimeError(f"RSS 피드 네트워크 접근 실패: {e}") from e

    except (ValueError, TypeError, AttributeError, re.error) as e:
        logging.error(f"[-] 뉴스 데이터 파싱 중 오류 발생: {e}", exc_info=True)
        raise RuntimeError(f"크롤링 데이터 형식 오류: {e}") from e

    if len(articles) < 2:
        logging.info("[*] RSS 수집 결과 보완을 위해 sejong_news_10years.json 데이터셋을 병합합니다.")
        articles.extend(load_archive_news_dataset())

    logging.info(f"[+] 총 {len(articles)}건의 뉴스 기사 수집 완료")
    return articles

def chunk_text(text: str, chunk_size: int = 500, overlap: int = 50) -> List[str]:
    text = text.strip()
    if not text: return []
    if len(text) <= chunk_size: return [text]

    chunks = []
    start = 0
    while start < len(text):
        chunks.append(text[start:start + chunk_size])
        start += (chunk_size - overlap)
    return chunks

def get_gemini_embedding(text: str, api_key: Optional[str] = None, model: str = "text-embedding-004") -> List[float]:
    if not api_key:
        api_key = os.getenv("GEMINI_API_KEY") or os.getenv("GOOGLE_API_KEY")

    if api_key:
        url = f"https://generativelanguage.googleapis.com/v1beta/models/{model}:embedContent?key={api_key}"
        headers = {"Content-Type": "application/json"}
        payload = {"model": f"models/{model}", "content": {"parts": [{"text": text}]}}
        
        try:
            resp = requests.post(url, headers=headers, json=payload, timeout=10)
            resp.raise_for_status()
            data = resp.json()
            values = data.get("embedding", {}).get("values", [])
            if values:
                return values
        # [IL-304] 구체적 예외 처리 적용
        except RequestException as e:
            logging.warning(f"[!] Gemini API 네트워크 오류: {e}")
        except json.JSONDecodeError:
            logging.warning("[!] Gemini API 응답 JSON 파싱 실패")

    raise RuntimeError(
        "Gemini 임베딩 API 호출에 실패했습니다. GEMINI_API_KEY 및 네트워크 상태를 확인하세요."
    )

def upsert_to_supabase(records: List[NewsChunkRecord], supabase_url: str, supabase_key: str) -> bool:
    endpoint = f"{supabase_url.rstrip('/')}/rest/v1/sejong_news_embeddings"
    headers = {
        "apikey": supabase_key,
        "Authorization": f"Bearer {supabase_key}",
        "Content-Type": "application/json",
        "Prefer": "resolution=merge-duplicates"
    }

    try:
        # Dataclass를 Dict로 변환하여 전송
        dict_records = [asdict(record) for record in records]
        resp = requests.post(endpoint, headers=headers, json=dict_records, timeout=15)
        resp.raise_for_status()
        logging.info(f"[+] Supabase에 {len(records)}건 Upsert 성공!")
        return True
    # [IL-304] 구체적 예외 처리 적용
    except RequestException as e:
        logging.error(f"[-] Supabase API 요청/네트워크 오류: {e}")
        return False

def save_to_local_db(records: List[NewsChunkRecord], file_path: str = "scripts/local_news_vectors.json"):
    os.makedirs(os.path.dirname(file_path), exist_ok=True)
    dict_records = [asdict(record) for record in records]
    with open(file_path, "w", encoding="utf-8") as f:
        json.dump(dict_records, f, ensure_ascii=False, indent=2)
    logging.info(f"[+] 로컬 벡터 DB 파일 생성 완료: {file_path}")

def main():
    parser = argparse.ArgumentParser(description="세종시 뉴스 임베딩 파이프라인")
    parser.add_argument("--query", type=str, default="세종시")
    parser.add_argument("--pages", type=int, default=2)
    parser.add_argument("--limit", type=int, default=10)
    parser.add_argument("--dry-run", action="store_true")
    args = parser.parse_args()

    articles = scrape_sejong_news(query=args.query, max_pages=args.pages, limit=args.limit)
    
    all_records: List[NewsChunkRecord] = []
    gemini_key = os.getenv("GEMINI_API_KEY")
    supabase_url = os.getenv("SUPABASE_URL")
    supabase_key = os.getenv("SUPABASE_SERVICE_ROLE_KEY")

    for idx, article in enumerate(articles, start=1):
        full_content = f"{article.title}\n{article.summary}"
        chunks = chunk_text(full_content)

        for c_idx, chunk in enumerate(chunks):
            vec = get_gemini_embedding(chunk, api_key=gemini_key) if not args.dry_run else [0.0] * 768
            
            # [ARC-208] DTO 객체 생성
            record = NewsChunkRecord(
                title=article.title,
                source=article.source,
                url=article.url,
                pub_date=article.pub_date,
                chunk_index=c_idx,
                content=chunk,
                embedding=vec
            )
            all_records.append(record)

    if args.dry_run:
        logging.info("[*] --dry-run 모드 완료 (DB 저장 안 함)")
        return

    if supabase_url and supabase_key:
        success = upsert_to_supabase(all_records, supabase_url, supabase_key)
        if not success:
            save_to_local_db(all_records)
    else:
        save_to_local_db(all_records)

if __name__ == "__main__":
    main()