-- 教师问卷精简：移除表单中的四个元数据字段后，teacher_name 和 subject 列需改为可空
-- 在 Supabase Dashboard → SQL Editor 中执行
-- 执行日期：2026-07-01

ALTER TABLE teacher_responses ALTER COLUMN teacher_name DROP NOT NULL;
ALTER TABLE teacher_responses ALTER COLUMN subject DROP NOT NULL;
