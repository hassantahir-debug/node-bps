const express = require("express");
const router = express.Router();
const { checkToken } = require("../middleware/auth.middleware");
const { login, getME } = require("../controllers/auth.controller");

router.post("/login",login);
router.get("/me", checkToken, getME);


module.exports = router
