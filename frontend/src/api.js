import axios from "axios";

const baseURL = (import.meta.env.VITE_API_BASE_URL || "").trim();

const api = axios.create({
  baseURL
});

export default api;
