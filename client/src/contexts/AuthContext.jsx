import { createContext, useState, useEffect, useContext, useMemo } from "react";
import authService from "../services/authService";

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const initAuth = async () => {
      try {
        setUser({
          user_id: 1,
          first_name: "System",
          last_name: "Admin",
          role: "Admin",
          username: "admin123"
        });
      } catch (err) {
        setUser(null);
      } finally {
        setLoading(false);
      }
    };
    initAuth();
  }, []);

  const register = async (payload) => {
    const response = await authService.register(payload);
    setUser(response.data);
    return response;
  };

  const login = async (payload) => {
    const response = await authService.login(payload);
    setUser(response.data);
    return response;
  }

  const logout = async () => {
    await authService.logout();
    setUser(null);
    window.location.href = "/login";
  };

  const value = useMemo(() => ({
    user,
    loading,
    register,
    login,
    logout
  }), [user, loading, register, login, logout]);

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => useContext(AuthContext);