'use client';

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/components/providers/auth-provider';
import { AdminNav } from '@/components/admin/admin-nav';

import { getUserRole } from '@/lib/user-roles';

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { user, loading } = useAuth();
  const router = useRouter();
  const [isAdmin, setIsAdmin] = useState<boolean | null>(null);

  useEffect(() => {
    async function checkAdminRole() {
      if (!loading && user) {
        const role = await getUserRole(user.uid);
        setIsAdmin(role === 'admin');
      } else if (!loading && !user) {
        setIsAdmin(false);
      }
    }
    
    checkAdminRole();
  }, [user, loading]);

  useEffect(() => {
    if (!loading && isAdmin !== null) {
      if (!user) {
        // Not logged in - redirect to auth immediately
        router.replace('/');
      } else if (!isAdmin) {
        // Not an admin - redirect to dashboard immediately
        router.replace('/dashboard');
      }
    }
  }, [user, loading, isAdmin, router]);

  // Show loading state
  if (loading || isAdmin === null) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading...</p>
        </div>
      </div>
    );
  }

  // Show 404 if not admin (hide admin pages from regular users)
  if (!user || !isAdmin) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen">
        <div className="text-center space-y-4">
          <h1 className="text-9xl font-bold text-muted-foreground/20">404</h1>
          <h2 className="text-2xl font-bold">Page Not Found</h2>
          <p className="text-muted-foreground">The page you are looking for does not exist.</p>
          <button
            onClick={() => router.push('/dashboard')}
            className="mt-4 px-4 py-2 bg-primary text-primary-foreground rounded-md hover:bg-primary/90"
          >
            Go to Dashboard
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen">
      <AdminNav />
      <main className="flex-1 w-full lg:w-auto overflow-x-hidden">
        <div className="p-4 sm:p-6 lg:p-8">
          {children}
        </div>
      </main>
    </div>
  );
}
