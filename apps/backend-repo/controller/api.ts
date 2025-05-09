import { Request, Response } from "express";
import { setUserData, getUsers } from "../repository/userCollection";
import { User, ApiResponse, UserResponse, ApiUserResponse, ApiErrorResponse } from '@/shared/user';
import { recalculateUserScore } from "../core/statusListener";

interface ApiUsersResponse extends Omit<ApiResponse, 'data'> {
    data: User[];
}

export const updateUserData = async (req: Request, res: Response) => {
    const data = req.body as Partial<User>;

    if (!data.id) {
        const response: ApiResponse = {
            success: false,
            message: "User ID is required",
            data: null,
            timestamp: Date.now(),
            code: 400
        };
        return res.status(400).json(response);
    }

    try {
        await setUserData(data);
        await recalculateUserScore(data.id);

        const userResponse: UserResponse = {
            id: data.id,
            email: data.email || "",
            name: data.name || "",
            totalAverageWeightRatings: data.totalAverageWeightRatings,
            numberOfRents: data.numberOfRents,
            recentlyActive: data.recentlyActive
        };

        const response: ApiUserResponse = {
            success: true,
            message: "User data updated successfully",
            data: userResponse,
            timestamp: Date.now(),
            code: 200
        };
        res.json(response);
    } catch (error) {
        const response: ApiErrorResponse = {
            success: false,
            message: "Failed to update user data",
            data: null,
            timestamp: Date.now(),
            code: 500
        };
        res.status(500).json(response);
    }
};

export const fetchAllUsers = async (req: Request, res: Response) => {
    try {
        const limit = req.query.limit ? parseInt(req.query.limit as string) : undefined;
        const startAfter = req.query.startAfter as string | undefined;
        const descending = req.query.descending === undefined ?
            true :
            (req.query.descending === 'true' || req.query.descending === '1');

        const users = await getUsers({
            limit,
            startAfter,
            descending
        });

        const response: ApiUsersResponse = {
            success: true,
            message: "Users retrieved successfully",
            data: users,
            timestamp: Date.now(),
            code: 200
        };

        res.json(response);
    } catch (error) {
        const response: ApiErrorResponse = {
            success: false,
            message: "Failed to fetch users",
            data: null,
            timestamp: Date.now(),
            code: 500
        };
        res.status(500).json(response);
    }
};
