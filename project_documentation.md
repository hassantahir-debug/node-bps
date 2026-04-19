# BPS Node.js Backend: Deep-Dive Interview Guide (Senior Level)

This document breaks down the codebase line-by-line, focusing on the "Why" and "How" behind the architectural decisions. It is designed to prepare you for rigorous senior-level code reviews and technical interviews.

---

## 1. Database Configuration & Connection (`src/config/db.js`)

**The Code:**
```javascript
const testConnection = async () => {
  try {
    await sequelize.authenticate();
    console.log("Successfully connected to MySQL via Sequelize!");
  } catch (error) {
    console.error("Unable to connect to the database:", error.message);
    process.exit(1); // <-- Why do we do this?
  }
};
```

### 🧠 Senior Interview Questions:

**Q: What exactly does `process.exit(1)` do here, and why is it necessary?**
> **Answer:** `process.exit(1)` forces the Node.js application to shut down immediately. The `1` signifies an "Uncaught Fatal Exception" (a failure code). If we pass `0`, it means a clean, successful exit. 
> **Why we use it:** Our entire backend depends on the database to function (auth, user data, NF2 records). If the database is down or credentials are wrong on startup, there is no point in keeping the Express server running just to serve 500 errors to every user. Shutting down the process signals to our process manager (like PM2 or Docker) that the app failed to boot, allowing the manager to log the critical failure or attempt a restart.

**Q: In Sequelize, what does `underscored: true` do?**
> **Answer:** By default, JavaScript uses `camelCase` (e.g., `createdAt`), but SQL databases typically use `snake_case` (e.g., `created_at`). Setting `underscored: true` automatically bridges this gap, saving us from writing mapping logic for every single column.

---

## 2. The `asyncHandler` Utility (`src/utils/asyncHandler.js`)

**The Code:**
```javascript
export const asyncHandler = (fn) => async (req, res, next) => {
  try {
     await fn(req, res, next);
  } catch (error) {
    next(error); // <-- Where does this go?
  }
};
```

### 🧠 Senior Interview Questions:

**Q: Why do we need this wrapper? Doesn't Express handle errors?**
> **Answer:** In Express v4, synchronous errors are caught automatically, but **asynchronous errors (inside promises) are not**. If a database query fails inside an `async` route and we don't have a `try/catch`, the promise rejects silently, the request hangs forever, and the user gets a spinning loading wheel. This wrapper ensures *every* async error is caught.

**Q: When you call `next(error)`, what happens?**
> **Answer:** In Express, calling `next()` with an argument tells the framework: "Stop the normal route execution and jump straight to the Error Handling Middleware." This error goes directly to the `app.use((err, req, res, next) => {...})` block in `app.js`, allowing us to handle all errors in one centralized place.

---

## 3. Zod Validation Middleware (`src/middleware/validate.middleware.js`)

**The Code:**
```javascript
export const validate = (schema) => (req, res, next) => {
  try {
    schema.parse({ body: req.body, query: req.query, params: req.params });
    next();
  } catch (error) {
    // Return 400 Bad Request...
  }
};
```

### 🧠 Senior Interview Questions:

**Q: Why do you validate at the middleware level instead of inside the Controller?**
> **Answer:** **Separation of Concerns (SoC).** The controller's job is business logic (saving a user, generating a PDF). It should not care about checking if an email has an `@` symbol. By validating in the middleware, we guarantee that the controller *only* receives 100% clean, valid data. It also keeps the controllers thin and readable.

**Q: In your Zod schemas, what is the exact difference between `createUserSchema` and `.partial()` in `updateUserSchema`?**
> **Answer:** When creating a user, fields like `name` and `password` are strictly required. When updating (`PUT` or `PATCH`), the client might only want to update the `name` and leave the `password` alone. By using `userSchema.partial()`, Zod takes all the strict rules (like `.email()`, `.min(6)`) and makes the *presence* of the field optional. If the field is missing, it passes. But if the field is provided, it *must* still follow the rules (e.g., you can't send an empty string for the email).

---

## 4. Authentication & Security (`auth.controller.js`)

**The Code:**
```javascript
res.cookie("token", token, {
  httpOnly: true,
  maxAge: 30 * 24 * 60 * 60 * 1000,
  sameSite: "lax",
  secure: false, // In prod, this should be true
});
```

### 🧠 Senior Interview Questions:

**Q: Why are we sending the JWT in an `httpOnly` cookie instead of just returning it in the JSON response?**
> **Answer:** Security against **XSS (Cross-Site Scripting)**. If we return the token in JSON, the frontend usually stores it in `localStorage`. If a hacker injects malicious JavaScript into our site, they can easily read `localStorage` and steal the token. An `httpOnly` cookie is invisible to JavaScript (`document.cookie` won't show it). The browser automatically attaches it to every request, keeping it safe from XSS.

**Q: What does `sameSite: "lax"` do?**
> **Answer:** It protects against **CSRF (Cross-Site Request Forgery)** attacks. `lax` means the cookie will only be sent to our server if the request originates from the same domain, or if the user is clicking a top-level link to our site. It prevents malicious websites from making forged POST requests on behalf of our logged-in user.

**Q: What is the difference between Hashing and Salting? (Regarding `bcryptjs`)**
> **Answer:** 
> - **Hashing** is a one-way mathematical function that turns "password123" into a scrambled string. You can't reverse it.
> - **Salting** is adding random text to the password *before* hashing it. If two users have the password "password123", without a salt, their hashes would be identical (allowing hackers to use pre-calculated "Rainbow Tables"). A salt ensures that identical passwords result in completely different hashes. `bcrypt` handles salting automatically.

---

## 5. PDF Generation & Streams (`documentController.js`)

**The Code:**
```javascript
const pdfStream = Readable.from(pdfBuffer);
pdfStream.pipe(res).on("end", () => res.end());
```

### 🧠 Senior Interview Questions:

**Q: Why use `pdfStream.pipe(res)` instead of just `res.send(pdfBuffer)`?**
> **Answer:** Memory Management and Performance. If a PDF is very large (e.g., 50MB), `res.send(pdfBuffer)` loads the entire 50MB into the Node.js RAM before sending it to the client. If 100 users request a PDF at the same time, the server could crash from Out Of Memory (OOM). 
> **Streams** (`.pipe`) break the file into small chunks. Node reads a small chunk, sends it to the client, flushes it from RAM, and reads the next chunk. This keeps memory usage completely flat, making the application highly scalable.

**Q: Why use Playwright (a browser) to generate a PDF on the backend?**
> **Answer:** Standard PDF libraries (like PDFKit) require you to write complex code to draw lines, text, and tables manually using X/Y coordinates. Playwright allows us to use standard HTML, CSS (Flexbox, Grid), and EJS templating. It spins up a headless Chromium browser, renders the HTML perfectly, and prints it. It is vastly superior for complex, highly-styled layouts like medical invoices.

---

## 6. JWT Utility (`src/utils/jwt.js`)

**The Code:**
```javascript
if (!process.env.JWT_SECRET) {
  console.error("JWT_SECRET is not defined in the environment variables.");
  process.exit(1);
}
const JWT_SECRET = process.env.JWT_SECRET;

const generateToken = (user) => {
  const payload = { id: user.id, email: user.email, role: user.role };
  return jwt.sign(payload, JWT_SECRET, { expiresIn: "2h" });
};

const verifyToken = (token) => {
  try {
    return jwt.verify(token, JWT_SECRET);
  } catch (error) {
    throw new Error("Invalid token");
  }
};
```

### 🧠 Senior Interview Questions:

**Q: Why do we check `!process.env.JWT_SECRET` at the top and call `process.exit(1)`?**
> **Answer:** This is a "fail fast" pattern. Without a JWT_SECRET, we cannot sign or verify any token. The entire auth system would be broken. By crashing immediately at startup, we force the developer to fix the `.env` file before the server can even boot. This prevents a situation where the server runs for hours accepting logins that silently fail.

**Q: What does `jwt.sign(payload, secret, { expiresIn: "2h" })` do exactly?**
> **Answer:** It creates a JWT token containing 3 parts separated by dots:
> - **Header:** Algorithm used (HS256) and token type (JWT).
> - **Payload:** The data we passed (id, email, role). This is Base64 encoded, NOT encrypted — anyone can read it. Never put passwords here.
> - **Signature:** A hash of (header + payload + secret). This is how the server verifies the token hasn't been tampered with.
> The `expiresIn: "2h"` adds an `exp` (expiration) field to the payload. After 2 hours, `jwt.verify()` will throw a `TokenExpiredError`.

**Q: What is the difference between `jwt.sign()` and `jwt.verify()`?**
> **Answer:** `sign()` creates a new token. `verify()` takes an existing token and checks two things: (1) Has the token been tampered with? (checks the signature using the secret). (2) Has the token expired? (checks the `exp` field). If either check fails, it throws an error.

**Q: Why do we only put `id`, `email`, and `role` in the payload? Why not the whole user object?**
> **Answer:** Two reasons: (1) **Size** — JWT is sent with every single HTTP request inside a cookie. A large payload means more bandwidth wasted on every request. (2) **Security** — The payload is Base64 encoded, not encrypted. Anyone can decode it and read the contents. We never want to expose sensitive data like passwords or personal details.

---

## 7. Auth Middleware (`src/middleware/auth.middleware.js`)

**The Code:**
```javascript
const checkToken = (req, res, next) => {
  const token = req.cookies.token;
  try {
    const decoded = verifyToken(token);
    req.user = decoded;
    next();
  } catch (error) {
    if (error.name === "TokenExpiredError") {
      return res.status(401).json({ message: "Unauthorized: Token expired" });
    }
    return res.status(401).json({ message: "Unauthorized: Invalid token" });
  }
};
```

### 🧠 Senior Interview Questions:

**Q: What does `req.user = decoded` do and why is it important?**
> **Answer:** After verifying the token, `decoded` contains `{ id, email, role }`. By attaching it to `req.user`, we make the user's identity available to ALL subsequent middleware and controllers in the chain. For example, the `checkRole` middleware reads `req.user.role`, and the `getME` controller reads `req.user.id`. Without this line, no downstream function would know who is making the request.

**Q: Why do we check `error.name === "TokenExpiredError"` separately?**
> **Answer:** To give the frontend specific information. If the token is expired, the frontend can redirect the user to the login page with a "Session expired, please login again" message. If the token is invalid (tampered or corrupted), it's a different scenario — possibly a security threat. Differentiating helps the frontend handle each case appropriately.

**Q: Why is `checkToken` NOT an `async` function?**
> **Answer:** Because `jwt.verify()` is a synchronous operation. It doesn't query a database or make any network call. It just does a mathematical hash comparison in memory, which is instant. There's no need for `async/await` here.

**Q: What is the difference between status `401` and `403`?**
> **Answer:** `401 Unauthorized` means "I don't know who you are" (no token or invalid token). `403 Forbidden` means "I know who you are, but you don't have permission" (valid token, wrong role). Our `checkToken` returns 401, and `checkRole` returns 403.

---

## 8. Role Middleware — RBAC (`src/middleware/role.middleware.js`)

**The Code:**
```javascript
const checkRole = (roles = []) => {
  return (req, res, next) => {
    const userRole = req.user.role;
    if (roles.length > 0 && !roles.includes(userRole)) {
      return res.status(403).json({ message: "Forbidden: Insufficient role" });
    }
    next();
  };
};
```

### 🧠 Senior Interview Questions:

**Q: What is RBAC?**
> **Answer:** Role-Based Access Control. Instead of checking permissions for each individual user, you assign users to roles (Admin, Biller, Poster, Doctor) and assign permissions to roles. For example, only "Admin" can create/delete users. This is scalable — you don't need to update permissions for each new user.

**Q: Why is `checkRole` a function that RETURNS a function? What pattern is this?**
> **Answer:** This is a **Higher-Order Function (HOF)** / **Closure**. Express middleware must have the signature `(req, res, next)`. But we also need to pass which roles are allowed. So `checkRole(["Admin"])` is called first — it creates a closure that "remembers" `roles = ["Admin"]`, and returns the actual middleware function `(req, res, next)` that Express can use.

**Q: Why does this middleware always run AFTER `checkToken`?**
> **Answer:** Because `checkRole` reads `req.user.role`, which is set by `checkToken`. If `checkRole` ran first, `req.user` would be `undefined` and the app would crash. The order in the route definition matters: `router.get("/", checkToken, checkRole(["Admin"]), controller)`.

---

## 9. User Model & Scopes (`src/models/user.js`)

**The Code:**
```javascript
const User = db.define("User", { ... }, {
  paranoid: true,
  defaultScope: {
    attributes: { exclude: ["password"] },
  },
  scopes: {
    withPassword: {
      attributes: { include: ["password"] },
    },
  },
});
```

### 🧠 Senior Interview Questions:

**Q: What is `defaultScope` and why do we exclude `password`?**
> **Answer:** A scope is a pre-defined query filter. `defaultScope` is applied to EVERY query automatically. By excluding `password`, we ensure that no matter where in the code someone writes `User.findAll()` or `User.findByPk()`, the password hash is NEVER returned. This is a security-by-default approach — you can't accidentally leak passwords.

**Q: Then how does the login function get the password to compare it?**
> **Answer:** By using `User.scope("withPassword").findOne(...)`. This explicitly overrides the default scope for that one query only. We use this in `findUserByEmail(email, true)` when the `includePassword` flag is `true`. This way, the password is only fetched when we specifically and intentionally need it (during login).

**Q: What does `paranoid: true` do? What is a Soft Delete?**
> **Answer:** When `paranoid: true` is set, calling `User.destroy()` does NOT run a SQL `DELETE` statement. Instead, it runs an `UPDATE` that sets the `deleted_at` column to the current timestamp. All normal queries (`findAll`, `findOne`) automatically add `WHERE deleted_at IS NULL`, so "deleted" users become invisible. This is critical for medical/billing systems where you legally cannot permanently delete records — you need audit trails.

**Q: What does `user.toJSON()` do and why do we call it?**
> **Answer:** Sequelize model instances are complex objects with internal metadata, methods, and circular references. `toJSON()` converts them into a plain JavaScript object `{ id, name, email, ... }`. This is necessary because: (1) `res.json()` works better with plain objects. (2) The destructuring `const { password: _, ...safeUser } = user` only works reliably on plain objects.

---

## 10. Server Bootstrap (`server.js`)

**The Code:**
```javascript
import "dotenv/config";
import app from "./app.js";
import { initializeBrowser } from "./src/services/browserService.js";
import "./src/config/db.js";

const PORT = process.env.PORT || 3000;
initializeBrowser()
  .then(() => {
    console.log("Browser initialized successfully.");
    app.listen(PORT);
  })
  .catch((err) => {
    console.error("Failed to initialize browser:", err);
    process.exit(1);
  });
```

### 🧠 Senior Interview Questions:

**Q: Why does `import "dotenv/config"` come first with no variable assignment?**
> **Answer:** This is a "side-effect import". It doesn't export anything — it just runs `dotenv.config()` immediately, which reads the `.env` file and loads all variables into `process.env`. It MUST be the very first import because every other file (db.js, jwt.js) depends on `process.env` values being available.

**Q: Why do we initialize the browser BEFORE calling `app.listen()`?**
> **Answer:** Because our PDF generation routes depend on Playwright's browser instance. If the server started accepting requests before the browser was ready, the first PDF request would crash with "Browser instance not initialized". By using `.then()`, we guarantee the server only starts listening after the browser is fully launched.

**Q: What does `import "./src/config/db.js"` do without a variable?**
> **Answer:** Another side-effect import. When this file is imported, its top-level code runs immediately — it creates the Sequelize instance and calls `testConnection()`. If the database connection fails, `process.exit(1)` is called inside `db.js`, stopping the entire boot process.

**Q: What is the `||` (OR) operator doing in `process.env.PORT || 3000`?**
> **Answer:** This is a fallback/default value pattern. If `process.env.PORT` is `undefined` (not set in `.env`), JavaScript treats it as falsy, so the `||` operator returns `3000` as the default. This ensures the app always has a port to listen on.

---

## 11. App Configuration & CORS (`app.js`)

**The Code:**
```javascript
app.use(cors({
  origin: process.env.ORIGIN || "http://localhost:4200",
  methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
  credentials: true,
  allowedHeaders: ["Content-Type", "Authorization"],
}));
```

### 🧠 Senior Interview Questions:

**Q: What is CORS and why do we need it?**
> **Answer:** CORS (Cross-Origin Resource Sharing). Browsers block requests from one domain (e.g., `localhost:4200` — Angular frontend) to a different domain (e.g., `localhost:3000` — Node backend). This is a security feature called the "Same-Origin Policy". The CORS middleware tells the browser: "It's okay, I trust requests from `localhost:4200`."

**Q: What does `credentials: true` do?**
> **Answer:** By default, browsers do NOT send cookies with cross-origin requests. Since our JWT lives in an `httpOnly` cookie, we MUST set `credentials: true` on the server AND `withCredentials: true` on the Angular frontend (HttpClient). Without this, the cookie would never be sent and every request would be "Unauthorized".

**Q: What does the `OPTIONS` method do in the methods array?**
> **Answer:** Before sending a `PUT` or `DELETE` request cross-origin, the browser automatically sends a "preflight" `OPTIONS` request to ask the server: "Am I allowed to do this?" The server must respond with the correct CORS headers. Including `OPTIONS` ensures these preflight requests are handled properly.

**Q: Why is `express.static(publicPath)` used?**
> **Answer:** It serves files from the `public/` folder as static assets. When we generate a PDF and save it to `public/invoice_123.pdf`, it becomes accessible via `http://localhost:3000/invoice_123.pdf`. This is how the Laravel backend and frontend can download generated documents.

---

## 12. Inter-Service Communication (`helper.js` & `nf2DatasService.js`)

**The Code:**
```javascript
// Fetching data FROM Laravel
const res = await fetch(`${process.env.LARAVEL_URL}/api/accidentdetails/${id}`);

// Sending data TO Laravel
const fetchResponse = await fetch(`${process.env.LARAVEL_URL}/api/document`, {
  method: "POST",
  body: JSON.stringify(sendObj),
});
```

### 🧠 Senior Interview Questions:

**Q: What is the `fetch` function? Is it from a library?**
> **Answer:** Starting from Node.js v18+, `fetch` is built-in (native). It works just like `fetch` in the browser. Before v18, you needed libraries like `axios` or `node-fetch`. Since our project runs on modern Node.js, we use the native `fetch` without any import.

**Q: Why does this Node.js backend communicate with the Laravel backend?**
> **Answer:** This is a **microservices architecture**. The Laravel backend is the primary API (patients, bills, insurance). The Node.js backend is a specialized service for two things: (1) JWT-based authentication. (2) PDF generation using Playwright. When a PDF is generated, we POST the document metadata back to Laravel so it can store the record in its database and the Angular frontend can list all generated documents.

**Q: Why do we use environment variables (`process.env.LARAVEL_URL`) instead of hardcoding URLs?**
> **Answer:** **Environment-specific configuration.** In development, Laravel runs on `localhost:8000`. In production, it might run on `https://api.bps-system.com`. By using environment variables, we can deploy the same code to any environment without changing a single line. We just update the `.env` file or the server's environment configuration.

**Q: What does `JSON.stringify(sendObj)` do?**
> **Answer:** `fetch` sends data as raw text over HTTP. `JSON.stringify()` converts a JavaScript object `{ bill_id: 1, file_name: "invoice.pdf" }` into a JSON string `'{"bill_id":1,"file_name":"invoice.pdf"}'`. The `Content-Type: application/json` header tells the receiving server (Laravel) to parse this string back into an object.

---

## 13. Password Hashing (`src/utils/hash.js`)

**The Code:**
```javascript
const hashPassword = async (password) => {
  const saltRounds = 10;
  return await bcrypt.hash(password, saltRounds);
};

const comparePassword = async (password, hash) => {
  return await bcrypt.compare(password, hash);
};
```

### 🧠 Senior Interview Questions:

**Q: What does `saltRounds = 10` mean?**
> **Answer:** It controls how many times the hashing algorithm runs internally (2^10 = 1024 iterations). Higher number = more secure but slower. 10 is the industry standard — it takes roughly 100ms to hash, which is fast enough for login but slow enough to make brute-force attacks impractical (an attacker would need 100ms × millions of guesses).

**Q: Why is `hashPassword` an `async` function?**
> **Answer:** `bcrypt.hash()` is CPU-intensive (it deliberately runs 1024 iterations). Making it async prevents it from blocking the Node.js event loop. If it were synchronous and 50 users tried to register at the same time, the server would freeze for 5 seconds while hashing all passwords sequentially.

**Q: How does `bcrypt.compare()` work if hashing is one-way?**
> **Answer:** It does NOT reverse the hash. It takes the plain-text password the user just typed, hashes it using the same salt (which is stored as part of the hash string), and then compares the two hash outputs. If they match, the password is correct.

---

## 14. Singleton Pattern — Browser Service (`src/services/browserService.js`)

**The Code:**
```javascript
let browserInstance = null;

export const initializeBrowser = async () => {
  if (!browserInstance) {
    browserInstance = await chromium.launch({ headless: true });
  }
};
```

### 🧠 Senior Interview Questions:

**Q: What design pattern is this?**
> **Answer:** **Singleton Pattern.** We only ever create ONE browser instance for the entire application lifetime. The `if (!browserInstance)` check ensures that even if `initializeBrowser()` is called multiple times, only one Chromium process is spawned. Each PDF request creates a new `page` inside this single browser, which is much cheaper than launching a new browser every time.

**Q: What does `headless: true` mean?**
> **Answer:** It launches the Chromium browser without any visible window (no GUI). Since this runs on a server, there is no screen to display to. The browser runs entirely in memory, renders the HTML, generates the PDF, and closes the page — all without any visual output.

**Q: Why do we keep the browser running instead of launching and closing it for each PDF?**
> **Answer:** Performance. Launching a Chromium browser takes 1-3 seconds and consumes significant RAM. If we launched a new browser for every PDF request, the server would be extremely slow under load. By keeping one instance alive (Singleton), creating a new page takes only ~50ms.
