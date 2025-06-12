import React, { useEffect, useState } from "react";
import { getUser, logoutUser } from "../utils/auth";
import { useNavigate } from "react-router-dom";
import { socket } from "../socket";
import { getAllUsers, getMessages, sendMessage } from "../api/api";

const Chat = () => {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [contacts, setContacts] = useState([]);
  const [currentChat, setCurrentChat] = useState(null);
  const [messages, setMessages] = useState([]);
  const [msg, setMsg] = useState("");
  const [onlineUsers, setOnlineUsers] = useState([]);

  useEffect(() => {
    const currentUser = getUser();
    if (!currentUser) {
      navigate("/login");
    } else {
      setUser(currentUser);
      socket.emit("add-user", currentUser._id);
      fetchUsers(currentUser);
    }
  }, [navigate]);

  const fetchUsers = async (currentUser) => {
    try {
      const { data } = await getAllUsers(currentUser._id);
      setContacts(data);
    } catch (error) {
      console.error("Error fetching users:", error);
    }
  };

  const loadMessages = async (contact) => {
    setCurrentChat(contact);
    try {
      const { data } = await getMessages({ from: user._id, to: contact._id });
      setMessages(data);
    } catch (error) {
      console.error("Error loading messages:", error);
    }
  };

  const sendMsg = async () => {
    if (msg.trim() === "" || !currentChat) return;
    try {
      const { data } = await sendMessage({ from: user._id, to: currentChat._id, message: msg });
      socket.emit("send-msg", { from: user._id, to: currentChat._id, message: msg });
      setMessages((prev) => [
        ...prev,
        {
          _id: data.data._id,
          fromSelf: true,
          message: msg,
          status: "sent",
          timestamp: data.data.createdAt,
        },
      ]);
      setMsg("");
    } catch (error) {
      console.error("Error sending message:", error);
    }
  };

  useEffect(() => {
    socket.on("msg-receive", (data) => {
      if (data.from === currentChat?._id) {
        setMessages((prev) => [...prev, { 
          _id: Date.now(), // temp id
          fromSelf: false, 
          message: data.message, 
          timestamp: data.timestamp 
        }]);
      }
    });

    socket.on("update-status", ({ messageId, status }) => {
      setMessages((prev) =>
        prev.map((msg) => (msg._id === messageId ? { ...msg, status } : msg))
      );
    });

    socket.on("online-users", (users) => {
      setOnlineUsers(users);
    });

    return () => {
      socket.off("msg-receive");
      socket.off("update-status");
      socket.off("online-users");
    };
  }, [currentChat]);

  const handleLogout = () => {
    logoutUser();
    setUser(null);
    navigate("/login", { replace: true });
  };

  const formatTime = (timestamp) => {
    if (!timestamp) return "";
    const date = new Date(timestamp);
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  return (
    <div style={{ display: "flex" }}>
      <div>
        <h3>Contacts</h3>
        {contacts.map((contact) => (
          <div
            key={contact._id}
            onClick={() => loadMessages(contact)}
            style={{
              cursor: "pointer",
              padding: "5px 0",
              color: onlineUsers.includes(contact._id) ? "green" : "gray",
            }}
          >
            {contact.name} {onlineUsers.includes(contact._id) ? "(Online)" : "(Offline)"}
          </div>
        ))}
        <button onClick={handleLogout} style={{ marginTop: 20 }}>
          Logout
        </button>
      </div>
      <div style={{ marginLeft: 20, flex: 1 }}>
        {currentChat ? (
          <>
            <h3>Chat with {currentChat.name}</h3>
            <div style={{ height: 300, overflowY: "scroll", border: "1px solid gray", padding: 5 }}>
              {messages.map((m, i) => (
                <div
                  key={m._id || i}
                  style={{
                    textAlign: m.fromSelf ? "right" : "left",
                    padding: "4px 0",
                  }}
                >
                  <div>{m.message}</div>
                  <small style={{ fontSize: 10 }}>
                    {formatTime(m.timestamp)}{" "}
                    {m.fromSelf && m.status && `(${m.status})`}
                  </small>
                </div>
              ))}
            </div>
            <input
              value={msg}
              onChange={(e) => setMsg(e.target.value)}
              placeholder="Type your message..."
              style={{ width: "80%", marginRight: "5px" }}
            />
            <button onClick={sendMsg}>Send</button>
          </>
        ) : (
          <p>Select a contact to start chatting</p>
        )}
      </div>
    </div>
  );
};

export default Chat;
