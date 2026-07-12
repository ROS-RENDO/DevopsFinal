#!/bin/bash
# =============================================================================
# Rate Limit Verification Script
# =============================================================================
# Purpose:  Verify that the login rate limiter (express-rate-limit) correctly
#           blocks requests after 5 attempts within a 15-minute window.
# Target:   POST /api/auth/login
# Expected: Requests 1-5 → HTTP 401 (invalid creds) or 200
#           Requests 6+  → HTTP 429 (Too Many Requests)
# =============================================================================

set -euo pipefail

# ── Configuration ────────────────────────────────────────────────────────────
BASE_URL="${BASE_URL:-http://localhost:3000}"
ENDPOINT="${BASE_URL}/api/auth/login"
MAX_REQUESTS=7        # Send more than the 5-request limit
RATE_LIMIT=5          # The configured max in rateLimiter.ts

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
CYAN='\033[0;36m'
NC='\033[0m' # No Color

echo ""
echo -e "${CYAN}╔══════════════════════════════════════════════════════════════╗${NC}"
echo -e "${CYAN}║           RATE LIMIT VERIFICATION TEST                     ║${NC}"
echo -e "${CYAN}╠══════════════════════════════════════════════════════════════╣${NC}"
echo -e "${CYAN}║  Target:   ${ENDPOINT}${NC}"
echo -e "${CYAN}║  Limit:    ${RATE_LIMIT} requests per 15-minute window      ║${NC}"
echo -e "${CYAN}║  Sending:  ${MAX_REQUESTS} requests                         ║${NC}"
echo -e "${CYAN}╚══════════════════════════════════════════════════════════════╝${NC}"
echo ""

PASS_COUNT=0
FAIL_COUNT=0
RATE_LIMITED=false

for i in $(seq 1 $MAX_REQUESTS); do
  # Send a login request with dummy credentials
  HTTP_CODE=$(curl -s -o /dev/null -w "%{http_code}" \
    -X POST "$ENDPOINT" \
    -H "Content-Type: application/json" \
    -d '{"email":"ratelimit-test@example.com","password":"wrongpassword"}')

  if [ "$i" -le "$RATE_LIMIT" ]; then
    # Requests within the limit should NOT be 429
    if [ "$HTTP_CODE" -ne 429 ]; then
      echo -e "  [${GREEN}PASS${NC}] Request #${i}: HTTP ${HTTP_CODE} (within limit, not rate-limited)"
      PASS_COUNT=$((PASS_COUNT + 1))
    else
      echo -e "  [${RED}FAIL${NC}] Request #${i}: HTTP ${HTTP_CODE} (rate-limited too early!)"
      FAIL_COUNT=$((FAIL_COUNT + 1))
    fi
  else
    # Requests beyond the limit SHOULD be 429
    if [ "$HTTP_CODE" -eq 429 ]; then
      echo -e "  [${GREEN}PASS${NC}] Request #${i}: HTTP ${HTTP_CODE} (correctly rate-limited)"
      PASS_COUNT=$((PASS_COUNT + 1))
      RATE_LIMITED=true
    else
      echo -e "  [${RED}FAIL${NC}] Request #${i}: HTTP ${HTTP_CODE} (should be 429, rate limiter NOT working!)"
      FAIL_COUNT=$((FAIL_COUNT + 1))
    fi
  fi
done

# ── Summary ──────────────────────────────────────────────────────────────────
echo ""
echo -e "${CYAN}──────────────────────────────────────────────────────────────${NC}"
echo -e "  Results:  ${GREEN}${PASS_COUNT} passed${NC}  |  ${RED}${FAIL_COUNT} failed${NC}"

if [ "$RATE_LIMITED" = true ] && [ "$FAIL_COUNT" -eq 0 ]; then
  echo -e "  Status:   ${GREEN}✓ RATE LIMITING IS WORKING CORRECTLY${NC}"
else
  echo -e "  Status:   ${RED}✗ RATE LIMITING MAY NOT BE CONFIGURED CORRECTLY${NC}"
fi

echo -e "${CYAN}──────────────────────────────────────────────────────────────${NC}"
echo ""
