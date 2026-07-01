/**
 * Brute Force Protection Test
 * 
 * This script simulates a real-world brute force attack against the login endpoint
 * using a list of commonly-used passwords. It verifies that the loginLimiter
 * rate limiter (defined in auth.controller.js) blocks requests after 5 attempts.
 *
 * Expected behavior:
 *   - Requests 1–5  → Allowed through (status !== 429)
 *   - Requests 6+   → Blocked with HTTP 429 (Too Many Requests)
 * 
 * Prerequisites: The server must be running on the configured port (default 5000).
 * 
 * Usage:  node tests/bruteforce.test.js
 */

const http = require('http');

const PORT = process.env.PORT || 5000;
const HOST = 'localhost';
const LOGIN_PATH = '/api/auth/login';
const MAX_ALLOWED = 5; // must match loginLimiter.max in auth.controller.js

// Common passwords used in real brute force attacks (sourced from known leaked-password lists)
const COMMON_PASSWORDS = [
  '123456',
  'password',
  '12345678',
  'qwerty',
  '123456789',
  '12345',
  '1234',
  '111111',
  '1234567',
  'dragon',
  '123123',
  'baseball',
  'abc123',
  'football',
  'monkey',
  'letmein',
  'shadow',
  'master',
  '666666',
  'qwertyuiop',
  '123321',
  'mustang',
  '1234567890',
  'michael',
  '654321',
  'superman',
  '1qaz2wsx',
  '7777777',
  '121212',
  '000000',
  'qazwsx',
  '123qwe',
  'killer',
  'trustno1',
  'jordan',
  'jennifer',
  'zxcvbnm',
  'asdfgh',
  'hunter',
  'buster',
  'soccer',
  'harley',
  'batman',
  'andrew',
  'tigger',
  'sunshine',
  'iloveyou',
  '2000',
  'charlie',
  'robert',
  'thomas',
  'hockey',
  'ranger',
  'daniel',
  'starwars',
  'klaster',
  '112233',
  'george',
  'computer',
  'michelle',
  'jessica',
  'pepper',
  '1111',
  'zxcvbn',
  '555555',
  '11111111',
  '131313',
  'freedom',
  '777777',
  'pass',
  'maggie',
  '159753',
  'aaaaaa',
  'ginger',
  'princess',
  'joshua',
  'cheese',
  'amanda',
  'summer',
  'love',
  'ashley',
  'nicole',
  'chelsea',
  'biteme',
  'matthew',
  'access',
  'yankees',
  '987654321',
  'dallas',
  'austin',
  'thunder',
  'taylor',
  'matrix',
  'admin',
  'admin123',
  'welcome',
  'welcome1',
  'passw0rd',
  'p@ssword',
  'p@ssw0rd',
  'abcd1234',
  'qwerty123',
  'test',
  'test123',
  'guest',
  'demo',
  'sample',
  'changeme',
  'secret',
  'god',
  'love123',
  'angel',
  'hello',
  'hello123',
  'master123',
  'root',
  'toor',
  'pass123',
  'pass1234'
];

// Target email for the simulated attack
const TARGET_EMAIL = 'victim@example.com';

// How many passwords to attempt (cap to a reasonable number for the test)
const TOTAL_ATTEMPTS = 8;

/**
 * Send a single POST login request with a given password
 */
function sendLogin(password) {
  const body = JSON.stringify({ email: TARGET_EMAIL, password });

  return new Promise((resolve, reject) => {
    const options = {
      hostname: HOST,
      port: PORT,
      path: LOGIN_PATH,
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Content-Length': Buffer.byteLength(body)
      }
    };

    const req = http.request(options, (res) => {
      let data = '';
      res.on('data', (chunk) => { data += chunk; });
      res.on('end', () => {
        let parsed;
        try { parsed = JSON.parse(data); } catch { parsed = data; }
        resolve({ status: res.statusCode, body: parsed });
      });
    });

    req.on('error', reject);
    req.write(body);
    req.end();
  });
}

/**
 * Main test runner
 */
async function runBruteForceTest() {
  console.log('='.repeat(60));
  console.log('  BRUTE FORCE PROTECTION TEST');
  console.log('='.repeat(60));
  console.log(`Target : http://${HOST}:${PORT}${LOGIN_PATH}`);
  console.log(`Victim : ${TARGET_EMAIL}`);
  console.log(`Limit  : ${MAX_ALLOWED} requests per 15-minute window`);
  console.log(`Sending: ${TOTAL_ATTEMPTS} login attempts with common passwords`);
  console.log('='.repeat(60));
  console.log('');

  let passed = true;

  for (let i = 0; i < TOTAL_ATTEMPTS; i++) {
    const attemptNum = i + 1;
    const password = COMMON_PASSWORDS[i % COMMON_PASSWORDS.length];

    try {
      const { status, body } = await sendLogin(password);

      const blocked = status === 429;
      const shouldBlock = attemptNum > MAX_ALLOWED;
      const ok = blocked === shouldBlock;

      const icon = ok ? '✅' : '❌';
      const statusLabel = blocked
        ? 'BLOCKED (429 Too Many Requests)'
        : `ALLOWED (${status})`;

      console.log(`  ${icon} Attempt #${attemptNum}  password="${password}"  →  ${statusLabel}`);

      if (blocked && body?.error) {
        console.log(`     └─ Server message: "${body.error}"`);
      }

      if (!ok) passed = false;
    } catch (err) {
      console.error(`  ❌ Attempt #${attemptNum}  password="${password}"  →  ERROR: ${err.message}`);
      passed = false;
    }
  }

  console.log('');
  console.log('='.repeat(60));

  if (passed) {
    console.log('  ✅ TEST PASSED — Rate limiter blocks brute force after ' + MAX_ALLOWED + ' attempts');
    console.log('  The loginLimiter in auth.controller.js is working correctly.');
  } else {
    console.log('  ❌ TEST FAILED — Rate limiter did not behave as expected');
    console.log('  Check loginLimiter config in auth.controller.js');
  }

  console.log('='.repeat(60));
  process.exit(passed ? 0 : 1);
}

runBruteForceTest();
