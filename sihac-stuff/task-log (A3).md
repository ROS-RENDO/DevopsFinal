# Task Log: Implementing Zod Validation

## What is Zod?

Zod is a "schema declaration and validation library" for JavaScript and TypeScript. In simpler terms, it's a tool that lets you describe exactly what a piece of data *should* look like, and then check if the actual data matches that description.

Key features:
- **Schema Declaration:** You define strict rules for your data. For example, you can state: *"I expect an object containing an `email` field (which must be a valid email format) and a `password` field (which must be a string of at least 6 characters)."*
- **Validation (Parsing):** You take untrusted data (like a user's HTTP request) and pass it through the schema. 
- **Fail-Safe:** If the data matches the rules, Zod gives it a green light. If it fails, Zod immediately throws a detailed error explaining exactly which field was wrong and why (e.g., "password is too short", "email is missing").

Zod is the modern standard for implementing **Server-Side Allow-List Validation**. It ensures your application only processes expected data, preventing attackers from crashing your server or exploiting database vulnerabilities with malformed inputs.

---

## What We Did

We significantly upgraded the security and architecture of the application's authentication flow by implementing centralized input validation.

### 1. Created Generic Validation Middleware
- **File:** `src/middleware/validate.middleware.js`
- **Action:** We built a reusable Express middleware. Its sole job is to take a Zod schema, check the incoming request data (`req.body`, etc.) against it, and automatically return a `400 Bad Request` if the data is invalid. This acts as a protective shield for the entire application.

### 2. Defined Strict Schemas
- **File:** `src/schemas/auth.schemas.js`
- **Action:** We defined the exact "allow-list" rules for the `/register` and `/login` endpoints using Zod. By moving this into a separate file, we keep the routing logic clean and make the rules easy to maintain or expand in the future.

### 3. Applied Middleware to Routes
- **File:** `src/routes/auth.routes.js`
- **Action:** We injected the `validate` middleware into the route definitions. Now, every request to `/register` or `/login` must pass through the Zod checkpoint before reaching the core logic.

### 4. Cleaned Up Controllers
- **File:** `src/controllers/auth.controller.js`
- **Action:** We removed all the manual, repetitive `if (!email || !password)` checks. The controllers are now cleaner and purely focused on business logic (creating users, generating tokens), because they can safely trust that the incoming data is already valid.

---

## Task Log: Understanding XSS and Output Encoding with EJS

### What is XSS?
Cross-Site Scripting (XSS) is a vulnerability where untrusted data is injected into a web page without proper escaping, allowing attackers to execute malicious scripts in a user's browser.

### What We Did
We reviewed an educational demonstration page (`views/profile.ejs`) to observe how the EJS templating engine handles user input, specifically focusing on its defensive mechanisms against XSS.

### 1. Created Output Encoding Demo
- **File:** `views/profile.ejs`
- **Action:** We observed a profile view demonstrating the difference between safe and unsafe data rendering in EJS.

### 2. Demonstrated Safe Escaping (`<%= %>`)
- **Action:** We reviewed the use of `<%= %>` tags for rendering the user's bio. This is the default, safe method. EJS automatically HTML-escapes the content, converting dangerous characters like `<` and `>` into HTML entities. This neutralizes potential XSS payloads by rendering them as harmless plain text.

### 3. Highlighted Unsafe Rendering (`<%- %>`)
- **Action:** We reviewed a section demonstrating the `<%- %>` syntax. This tag tells EJS to render raw, unescaped HTML, which introduces a critical XSS vulnerability if used with untrusted user input, as it would execute any injected malicious scripts directly in the browser.

### References
- [What is EJS and why do I need it? (GeeksforGeeks)](https://www.geeksforgeeks.org/javascript/what-is-ejs-and-why-do-i-need-it/)
