const express = require("express");
const router = express.Router();
const { register, login, getAllUsers } = require("../controllers/authController");

router.post("/register", register);
router.post("/login", login);
router.get("/allusers/:id", getAllUsers);

module.exports = router;
