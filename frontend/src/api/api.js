import axios from "axios";

const API = axios.create({
  baseURL: process.env.REACT_APP_API_URL + "/api",
});

export const register = (data) => API.post("/auth/register", data);
export const login = (data) => API.post("/auth/login", data);
export const getAllUsers = (id) => API.get(`/auth/allusers/${id}`);
export const sendMessage = (data) => API.post("/messages/addmessage", data);
export const getMessages = (data) => API.post("/messages/getmessage", data);
