import axios from "axios";
import Cookies from "universal-cookie";

const api = axios.create({
  baseURL: process.env.REACT_APP_BASE_URL,
});

api.interceptors.request.use(async (config) => {
  const cookies = new Cookies();
  const authTokens = cookies.get("authTokens");

  if (authTokens) {
    config.headers.Authorization = `Bearer ${authTokens.access}`;
  }
  return config;
});

api.interceptors.response.use(
  (response) => {
    return response;
  },
  async (error) => {
    const originalRequest = error.config;

    if (
      error.response.status === 401 &&
      originalRequest.url === `${process.env.REACT_APP_BASE_URL}/api/token/refresh/`
    ) {
      window.location.href = "/login/";
      return Promise.reject(error);
    }

    if (error.response.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;
      const cookies = new Cookies();
      const authTokens = cookies.get("authTokens");

      if (authTokens) {
        try {
          const response = await api.post("/api/token/refresh/", {
            refresh: authTokens.refresh,
          });

          cookies.set("authTokens", response.data, { path: "/" });

          api.defaults.headers.common["Authorization"] =
            "Bearer " + response.data.access;

          return api(originalRequest);
        } catch (err) {
          console.error("Failed to refresh token", err);
          window.location.href = "/";
          return Promise.reject(err);
        }
      }
    }
    return Promise.reject(error);
  }
);

export default api;
