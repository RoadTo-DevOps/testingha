import { createContext, useContext, useMemo, useState } from "react";
import api from "../api";

const AuthContext = createContext(null);

function getStoredAuth() {
  const token = localStorage.getItem("token");
  const userRaw = localStorage.getItem("user");
  const user = userRaw ? JSON.parse(userRaw) : null;

  if (!token || !user) {
    return { token: null, user: null };
  }

  return { token, user };
}

export function AuthProvider({ children }) {
  const initial = getStoredAuth();
  const [token, setToken] = useState(initial.token);
  const [user, setUser] = useState(initial.user);

  const authHeaders = useMemo(() => {
    if (!token) return {};
    return { Authorization: `Bearer ${token}` };
  }, [token]);

  const login = async (email, password) => {
    const res = await api.post("/api/auth/login", { email, password });
    const { token: nextToken, user: nextUser } = res.data;

    localStorage.setItem("token", nextToken);
    localStorage.setItem("user", JSON.stringify(nextUser));

    setToken(nextToken);
    setUser(nextUser);

    return nextUser;
  };

  const register = async (fullName, email, password) => {
    const res = await api.post("/api/auth/register", { fullName, email, password });
    return res.data;
  };

  const logout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    setToken(null);
    setUser(null);
  };

  return (
    <AuthContext.Provider
      value={{
        token,
        user,
        isAuthenticated: Boolean(token && user),
        isAdmin: user?.role === "admin",
        authHeaders,
        login,
        register,
        logout
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within AuthProvider");
  }
  return context;
}
