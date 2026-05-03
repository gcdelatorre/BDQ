import api from "./api.js"

const getCurrentUser = async () => {
  const response = await api.get("/api/auth/me")
  return response.data
}

const login = async (payload) => {
  const response = await api.post("/api/auth/login", payload)
  return response.data
}

const register = async (payload) => {
  const response = await api.post("/api/auth/register", payload)
  return response.data
}

const logout = async () => {
  await api.post("/api/auth/logout")
}

const authService = {
  getCurrentUser,
  login,
  register,
  logout
}

export default authService