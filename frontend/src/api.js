import axios from "axios" 

const api = axios.create({
    baseURL: "http://127.0.0.1:8000/api/",
});

// Automaticalyy attach the JWT acces token to the request
api.interceptors.request.use(
    (config) => {
        const token = localStorage.getItem("access");

        // This retrieves the users's JWT access token from the browswer storage=
        if(token){
            config.headers.Authorization = `Bearer ${token}`;
        } 

        return config;
    },
    (error) => {
        return Promise.reject(error);
    }
)

export default api;