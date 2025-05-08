// components/ClientWrapper.tsx
'use client';

import { Provider } from 'react-redux';
import { store } from '@/store/store';
import AuthProvider from './AuthProvider';
import { useEffect, useState } from 'react';

export default function ClientWrapper({ children }: { children: React.ReactNode }) {
    // console.log('ClientWrapper rendered');
    const [isHydrated, setIsHydrated] = useState(false);

    useEffect(() => {
        setIsHydrated(true);
    }, []);

    // if (!isHydrated) return null;

    return (
        <Provider store={store}>
            <AuthProvider>{children}</AuthProvider>
        </Provider>
    );
}
