import { Router } from "express";
import { checkToken } from "../middleware/auth.middleware.js";
import { checkRole } from "../middleware/role.middleware.js";
import {
  GetAllusers,
  createUser,
  updateUser,
  deleteUser,
} from "../controllers/auth.controller.js";

const router = Router();

router.get("/", checkToken, checkRole(["Admin"]), GetAllusers);
router.post("/", checkToken, checkRole(["Admin"]), createUser);
router.put("/:id", checkToken, checkRole(["Admin"]), updateUser);
router.delete("/:id", checkToken, checkRole(["Admin"]), deleteUser);

export default router;
