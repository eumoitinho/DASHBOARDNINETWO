import Breadcrumb from "@/components/Breadcrumb";
import AgencyDashboard from "@/components/AgencyDashboard";
import MasterLayout from "@/masterLayout/MasterLayout";

export const metadata = {
  title: "Dashboard da Agência - WowDash NEXT JS",
  description:
    "Dashboard para agências de tráfego pago gerenciarem múltiplos clientes e suas analytics",
};

const Page = () => {
  return (
    <>
      {/* MasterLayout */}
      <MasterLayout>
        {/* Breadcrumb */}
        <Breadcrumb title='Dashboard da Agência' />

        {/* AgencyDashboard */}
        <AgencyDashboard />
      </MasterLayout>
    </>
  );
};

export default Page;
