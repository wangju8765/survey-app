-- 问卷系统数据库表
-- 在 Supabase SQL Editor 中执行此脚本

-- 有效编号表（教练预置，用于验证访问资格）
CREATE TABLE IF NOT EXISTS valid_codes (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  code TEXT NOT NULL UNIQUE,
  created_at TIMESTAMPTZ DEFAULT now(),
  active BOOLEAN DEFAULT true
);

CREATE INDEX IF NOT EXISTS idx_valid_codes_code ON valid_codes(code);

ALTER TABLE valid_codes ENABLE ROW LEVEL SECURITY;

-- 允许任何人查询编号是否存在（验证）
CREATE POLICY "allow_select_valid_codes" ON valid_codes FOR SELECT USING (true);
-- 只允许 service_role 增删编号
CREATE POLICY "allow_insert_valid_codes" ON valid_codes FOR INSERT WITH CHECK (false);
CREATE POLICY "allow_delete_valid_codes" ON valid_codes FOR DELETE USING (false);

-- 插入示例编号（教练可自行增删）
INSERT INTO valid_codes (code) VALUES ('ZW2026'), ('DEMO001')
ON CONFLICT (code) DO NOTHING;

-- 学生问卷
CREATE TABLE IF NOT EXISTS student_responses (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  created_at TIMESTAMPTZ DEFAULT now(),
  student_code TEXT NOT NULL,
  q1 TEXT,
  q2 TEXT,
  q3 TEXT,
  q4 TEXT,
  q5 TEXT[],
  q6 TEXT,
  q7 TEXT,
  q8 TEXT,
  q9 TEXT,
  q10 TEXT,
  q11 TEXT,
  q12 TEXT[],
  q13 TEXT,
  q14 TEXT,
  q15 TEXT,
  q16 TEXT,
  q17 TEXT,
  q18 TEXT
);

-- 家长问卷
CREATE TABLE IF NOT EXISTS parent_responses (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  created_at TIMESTAMPTZ DEFAULT now(),
  student_code TEXT NOT NULL,
  q1 TEXT,
  q2 TEXT,
  q3 TEXT,
  q4 TEXT,
  q5 TEXT,
  q6 TEXT,
  q7 TEXT,
  q8 TEXT[],
  q9 TEXT,
  q10 TEXT,
  q11 TEXT,
  q12 TEXT,
  q13 TEXT,
  q14 TEXT
);

-- 教师问卷
CREATE TABLE IF NOT EXISTS teacher_responses (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  created_at TIMESTAMPTZ DEFAULT now(),
  student_code TEXT NOT NULL,
  teacher_name TEXT NOT NULL,
  subject TEXT NOT NULL,
  known_duration TEXT,
  q1 TEXT,
  q2 TEXT,
  q3 TEXT,
  q4 TEXT,
  q5 TEXT,
  q6 TEXT,
  q7 TEXT
);

-- 索引：按编号快速查询
CREATE INDEX IF NOT EXISTS idx_student_code_student ON student_responses(student_code);
CREATE INDEX IF NOT EXISTS idx_student_code_parent ON parent_responses(student_code);
CREATE INDEX IF NOT EXISTS idx_student_code_teacher ON teacher_responses(student_code);

-- 开启 Row Level Security，只允许 anon 角色插入
ALTER TABLE student_responses ENABLE ROW LEVEL SECURITY;
ALTER TABLE parent_responses ENABLE ROW LEVEL SECURITY;
ALTER TABLE teacher_responses ENABLE ROW LEVEL SECURITY;

-- 允许所有人插入（匿名填答）
CREATE POLICY "allow_insert_student" ON student_responses FOR INSERT WITH CHECK (true);
CREATE POLICY "allow_insert_parent" ON parent_responses FOR INSERT WITH CHECK (true);
CREATE POLICY "allow_insert_teacher" ON teacher_responses FOR INSERT WITH CHECK (true);

-- 只允许 service_role 读取（教练使用，不暴露给前端）
CREATE POLICY "allow_select_student" ON student_responses FOR SELECT USING (false);
CREATE POLICY "allow_select_parent" ON parent_responses FOR SELECT USING (false);
CREATE POLICY "allow_select_teacher" ON teacher_responses FOR SELECT USING (false);
