#!/usr/bin/env bash
# =============================================================================
# purge-secrets-history.sh
#
# Rewrites git history to remove committed secrets from two files:
#   - .claude/settings.local.json
#   - api/.dev.vars
#
# PREREQUISITES (run these once before this script):
#   pip install git-filter-repo
#
# USAGE:
#   1. Clone the CoachOSGYM repo to a FRESH local directory (do not run
#      inside a repo you are actively developing in — filter-repo requires
#      a clean clone).
#
#       git clone https://github.com/<org>/CoachOSGYM.git coachosgym-clean
#       cd coachosgym-clean
#
#   2. Run this script:
#       bash scripts/purge-secrets-history.sh
#
#   3. Review the rewritten history, then force-push:
#       git push origin --force --all
#       git push origin --force --tags
#
# AFTER RUNNING:
#   - All collaborators must re-clone or run: git fetch origin && git reset --hard origin/main
#   - Rotate ALL exposed credentials listed at the bottom of this script.
# =============================================================================

set -euo pipefail

echo "==> Checking git-filter-repo is available..."
if ! python3 -m git_filter_repo --version &>/dev/null; then
  echo "ERROR: git-filter-repo not found. Install it with: pip install git-filter-repo"
  exit 1
fi

echo "==> Removing .claude/settings.local.json from all commits..."
python3 -m git_filter_repo \
  --path .claude/settings.local.json \
  --invert-paths \
  --force

echo "==> Removing api/.dev.vars from all commits..."
python3 -m git_filter_repo \
  --path api/.dev.vars \
  --invert-paths \
  --force

echo ""
echo "==> History rewrite complete."
echo ""
echo "Verify the files are gone:"
echo "  git log --all --oneline -- .claude/settings.local.json"
echo "  git log --all --oneline -- api/.dev.vars"
echo ""
echo "Both commands should return NO output."
echo ""
echo "==> To push the clean history to GitHub:"
echo "  git remote add origin https://github.com/<org>/CoachOSGYM.git"
echo "  git push origin --force --all"
echo "  git push origin --force --tags"
echo ""
echo "================================================================="
echo " CREDENTIALS THAT MUST BE ROTATED IMMEDIATELY"
echo "================================================================="
echo ""
echo " The following types of credentials were found in committed files"
echo " and must be treated as compromised. Rotate them in their respective"
echo " dashboards before generating or using any new tokens."
echo ""
echo " 1. Cloudflare API tokens"
echo "    Where to rotate: dash.cloudflare.com -> My Profile -> API Tokens"
echo "    Action: Delete all existing tokens, create a new one with least-privilege"
echo "    scope, then store it as a Cloudflare Workers secret:"
echo "      wrangler secret put CLOUDFLARE_API_TOKEN"
echo ""
echo " 2. Supabase Personal Access Token (PAT)"
echo "    Where to rotate: app.supabase.com -> Account -> Access Tokens"
echo "    Action: Revoke the compromised PAT and generate a fresh one."
echo "    Store the new PAT in GitHub Actions secrets (not in code)."
echo ""
echo " 3. Supabase Service Role JWT"
echo "    Where to rotate: app.supabase.com -> Project Settings -> API"
echo "    Action: Click 'Reset JWT secret' to invalidate the old key."
echo "    Update SUPABASE_SERVICE_ROLE_KEY everywhere it is used."
echo ""
echo "================================================================="
echo " After rotating, update the new values in:"
echo "   - Cloudflare Workers secrets (wrangler secret put ...)"
echo "   - GitHub Actions repository secrets"
echo "   - Any other environments that consumed these credentials"
echo "================================================================="
