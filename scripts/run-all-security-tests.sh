#!/bin/bash
# =============================================================================
# Security Test Suite — Master Runner
# =============================================================================
# Purpose:  Run all security verification tests in sequence.
#           Each test verifies that a defensive control is working correctly.
#
# Usage:    ./scripts/run-all-security-tests.sh
#           BASE_URL=http://localhost:3000 ./scripts/run-all-security-tests.sh
#
# Prerequisites:
#   - The backend must be running (docker compose up, or npm run dev)
#   - curl must be installed
#   - For the secure cookie test, a test user (testuser@example.com) must
#     exist in the database
# =============================================================================

set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"
BASE_URL="${BASE_URL:-http://localhost:3000}"

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
CYAN='\033[0;36m'
BOLD='\033[1m'
NC='\033[0m'

echo ""
echo -e "${BOLD}${CYAN}"
echo "  ╔══════════════════════════════════════════════════════════════╗"
echo "  ║                                                            ║"
echo "  ║          🔒  SECURITY VERIFICATION TEST SUITE  🔒          ║"
echo "  ║                                                            ║"
echo "  ║   Testing that your application's defenses are working     ║"
echo "  ║                                                            ║"
echo "  ╚══════════════════════════════════════════════════════════════╝"
echo -e "${NC}"
echo ""
echo -e "  ${CYAN}Backend URL:${NC} ${BASE_URL}"
echo ""

# ── Check that the backend is reachable ──────────────────────────────────────
echo -e "  ${CYAN}Checking backend connectivity...${NC}"
if curl -s -o /dev/null -w "%{http_code}" "${BASE_URL}/" | grep -q "200"; then
  echo -e "  ${GREEN}✓ Backend is reachable${NC}"
else
  echo -e "  ${RED}✗ Backend is not reachable at ${BASE_URL}${NC}"
  echo -e "  ${RED}  Make sure the server is running before running tests.${NC}"
  exit 1
fi

echo ""
echo -e "${BOLD}══════════════════════════════════════════════════════════════${NC}"

# ── Test 1: Rate Limiting ────────────────────────────────────────────────────
echo ""
echo -e "  ${BOLD}[1/5] Rate Limit Verification${NC}"
echo ""
BASE_URL="$BASE_URL" bash "$SCRIPT_DIR/test-rate-limit.sh"

# Wait a moment between tests
sleep 1

# ── Test 2: Secure Cookie ───────────────────────────────────────────────────
echo ""
echo -e "  ${BOLD}[2/5] Secure Cookie Verification${NC}"
echo ""
BASE_URL="$BASE_URL" bash "$SCRIPT_DIR/test-secure-cookie.sh"

sleep 1

# ── Test 3: Injection Prevention ────────────────────────────────────────────
echo ""
echo -e "  ${BOLD}[3/5] Injection Prevention Verification${NC}"
echo ""
BASE_URL="$BASE_URL" bash "$SCRIPT_DIR/test-injection-prevention.sh"

sleep 1

# ── Test 4: Brute Force Protection ──────────────────────────────────────────
echo ""
echo -e "  ${BOLD}[4/5] Brute Force Protection Verification${NC}"
echo ""
BASE_URL="$BASE_URL" bash "$SCRIPT_DIR/test-brute-force-protection.sh"

sleep 1

# ── Test 5: XSS Prevention ──────────────────────────────────────────────────
echo ""
echo -e "  ${BOLD}[5/5] XSS Prevention Verification${NC}"
echo ""
BASE_URL="$BASE_URL" bash "$SCRIPT_DIR/test-xss-prevention.sh"

# ── Final Summary ────────────────────────────────────────────────────────────
echo ""
echo -e "${BOLD}${CYAN}"
echo "  ╔══════════════════════════════════════════════════════════════╗"
echo "  ║                                                            ║"
echo "  ║          🔒  ALL SECURITY TESTS COMPLETE  🔒               ║"
echo "  ║                                                            ║"
echo "  ║   Review the results above to confirm your application's   ║"
echo "  ║   security controls are properly configured.               ║"
echo "  ║                                                            ║"
echo "  ╚══════════════════════════════════════════════════════════════╝"
echo -e "${NC}"
echo ""
