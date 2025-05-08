import axiosInstance from "./axiosInstance";
import { User } from "../../../packages/shared/user";

export const updateUserData = async (userData: User) => {
    try {
        const response = await axiosInstance.post("/update-user-data", userData);
        return response.data;
    } catch (error) {
        throw error;
    }
};

export interface FetchUsersOptions {
    limit?: number;
    startAfter?: string;
    descending?: boolean;
}

export const fetchUsers = async (options: FetchUsersOptions = {}) => {
    const { limit, startAfter, descending } = options;

    const params = new URLSearchParams();
    if (limit) params.append('limit', limit.toString());
    if (startAfter) params.append('startAfter', startAfter);
    if (descending !== undefined) params.append('descending', descending.toString());

    const queryString = params.toString();
    const url = `/fetch-user-data${queryString ? `?${queryString}` : ''}`;

    const response = await axiosInstance.get(url);
    return response.data;
};