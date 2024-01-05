import axios from "axios";
import AccessTokenService from "~/services/accessToken.service";

const serviceToken = new AccessTokenService();

const axiosClient = axios.create({
  baseURL: import.meta.env.VITE_SERVICE_API_URL,
  timeout: 60000,
  headers: {
    "Content-Type": "application/json",
  },
});

axiosClient.interceptors.request.use(
  (config: any) => {
    const tokenData = serviceToken.get();

    if (tokenData) {
      config.headers["Authorization"] = "Bearer " + tokenData;
    }

    return config;
  },
  (error: any) => Promise.reject(error)
);

axiosClient.interceptors.response.use(
  (response: any) => {
    if (response.headers.authorization) {
      response.data.token = response.headers.authorization;
    }
    return response;
  },
  (error: any) => {
    const { response } = error;
    switch (response?.status) {
      case 404:
        console.log("404 error handler!");
        break;
      case 500:
        if (process.env.NODE_ENV === "production") {
          console.log("500 error handler!");
        }
        break;
      case 429:
      case 401:
        serviceToken.clear();
        window.location.href = "/login";
        break;
      default:
        // eslint-disable-next-line no-case-declarations
        const dError = {
          status: response?.status,
          textStatus: response?.textStatus,
          message: response?.data?.message || "",
        };
        console.error("App Error:", dError);
    }

    return Promise.reject(error);
  }
);

export default axiosClient;
