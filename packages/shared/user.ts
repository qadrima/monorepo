export interface ApiResponse<T = null> {
    success: boolean;
    message: string;
    data: T;
    timestamp: number;
    code: number;
}

export interface User {
    id: string;
    name: string;
    email: string;
    token: string;
    totalAverageWeightRatings?: number;
    numberOfRents?: number;
    recentlyActive?: number;
    compositeScore?: number;
}

export interface UserResponse extends Omit<User, 'token'> { }

export type ApiUserResponse = ApiResponse<UserResponse>;
export type ApiErrorResponse = ApiResponse<null>;