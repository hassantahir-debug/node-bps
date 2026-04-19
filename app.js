// Third-party imports
import express from "express";
import cookieParser from "cookie-parser";
import cors from "cors";
import path from "node:path";
import { fileURLToPath } from "node:url";

// Local imports
import authRoutes from "./src/routes/auth.routes.js";
import userRoutes from "./src/routes/user.routes.js";
import documentRouter from "./src/routes/document.routes.js";

// App setup
const app = express();
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const publicPath = path.join(__dirname, "public");

// Middleware
app.use(cookieParser());
app.use(express.json());
app.use(express.static(publicPath));

// CORS config
app.use(
  cors({
    origin: process.env.ORIGIN || "http://localhost:4200",
    methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    credentials: true,
    allowedHeaders: ["Content-Type", "Authorization"],
  }),
);

// Routes
app.use("/api/auth", authRoutes);
app.use("/api/users", userRoutes);
app.use("/pdf/document", documentRouter);

// Global error handler
app.use((err, req, res, next) => {
  const statusCode = err.statusCode || 500;
  const message = err.message || "Internal server error";

  console.error(err.stack);

  res.status(statusCode).json({
    message,
    stack: process.env.NODE_ENV !== "production" && err.stack,
  });
});

export default app;
