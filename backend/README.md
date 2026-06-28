# Devops Final - Backend Features

## A2: Secure Authentication & Session Management

This backend implementation successfully fulfills the requirements for the **A2** grading criteria (Secure Authentication & Session Management):

### 1. Passwords Stored Safely
- **Implementation:** Passwords are never stored in plaintext. They are hashed using a slow adaptive hash.
- **Demonstration:** You can see the hashing call `bcrypt.hash(password, 10)` inside `src/controllers/auth.controller.js`. When checking your SQLite database, you will see a fully hashed string for the password column.

### 2. Secure Session Cookie
- **Implementation:** The JWT token is no longer just returned in the JSON payload; it is set securely in the user's browser.
- **Demonstration:** `cookie-parser` is installed and `auth.controller.js` sets the JWT in an `httpOnly`, `sameSite`, and `secure` cookie that expires in 1 day. The `/logout` endpoint successfully clears this cookie, terminating the session. The `verifyToken` middleware automatically reads from this secure cookie.

### 3. Server-Side Authorization (Live 403)
- **Implementation:** Identity is established safely, and being logged in does not mean being allowed to do everything (default-deny approach).
- **Demonstration:** The `roleMiddleware` is active on routes in `src/routes/role.routes.js`. To demonstrate a live 403, log in as a `customer` and attempt to send a POST request to the restricted `/api/roles/company/staff` endpoint. You will be blocked with a clear `403 Forbidden` response.

### 4. Brute-Force Protection
- **Implementation:** The backend actively defends against brute-force and enumeration attacks.
- **Demonstration:** `express-rate-limit` is applied directly to the `/api/auth/login` route. It strictly allows a maximum of 5 login attempts per 15-minute window per IP address. Exceeding this limit returns a `429 Too Many Requests` error.