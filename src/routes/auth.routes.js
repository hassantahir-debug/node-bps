import { Router } from "express";
import { checkToken } from "../middleware/auth.middleware.js";
import { login, getME } from "../controllers/auth.controller.js";
import { validate } from "../middleware/validate.middleware.js";
import { loginSchema } from "../validations/auth.validation.js";

const router = Router();

router.post("/login", validate(loginSchema), login);
router.get("/me", checkToken, getME);

export default router;
