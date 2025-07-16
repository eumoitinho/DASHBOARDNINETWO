/**
 * Client Access Guard Component for NINETWODASH
 * Protects client-specific routes and data access
 */

"use client";

import { useParams } from 'next/navigation';
import { useClientAccess } from '@/hooks/useAuth';
import LoadingSpinner from '@/components/LoadingSpinner';

const ClientAccessGuard = ({ children, clientSlug = null }) => {
  const params = useParams();
  const targetSlug = clientSlug || params?.client || params?.id;
  const { canAccess, isAdmin, ownClient } = useClientAccess(targetSlug);

  // Debug temporário
  console.log('ClientAccessGuard Debug:', {
    targetSlug,
    canAccess,
    isAdmin,
    ownClient,
    params
  });

  if (!canAccess) {
    return (
      <div className="d-flex justify-content-center align-items-center vh-100">
        <div className="text-center">
          <div className="alert alert-danger">
            <h4 className="alert-heading">Acesso Negado</h4>
            <p>Você não tem permissão para acessar este conteúdo.</p>
            <hr />
            <p className="mb-0">
              {isAdmin 
                ? 'Verifique se o cliente existe.' 
                : 'Você só pode acessar dados do seu próprio cliente.'
              }
            </p>
          </div>
        </div>
      </div>
    );
  }

  return children;
};

export default ClientAccessGuard;