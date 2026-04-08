import { Router } from "express";
import { checkToken } from "../middleware/auth.middleware.js";
import { login, getME } from "../controllers/auth.controller.js";

const router = Router();

router.post("/login", login);
router.get("/me", checkToken, getME);

export default router;
