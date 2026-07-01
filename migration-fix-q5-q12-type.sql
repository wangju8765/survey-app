-- 修复 q5 和 q12 列类型：数据库中为 TEXT[]，应改为 TEXT
-- 这两个是单选题，代码发送的是字符串而非数组
-- 在 Supabase Dashboard → SQL Editor 中执行

ALTER TABLE student_responses ALTER COLUMN q5 TYPE TEXT USING (q5[1]);
ALTER TABLE student_responses ALTER COLUMN q12 TYPE TEXT USING (q12[1]);
