// apis/axiosInstance.ts
import axios from "axios";
import { auth } from "../config/firebase";

const axiosInstance = axios.create({
    baseURL: "http://localhost:3001",
});

axiosInstance.interceptors.request.use(async (config) => {
    const user = auth.currentUser;
    console.log("Firebase auth state:", user ? "User logged in" : "No user logged in");
    if (user) {
        try {
            const token = await user.getIdToken();
            config.headers.Authorization = `Bearer ${token}`;
            console.log("Token added to request");
        } catch (error) {
            console.error("Error getting auth token:", error);
        }
    } else {
        console.warn("No authentication token available - request will fail with 403");
    }
    return config;
});

export default axiosInstance;
