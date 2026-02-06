import { Layout } from "@/components/layout/Layout";
import { StatsCard } from "@/components/dashboard/StatsCard";
import { ApartmentOverview } from "@/components/dashboard/ApartmentOverview";
import { RecentPayments } from "@/components/dashboard/RecentPayments";
import { OverdueAlerts } from "@/components/dashboard/OverdueAlerts";
import { PaymentStatusOverview } from "@/components/dashboard/PaymentStatusOverview";
import { apartments, loadTenants, formatCurrency } from "@/lib/data";
import { Building2, Users, CreditCard, AlertCircle } from "lucide-react";

const Index = () => {
  const tenants = loadTenants();
  const totalTenants = tenants.length;
  const totalExpectedRent = apartments.reduce((sum, apt) => sum + apt.monthlyRevenue, 0);
  const totalCollectedRent = tenants.reduce((sum, t) => sum + t.amountPaid, 0);
  const overdueTenants = tenants.filter((t) => t.paymentStatus === "unpaid" || t.paymentStatus === "partial").length;
  const collectionRate = totalExpectedRent > 0 ? ((totalCollectedRent / totalExpectedRent) * 100).toFixed(1) : "0";

  return (
    <Layout>
      <div className="space-y-8 pt-12 lg:pt-0">
        {/* Header */}
        <div>
          <h1 className="text-2xl font-bold text-foreground">Dashboard</h1>
          <p className="text-muted-foreground">Welcome back to Wireless Trade</p>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <StatsCard
            title="Total Apartments"
            value={apartments.length.toString()}
            subtitle={`${apartments.reduce((sum, apt) => sum + apt.totalUnits, 0)} total units`}
            icon={Building2}
          />
          <StatsCard
            title="Total Tenants"
            value={totalTenants.toString()}
            subtitle={`${apartments.reduce((sum, apt) => sum + apt.occupiedUnits, 0)} units occupied`}
            icon={Users}
          />
          <StatsCard
            title="Monthly Collection"
            value={formatCurrency(totalCollectedRent)}
            subtitle={`${collectionRate}% collected`}
            icon={CreditCard}
            trend={{ value: `${collectionRate}%`, positive: parseFloat(collectionRate) > 85 }}
          />
          <StatsCard
            title="Overdue Payments"
            value={overdueTenants.toString()}
            subtitle="Tenants with balance"
            icon={AlertCircle}
          />
        </div>

        {/* Main Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2">
            <ApartmentOverview />
          </div>
          <PaymentStatusOverview />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <OverdueAlerts />
          <RecentPayments />
        </div>
      </div>
    </Layout>
  );
};

export default Index;
