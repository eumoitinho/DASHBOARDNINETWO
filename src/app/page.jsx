"use client";

import { useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { Icon } from "@iconify/react/dist/iconify.js";



const Page = () => {
  const { data: session, status } = useSession();
  const router = useRouter();

  useEffect(() => {
    if (status === 'loading') return; // Still loading

    if (!session) {
      // Not authenticated, redirect to login
      router.push('/login');
      return;
    }

    // Redirect based on user role
    if (session.user.role === 'admin') {
      router.push('/dashboards');
    } else {
      router.push(`/portal/${session.user.clientSlug}`);
    }
  }, [session, status, router]);

  // Loading screen while redirecting
  return (
    <div className="d-flex justify-content-center align-items-center vh-100">
      <div className="text-center">
        <div className="mb-4">
          <img 
            src="/assets/images/logo.png" 
            alt="NINETWODASH" 
            style={{ maxWidth: '200px', height: 'auto' }}
          />
        </div>
        <div className="spinner-border text-primary mb-3" role="status">
          <span className="visually-hidden">Carregando...</span>
        </div>
        <h5 className="text-primary mb-2">NINETWODASH</h5>
        <p className="text-muted">
          {status === 'loading' ? 'Verificando autenticação...' : 'Redirecionando...'}
        </p>
      </div>
    </div>
  );
};

export default Page;
