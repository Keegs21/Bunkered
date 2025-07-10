import axios from "axios";

const apiClient = axios.create({
  baseURL: "/api/v1", // Use relative path for API calls
  headers: {
    "Content-Type": "application/json",
  },
});

// Add a request interceptor to include the auth token
apiClient.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("token");
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

export default apiClient;
