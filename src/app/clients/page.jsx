"use client";

import Breadcrumb from "@/components/Breadcrumb";
import ClientList from "@/components/ClientList";
import MasterLayout from "@/masterLayout/MasterLayout";
import ProtectedRoute from "@/components/auth/ProtectedRoute";

const ClientsPage = () => {
  return (
    <ProtectedRoute requiredRole="admin">
      <MasterLayout>
        <Breadcrumb 
          title='Clientes' 
          breadcrumbs={[
            { label: 'Clientes', href: '/clients' }
          ]}
        />
        <ClientList />
      </MasterLayout>
    </ProtectedRoute>
  );
};

export default ClientsPage; 