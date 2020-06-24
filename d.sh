#!/usr/bin/env sh

# 确保脚本抛出遇到的错误
set -e

# 生成静态文件
hugo

# 进入生成的文件夹
cd public


git init
git add -A

# Commit changes.
msg="rebuilding site $(date)"
if [ -n "$*" ]; then
	msg="$*"
fi
git commit -m "$msg"

# 如果发布到 https://<USERNAME>.github.io
git push -f https://github.com/kiyonlin/kiyonlin.github.io.git master

cd -

rm -rf public
