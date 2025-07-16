"use client";

import { useParams } from 'next/navigation';
import ClientPortalDashboard from "@/components/client-portal/ClientPortalDashboard";
import ProtectedRoute from "@/components/auth/ProtectedRoute";
import ClientAccessGuard from "@/components/auth/ClientAccessGuard";

const ClientPortalPage = () => {
  const params = useParams();
  const clientSlug = params?.client;

  return (
    <ProtectedRoute allowedRoles={['admin', 'client']}>
      <ClientAccessGuard clientSlug={clientSlug}>
        <ClientPortalDashboard clientSlug={clientSlug} />
      </ClientAccessGuard>
    </ProtectedRoute>
  );
};

export default ClientPortalPage;