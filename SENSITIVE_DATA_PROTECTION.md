# Sensitive Data Protection

Overview of how sensitive data is hashed, encrypted, or protected using vetted algorithms in this application.

## Data at Rest

### Passwords

- **Algorithm**: bcrypt (Blowfish-based adaptive hash)
- **Salt Rounds**: 10
- **Implementation**: Passwords are hashed with `bcrypt.hash()` before being stored in the database. During login, `bcrypt.compare()` verifies the plaintext password against the stored hash.
- **File**: `backend/src/controllers/auth.controller.ts` (lines 32–33)

### JWT Access Token

- **Algorithm**: HMAC-SHA256 (HS256)
- **Expiry**: 15 minutes
- **Purpose**: Authenticates API requests. Signed with `JWT_SECRET` from environment variables.
- **File**: `backend/src/controllers/auth.controller.ts` (lines 6–11)

### JWT Refresh Token

- **Algorithm**: HMAC-SHA256 (HS256)
- **Expiry**: 7 days
- **Storage**: Stored in a HttpOnly, Secure, SameSite=Strict cookie on the client side. Also stored in the database for server-side validation.
- **Purpose**: Used to obtain new access tokens without re-authentication.
- **File**: `backend/src/controllers/auth.controller.ts` (lines 13–18)

## Data in Transit

### TLS/HTTPS (Nginx Reverse Proxy)

- **Protocol**: TLS 1.2 / TLS 1.3
- **Certificate**: RSA 2048-bit (self-signed for development)
- **Implementation**: Nginx terminates TLS on port 443 and proxies to the backend over the internal Docker network. All HTTP traffic on port 80 is redirected to HTTPS (301).
- **Files**: `nginx/Dockerfile`, `nginx/nginx.conf`

### Security Headers (via Nginx)

| Header | Value | Purpose |
|--------|-------|---------|
| `Strict-Transport-Security` | `max-age=31536000; includeSubDomains` | Forces HTTPS for 1 year (HSTS) |
| `X-Frame-Options` | `SAMEORIGIN` | Prevents clickjacking |
| `X-Content-Type-Options` | `nosniff` | Prevents MIME-type sniffing |
| `X-XSS-Protection` | `1; mode=block` | Enables browser XSS filter |
| `Referrer-Policy` | `strict-origin-when-cross-origin` | Controls referrer information |

## Summary Table

| Sensitive Data | Protection Method | Algorithm | Status |
|----------------|-------------------|-----------|--------|
| User passwords | Hashed (one-way) | bcrypt (10 salt rounds) | ✅ Protected |
| JWT access token | Signed | HMAC-SHA256 (HS256) | ✅ Protected |
| JWT refresh token | Signed + HttpOnly cookie | HMAC-SHA256 (HS256) | ✅ Protected |
| Data in transit | Encrypted | TLS 1.2/1.3 (RSA-2048) | ✅ Protected |
| JWT secrets | Environment variables | N/A | ✅ Stored in `.env` |
| Database credentials | Environment variables | N/A | ✅ Stored in `.env` |
