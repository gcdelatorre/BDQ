import api from "./api.js"

const getCurrentUser = async () => {
  // baseURL already ends in /api, so we just need /auth/me
  const response = await api.get("/auth/me")
  return response.data
}

const login = async (payload) => {
  const response = await api.post("/auth/login", payload)
  return response.data
}

const register = async (payload) => {
  const response = await api.post("/auth/register", payload)
  return response.data
}

const logout = async () => {
  await api.post("/auth/logout")
}

const authService = {
  getCurrentUser,
  login,
  register,
  logout
}

export default authService