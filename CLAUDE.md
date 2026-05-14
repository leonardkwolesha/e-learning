# EduAI OS — AI-Powered Personalized Learning Platform

## Project Vision

An AI-driven, Netflix-style personalized learning operating system targeting secondary education through university level. The platform ingests learner profiles and behavioral signals to dynamically generate curricula, deliver interactive multimodal instruction (text, speech, video, diagrams, formulas), assess understanding, and continuously adapt content based on real-time engagement and sentiment analysis.

---

## Target Audience

- Secondary school students (Grades 9–12)
- Diploma and certificate candidates
- Undergraduate and postgraduate university students
- Self-learners transitioning between education levels

---

## Core Platform Pillars

1. **Adaptive Curriculum Engine** — generates structured, personalized curriculum from user onboarding inputs
2. **Multimodal Content Delivery** — text, rendered math (LaTeX), diagrams, AI-narrated video, speech-to-speech
3. **Conversational AI Tutor** — teaches chapters, answers questions, explains examples in real time
4. **Activity & Assessment Engine** — auto-generates chapter activities, evaluates responses like a teacher
5. **Emotion & Engagement Intelligence** — processes live video feed for sentiment, attention, fatigue detection
6. **Speech-to-Speech Interface** — open-source real-time voice interaction with overlap handling
7. **ML Suite** — recommendation, knowledge graph, drop prediction, behaviour tracking, big data pipeline
8. **Analytics & Dashboards** — real-time feature store, student dashboards, instructor/admin views

---

## Tech Stack

| Layer | Technology |
|---|---|
| Backend API | Python 3.11+, FastAPI, Uvicorn |
| Database | Supabase (PostgreSQL) |
| Auth | Supabase Auth (JWT, OAuth) |
| File / Media Storage | Supabase Storage |
| Realtime Events | Supabase Realtime (WebSockets) |
| LLM / Generative AI | OpenAI API (gpt-4o / gpt-4o-mini) |
| Embeddings / Vector Search | pgvector via Supabase |
| Speech-to-Speech | OpenedAI Speech + Whisper (open source, self-hosted) |
| Video Sentiment | MediaPipe + DeepFace + OpenCV (real-time webcam pipeline) |
| ML Pipelines | Apache Kafka + Apache Spark (big data), scikit-learn, PyTorch |
| Feature Store | Feast (open source) backed by Redis + Supabase |
| Knowledge Graph | Neo4j (hosted) or Supabase + pgvector graph traversal |
| Task Queue | Celery + Redis |
| Caching | Redis |
| Frontend | Next.js 14 (App Router), TypeScript, Tailwind CSS |
| Real-time Frontend | Supabase Realtime client, WebRTC (video/audio) |
| Diagrams / Math | KaTeX (formulas), Mermaid.js / D3.js (diagrams) |
| Monitoring | Prometheus + Grafana |
| Containerization | Docker + Docker Compose (dev), Kubernetes (prod) |
| CI/CD | GitHub Actions |

---

## Project Directory Skeleton

```
edu-ai-os/
├── CLAUDE.md
├── .env.example
├── docker-compose.yml
├── pyproject.toml
│
├── backend/                          # FastAPI Python backend
│   ├── main.py                       # FastAPI app entrypoint
│   ├── core/
│   │   ├── config.py                 # Settings (Pydantic BaseSettings)
│   │   ├── database.py               # Supabase client init
│   │   ├── auth.py                   # JWT middleware, Supabase Auth helpers
│   │   ├── redis_client.py           # Redis connection pool
│   │   └── exceptions.py
│   │
│   ├── api/
│   │   ├── v1/
│   │   │   ├── router.py             # Aggregates all route modules
│   │   │   ├── auth.py               # /auth — register, login, OAuth
│   │   │   ├── onboarding.py         # /onboarding — profile setup, grade, subject selection
│   │   │   ├── curriculum.py         # /curriculum — generate, fetch, update curriculum
│   │   │   ├── content.py            # /content — chapter content, diagrams, formulas
│   │   │   ├── tutor.py              # /tutor — conversational AI tutor (streaming)
│   │   │   ├── assessment.py         # /assessment — activity generation, submission, evaluation
│   │   │   ├── speech.py             # /speech — STT/TTS proxy endpoints
│   │   │   ├── video_analysis.py     # /video — sentiment analysis from webcam feed
│   │   │   ├── analytics.py          # /analytics — student progress, engagement metrics
│   │   │   ├── recommendation.py     # /recommend — next chapter, related content
│   │   │   └── admin.py              # /admin — instructor/admin dashboards
│   │   └── websockets/
│   │       ├── tutor_ws.py           # WebSocket: real-time tutor conversation
│   │       ├── speech_ws.py          # WebSocket: speech-to-speech session
│   │       └── sentiment_ws.py       # WebSocket: live video sentiment stream
│   │
│   ├── services/
│   │   ├── curriculum_generator.py   # OpenAI API: build curriculum from user profile
│   │   ├── content_generator.py      # OpenAI API: generate chapter content, examples
│   │   ├── activity_generator.py     # OpenAI API: generate & evaluate activities
│   │   ├── tutor_engine.py           # OpenAI API: streaming tutor conversation
│   │   ├── speech_service.py         # Whisper STT + OpenedAI TTS integration
│   │   ├── video_sentiment.py        # DeepFace + MediaPipe: emotion/attention pipeline
│   │   ├── diagram_service.py        # Mermaid / Matplotlib: diagram generation
│   │   └── notification_service.py   # Push notifications, email alerts
│   │
│   ├── ml/
│   │   ├── recommendation/
│   │   │   ├── collaborative_filter.py
│   │   │   ├── content_based.py
│   │   │   └── hybrid_recommender.py
│   │   ├── knowledge_graph/
│   │   │   ├── graph_builder.py      # Build concept dependency graph
│   │   │   ├── path_finder.py        # Personalized learning path via graph traversal
│   │   │   └── concept_linker.py     # Link chapters to knowledge graph nodes
│   │   ├── behaviour_tracking/
│   │   │   ├── event_collector.py    # Click, scroll, pause, replay events
│   │   │   ├── session_analyzer.py   # Session-level engagement scoring
│   │   │   └── feature_extractor.py  # Feature engineering for downstream ML
│   │   ├── prediction/
│   │   │   ├── dropout_predictor.py  # Early drop-out risk model
│   │   │   └── success_predictor.py  # Chapter/course completion probability
│   │   ├── sentiment/
│   │   │   ├── face_analyzer.py      # DeepFace emotion classification
│   │   │   ├── attention_detector.py # Gaze & head pose via MediaPipe
│   │   │   └── engagement_scorer.py  # Composite engagement score
│   │   └── pipeline/
│   │       ├── kafka_producer.py     # Publish events to Kafka
│   │       ├── kafka_consumer.py     # Consume and process event streams
│   │       ├── spark_jobs/           # PySpark batch processing jobs
│   │       └── feature_store/        # Feast feature definitions and retrieval
│   │
│   ├── models/                       # Pydantic schemas (request/response)
│   │   ├── user.py
│   │   ├── curriculum.py
│   │   ├── content.py
│   │   ├── assessment.py
│   │   ├── analytics.py
│   │   └── sentiment.py
│   │
│   ├── db/
│   │   ├── migrations/               # Supabase SQL migrations
│   │   └── seeds/                    # Seed data (subjects, grade levels, sample content)
│   │
│   └── tests/
│       ├── unit/
│       ├── integration/
│       └── conftest.py
│
├── frontend/                         # Next.js 14 frontend
│   ├── app/
│   │   ├── (auth)/
│   │   │   ├── login/page.tsx
│   │   │   └── register/page.tsx
│   │   ├── onboarding/page.tsx       # Grade, subject, background intake
│   │   ├── dashboard/page.tsx        # Netflix-style subject/course grid
│   │   ├── curriculum/
│   │   │   └── [subjectId]/page.tsx  # Curriculum tree view
│   │   ├── learn/
│   │   │   └── [chapterId]/page.tsx  # Main learning interface
│   │   ├── tutor/page.tsx            # AI tutor chat + voice interface
│   │   ├── assessment/
│   │   │   └── [activityId]/page.tsx # Activity / quiz interface
│   │   └── analytics/page.tsx        # Personal progress dashboard
│   │
│   ├── components/
│   │   ├── curriculum/
│   │   │   ├── SubjectCard.tsx       # Netflix-style card
│   │   │   ├── CurriculumTree.tsx    # Chapter tree navigator
│   │   │   └── ProgressRing.tsx
│   │   ├── content/
│   │   │   ├── ContentRenderer.tsx   # Renders text, KaTeX, Mermaid, images
│   │   │   ├── FormulaBlock.tsx      # KaTeX math formula display
│   │   │   └── DiagramViewer.tsx     # Mermaid / D3 diagram display
│   │   ├── tutor/
│   │   │   ├── ChatInterface.tsx     # Streaming AI tutor chat
│   │   │   ├── VoiceInterface.tsx    # Speech-to-speech UI
│   │   │   └── SentimentOverlay.tsx  # Webcam + emotion display overlay
│   │   ├── assessment/
│   │   │   ├── ActivityRunner.tsx    # Renders activity questions
│   │   │   ├── EvaluationFeedback.tsx
│   │   │   └── ProgressTracker.tsx
│   │   └── shared/
│   │       ├── WebcamCapture.tsx     # WebRTC webcam component
│   │       └── StreamingText.tsx     # Streaming LLM text renderer
│   │
│   ├── lib/
│   │   ├── supabase.ts               # Supabase client
│   │   ├── api.ts                    # Backend API client
│   │   └── websocket.ts              # WebSocket connection manager
│   │
│   └── types/
│       └── index.ts
│
├── ml_infra/                         # ML infrastructure configs
│   ├── feast/
│   │   ├── feature_store.yaml
│   │   └── features/
│   │       ├── student_features.py
│   │       ├── engagement_features.py
│   │       └── content_features.py
│   ├── kafka/
│   │   └── topics.yaml
│   └── spark/
│       └── jobs/
│
└── infrastructure/
    ├── docker/
    │   ├── backend.Dockerfile
    │   └── frontend.Dockerfile
    ├── k8s/
    │   ├── deployments/
    │   └── services/
    └── monitoring/
        ├── prometheus.yml
        └── grafana/dashboards/
```

---

## Database Schema (Supabase / PostgreSQL)

### Core Tables

```sql
-- Users & Profiles
users                  (id, email, role, created_at)
student_profiles       (id, user_id, grade_level, education_type, background_summary, learning_style, created_at)
subject_interests      (id, student_id, subject_name, priority_order)

-- Curriculum
curricula              (id, student_id, subject, total_chapters, generated_at, status)
chapters               (id, curriculum_id, title, sequence_order, estimated_duration_mins, prerequisites[])
chapter_content        (id, chapter_id, content_json, diagrams_json, formulas_json, generated_at)

-- Learning Sessions
learning_sessions      (id, student_id, chapter_id, started_at, ended_at, completion_pct)
session_events         (id, session_id, event_type, payload_json, ts)  -- Kafka ingestion target

-- Assessment
activities             (id, chapter_id, activity_type, questions_json, generated_at)
activity_submissions   (id, activity_id, student_id, answers_json, score, ai_feedback, submitted_at)

-- AI Tutor
tutor_conversations    (id, student_id, chapter_id, messages_json, created_at)

-- Sentiment / Engagement
sentiment_snapshots    (id, session_id, ts, emotion, attention_score, engagement_score, raw_landmarks_json)

-- Analytics & ML
student_engagement_scores  (id, student_id, chapter_id, composite_score, computed_at)
dropout_risk_scores        (id, student_id, risk_score, risk_factors_json, computed_at)
recommendation_logs        (id, student_id, recommended_chapter_id, reason, accepted, ts)

-- Knowledge Graph (pgvector + adjacency)
concept_nodes          (id, name, subject, embedding vector(1536))
concept_edges          (from_id, to_id, relationship_type, weight)
chapter_concept_map    (chapter_id, concept_id)
```

---

## ML Suite — Component Details

### 1. Student Behaviour Tracking
- Captures: scroll depth, pause/replay events, time-on-section, click heatmaps, tab-switch events
- Transport: Kafka topic `student-events`
- Processing: Spark Structured Streaming → feature store (Feast) → PostgreSQL aggregates

### 2. Recommendation System
- **Content-based**: chapter embedding similarity via pgvector cosine search
- **Collaborative filtering**: matrix factorization on student × chapter interaction matrix
- **Hybrid**: weighted blend with real-time re-ranking from engagement score
- Triggers: chapter completion, session end, dropout risk spike

### 3. Knowledge Graph-Based Learning Path
- Graph nodes = concepts; edges = prerequisite/related relationships
- Path-finding: Dijkstra / topological sort weighted by student mastery scores
- Dynamic re-routing: if sentiment signals weak understanding, insert remedial concept node

### 4. AI Tutor (Conversational)
- OpenAI API (gpt-4o) with system prompt containing: chapter content, student profile, prior conversation summary
- Streaming responses via WebSocket
- Capabilities: explain, give examples, show formula steps, quiz student mid-conversation, draw diagrams on demand

### 5. Video Engagement Analytics
- Input: webcam frames at 5 fps via WebRTC
- Processing: DeepFace (emotion: happy/sad/angry/neutral/surprised/fearful/disgusted) + MediaPipe Face Mesh (gaze, head pose)
- Output: per-second engagement score → adaptive content pacing trigger

### 6. Dropout & Success Prediction
- Features: days since last login, cumulative engagement score, activity scores, dropout_risk_score from prior week
- Model: XGBoost classifier (binary: at-risk / on-track) retrained weekly via Spark batch job
- Action: high-risk students receive motivational nudges + reduced content density

### 7. Generative AI Tutorial & Video Analytics
- OpenAI API (gpt-4o) generates chapter narration scripts
- OpenedAI Speech (Kokoro / Piper TTS) synthesizes audio
- Auto-generate slide decks from chapter JSON content
- Track: per-slide watch time, rewind events → feed back into recommendation system

### 8. Big Data Pipeline
```
[Client Events] → Kafka → Spark Streaming → Feature Store (Feast/Redis)
                                          → PostgreSQL (aggregates)
                                          → S3-compatible (Supabase Storage) for raw event lake
[Batch Jobs] → Spark → Model retraining → ML model registry
```

### 9. Feature Store & Real-time Dashboards
- Feast feature groups: `student_engagement`, `content_quality`, `dropout_risk`
- Grafana dashboards: platform-wide engagement, dropout risk heatmap, content performance
- Student-facing dashboard: progress rings, streak, predicted completion date, weak concept alerts

---

## Speech-to-Speech System

**Stack**: Whisper (STT) + OpenedAI Speech server (TTS, self-hosted)
- WebSocket pipeline: microphone audio chunks → Whisper transcription → OpenAI API → TTS synthesis → audio playback
- Overlap handling: Voice Activity Detection (VAD) via Silero VAD; barge-in detection pauses TTS playback
- Modes: **tutor mode** (Q&A), **lecture mode** (narrated content delivery), **assessment mode** (spoken quiz)

---

## Video Sentiment Pipeline

```
Webcam (WebRTC) → Canvas frame extraction (5 fps)
               → Base64 encode → WebSocket → backend/sentiment_ws.py
               → DeepFace.analyze() → emotion vector
               → MediaPipe FaceMesh → gaze_score, head_pose
               → engagement_scorer.py → composite_score [0.0–1.0]
               → Supabase Realtime broadcast → frontend SentimentOverlay
               → If composite_score < 0.4 for 60s → trigger adaptation signal
```

Adaptation actions on low engagement:
- Shorten next content block
- Insert an interactive question
- Suggest a 5-minute break
- Switch to speech/video delivery mode from text

---

## Onboarding Flow

1. **Step 1 — Identity**: name, age, grade level, education type (secondary / diploma / undergrad / postgrad)
2. **Step 2 — Subject Selection**: choose subjects (multi-select), rank by priority
3. **Step 3 — Background Assessment**: short diagnostic quiz per subject (adaptive, 5–10 questions via OpenAI API)
4. **Step 4 — Learning Style**: visual / auditory / reading / kinesthetic preference
5. **Step 5 — Upload** (optional): prior transcripts, syllabi, math sheets for diploma candidates
6. **Step 6 — Curriculum Generation**: OpenAI API generates full structured curriculum; stored in DB; shown as interactive tree

---

## Chapter Learning Flow

```
Chapter Selected
    ↓
Content Rendered (text + formulas + diagrams)
    ↓
AI Tutor narrates (speech-to-speech, optional)
    ↓
Mid-chapter interaction prompts (tutor asks questions)
    ↓
Sentiment monitor running in background (webcam)
    ↓
Chapter Summary generated
    ↓
Activity / Assessment generated
    ↓
Student submits — AI evaluates with teacher-like feedback
    ↓
Mastery score updated → Knowledge graph node marked
    ↓
Recommendation engine selects next chapter
```

---

## API Endpoints (Key Routes)

```
POST   /api/v1/auth/register
POST   /api/v1/auth/login
POST   /api/v1/onboarding/profile
POST   /api/v1/onboarding/diagnostic
POST   /api/v1/curriculum/generate
GET    /api/v1/curriculum/{curriculum_id}
GET    /api/v1/curriculum/{curriculum_id}/chapters
POST   /api/v1/content/generate/{chapter_id}
GET    /api/v1/content/{chapter_id}
POST   /api/v1/tutor/message                   # Non-streaming
WS     /api/v1/ws/tutor/{session_id}           # Streaming tutor
WS     /api/v1/ws/speech/{session_id}          # Speech-to-speech
WS     /api/v1/ws/sentiment/{session_id}       # Video sentiment
POST   /api/v1/assessment/generate/{chapter_id}
POST   /api/v1/assessment/submit/{activity_id}
GET    /api/v1/analytics/student/{student_id}
GET    /api/v1/recommend/next/{student_id}
GET    /api/v1/admin/dashboard
```

---

## 6-Member Team Task Division

---

### Member 1 — Backend Core & Auth Lead

**Responsibility**: Foundation, infrastructure, and cross-cutting concerns

**Tasks**:
- Set up FastAPI project structure, routing, middleware, exception handlers
- Integrate Supabase client (database, auth, storage, realtime)
- Implement `/auth` endpoints (register, login, JWT refresh, OAuth via Supabase)
- Set up Redis (caching, session store, Celery broker)
- Implement `core/config.py`, `core/database.py`, `core/auth.py`
- Docker Compose dev environment (backend, Redis, Kafka, Zookeeper)
- CI/CD pipeline (GitHub Actions: lint, test, build)
- Write database migrations (Supabase SQL — all core tables)
- Seed database with subjects, grade levels, diagnostic question templates
- Environment variable management, secrets rotation strategy

**Deliverables**: Running FastAPI server with auth, Supabase connected, Docker dev stack

---

### Member 2 — Curriculum & Content Generation Lead

**Responsibility**: AI-powered curriculum and content creation engine

**Tasks**:
- `services/curriculum_generator.py` — OpenAI API integration to generate full subject curricula from student profile
- `services/content_generator.py` — per-chapter content generation (text, examples, formulas in LaTeX, diagram specs in Mermaid)
- `services/diagram_service.py` — render Mermaid specs server-side or pass to frontend
- `/api/v1/curriculum/` routes (generate, fetch, update)
- `/api/v1/content/` routes (generate, fetch chapter content)
- Onboarding diagnostic quiz generation and scoring via OpenAI API
- `/api/v1/onboarding/` routes
- Prompt engineering: system prompts for curriculum builder, content generator, diagnostic quiz
- Supabase Storage integration for storing generated diagrams and media
- Unit tests for all generation services (mock OpenAI API responses)

**Deliverables**: End-to-end curriculum generation from onboarding to chapter content

---

### Member 3 — AI Tutor & Assessment Lead

**Responsibility**: Conversational tutor, speech interface, and assessment engine

**Tasks**:
- `services/tutor_engine.py` — streaming OpenAI API tutor (gpt-4o) with context window management (student profile + chapter content + conversation history)
- WebSocket endpoint `ws/tutor/{session_id}` with streaming text delivery
- `services/activity_generator.py` — generate chapter activities (MCQ, short answer, problem-solving) via OpenAI API
- Activity evaluation engine — OpenAI API grades responses with teacher-like natural feedback
- `/api/v1/assessment/` routes (generate, submit, evaluate, fetch results)
- `services/speech_service.py` — Whisper STT integration + OpenAI TTS (tts-1 / tts-1-hd) or OpenedAI TTS server proxy
- WebSocket endpoint `ws/speech/{session_id}` — full speech-to-speech pipeline with VAD/barge-in handling
- Prompt engineering: tutor system prompt (educational persona, subject expert, adaptive difficulty)
- Store conversation history in `tutor_conversations` table
- Unit and integration tests for tutor and assessment flows

**Deliverables**: Working conversational AI tutor (text + voice), complete assessment lifecycle

---

### Member 4 — ML Suite Lead (Recommendation & Knowledge Graph)

**Responsibility**: Recommendation engine, knowledge graph, behaviour tracking, prediction models

**Tasks**:
- `ml/recommendation/` — build hybrid recommender (content-based via pgvector + collaborative filtering)
- `ml/knowledge_graph/graph_builder.py` — populate Neo4j or pgvector graph from curriculum concept data
- `ml/knowledge_graph/path_finder.py` — personalized learning path computation
- `ml/behaviour_tracking/event_collector.py` — Kafka producer for client events
- `ml/behaviour_tracking/session_analyzer.py` — session engagement scoring
- `ml/prediction/dropout_predictor.py` — XGBoost dropout risk model (training pipeline + inference)
- `ml/prediction/success_predictor.py` — completion probability model
- `/api/v1/recommend/` routes
- Feast feature store setup (`ml_infra/feast/`) — define feature views, feature services
- Kafka topic setup and consumer group configuration
- Spark batch job for weekly model retraining
- Model versioning and registry (MLflow or simple Supabase-backed registry)

**Deliverables**: Working recommendation API, knowledge graph, dropout risk scores updated nightly

---

### Member 5 — Video Sentiment & Analytics Lead

**Responsibility**: Real-time video analysis, engagement pipeline, dashboards

**Tasks**:
- `services/video_sentiment.py` — DeepFace + MediaPipe integration for emotion and attention detection
- `ml/sentiment/face_analyzer.py`, `attention_detector.py`, `engagement_scorer.py`
- WebSocket endpoint `ws/sentiment/{session_id}` — receive webcam frames, return engagement scores, broadcast via Supabase Realtime
- Adaptation trigger logic — detect low engagement, emit adaptation events to tutor/content services
- `/api/v1/video_analysis/` REST fallback routes
- `/api/v1/analytics/` routes — student progress, chapter mastery, engagement history
- Kafka consumer for `student-events` → PostgreSQL aggregates
- Spark Structured Streaming job for real-time engagement aggregation
- Grafana dashboards: platform engagement, dropout risk, content performance heatmaps
- Student-facing analytics page data API (progress rings, streak, weak concepts)
- Store `sentiment_snapshots` and `student_engagement_scores` to Supabase

**Deliverables**: Live webcam sentiment pipeline, adaptive trigger system, analytics dashboards

---

### Member 6 — Frontend Lead

**Responsibility**: Full Next.js frontend — UX, component library, WebRTC, real-time integration

**Tasks**:
- Next.js 14 project setup (App Router, TypeScript, Tailwind CSS, ESLint)
- Supabase client integration (auth session, realtime subscriptions)
- Onboarding flow (multi-step form: profile → subject selection → diagnostic quiz → curriculum preview)
- Netflix-style Dashboard (`/dashboard`) — subject cards, continue learning rail, recommendations rail
- Curriculum tree view (`/curriculum/[subjectId]`) — interactive chapter navigator with mastery indicators
- Chapter learning page (`/learn/[chapterId]`) — `ContentRenderer` (text + KaTeX + Mermaid), chapter navigation
- AI Tutor interface (`/tutor`) — streaming chat, voice toggle, `WebcamCapture` with `SentimentOverlay`
- `VoiceInterface.tsx` — mic capture, WebSocket to `ws/speech`, audio playback with barge-in
- Assessment page (`/assessment/[activityId]`) — question renderer, answer submission, animated feedback display
- Analytics/progress dashboard (`/analytics`) — charts (Recharts / Chart.js), streaks, risk alerts
- Supabase Realtime integration for live sentiment score updates on learning page
- Responsive design (mobile-first for students on phones)
- Accessibility: ARIA roles, keyboard navigation, screen reader support for content renderer

**Deliverables**: Complete, responsive frontend integrated with all backend WebSocket and REST APIs

---

## Development Phases

| Phase | Duration | Focus |
|---|---|---|
| Phase 0 | Week 1 | Repo setup, Docker stack, Supabase schema, CI/CD |
| Phase 1 | Weeks 2–3 | Auth, onboarding, curriculum generation, content rendering |
| Phase 2 | Weeks 4–5 | AI tutor (text), assessment engine, basic frontend |
| Phase 3 | Weeks 6–7 | Speech-to-speech, video sentiment, WebSocket pipelines |
| Phase 4 | Weeks 8–9 | ML recommendation, knowledge graph, dropout prediction |
| Phase 5 | Weeks 10–11 | Big data pipeline (Kafka + Spark), feature store, Grafana |
| Phase 6 | Week 12 | Integration testing, performance tuning, pilot with real students |

---

## Environment Variables (`.env.example`)

```env
# Supabase
SUPABASE_URL=
SUPABASE_ANON_KEY=
SUPABASE_SERVICE_ROLE_KEY=

# OpenAI API
OPENAI_API_KEY=
OPENAI_MODEL=gpt-4o
OPENAI_MODEL_FAST=gpt-4o-mini

# Redis
REDIS_URL=redis://localhost:6379

# Kafka
KAFKA_BOOTSTRAP_SERVERS=localhost:9092
KAFKA_STUDENT_EVENTS_TOPIC=student-events

# Speech
WHISPER_MODEL=base.en
OPENEDAI_SPEECH_URL=http://localhost:8001

# Neo4j (if used)
NEO4J_URI=bolt://localhost:7687
NEO4J_USER=neo4j
NEO4J_PASSWORD=

# Feature Store
FEAST_REGISTRY_PATH=ml_infra/feast/feature_store.yaml

# Frontend
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
NEXT_PUBLIC_API_URL=http://localhost:8000
```

---

## Code Conventions

- **Python**: Black formatter, isort, Ruff linter, 100-char line limit
- **TypeScript**: ESLint + Prettier, strict mode enabled
- **API responses**: always `{"data": ..., "error": null}` or `{"data": null, "error": "message"}`
- **OpenAI API calls**: use `gpt-4o` for tutor/generation tasks; `gpt-4o-mini` for lightweight classification and embeddings; always stream responses for tutor endpoints
- **WebSocket messages**: JSON with `{"type": "...", "payload": {...}}` envelope
- **Database**: all timestamps in UTC, UUIDs as primary keys, soft deletes (`deleted_at`)
- **Secrets**: never committed; use `.env` locally, environment injection in prod

---

## Key External Resources

- [Supabase Python client](https://supabase.com/docs/reference/python)
- [OpenAI Python SDK](https://github.com/openai/openai-python)
- [OpenAI API Reference](https://platform.openai.com/docs/api-reference)
- [OpenedAI Speech (self-hosted TTS)](https://github.com/matatonic/openedai-speech)
- [Faster Whisper (STT)](https://github.com/SYSTRAN/faster-whisper)
- [DeepFace](https://github.com/serengil/deepface)
- [MediaPipe](https://ai.google.dev/edge/mediapipe)
- [Feast Feature Store](https://docs.feast.dev)
- [pgvector](https://github.com/pgvector/pgvector)
