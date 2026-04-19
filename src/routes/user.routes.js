import { Router } from "express";
import { checkToken } from "../middleware/auth.middleware.js";
import { checkRole } from "../middleware/role.middleware.js";
import { validate } from "../middleware/validate.middleware.js";
import { createUserSchema, updateUserSchema } from "../validations/user.validation.js";
import {
  GetAllusers,
  createUser,
  updateUser,
  deleteUser,
} from "../controllers/user.controller.js";

const router = Router();

router.get("/", checkToken, checkRole(["Admin"]), GetAllusers);
router.post("/", checkToken, checkRole(["Admin"]), validate(createUserSchema), createUser);
router.put("/:id", checkToken, checkRole(["Admin"]), validate(updateUserSchema), updateUser);
router.delete("/:id", checkToken, checkRole(["Admin"]), deleteUser);

export default router;
