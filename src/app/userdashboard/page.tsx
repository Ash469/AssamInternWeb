'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function UserDashboardRedirect() {
  const router = useRouter();

  useEffect(() => {
    // Normal website model: Citizens track their submitted applications directly on /application/status
    router.replace('/application/status');
  }, [router]);

  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center">
      <div className="w-8 h-8 border-2 border-slate-300 border-t-slate-800 rounded-full animate-spin"></div>
    </div>
  );
}
