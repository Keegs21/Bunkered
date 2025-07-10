import {
  createContext,
  useContext,
  useState,
  useEffect,
  ReactNode,
} from "react";
import apiClient from "../api";
import { User } from "../types";

interface AuthContextType {
  user: User | null;
  token: string | null;
  loading: boolean;
  isAdmin: boolean;
  isAuthenticated: boolean;
  login: (formData: FormData) => Promise<void>;
  register: (userData: any) => Promise<void>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const initializeAuth = async () => {
      const token = localStorage.getItem("token");
      if (token) {
        try {
          const response = await apiClient.get<User>("/users/me");
          setUser(response.data);
        } catch (error) {
          console.error("Failed to fetch user on init:", error);
          localStorage.removeItem("token");
        }
      }
      setLoading(false);
    };
    initializeAuth();
  }, []);

  const login = async (formData: FormData) => {
    try {
      const response = await apiClient.post<{ access_token: string }>(
        "/auth/login",
        formData,
        {
          headers: {
            "Content-Type": "application/x-www-form-urlencoded",
          },
        }
      );
      const { access_token } = response.data;
      localStorage.setItem("token", access_token);

      const userResponse = await apiClient.get<User>("/users/me");
      setUser(userResponse.data);
    } catch (error) {
      console.error("Login failed:", error);
      throw error;
    }
  };

  const register = async (userData: any) => {
    try {
      await apiClient.post<User>("/auth/register", userData);
      const loginData = new FormData();
      loginData.append("username", userData.email);
      loginData.append("password", userData.password);
      await login(loginData);
    } catch (error) {
      console.error("Registration failed:", error);
      throw error;
    }
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem("token");
    // The interceptor will handle clearing the header on subsequent requests
  };

  const value: AuthContextType = {
    user,
    token: localStorage.getItem("token"),
    loading,
    isAdmin: user?.is_superuser || false,
    isAuthenticated: !!user && !!localStorage.getItem("token"),
    login,
    register,
    logout,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};
