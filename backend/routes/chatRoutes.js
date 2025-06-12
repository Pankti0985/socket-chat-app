const express = require("express");
const router = express.Router();
const { addMessage, getMessages, updateMessageStatus } = require("../controllers/chatController");

router.post("/addmessage", addMessage);
router.post("/getmessage", getMessages);
router.post("/updatestatus", updateMessageStatus);
module.exports = router;
