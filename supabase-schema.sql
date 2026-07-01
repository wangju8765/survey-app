-- 三方问卷系统 · 数据库表
-- 在 Supabase SQL Editor 中执行此脚本即可完成初始化
-- 最后更新：2026-07-01

-- ============================================================
-- 迁移说明（2026-07-01：新增 q20-q30 覆盖 D4/Z1/M7/D3-SR）
-- 在已有数据库的 Supabase SQL Editor 中执行以下语句：
--   ALTER TABLE student_responses ADD COLUMN IF NOT EXISTS q20 TEXT;
--   ALTER TABLE student_responses ADD COLUMN IF NOT EXISTS q21 TEXT;
--   ALTER TABLE student_responses ADD COLUMN IF NOT EXISTS q22 TEXT;
--   ALTER TABLE student_responses ADD COLUMN IF NOT EXISTS q23 TEXT;
--   ALTER TABLE student_responses ADD COLUMN IF NOT EXISTS q24 TEXT;
--   ALTER TABLE student_responses ADD COLUMN IF NOT EXISTS q25 TEXT;
--   ALTER TABLE student_responses ADD COLUMN IF NOT EXISTS q26 TEXT;
--   ALTER TABLE student_responses ADD COLUMN IF NOT EXISTS q27 TEXT;
--   ALTER TABLE student_responses ADD COLUMN IF NOT EXISTS q28 TEXT;
--   ALTER TABLE student_responses ADD COLUMN IF NOT EXISTS q29 TEXT;
--   ALTER TABLE student_responses ADD COLUMN IF NOT EXISTS q30 TEXT;
-- ============================================================

-- ============================================================
-- 1. 学生信息表（教练创建，一个学生一条记录，code 即测评编号）
-- ============================================================
CREATE TABLE IF NOT EXISTS students (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  code TEXT NOT NULL UNIQUE,
  age INT,
  grade TEXT,
  gender TEXT,
  created_at TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_students_code ON students(code);

ALTER TABLE students ENABLE ROW LEVEL SECURITY;

CREATE POLICY "allow_select_students" ON students FOR SELECT USING (true);
CREATE POLICY "allow_insert_students" ON students FOR INSERT WITH CHECK (true);
CREATE POLICY "allow_delete_students" ON students FOR DELETE USING (false);
CREATE POLICY "allow_update_students" ON students FOR UPDATE USING (false);

-- ============================================================
-- 2. 学生问卷回答（30 题：q1-q28 选择 + q18-q19 开放，q11/q12/q13 显示题号重排为18/19/20）
--    覆盖维度：D1 归因(q3,q4,q14,q15), D2 元认知(q5), D3 SRL(q7,q17,q25,q26),
--             D4 EF(q20-q24), D5 策略(q6), M1/M2/M3(q11,q12,q13),
--             M6 自我妨碍(q17), M7 兴趣(q29,q30), M8 情感/目标(q1,q2,q8),
--             Z1 ZPD(q27,q28), R5/R6 同伴(q9,q10), 可能自我(q16)
-- ============================================================
CREATE TABLE IF NOT EXISTS student_responses (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  created_at TIMESTAMPTZ DEFAULT now(),
  student_code TEXT NOT NULL,
  q1 TEXT,
  q2 TEXT,
  q3 TEXT,
  q4 TEXT,
  q5 TEXT,
  q6 TEXT[],
  q7 TEXT,
  q8 TEXT,
  q9 TEXT,
  q10 TEXT,
  q11 TEXT,
  q12 TEXT,
  q13 TEXT[],
  q14 TEXT,
  q15 TEXT,
  q16 TEXT,
  q17 TEXT,
  q18 TEXT,
  q19 TEXT,
  q20 TEXT,
  q21 TEXT,
  q22 TEXT,
  q23 TEXT,
  q24 TEXT,
  q25 TEXT,
  q26 TEXT,
  q27 TEXT,
  q28 TEXT,
  q29 TEXT,
  q30 TEXT
);

CREATE INDEX IF NOT EXISTS idx_student_responses_code ON student_responses(student_code);

ALTER TABLE student_responses ENABLE ROW LEVEL SECURITY;

CREATE POLICY "allow_insert_student_responses" ON student_responses FOR INSERT WITH CHECK (true);
CREATE POLICY "allow_select_student_responses" ON student_responses FOR SELECT USING (true);

-- ============================================================
-- 3. 家长问卷回答（14 题：q1-q12 选择 + q13-q14 开放）
--    q3、q6、q8 为多选（TEXT[]），其余单选为 TEXT
-- ============================================================
CREATE TABLE IF NOT EXISTS parent_responses (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  created_at TIMESTAMPTZ DEFAULT now(),
  student_code TEXT NOT NULL,
  parent_role TEXT,
  q1 TEXT,
  q2 TEXT,
  q3 TEXT[],
  q4 TEXT,
  q5 TEXT,
  q6 TEXT[],
  q7 TEXT,
  q8 TEXT[],
  q9 TEXT,
  q10 TEXT,
  q11 TEXT,
  q12 TEXT,
  q13 TEXT,
  q14 TEXT
);

CREATE INDEX IF NOT EXISTS idx_parent_responses_code ON parent_responses(student_code);

ALTER TABLE parent_responses ENABLE ROW LEVEL SECURITY;

CREATE POLICY "allow_insert_parent_responses" ON parent_responses FOR INSERT WITH CHECK (true);
CREATE POLICY "allow_select_parent_responses" ON parent_responses FOR SELECT USING (true);

-- ============================================================
-- 4. 教师问卷回答（7 题：q1-q5 选择 + q6-q7 开放）
--    q2 为多选（TEXT[]），其余单选为 TEXT
-- ============================================================
CREATE TABLE IF NOT EXISTS teacher_responses (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  created_at TIMESTAMPTZ DEFAULT now(),
  student_code TEXT NOT NULL,
  student_name TEXT NOT NULL DEFAULT '',
  teacher_name TEXT NOT NULL,
  subject TEXT NOT NULL,
  known_duration TEXT,
  q1 TEXT,
  q2 TEXT[],
  q3 TEXT,
  q4 TEXT,
  q5 TEXT,
  q6 TEXT,
  q7 TEXT
);

CREATE INDEX IF NOT EXISTS idx_teacher_responses_code ON teacher_responses(student_code);

ALTER TABLE teacher_responses ENABLE ROW LEVEL SECURITY;

CREATE POLICY "allow_insert_teacher_responses" ON teacher_responses FOR INSERT WITH CHECK (true);
CREATE POLICY "allow_select_teacher_responses" ON teacher_responses FOR SELECT USING (true);
