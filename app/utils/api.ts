import axios from "axios";

const api = axios.create({
  baseURL: "/api",
  withCredentials: true, // This ensures cookies are sent with requests
});

export default api;
