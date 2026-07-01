#!/bin/bash
set -e
cd /Users/zeno/Documents/Research/survey-app

# 从 HOME 目录读取密钥（不进入 git 仓库）
if [ -f "$HOME/.survey-app-env" ]; then
  cp "$HOME/.survey-app-env" .env.production
else
  echo "请先运行 bash deploy.sh 以创建密钥文件"
  exit 1
fi

echo ">>> 提交源码..."
git add -A
git commit -m "update: $(date '+%Y-%m-%d %H:%M:%S')" 2>/dev/null || echo "nothing to commit"

echo ">>> 构建..."
npm install --silent
npm run build

echo ">>> 部署到 EdgeOne Pages..."
edgeone makers deploy ./out -n xiaowang-survey

echo ">>> 完成！"
