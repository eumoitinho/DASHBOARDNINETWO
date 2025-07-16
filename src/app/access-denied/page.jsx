"use client";

import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { Icon } from "@iconify/react/dist/iconify.js";

const AccessDeniedPage = () => {
  const { data: session } = useSession();
  const router = useRouter();

  const handleGoBack = () => {
    if (session?.user?.role === 'admin') {
      router.push('/dashboards');
    } else if (session?.user?.role === 'client') {
      router.push(`/portal/${session.user.clientSlug}`);
    } else {
      router.push('/login');
    }
  };

  return (
    <div className="d-flex justify-content-center align-items-center vh-100">
      <div className="text-center">
        <div className="mb-4">
          <Icon 
            icon="solar:shield-cross-bold" 
            className="text-danger" 
            style={{ fontSize: '120px' }}
          />
        </div>
        
        <h1 className="display-4 text-danger mb-3">403</h1>
        <h2 className="h4 mb-3">Acesso Negado</h2>
        
        <div className="alert alert-danger d-inline-block" role="alert">
          <Icon icon="solar:danger-circle-bold" className="me-2" />
          Você não tem permissão para acessar esta página.
        </div>
        
        <div className="mt-4">
          <p className="text-muted mb-4">
            {session?.user?.role === 'admin' 
              ? 'Verifique se a URL está correta ou se o recurso existe.'
              : 'Esta área é restrita. Você só pode acessar conteúdo do seu cliente.'
            }
          </p>
          
          <div className="d-flex gap-3 justify-content-center">
            <button 
              onClick={handleGoBack}
              className="btn btn-primary"
            >
              <Icon icon="solar:home-bold" className="me-2" />
              Voltar ao Dashboard
            </button>
            
            <button 
              onClick={() => router.back()}
              className="btn btn-outline-secondary"
            >
              <Icon icon="solar:arrow-left-bold" className="me-2" />
              Voltar
            </button>
          </div>
        </div>
        
        {session?.user && (
          <div className="mt-4 p-3 bg-light rounded">
            <small className="text-muted">
              <strong>Usuário:</strong> {session.user.name} ({session.user.role})
              {session.user.role === 'client' && (
                <>
                  <br />
                  <strong>Cliente:</strong> {session.user.clientSlug}
                </>
              )}
            </small>
          </div>
        )}
      </div>
    </div>
  );
};

export default AccessDeniedPage;
