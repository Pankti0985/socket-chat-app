const express = require("express");
const router = express.Router();
const { addMessage, getMessages } = require("../controllers/chatController");

router.post("/addmessage", addMessage);
router.post("/getmessage", getMessages);

module.exports = router;
