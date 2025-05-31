// src/components/UserList.jsx
import React, { useState, useEffect } from "react";
import axios from "axios";

const UserList = ({ currentUser, onSelectUser }) => {
  const [users, setUsers] = useState([]);

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const token = localStorage.getItem("token");
        const res = await axios.get(`${process.env.REACT_APP_API}/api/users`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        // Exclude the current user
        const otherUsers = res.data.filter(user => user._id !== currentUser._id);
        setUsers(otherUsers);
      } catch (error) {
        console.error("Error fetching users:", error);
      }
    };

    fetchUsers();
  }, [currentUser]);

  return (
    <select onChange={(e) => onSelectUser(e.target.value)} defaultValue="">
      <option value="" disabled>
        Select a user to chat with
      </option>
      {users.map((user) => (
        <option key={user._id} value={user._id}>
          {user.name}
        </option>
      ))}
    </select>
  );
};

export default UserList;
