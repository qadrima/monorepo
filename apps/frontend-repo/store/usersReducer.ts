import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { User } from "../../../packages/shared/user";

interface UsersState {
    users: User[] | [];
}

const initialState: UsersState = {
    users: [],
};

const themeSlice = createSlice({
    name: 'users',
    initialState,
    reducers: {
        setUsers: (state, action: PayloadAction<User[]>) => {
            state.users = action.payload;
        },
        addUsers: (state, action: PayloadAction<User[]>) => {
            state.users = [...state.users, ...action.payload];
        },
    },
});

export const { setUsers, addUsers } = themeSlice.actions;
export default themeSlice.reducer;