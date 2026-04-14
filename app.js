import express from "express";
import cors from "cors";
import authRoutes from "./src/routes/auth.routes.js";
import userRoutes from "./src/routes/user.routes.js";
import documentRouter from "./src/routes/document.routes.js";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const publicPath = path.join(__dirname, "public");
const app = express();
app.use(express.static(publicPath));

app.use(express.json());
app.use(cors());

// Option 2: Explicit Wildcard
app.use(cors({
  origin: '*'
}));
// app.use(
//   cors({
//     origin: process.env.ORIGIN || "http://localhost:4200",
//     methods: ["GET", "POST", "PUT", "DELETE"],
//   }),
// );

app.use("/api/auth", authRoutes);
app.use("/api/users", userRoutes);
app.use("/pdf/document", documentRouter);

app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ message: "Internal server error" });
});

export default app;
