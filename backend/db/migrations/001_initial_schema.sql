-- Enable extensions
create extension if not exists "uuid-ossp";
create extension if not exists "vector";

-- ─── Users & Profiles ─────────────────────────────────────────
create table if not exists student_profiles (
  id           uuid primary key default uuid_generate_v4(),
  user_id      uuid not null references auth.users(id) on delete cascade,
  grade_level  text not null,
  education_type text not null check (education_type in ('secondary','diploma','undergrad','postgrad')),
  background_summary text default '',
  learning_style text not null check (learning_style in ('visual','auditory','reading','kinesthetic')),
  created_at   timestamptz default now()
);
create index on student_profiles(user_id);

create table if not exists subject_interests (
  id           uuid primary key default uuid_generate_v4(),
  student_id   uuid not null references student_profiles(id) on delete cascade,
  subject_name text not null,
  priority_order int default 0
);

-- ─── Curriculum ────────────────────────────────────────────────
create table if not exists curricula (
  id              uuid primary key default uuid_generate_v4(),
  student_id      uuid not null references student_profiles(id) on delete cascade,
  subject         text not null,
  total_chapters  int default 0,
  generated_at    timestamptz default now(),
  status          text default 'generating' check (status in ('generating','ready','error')),
  deleted_at      timestamptz
);
create index on curricula(student_id);

create table if not exists chapters (
  id                        uuid primary key default uuid_generate_v4(),
  curriculum_id             uuid not null references curricula(id) on delete cascade,
  title                     text not null,
  sequence_order            int not null,
  estimated_duration_mins   int default 45,
  prerequisites             text[] default '{}',
  status                    text default 'locked' check (status in ('locked','available','in_progress','completed')),
  mastery_score             float,
  deleted_at                timestamptz
);
create index on chapters(curriculum_id);

create table if not exists chapter_content (
  id              uuid primary key default uuid_generate_v4(),
  chapter_id      uuid not null references chapters(id) on delete cascade unique,
  content_json    jsonb default '[]',
  diagrams_json   jsonb default '[]',
  formulas_json   jsonb default '[]',
  generated_at    timestamptz default now()
);

-- ─── Learning Sessions ─────────────────────────────────────────
create table if not exists learning_sessions (
  id              uuid primary key default uuid_generate_v4(),
  student_id      uuid not null references student_profiles(id) on delete cascade,
  chapter_id      uuid not null references chapters(id) on delete cascade,
  started_at      timestamptz default now(),
  ended_at        timestamptz,
  completion_pct  float default 0
);
create index on learning_sessions(student_id);

create table if not exists session_events (
  id          uuid primary key default uuid_generate_v4(),
  session_id  uuid not null references learning_sessions(id) on delete cascade,
  event_type  text not null,
  payload_json jsonb default '{}',
  ts          timestamptz default now()
);

-- ─── Assessment ────────────────────────────────────────────────
create table if not exists activities (
  id            uuid primary key default uuid_generate_v4(),
  chapter_id    uuid not null references chapters(id) on delete cascade,
  activity_type text default 'quiz' check (activity_type in ('quiz','assignment','practice')),
  questions_json jsonb default '[]',
  generated_at  timestamptz default now()
);

create table if not exists activity_submissions (
  id            uuid primary key default uuid_generate_v4(),
  activity_id   uuid not null references activities(id) on delete cascade,
  student_id    uuid not null references student_profiles(id) on delete cascade,
  answers_json  jsonb default '{}',
  score         float default 0,
  ai_feedback   text default '',
  submitted_at  timestamptz default now()
);
create index on activity_submissions(student_id);

-- ─── AI Tutor ─────────────────────────────────────────────────
create table if not exists tutor_conversations (
  id            uuid primary key default uuid_generate_v4(),
  student_id    uuid references student_profiles(id) on delete cascade,
  chapter_id    uuid references chapters(id) on delete cascade,
  messages_json jsonb default '[]',
  created_at    timestamptz default now()
);

-- ─── Sentiment ─────────────────────────────────────────────────
create table if not exists sentiment_snapshots (
  id               uuid primary key default uuid_generate_v4(),
  session_id       uuid not null references learning_sessions(id) on delete cascade,
  ts               timestamptz default now(),
  emotion          text,
  attention_score  float,
  engagement_score float,
  raw_landmarks_json jsonb default '{}'
);

-- ─── Analytics & ML ───────────────────────────────────────────
create table if not exists student_engagement_scores (
  id              uuid primary key default uuid_generate_v4(),
  student_id      uuid not null references student_profiles(id) on delete cascade,
  chapter_id      uuid references chapters(id) on delete cascade,
  composite_score float,
  computed_at     timestamptz default now()
);

create table if not exists dropout_risk_scores (
  id              uuid primary key default uuid_generate_v4(),
  student_id      uuid not null references student_profiles(id) on delete cascade,
  risk_score      float,
  risk_factors_json jsonb default '[]',
  computed_at     timestamptz default now()
);

create table if not exists recommendation_logs (
  id                    uuid primary key default uuid_generate_v4(),
  student_id            uuid not null references student_profiles(id) on delete cascade,
  recommended_chapter_id uuid references chapters(id) on delete cascade,
  reason                text,
  accepted              boolean,
  ts                    timestamptz default now()
);

-- ─── Knowledge Graph ──────────────────────────────────────────
create table if not exists concept_nodes (
  id        uuid primary key default uuid_generate_v4(),
  name      text not null,
  subject   text not null,
  embedding vector(1536)
);

create table if not exists concept_edges (
  from_id           uuid not null references concept_nodes(id) on delete cascade,
  to_id             uuid not null references concept_nodes(id) on delete cascade,
  relationship_type text,
  weight            float default 1.0,
  primary key (from_id, to_id)
);

create table if not exists chapter_concept_map (
  chapter_id  uuid not null references chapters(id) on delete cascade,
  concept_id  uuid not null references concept_nodes(id) on delete cascade,
  primary key (chapter_id, concept_id)
);

-- Row Level Security
alter table student_profiles enable row level security;
alter table curricula enable row level security;
alter table learning_sessions enable row level security;
alter table tutor_conversations enable row level security;
alter table activity_submissions enable row level security;

create policy "Users manage own profile" on student_profiles
  for all using (auth.uid() = user_id);

create policy "Users see own curricula" on curricula
  for all using (
    student_id in (select id from student_profiles where user_id = auth.uid())
  );
