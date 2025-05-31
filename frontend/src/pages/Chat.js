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

  useEffect(() => {
    const currentUser = getUser();
    if (!currentUser) {
      navigate("/login");
    } else {
      setUser(currentUser); // save in state so it's reactive
      socket.emit("add-user", currentUser._id);
      fetchUsers(currentUser);
    }
  }, []);

  const fetchUsers = async (currentUser) => {
    const { data } = await getAllUsers(currentUser._id);
    setContacts(data);
  };

  const loadMessages = async (contact) => {
    setCurrentChat(contact);
    const { data } = await getMessages({ from: user._id, to: contact._id });
    setMessages(data);
  };

  const sendMsg = async () => {
    if (msg.trim() === "") return;
    await sendMessage({ from: user._id, to: currentChat._id, message: msg });
    socket.emit("send-msg", { to: currentChat._id, message: msg });
    setMessages([...messages, { fromSelf: true, message: msg }]);
    setMsg("");
  };

  useEffect(() => {
    socket.on("msg-receive", (message) => {
      setMessages((prev) => [...prev, { fromSelf: false, message }]);
    });
    return () => socket.off("msg-receive");
  }, []);

  const handleLogout = () => {
    logoutUser(); // clears localStorage
    setUser(null); // triggers useEffect again if needed
    navigate("/login", { replace: true }); // redirect
  };

  return (
    <div style={{ display: "flex" }}>
      <div>
        <h3>Contacts</h3>
        {contacts.map((contact) => (
          <div
            key={contact._id}
            onClick={() => loadMessages(contact)}
            style={{ cursor: "pointer", padding: "5px 0" }}
          >
            {contact.name}
          </div>
        ))}
        <button onClick={handleLogout} style={{ marginTop: 20 }}>
          Logout
        </button>
      </div>
      <div style={{ marginLeft: 20 }}>
        {currentChat ? (
          <>
            <h3>Chat with {currentChat.name}</h3>
            <div style={{ height: 300, overflowY: "scroll" }}>
              {messages.map((m, i) => (
                <div key={i} style={{ textAlign: m.fromSelf ? "right" : "left" }}>
                  {m.message}
                </div>
              ))}
            </div>
            <input
              value={msg}
              onChange={(e) => setMsg(e.target.value)}
              placeholder="Type your message..."
            />
            <button onClick={sendMsg}>Send</button>
          </>
        ) : (
          <p>Select a contact</p>
        )}
      </div>
    </div>
  );
};

export default Chat;
