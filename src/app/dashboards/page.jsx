"use client";

import Breadcrumb from "@/components/Breadcrumb";
import DashboardsList from "@/components/DashboardsList";
import MasterLayout from "@/masterLayout/MasterLayout";
import ProtectedRoute from "@/components/auth/ProtectedRoute";

const DashboardsPage = () => {
  return (
    <ProtectedRoute requiredRole="admin">
      <MasterLayout>
        <Breadcrumb 
          title='Dashboards dos Clientes' 
          breadcrumbs={[
            { label: 'Dashboards', href: '/dashboards' }
          ]}
        />
        <DashboardsList />
      </MasterLayout>
    </ProtectedRoute>
  );
};

export default DashboardsPage; 