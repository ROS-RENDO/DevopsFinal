#!/bin/bash
# =============================================================================
# Brute Force Protection Verification Script
# =============================================================================
# Purpose:  Verify that the application's rate limiter blocks repeated login
#           attempts with different passwords for the same account, simulating
#           what a brute-force attack would look like — and confirming the
#           defense STOPS it.
# Target:   POST /api/auth/login
# Expected: After 5 attempts, the server returns HTTP 429 (Too Many Requests)
# =============================================================================

set -euo pipefail

# ── Configuration ────────────────────────────────────────────────────────────
BASE_URL="${BASE_URL:-http://localhost:3000}"
ENDPOINT="${BASE_URL}/api/auth/login"
TARGET_EMAIL="${TARGET_EMAIL:-bruteforce-test@example.com}"
MAX_ATTEMPTS=10       # Try 10 different passwords
RATE_LIMIT=5          # The configured max in rateLimiter.ts

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
CYAN='\033[0;36m'
NC='\033[0m'

echo ""
echo -e "${CYAN}╔══════════════════════════════════════════════════════════════╗${NC}"
echo -e "${CYAN}║      BRUTE FORCE PROTECTION VERIFICATION TEST              ║${NC}"
echo -e "${CYAN}╠══════════════════════════════════════════════════════════════╣${NC}"
echo -e "${CYAN}║  Verifies that repeated login attempts are blocked after   ║${NC}"
echo -e "${CYAN}║  exceeding the rate limit (${RATE_LIMIT} attempts / 15 min).             ║${NC}"
echo -e "${CYAN}║  Target:  ${TARGET_EMAIL}${NC}"
echo -e "${CYAN}╚══════════════════════════════════════════════════════════════╝${NC}"
echo ""

PASS_COUNT=0
FAIL_COUNT=0
BLOCKED_AT=0

# Common weak passwords to cycle through (for testing that they're all blocked)
PASSWORDS=(
  "password"
  "123456"
  "password123"
  "admin"
  "letmein"
  "welcome"
  "monkey"
  "dragon"
  "master"
  "qwerty"
)

echo -e "${CYAN}  ── Sending ${MAX_ATTEMPTS} login attempts ──${NC}"
echo ""

for i in $(seq 1 $MAX_ATTEMPTS); do
  PWD_INDEX=$(( (i - 1) % ${#PASSWORDS[@]} ))
  CURRENT_PWD="${PASSWORDS[$PWD_INDEX]}"

  HTTP_CODE=$(curl -s -o /dev/null -w "%{http_code}" \
    -X POST "$ENDPOINT" \
    -H "Content-Type: application/json" \
    -d "{\"email\":\"${TARGET_EMAIL}\",\"password\":\"${CURRENT_PWD}\"}")

  if [ "$HTTP_CODE" -eq 429 ]; then
    if [ "$BLOCKED_AT" -eq 0 ]; then
      BLOCKED_AT=$i
    fi
    echo -e "  [${GREEN}BLOCKED${NC}] Attempt #${i} (pwd: ${CURRENT_PWD}): HTTP ${HTTP_CODE} — rate-limited ✓"
    PASS_COUNT=$((PASS_COUNT + 1))
  elif [ "$i" -le "$RATE_LIMIT" ]; then
    echo -e "  [${CYAN}ALLOW${NC}]   Attempt #${i} (pwd: ${CURRENT_PWD}): HTTP ${HTTP_CODE} — within limit"
    PASS_COUNT=$((PASS_COUNT + 1))
  else
    echo -e "  [${RED}FAIL${NC}]    Attempt #${i} (pwd: ${CURRENT_PWD}): HTTP ${HTTP_CODE} — should be 429!"
    FAIL_COUNT=$((FAIL_COUNT + 1))
  fi
done

# ── Summary ──────────────────────────────────────────────────────────────────
echo ""
echo -e "${CYAN}──────────────────────────────────────────────────────────────${NC}"
echo -e "  Results:  ${GREEN}${PASS_COUNT} passed${NC}  |  ${RED}${FAIL_COUNT} failed${NC}"

if [ "$BLOCKED_AT" -gt 0 ]; then
  echo -e "  Blocked:  Rate limiter activated at attempt #${BLOCKED_AT}"
fi

if [ "$FAIL_COUNT" -eq 0 ] && [ "$BLOCKED_AT" -gt 0 ]; then
  echo -e "  Status:   ${GREEN}✓ BRUTE FORCE PROTECTION IS WORKING CORRECTLY${NC}"
  echo -e "            Accounts are protected after ${RATE_LIMIT} failed attempts."
else
  echo -e "  Status:   ${RED}✗ BRUTE FORCE PROTECTION MAY NOT BE WORKING${NC}"
  echo -e "            The rate limiter did not block excessive login attempts."
fi

echo -e "${CYAN}──────────────────────────────────────────────────────────────${NC}"
echo ""
