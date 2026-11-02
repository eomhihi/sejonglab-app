# 세종시 뉴스 크롤러 & Gemini text-embedding-004 전처리 가이드

이 파이프라인 스크립트(`crawl_and_embed.py`)는 세종시 관련 최신 뉴스/보도자료를 자동 수집하고, 500자 단위 청크로 분할하여 **Gemini API (`text-embedding-004`)** 기반 768차원 벡터를 생성한 후 **Supabase (pgvector)** 또는 로컬 벡터 저장소에 저장합니다.

---

## 1. 실행 환경 및 의존성 패키지

필요 라이브러리를 설치합니다:

```bash
pip install requests beautifulsoup4
```

---

## 2. 환경 변수 설정 (`.env.local` 또는 시스템 환경변수)

```bash
# Gemini API Key (임베딩 생성용)
export GEMINI_API_KEY="your-gemini-api-key"

# Supabase pgvector 연동 (선택 - 미설정 시 scripts/local_news_vectors.json 로컬 백업 저장)
export SUPABASE_URL="https://your-project.supabase.co"
export SUPABASE_SERVICE_ROLE_KEY="your-supabase-service-role-key"
```

---

## 3. Supabase pgvector 테이블 생성 (SQL)

Supabase 대시보드 **SQL Editor**에서 아래 명령어를 실행하여 768차원 벡터 테이블 및 유사도 검색 함수를 생성합니다:

```sql
-- pgvector 확장 활성화
CREATE EXTENSION IF NOT EXISTS vector;

-- 뉴스 임베딩 저장 테이블
CREATE TABLE IF NOT EXISTS sejong_news_embeddings (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    title TEXT NOT NULL,
    source VARCHAR(100) DEFAULT '세종시 보도자료',
    url TEXT,
    pub_date VARCHAR(50),
    chunk_index INT DEFAULT 0,
    content TEXT NOT NULL,
    embedding vector(768),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- HNSW 인덱스 생성
CREATE INDEX IF NOT EXISTS idx_sejong_news_embedding_hnsw 
ON sejong_news_embeddings 
USING hnsw (embedding vector_cosine_ops);

-- RAG 검색용 코사인 유사도 연산 함수
CREATE OR REPLACE FUNCTION match_sejong_news (
  query_embedding vector(768),
  match_threshold float DEFAULT 0.5,
  match_count int DEFAULT 5
)
RETURNS TABLE (
  id UUID,
  title TEXT,
  source VARCHAR,
  url TEXT,
  pub_date VARCHAR,
  chunk_index INT,
  content TEXT,
  similarity float
)
LANGUAGE plpgsql
AS $$
BEGIN
  RETURN QUERY
  SELECT
    sejong_news_embeddings.id,
    sejong_news_embeddings.title,
    sejong_news_embeddings.source,
    sejong_news_embeddings.url,
    sejong_news_embeddings.pub_date,
    sejong_news_embeddings.chunk_index,
    sejong_news_embeddings.content,
    1 - (sejong_news_embeddings.embedding <=> query_embedding) AS similarity
  FROM sejong_news_embeddings
  WHERE 1 - (sejong_news_embeddings.embedding <=> query_embedding) > match_threshold
  ORDER BY sejong_news_embeddings.embedding <=> query_embedding
  LIMIT match_count;
END;
$$;
```

---

## 4. 스크립트 실행 방법

### (1) 테스트 (Dry Run - DB 저장 및 API 호출 비용 없이 수집/청킹 확인)
```bash
python scripts/crawl_and_embed.py --dry-run
```

### (2) 실제 뉴스 크롤링 & 벡터 DB 생성 실행
```bash
python scripts/crawl_and_embed.py --query "세종시 스마트시티" --pages 3 --limit 15
```

### (3) SQL 생성문 확인
```bash
python scripts/crawl_and_embed.py --show-sql
```
