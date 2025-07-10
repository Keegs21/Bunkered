import React, { createContext, useContext, useEffect, useState } from "react";
import axios from "axios";

interface User {
  id: number;
  email: string;
  username: string;
  first_name?: string;
  last_name?: string;
  is_superuser: boolean;
  is_active: boolean;
}

interface AuthContextType {
  user: User | null;
  token: string | null;
  loading: boolean;
  isAdmin: boolean;
  isAuthenticated: boolean;
  login: (username: string, password: string) => Promise<void>;
  register: (userData: RegisterData) => Promise<void>;
  logout: () => void;
}

interface RegisterData {
  email: string;
  username: string;
  password: string;
  first_name?: string;
  last_name?: string;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};

// Configure axios defaults
const API_BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:8000";
axios.defaults.baseURL = API_BASE_URL;

/**
 * Admin Authentication Strategy:
 * - Admin users have is_superuser: true in the database
 * - Regular users have is_superuser: false
 * - Use isAdmin from auth context to check admin permissions
 * - Admin users can access admin-only features and manage leagues
 *
 * Usage in components:
 * const { user, isAdmin, isAuthenticated } = useAuth();
 *
 * Check if user is admin:
 * if (isAdmin) { show admin features }
 *
 * Check if user is authenticated:
 * if (isAuthenticated) { show user features }
 */

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(
    localStorage.getItem("token")
  );
  const [loading, setLoading] = useState(true);

  // Set axios auth header when token changes
  useEffect(() => {
    if (token) {
      axios.defaults.headers.common["Authorization"] = `Bearer ${token}`;
      fetchCurrentUser();
    } else {
      delete axios.defaults.headers.common["Authorization"];
      setLoading(false);
    }
  }, [token]);

  const fetchCurrentUser = async () => {
    try {
      const response = await axios.get("/api/v1/users/me");
      setUser(response.data);
    } catch (error) {
      console.error("Failed to fetch user:", error);
      logout();
    } finally {
      setLoading(false);
    }
  };

  const login = async (username: string, password: string) => {
    try {
      const formData = new FormData();
      formData.append("username", username);
      formData.append("password", password);

      const response = await axios.post("/api/v1/auth/login", formData, {
        headers: {
          "Content-Type": "application/x-www-form-urlencoded",
        },
      });

      const { access_token } = response.data;
      setToken(access_token);
      localStorage.setItem("token", access_token);
    } catch (error) {
      console.error("Login failed:", error);
      throw error;
    }
  };

  const register = async (userData: RegisterData) => {
    try {
      const response = await axios.post("/api/v1/auth/register", userData);
      // Auto-login after registration
      await login(userData.username, userData.password);
    } catch (error) {
      console.error("Registration failed:", error);
      throw error;
    }
  };

  const logout = () => {
    setUser(null);
    setToken(null);
    localStorage.removeItem("token");
    delete axios.defaults.headers.common["Authorization"];
  };

  const value = {
    user,
    token,
    loading,
    isAdmin: user?.is_superuser || false,
    isAuthenticated: !!user && !!token,
    login,
    register,
    logout,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
