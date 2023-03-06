#!/usr/bin/env bash

project_root="$(git rev-parse --show-toplevel)"
deploy_target_dir=$(realpath "$project_root/../mia-deploy")

if [ ! -d "$deploy_target_dir" ]; then
  echo "Please clone the project into $deploy_target_dir"
  echo "And checkout to the gh-pages branch"
fi

# Build dist
cd "$project_root/apps/mia-app"
pnpm run build

# Copy dist to deploy target
rsync -arvP --delete --exclude=.git --exclude=.nojekyll --exclude=CNAME \
  "$project_root/apps/mia-app/dist/" "$deploy_target_dir"

cd "$deploy_target_dir"
git add .
git commit -m "Deploy $(date)"