'use client';

import { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { AppDispatch, RootState } from '@/store/store';
import { listenToAuthChanges } from '@/store/actions';
import { useRouter, usePathname } from 'next/navigation';
import LoadingPage from '@/components/LoadingPage';
import { usePresence } from '@/utils/usePresence';

import { ThemeProvider, CssBaseline } from '@mui/material';
import { createTheme } from '@mui/material/styles';

const lightTheme = createTheme({
    palette: {
        mode: 'light',
        primary: {
            main: '#1976d2',
        },
        secondary: {
            main: '#9c27b0',
        },
    },
});

const darkTheme = createTheme({
    palette: {
        mode: 'dark',
        primary: {
            main: '#90caf9',
        },
        secondary: {
            main: '#f48fb1',
        },
    },
});

export default function AuthProvider({ children }: { children: React.ReactNode }) {
    const dispatch = useDispatch<AppDispatch>();
    const router = useRouter();
    const pathname = usePathname();

    const { user, loadingAuth, themeMode } = useSelector((state: RootState) => state.auth);

    // Listen to auth changes
    useEffect(() => {
        const unsubscribe = dispatch(listenToAuthChanges());
        return () => unsubscribe();
    }, [dispatch]);

    usePresence();

    useEffect(() => {
        if (!loadingAuth) {
            if (user) {
                router.push('/');
            }
            else if (pathname !== '/login' && pathname !== '/signup') {
                router.push('/login');
            }
        }
    }, [loadingAuth, user, pathname, router]);

    const theme = themeMode === 'light' ? lightTheme : darkTheme;
    return (
        <ThemeProvider theme={theme}>
            <CssBaseline />
            {loadingAuth ? <LoadingPage /> : children}
        </ThemeProvider>
    );
}
