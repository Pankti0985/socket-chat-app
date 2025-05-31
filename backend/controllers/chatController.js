const Message = require("../models/Message");

exports.addMessage = async (req, res) => {
  try {
    const { from, to, message } = req.body;
    const newMessage = await Message.create({
      sender: from,
      receiver: to,
      message,
    });
    res.json({ msg: "Message sent", data: newMessage });
  } catch (err) {
    res.status(500).json({ msg: err.message });
  }
};

exports.getMessages = async (req, res) => {
  try {
    const { from, to } = req.body;
    const messages = await Message.find({
      $or: [
        { sender: from, receiver: to },
        { sender: to, receiver: from },
      ],
    }).sort({ createdAt: 1 });

    const formatted = messages.map((msg) => ({
      fromSelf: msg.sender.toString() === from,
      message: msg.message,
    }));

    res.json(formatted);
  } catch (err) {
    res.status(500).json({ msg: err.message });
  }
};
