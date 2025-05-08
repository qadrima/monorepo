// store/store.ts
import { configureStore } from '@reduxjs/toolkit';
import authReducer from './reducers';
import usersReducer from './usersReducer';

export const store = configureStore({
    reducer: {
        auth: authReducer,
        users: usersReducer,
    },
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
