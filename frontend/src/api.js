
import axios from "axios";

const api = axios.create({
    baseURL :  "http://127.0.0.1:8000/api/",
})

// Automatically attach the JWT access token to request
api.interceptors.request.use(
    (config) => {
        const token = localStorage.getItem(ACCESS_TOKEN);

        // This retrieves the users's JWT access token form thew browser storage
        if (token) {
            config.headers.Authorization = `Bearer ${token}`;
        }

        return config;
    },
    (error) => {
        return Promise.reject(error);
    }
);

export default api;