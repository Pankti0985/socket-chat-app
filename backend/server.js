const express = require("express");
const cors = require("cors");
const mongoose = require("mongoose");
const socket = require("socket.io");

require("dotenv").config();

const authRoutes = require("./routes/authRoutes");
const messageRoutes = require("./routes/chatRoutes");

const app = express();
app.use(cors());
app.use(express.json());

mongoose.connect(process.env.MONGO_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
})
.then(() => console.log("MongoDB connected"))
.catch((err) => console.log(err.message));

app.use("/api/auth", authRoutes);
app.use("/api/messages", messageRoutes);

const server = app.listen(process.env.PORT || 5000, () =>
  console.log(`Server running on port ${process.env.PORT || 5000}`)
);

const io = socket(server, {
  cors: { origin: "*", credentials: true },
});

global.onlineUsers = new Map();

io.on("connection", (socket) => {
  socket.on("add-user", (userId) => {
    onlineUsers.set(userId, socket.id);
    io.emit("online-users", Array.from(onlineUsers.keys()));
  });

  socket.on("send-msg", (data) => {
    const sendToSocket = onlineUsers.get(data.to);
    if (sendToSocket) {
      socket.to(sendToSocket).emit("msg-receive", {
        ...data,
        timestamp: new Date(),
      });
    }
  });

  socket.on("message-delivered", ({ messageId }) => {
    io.emit("update-status", { messageId, status: "delivered" });
  });

  socket.on("message-seen", ({ messageId }) => {
    io.emit("update-status", { messageId, status: "seen" });
  });

  socket.on("disconnect", () => {
    for (let [key, value] of onlineUsers.entries()) {
      if (value === socket.id) {
        onlineUsers.delete(key);
        break;
      }
    }
    io.emit("online-users", Array.from(onlineUsers.keys()));
  });
});
