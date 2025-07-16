"use client";

import Breadcrumb from "@/components/Breadcrumb";
import BudgetManager from "@/components/BudgetManager";
import MasterLayout from "@/masterLayout/MasterLayout";
import ProtectedRoute from "@/components/auth/ProtectedRoute";

const BudgetsPage = () => {
  return (
    <ProtectedRoute requiredRole="admin">
      <MasterLayout>
        <Breadcrumb 
          title='Gerenciar Orçamentos' 
          breadcrumbs={[
            { label: 'Gestão de Clientes', href: '/clients' },
            { label: 'Orçamentos' }
          ]}
        />
        <BudgetManager />
      </MasterLayout>
    </ProtectedRoute>
  );
};

export default BudgetsPage; 