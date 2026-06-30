#!/bin/bash
set -e
cd /Users/zeno/Documents/Research/survey-app

echo ">>> 提交代码..."
git add -A
git commit -m "三方问卷系统：验证码访问+学生家长教师问卷"

echo ">>> 创建仓库并推送..."
gh repo create wangju8765/survey-app --public --source=. --remote=origin --push

echo ">>> 设置 secrets..."
gh secret set NEXT_PUBLIC_SUPABASE_URL --body "https://csymvhfqosorojkxwlbf.supabase.co" -R wangju8765/survey-app
gh secret set NEXT_PUBLIC_SUPABASE_ANON_KEY --body "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImNzeW12aGZxb3Nvcm9qa3h3bGJmIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODI4MTIxNDAsImV4cCI6MjA5ODM4ODE0MH0.p0GBmiJr1QKbmqFqsnuIjuneGMnZR0-hR29g6C1sUBk" -R wangju8765/survey-app

echo ">>> 完成！"
