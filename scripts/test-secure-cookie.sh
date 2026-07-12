#!/bin/bash
# =============================================================================
# Secure Cookie Verification Script
# =============================================================================
# Purpose:  Verify that the refreshToken cookie set during login has all the
#           required security attributes: HttpOnly, Secure, SameSite=Strict.
# Target:   POST /api/auth/login (using the test bypass account)
# Expected: Set-Cookie header includes HttpOnly; Secure; SameSite=Strict
# =============================================================================

set -euo pipefail

# ── Configuration ────────────────────────────────────────────────────────────
BASE_URL="${BASE_URL:-http://localhost:3000}"
ENDPOINT="${BASE_URL}/api/auth/login"

# The test account that bypasses MFA (as configured in auth.controller.ts)
TEST_EMAIL="${TEST_EMAIL:-testuser@example.com}"
TEST_PASSWORD="${TEST_PASSWORD:-password123}"

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
CYAN='\033[0;36m'
NC='\033[0m'

echo ""
echo -e "${CYAN}╔══════════════════════════════════════════════════════════════╗${NC}"
echo -e "${CYAN}║           SECURE COOKIE VERIFICATION TEST                  ║${NC}"
echo -e "${CYAN}╠══════════════════════════════════════════════════════════════╣${NC}"
echo -e "${CYAN}║  Target: ${ENDPOINT}${NC}"
echo -e "${CYAN}║  Checks: HttpOnly, Secure, SameSite=Strict, Path=/        ║${NC}"
echo -e "${CYAN}╚══════════════════════════════════════════════════════════════╝${NC}"
echo ""

# ── Ensure the test user exists (Register first) ─────────────────────────
echo -e "  ${CYAN}Registering test user to ensure it exists...${NC}"
curl -s -o /dev/null \
  -X POST "${BASE_URL}/api/auth/register" \
  -H "Content-Type: application/json" \
  -d "{\"email\":\"${TEST_EMAIL}\",\"password\":\"${TEST_PASSWORD}\",\"name\":\"Test User\"}"

# ── Send login request and capture Set-Cookie headers ────────────────────────
RESPONSE=$(curl -s -D - -o /dev/null \
  -X POST "$ENDPOINT" \
  -H "Content-Type: application/json" \
  -d "{\"email\":\"${TEST_EMAIL}\",\"password\":\"${TEST_PASSWORD}\"}")

COOKIE_HEADER=$(echo "$RESPONSE" | grep -i "set-cookie" || true)

if [ -z "$COOKIE_HEADER" ]; then
  echo -e "  [${YELLOW}WARN${NC}] No Set-Cookie header found in response."
  echo -e "         This may happen if MFA is required (non-test account)."
  echo -e "         Make sure the test account (testuser@example.com) exists in the database."
  echo ""
  echo -e "  Full Response Headers:"
  echo "$RESPONSE" | head -20
  echo ""
  exit 1
fi

echo -e "  ${CYAN}Set-Cookie header received:${NC}"
echo -e "  $COOKIE_HEADER"
echo ""

# ── Check each security attribute ───────────────────────────────────────────
PASS_COUNT=0
FAIL_COUNT=0

check_attribute() {
  local attr="$1"
  local pattern="$2"
  
  if echo "$COOKIE_HEADER" | grep -iq "$pattern"; then
    echo -e "  [${GREEN}PASS${NC}] ${attr} attribute is present"
    PASS_COUNT=$((PASS_COUNT + 1))
  else
    echo -e "  [${RED}FAIL${NC}] ${attr} attribute is MISSING"
    FAIL_COUNT=$((FAIL_COUNT + 1))
  fi
}

echo -e "${CYAN}  Cookie Security Attribute Checks:${NC}"
echo ""

check_attribute "HttpOnly"           "httponly"
check_attribute "Secure"             "secure"
check_attribute "SameSite=Strict"    "samesite=strict"
check_attribute "Path=/"             "path=/"
check_attribute "refreshToken name"  "refreshtoken="

# ── Check for Max-Age or Expires ─────────────────────────────────────────────
if echo "$COOKIE_HEADER" | grep -iqE "(max-age|expires)"; then
  echo -e "  [${GREEN}PASS${NC}] Cookie expiration (Max-Age or Expires) is set"
  PASS_COUNT=$((PASS_COUNT + 1))
else
  echo -e "  [${RED}FAIL${NC}] Cookie expiration is NOT set (session cookie only)"
  FAIL_COUNT=$((FAIL_COUNT + 1))
fi

# ── Summary ──────────────────────────────────────────────────────────────────
echo ""
echo -e "${CYAN}──────────────────────────────────────────────────────────────${NC}"
echo -e "  Results:  ${GREEN}${PASS_COUNT} passed${NC}  |  ${RED}${FAIL_COUNT} failed${NC}"

if [ "$FAIL_COUNT" -eq 0 ]; then
  echo -e "  Status:   ${GREEN}✓ COOKIE SECURITY IS PROPERLY CONFIGURED${NC}"
else
  echo -e "  Status:   ${RED}✗ COOKIE SECURITY NEEDS ATTENTION${NC}"
fi

echo -e "${CYAN}──────────────────────────────────────────────────────────────${NC}"
echo ""
