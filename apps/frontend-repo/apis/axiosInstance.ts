// apis/axiosInstance.ts
import axios from "axios";
import { auth } from "../config/firebase";

const axiosInstance = axios.create({
    baseURL: "http://localhost:3001",
});

axiosInstance.interceptors.request.use(async (config) => {
    const user = auth.currentUser;
    if (user) {
        const token = await user.getIdToken();
        config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
});

export default axiosInstance;
