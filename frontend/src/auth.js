import api from "./api";

// register a new user 
export const registerUser = async (useData) => {
    const response = await api.post("users/register/", useData);
    return response.data;
};

// Login an exiting user
export const loginUser = async (credentials) => {
    const response = await api.post("users/login/", credentials);

    //save JWT to broswer storage
    localStorage.setItem("access", response.data.access);
    localStorage.setItem("refresh", response.data.refresh);

    return response.data;
};

// log out the user
export const logoutUser = () => {
    localStorage.removeItem("access");
    localStorage.removeItem("refesh");
}

// Check wether an access token exists
export const isAuthenticated = () => {
    return Bolean(localStorage.getItem("access"))
}
