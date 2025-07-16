"use client";

import Breadcrumb from "@/components/Breadcrumb";
import ClientTagsManager from "@/components/ClientTagsManager";
import MasterLayout from "@/masterLayout/MasterLayout";
import ProtectedRoute from "@/components/auth/ProtectedRoute";

const ClientTagsPage = () => {
  return (
    <ProtectedRoute requiredRole="admin">
      <MasterLayout>
        <Breadcrumb 
          title='Gerenciar Tags' 
          breadcrumbs={[
            { label: 'Gestão de Clientes', href: '/clients' },
            { label: 'Gerenciar Tags' }
          ]}
        />
        <ClientTagsManager />
      </MasterLayout>
    </ProtectedRoute>
  );
};

export default ClientTagsPage; 