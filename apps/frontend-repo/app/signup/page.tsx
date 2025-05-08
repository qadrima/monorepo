'use client';

import { useSelector } from 'react-redux';
import { RootState } from '@/store/store';
import SignupForm from '@/components/SignupForm';

export default function LoginPage() {
    const { user, loadingAuth } = useSelector((state: RootState) => state.auth);

    if (!loadingAuth && !user) return (
        <main>
            <SignupForm />
        </main>
    );
}
