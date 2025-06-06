// components/SecurityGuard.tsx
'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';

export default function SecurityGuard({ children }: { children: React.ReactNode }) {
  const [authorized, setAuthorized] = useState(false);
  const router = useRouter();

  useEffect(() => {
    const checkAuth = async () => {
      const res = await fetch('/api/auth/check', { cache: 'no-store' });
      if (res.ok) setAuthorized(true);
      else router.push('/admin');
    };

    checkAuth();
  }, [router]);

  if (!authorized) return <div className='loader'></div>;

  return <>{children}</>;
}