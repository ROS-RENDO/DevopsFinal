#!/bin/bash
# =============================================================================
# Injection Prevention Verification Script
# =============================================================================
# Purpose:  Verify that the application's Zod validation and Prisma ORM
#           correctly reject or sanitize common injection payloads.
#           This script tests that defenses ARE WORKING — every malicious
#           payload should be REJECTED by the server.
# Target:   POST /api/auth/register, POST /api/auth/login
# Expected: All injection attempts → HTTP 400 (validation error) or safe response
# =============================================================================

set -euo pipefail

# ── Configuration ────────────────────────────────────────────────────────────
BASE_URL="${BASE_URL:-http://localhost:3000}"
REGISTER_URL="${BASE_URL}/api/auth/register"
LOGIN_URL="${BASE_URL}/api/auth/login"

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
CYAN='\033[0;36m'
NC='\033[0m'

echo ""
echo -e "${CYAN}╔══════════════════════════════════════════════════════════════╗${NC}"
echo -e "${CYAN}║       INJECTION PREVENTION VERIFICATION TEST               ║${NC}"
echo -e "${CYAN}╠══════════════════════════════════════════════════════════════╣${NC}"
echo -e "${CYAN}║  Verifies that Zod validation + Prisma ORM reject          ║${NC}"
echo -e "${CYAN}║  malformed inputs. All payloads SHOULD be blocked.         ║${NC}"
echo -e "${CYAN}╚══════════════════════════════════════════════════════════════╝${NC}"
echo ""

PASS_COUNT=0
FAIL_COUNT=0

# Helper: send a request and check that it returns 400 (validation error)
# or does NOT return 200/201 (which would mean the payload was accepted)
test_injection() {
  local test_name="$1"
  local url="$2"
  local payload="$3"
  local expected_blocked="${4:-true}"

  HTTP_CODE=$(curl -s -o /dev/null -w "%{http_code}" \
    -X POST "$url" \
    -H "Content-Type: application/json" \
    -d "$payload")

  if [ "$expected_blocked" = "true" ]; then
    # Payload should be rejected (400, 401, 422, etc. — anything but 200/201/500)
    if [ "$HTTP_CODE" -eq 200 ] || [ "$HTTP_CODE" -eq 201 ]; then
      echo -e "  [${RED}FAIL${NC}] ${test_name}: HTTP ${HTTP_CODE} — payload was ACCEPTED (should be blocked!)"
      FAIL_COUNT=$((FAIL_COUNT + 1))
    elif [ "$HTTP_CODE" -eq 500 ]; then
      echo -e "  [${YELLOW}WARN${NC}] ${test_name}: HTTP ${HTTP_CODE} — server error (unhandled input)"
      FAIL_COUNT=$((FAIL_COUNT + 1))
    else
      echo -e "  [${GREEN}PASS${NC}] ${test_name}: HTTP ${HTTP_CODE} — payload correctly rejected"
      PASS_COUNT=$((PASS_COUNT + 1))
    fi
  fi
}

# ── Test 1: SQL Injection in email field (login) ────────────────────────────
echo -e "${CYAN}  ── SQL Injection Tests ──${NC}"
echo ""

test_injection \
  "SQL injection in email (OR 1=1)" \
  "$LOGIN_URL" \
  '{"email":"admin@test.com'\'' OR 1=1 --","password":"anything"}'

test_injection \
  "SQL injection in email (UNION SELECT)" \
  "$LOGIN_URL" \
  '{"email":"x'\'' UNION SELECT * FROM users --","password":"anything"}'

test_injection \
  "SQL injection in password" \
  "$LOGIN_URL" \
  '{"email":"test@test.com","password":"'\'' OR '\''1'\''='\''1"}'

# ── Test 2: NoSQL Injection ─────────────────────────────────────────────────
echo ""
echo -e "${CYAN}  ── NoSQL Injection Tests ──${NC}"
echo ""

test_injection \
  "NoSQL injection (\$gt operator)" \
  "$LOGIN_URL" \
  '{"email":{"$gt":""},"password":"anything"}'

test_injection \
  "NoSQL injection (\$ne operator)" \
  "$LOGIN_URL" \
  '{"email":{"$ne":""},"password":{"$ne":""}}'

# ── Test 3: Command Injection ───────────────────────────────────────────────
echo ""
echo -e "${CYAN}  ── Command Injection Tests ──${NC}"
echo ""

test_injection \
  "Command injection in name field" \
  "$REGISTER_URL" \
  '{"email":"cmd-test@test.com","password":"password123","name":"; ls -la /etc/passwd"}'

test_injection \
  "Command injection with backticks" \
  "$REGISTER_URL" \
  '{"email":"cmd-test2@test.com","password":"password123","name":"`cat /etc/passwd`"}'

# ── Test 4: Invalid email format ────────────────────────────────────────────
echo ""
echo -e "${CYAN}  ── Input Validation Tests ──${NC}"
echo ""

test_injection \
  "Invalid email format (no @)" \
  "$LOGIN_URL" \
  '{"email":"not-an-email","password":"password123"}'

test_injection \
  "Empty email" \
  "$LOGIN_URL" \
  '{"email":"","password":"password123"}'

test_injection \
  "Empty password" \
  "$LOGIN_URL" \
  '{"email":"test@test.com","password":""}'

test_injection \
  "Missing email field" \
  "$LOGIN_URL" \
  '{"password":"password123"}'

test_injection \
  "Missing password field" \
  "$LOGIN_URL" \
  '{"email":"test@test.com"}'

# ── Test 5: Role manipulation ───────────────────────────────────────────────
echo ""
echo -e "${CYAN}  ── Role Manipulation Tests ──${NC}"
echo ""

test_injection \
  "Role escalation (superadmin)" \
  "$REGISTER_URL" \
  '{"email":"roletest@test.com","password":"password123","name":"Test","role":"superadmin"}'

test_injection \
  "Role escalation (root)" \
  "$REGISTER_URL" \
  '{"email":"roletest2@test.com","password":"password123","name":"Test","role":"root"}'

# ── Summary ──────────────────────────────────────────────────────────────────
echo ""
echo -e "${CYAN}──────────────────────────────────────────────────────────────${NC}"
echo -e "  Results:  ${GREEN}${PASS_COUNT} passed${NC}  |  ${RED}${FAIL_COUNT} failed${NC}"

if [ "$FAIL_COUNT" -eq 0 ]; then
  echo -e "  Status:   ${GREEN}✓ INPUT VALIDATION & INJECTION PREVENTION WORKING${NC}"
else
  echo -e "  Status:   ${RED}✗ SOME INJECTION PAYLOADS WERE NOT PROPERLY HANDLED${NC}"
fi

echo -e "${CYAN}──────────────────────────────────────────────────────────────${NC}"
echo ""
