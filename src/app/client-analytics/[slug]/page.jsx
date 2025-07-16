"use client";

import { useParams } from 'next/navigation';
import Breadcrumb from "@/components/Breadcrumb";
import ClientAnalytics from "@/components/ClientAnalytics";
import MasterLayout from "@/masterLayout/MasterLayout";
import ProtectedRoute from "@/components/auth/ProtectedRoute";
import ClientAccessGuard from "@/components/auth/ClientAccessGuard";

const ClientAnalyticsPage = async ({ params }) => {
  const resolvedParams = await params;
  const clientSlug = resolvedParams?.slug;

  return (
    <ProtectedRoute allowedRoles={['admin', 'client']}>
      <ClientAccessGuard clientSlug={clientSlug}>
        <MasterLayout>
          <Breadcrumb 
            title='Analytics do Cliente' 
            breadcrumbs={[
              { label: 'Dashboards', href: '/dashboards' },
              { label: 'Analytics do Cliente' }
            ]}
          />
          <ClientAnalytics clientSlug={clientSlug} />
        </MasterLayout>
      </ClientAccessGuard>
    </ProtectedRoute>
  );
};

export default ClientAnalyticsPage; 