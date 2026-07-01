-- 为管理后台的删除功能开放 DELETE 权限
-- 在 Supabase Dashboard → SQL Editor 中执行
-- 执行日期：2026-07-01

-- 学生表：允许删除
DROP POLICY IF EXISTS "allow_delete_students" ON students;
CREATE POLICY "allow_delete_students" ON students FOR DELETE USING (true);

-- 三份问卷回答表：允许删除（管理后台删除学生时同步清理）
DROP POLICY IF EXISTS "allow_delete_student_responses" ON student_responses;
CREATE POLICY "allow_delete_student_responses" ON student_responses FOR DELETE USING (true);

DROP POLICY IF EXISTS "allow_delete_parent_responses" ON parent_responses;
CREATE POLICY "allow_delete_parent_responses" ON parent_responses FOR DELETE USING (true);

DROP POLICY IF EXISTS "allow_delete_teacher_responses" ON teacher_responses;
CREATE POLICY "allow_delete_teacher_responses" ON teacher_responses FOR DELETE USING (true);
