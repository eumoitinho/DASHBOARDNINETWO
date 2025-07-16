"use client";

import Breadcrumb from "@/components/Breadcrumb";
import AddEditClient from "@/components/AddEditClient";
import MasterLayout from "@/masterLayout/MasterLayout";
import ProtectedRoute from "@/components/auth/ProtectedRoute";

const AddClientPage = () => {
  return (
    <ProtectedRoute requiredRole="admin">
      <MasterLayout>
        <Breadcrumb 
          title='Adicionar Cliente' 
          breadcrumbs={[
            { label: 'Clientes', href: '/clients' },
            { label: 'Adicionar Cliente' }
          ]}
        />
        <AddEditClient />
      </MasterLayout>
    </ProtectedRoute>
  );
};

export default AddClientPage; 