const express = require("express");
const router = express.Router();
const { checkToken } = require("../middleware/auth.middleware");
const { checkRole } = require("../middleware/role.middleware");
const {
  GetAllusers,
  createUser,
  updateUser,
  deleteUser,
} = require("../controllers/auth.controller");

router.get("/", checkToken, checkRole(["Admin"]), GetAllusers);
router.post("/", checkToken, checkRole(["Admin"]), createUser);
router.put("/:id", checkToken, checkRole(["Admin"]), updateUser);
router.delete("/:id", checkToken, checkRole(["Admin"]), deleteUser);

module.exports = router;
