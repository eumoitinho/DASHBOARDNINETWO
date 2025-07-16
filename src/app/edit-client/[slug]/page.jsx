"use client";

import Breadcrumb from "@/components/Breadcrumb";
import AddEditClient from "@/components/AddEditClient";
import MasterLayout from "@/masterLayout/MasterLayout";
import ProtectedRoute from "@/components/auth/ProtectedRoute";

const EditClientPage = async ({ params }) => {
  const resolvedParams = await params;
  
  return (
    <ProtectedRoute requiredRole="admin">
      <MasterLayout>
        <Breadcrumb 
          title='Editar Cliente' 
          breadcrumbs={[
            { label: 'Clientes', href: '/clients' },
            { label: 'Editar Cliente' }
          ]}
        />
        <AddEditClient clientSlug={resolvedParams.slug} />
      </MasterLayout>
    </ProtectedRoute>
  );
};

export default EditClientPage; 