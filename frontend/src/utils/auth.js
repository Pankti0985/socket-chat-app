// utils/auth.js

const USER_KEY = "chat-user"; 

export const saveUser = (user) => {
  localStorage.setItem(USER_KEY, JSON.stringify(user));
};

export const getUser = () => {
  const user = localStorage.getItem(USER_KEY);
  return user ? JSON.parse(user) : null;
};

export const logoutUser = () => {
  localStorage.removeItem(USER_KEY);
  localStorage.removeItem("token"); 
};
