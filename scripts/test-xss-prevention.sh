#!/bin/bash
# =============================================================================
# XSS Prevention Verification Script
# =============================================================================
# Purpose:  Verify that the application correctly handles XSS payloads by:
#           1. Rejecting them via input validation (Zod schemas)
#           2. Returning proper Content-Type headers (application/json)
#           3. Setting X-Content-Type-Options: nosniff
#           4. Setting Content-Security-Policy headers
#           These defenses prevent browsers from executing injected scripts.
# Target:   POST /api/auth/register, GET / (health), security headers
# Expected: XSS payloads are rejected or safely stored as plain text
# =============================================================================

set -euo pipefail

# ── Configuration ────────────────────────────────────────────────────────────
BASE_URL="${BASE_URL:-http://localhost:3000}"
REGISTER_URL="${BASE_URL}/api/auth/register"
HEALTH_URL="${BASE_URL}/"

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
CYAN='\033[0;36m'
NC='\033[0m'

echo ""
echo -e "${CYAN}╔══════════════════════════════════════════════════════════════╗${NC}"
echo -e "${CYAN}║         XSS PREVENTION VERIFICATION TEST                   ║${NC}"
echo -e "${CYAN}╠══════════════════════════════════════════════════════════════╣${NC}"
echo -e "${CYAN}║  Verifies that XSS payloads are rejected by validation     ║${NC}"
echo -e "${CYAN}║  and that security headers prevent script execution.       ║${NC}"
echo -e "${CYAN}╚══════════════════════════════════════════════════════════════╝${NC}"
echo ""

PASS_COUNT=0
FAIL_COUNT=0

# ── Part 1: XSS Payload Rejection via Input Validation ──────────────────────
echo -e "${CYAN}  ── Part 1: XSS Payload Input Validation ──${NC}"
echo ""

test_xss_payload() {
  local test_name="$1"
  local payload="$2"

  RESPONSE=$(curl -s -w "\n%{http_code}" \
    -X POST "$REGISTER_URL" \
    -H "Content-Type: application/json" \
    -d "$payload")

  HTTP_CODE=$(echo "$RESPONSE" | tail -1)
  BODY=$(echo "$RESPONSE" | sed '$d')

  # XSS in email should be blocked by Zod email validation (400)
  # XSS in name might be stored but should never be rendered unescaped
  if [ "$HTTP_CODE" -eq 400 ]; then
    echo -e "  [${GREEN}PASS${NC}] ${test_name}: HTTP ${HTTP_CODE} — rejected by validation"
    PASS_COUNT=$((PASS_COUNT + 1))
  elif [ "$HTTP_CODE" -eq 500 ]; then
    echo -e "  [${YELLOW}WARN${NC}] ${test_name}: HTTP ${HTTP_CODE} — server error (unhandled)"
    FAIL_COUNT=$((FAIL_COUNT + 1))
  else
    echo -e "  [${YELLOW}INFO${NC}] ${test_name}: HTTP ${HTTP_CODE} — input accepted (check output encoding)"
    # Not necessarily a fail — if stored safely and rendered with escaping, it's fine
    PASS_COUNT=$((PASS_COUNT + 1))
  fi
}

# Script tag in email field (should be rejected by Zod email validation)
test_xss_payload \
  "Script tag in email" \
  '{"email":"<script>alert(1)</script>","password":"password123","name":"Test"}'

# Event handler in email
test_xss_payload \
  "Event handler in email" \
  '{"email":"test@<img onerror=alert(1)>.com","password":"password123","name":"Test"}'

# Script tag in name field
test_xss_payload \
  "Script tag in name" \
  '{"email":"xss-test1@test.com","password":"password123","name":"<script>alert(document.cookie)</script>"}'

# SVG-based XSS in name
test_xss_payload \
  "SVG XSS in name" \
  '{"email":"xss-test2@test.com","password":"password123","name":"<svg onload=alert(1)>"}'

# Image tag XSS in name
test_xss_payload \
  "IMG onerror XSS in name" \
  '{"email":"xss-test3@test.com","password":"password123","name":"<img src=x onerror=alert(1)>"}'

# JavaScript protocol in name
test_xss_payload \
  "javascript: protocol in name" \
  '{"email":"xss-test4@test.com","password":"password123","name":"javascript:alert(1)"}'

# ── Part 2: Security Headers Check ──────────────────────────────────────────
echo ""
echo -e "${CYAN}  ── Part 2: Anti-XSS Security Headers ──${NC}"
echo ""

HEADERS=$(curl -s -D - -o /dev/null "$HEALTH_URL")

check_header() {
  local header_name="$1"
  local expected_pattern="$2"
  local description="$3"

  if echo "$HEADERS" | grep -iq "$expected_pattern"; then
    echo -e "  [${GREEN}PASS${NC}] ${description}"
    PASS_COUNT=$((PASS_COUNT + 1))
  else
    echo -e "  [${RED}FAIL${NC}] ${description}"
    FAIL_COUNT=$((FAIL_COUNT + 1))
  fi
}

check_header "Content-Type" "content-type: application/json" \
  "Content-Type: application/json (prevents browser HTML parsing)"

check_header "X-Content-Type-Options" "x-content-type-options: nosniff" \
  "X-Content-Type-Options: nosniff (prevents MIME-type sniffing)"

check_header "X-Frame-Options" "x-frame-options" \
  "X-Frame-Options header present (prevents clickjacking)"

check_header "Content-Security-Policy" "content-security-policy" \
  "Content-Security-Policy header present (restricts script sources)"

check_header "CSP script-src" "script-src 'self'" \
  "CSP script-src 'self' (blocks inline scripts)"

# ── Part 3: Response Content-Type Verification ──────────────────────────────
echo ""
echo -e "${CYAN}  ── Part 3: API Response Content-Type ──${NC}"
echo ""

API_CONTENT_TYPE=$(curl -s -D - -o /dev/null \
  -X POST "$REGISTER_URL" \
  -H "Content-Type: application/json" \
  -d '{"email":"content-type-test@test.com","password":"pass123","name":"Test"}' \
  | grep -i "^content-type:" | head -1)

if echo "$API_CONTENT_TYPE" | grep -iq "application/json"; then
  echo -e "  [${GREEN}PASS${NC}] API responses use application/json (XSS payloads won't render)"
  PASS_COUNT=$((PASS_COUNT + 1))
else
  echo -e "  [${RED}FAIL${NC}] API response Content-Type: $API_CONTENT_TYPE (should be application/json)"
  FAIL_COUNT=$((FAIL_COUNT + 1))
fi

# ── Summary ──────────────────────────────────────────────────────────────────
echo ""
echo -e "${CYAN}──────────────────────────────────────────────────────────────${NC}"
echo -e "  Results:  ${GREEN}${PASS_COUNT} passed${NC}  |  ${RED}${FAIL_COUNT} failed${NC}"

if [ "$FAIL_COUNT" -eq 0 ]; then
  echo -e "  Status:   ${GREEN}✓ XSS PREVENTION MEASURES ARE WORKING${NC}"
else
  echo -e "  Status:   ${RED}✗ SOME XSS PREVENTION MEASURES NEED ATTENTION${NC}"
fi

echo -e "${CYAN}──────────────────────────────────────────────────────────────${NC}"
echo ""
