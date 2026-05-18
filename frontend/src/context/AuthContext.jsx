import React, { createContext, useContext, useEffect, useState } from "react";
import api from "../api/axios";
import socket from "../socket";

const AuthContext = createContext();

export const useAuth = () => {
  const context = useContext(AuthContext);

  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }

  return context;
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  // Check stored token and verify user from backend
  useEffect(() => {
    const checkLoggedInUser = async () => {
      try {
        const token = localStorage.getItem("token");
        const storedUser = localStorage.getItem("user");

        if (!token) {
          setUser(null);
          setIsLoading(false);
          return;
        }

        // Temporary fast load from localStorage
        if (storedUser) {
          setUser(JSON.parse(storedUser));
        }

        // Confirm from backend
        const res = await api.get("/auth/me");

        setUser(res.data.user);
        localStorage.setItem("user", JSON.stringify(res.data.user));
      } catch (error) {
        localStorage.removeItem("token");
        localStorage.removeItem("user");
        setUser(null);
      } finally {
        setIsLoading(false);
      }
    };

    checkLoggedInUser();
  }, []);

  useEffect(() => {
    if (!user) {
      if (socket.connected) {
        socket.disconnect();
      }
      return;
    }

    if (!socket.connected) {
      socket.connect();
    }

    const role = user.role || user.account_type;

    socket.emit("join_role_room", {
      role,
      userId: user.id,
    });

    return () => {
      socket.off("connect");
    };
  }, [user]);

  const login = (userData, token) => {
    setUser(userData);
    localStorage.setItem("token", token);
    localStorage.setItem("user", JSON.stringify(userData));
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem("token");
    localStorage.removeItem("user");

    if (socket.connected) {
      socket.disconnect();
    }
  };

  const hasRole = (...roles) => {
    return user ? roles.includes(user.account_type || user.role) : false;
  };

  const value = {
    user,
    login,
    logout,
    hasRole,
    isLoading,
    isAuthenticated: !!user,
    isVerified: user?.isVerified || false,
    isSuspended: user?.isSuspended || false,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};