import { createContext, useState, useEffect, useContext, useMemo } from "react";
import authService from "../services/authService";

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);

  useEffect(() => {
    const currentUser = authService.getCurrentUser();
    setUser(currentUser);
  }, []);

  const register = async (payload) => {
    const data = await authService.register(payload);
    setUser(data.user);
    return data;
  };

  const login = async (payload) => {
    const data = await authService.login(payload);
    setUser(data.user);
    return data;
  }

  const logout = async () => {
    await authService.logout();
    setUser(null);
    window.location.href = "/login";
  };

  const value = useMemo(() => ({
    user,
    register,
    login,
    logout,
  }), [user, register, login, logout]);

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => useContext(AuthContext);