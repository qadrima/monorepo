'use client';

import { useSelector } from 'react-redux';
import { RootState } from '@/store/store';
import Dashboard from '@/components/Dashboard';

export default function HomePage() {
  const { user } = useSelector((state: RootState) => state.auth);

  if (user) return (
    <main>
      <Dashboard />
    </main>
  );
}
