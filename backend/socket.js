const User = require('./models/User');
const Message = require('./models/Message');

const onlineUsers = new Map();

const socketHandler = (io) => {
  io.on("connection", (socket) => {
    socket.on("add-user", async (userId) => {
      onlineUsers.set(userId, socket.id);
      await User.findByIdAndUpdate(userId, { isOnline: true });
      io.emit("update-user-status", { userId, isOnline: true });
    });

    socket.on("send-msg", async (data) => {
      const { from, to, message } = data;
      const msg = await Message.create({ from, to, message, status: "sent" });

      const sendData = {
        _id: msg._id,
        from,
        to,
        message,
        status: "sent",
        timestamp: msg.timestamp,
      };

      const recipientSocket = onlineUsers.get(to);
      if (recipientSocket) {
        io.to(recipientSocket).emit("msg-receive", sendData);
        await Message.findByIdAndUpdate(msg._id, { status: "delivered" });
        sendData.status = "delivered";
        io.to(socket.id).emit("msg-status-update", sendData);
      } else {
        io.to(socket.id).emit("msg-status-update", sendData);
      }
    });

    socket.on("message-seen", async ({ msgId }) => {
      await Message.findByIdAndUpdate(msgId, { status: "seen" });
      io.emit("msg-seen-update", { msgId, status: "seen" });
    });

    socket.on("disconnect", async () => {
      for (let [userId, id] of onlineUsers.entries()) {
        if (id === socket.id) {
          onlineUsers.delete(userId);
          await User.findByIdAndUpdate(userId, { isOnline: false });
          io.emit("update-user-status", { userId, isOnline: false });
          break;
        }
      }
    });
  });
};

module.exports = socketHandler;
