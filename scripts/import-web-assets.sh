#!/bin/sh
# Git handles source retrieval; Node validation and project writes run in Docker.
set -eu
revision=${WEB_ASSETS_REVISION:?Set WEB_ASSETS_REVISION to a full source commit SHA}
source=${WEB_ASSETS_SOURCE:?Set WEB_ASSETS_SOURCE}
case "$revision" in *[!0-9a-f]*|'') echo 'Expected a lowercase commit SHA' >&2; exit 2;; esac
[ "${#revision}" -eq 40 ] || { echo 'Expected a 40-character commit SHA' >&2; exit 2; }
staging=$(mktemp -d)
trap 'rm -rf "$staging"' EXIT HUP INT TERM
mkdir "$staging/files"
git init --bare --quiet "$staging/repository"
# Append the CLI helper; configured Git helpers still get the first chance.
if command -v gh >/dev/null 2>&1; then
  git -c 'credential.helper=!gh auth git-credential' \
    --git-dir="$staging/repository" fetch --quiet --depth=1 -- "$source" "$revision"
else
  git --git-dir="$staging/repository" fetch --quiet --depth=1 -- "$source" "$revision"
fi
for name in footer.json tokens.json footer.css application-policy.json CITATION.cff; do
  git --git-dir="$staging/repository" show "$revision:shared/web/$name" > "$staging/files/$name"
done
"$@" --volume "$staging/files:/web-assets-source:ro" --volume "$PWD:/repo" \
  --env WEB_ASSETS_REVISION="$revision" \
  --env WEB_ASSETS_CITATION_OUTPUT=/repo/CITATION.cff \
  web node scripts/web-assets.mjs --import /web-assets-source
