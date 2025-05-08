import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { User } from "../../../packages/shared/user";

export type ThemeMode = 'light' | 'dark';

const getInitialTheme = (): ThemeMode => {
    if (typeof window !== 'undefined') {
        const storedTheme = localStorage.getItem('theme');
        if (storedTheme === 'dark' || storedTheme === 'light') {
            return storedTheme;
        }
    }
    return 'light';
};

interface AuthState {
    user: User | null;
    tempUid: string | null;
    loadingAuth: boolean;
    loadingForm: boolean;
    themeMode: ThemeMode;
    errorMessage: string | null;
    successMessage: string | null;
}

const initialState: AuthState = {
    user: null,
    tempUid: null,
    loadingAuth: true,
    loadingForm: false,
    themeMode: getInitialTheme(),
    errorMessage: null,
    successMessage: null,
};

const authSlice = createSlice({
    name: 'auth',
    initialState,
    reducers: {
        setUser: (state, action: PayloadAction<User>) => {
            if (state.user?.id === action.payload.id) return;
            state.user = action.payload;
            state.tempUid = action.payload.id;
            state.loadingAuth = false;
        },
        setTempUid: (state, action: PayloadAction<string | null>) => {
            state.tempUid = action.payload;
        },
        clearUser: (state) => {
            if (!state.user && state.loadingAuth === false) return;
            state.user = null;
            state.loadingAuth = false;
        },
        setLoadingAuth: (state, action: PayloadAction<boolean>) => {
            state.loadingAuth = action.payload;
            if (action.payload) {
                state.errorMessage = null;
                state.successMessage = null;
            }
        },
        setLoadingForm: (state, action: PayloadAction<boolean>) => {
            state.loadingForm = action.payload;
            if (action.payload) {
                state.errorMessage = null;
                state.successMessage = null;
            }
        },
        setThemeMode: (state, action: PayloadAction<ThemeMode>) => {
            console.log('setThemeMode', action.payload);
            state.themeMode = action.payload;
            if (typeof window !== 'undefined') {
                localStorage.setItem('theme', action.payload);
            }
        },
        setMessage: (
            state,
            action: PayloadAction<{ successMessage: string | null; errorMessage: string | null }>
        ) => {
            state.successMessage = action.payload.successMessage;
            state.errorMessage = action.payload.errorMessage;
        },
    },
});


export const { setUser, clearUser, setLoadingForm, setLoadingAuth, setThemeMode, setMessage, setTempUid } = authSlice.actions;
export default authSlice.reducer;
