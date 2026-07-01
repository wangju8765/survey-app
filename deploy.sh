#!/bin/bash
set -e
cd /Users/zeno/Documents/Research/survey-app

# 密钥文件存放在 HOME 目录，不进入 git 仓库
if [ ! -f "$HOME/.survey-app-env" ]; then
  echo ">>> 缺少密钥文件，正在创建 ~/.survey-app-env"
  echo ">>> 请输入以下信息（按回车确认默认值）："
  read -p "Supabase URL: " supabase_url
  read -p "Supabase Anon Key: " supabase_key
  read -p "Admin Password: " admin_pass
  cat > "$HOME/.survey-app-env" << EOF
NEXT_PUBLIC_SUPABASE_URL=${supabase_url}
NEXT_PUBLIC_SUPABASE_ANON_KEY=${supabase_key}
NEXT_PUBLIC_ADMIN_PASSWORD=${admin_pass}
EOF
  echo ">>> 已保存到 ~/.survey-app-env"
fi

cp "$HOME/.survey-app-env" .env.production

echo ">>> 提交源码..."
git add -A
git commit -m "update: $(date '+%Y-%m-%d %H:%M:%S')" 2>/dev/null || echo "nothing to commit"

echo ">>> 构建..."
npm install --silent
npm run build

echo ">>> 添加 .nojekyll..."
touch out/.nojekyll

echo ">>> 部署到 gh-pages..."
TMP_DIR=$(mktemp -d)
cp -r out/* "$TMP_DIR/"
cp out/.nojekyll "$TMP_DIR/" 2>/dev/null || true

git checkout gh-pages
find . -maxdepth 1 -not -name '.' -not -name '.git' -exec rm -rf {} \; 2>/dev/null || true
cp -r "$TMP_DIR"/* .
cp "$TMP_DIR"/.nojekyll . 2>/dev/null || true
rm -rf "$TMP_DIR"

git add -A
git commit -m "deploy: $(date '+%Y-%m-%d %H:%M:%S')" || echo "nothing to commit"
git push origin gh-pages
git checkout main

echo ">>> 完成！https://wangju8765.github.io/survey-app/"
