import { useState } from 'react';
import { Navigate } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { useUserRole } from '@/hooks/useUserRole';
import { useTenantRentData } from '@/hooks/useTenantRentData';
import { TenantPaymentDialog } from '@/components/tenant/TenantPaymentDialog';
import { TenantPaymentHistory } from '@/components/tenant/TenantPaymentHistory';
import { TenantHeader } from '@/components/tenant/TenantHeader';
import { formatCurrency } from '@/lib/data';
import { Home, Calendar, CreditCard, CheckCircle, AlertTriangle, Clock } from 'lucide-react';

const TenantDashboard = () => {
  const { user, role, isLoading: isRoleLoading, isTenant, tenantRecord } = useUserRole();
  const { currentPeriod, allPeriods, payments, isLoading: isDataLoading } = useTenantRentData(tenantRecord?.id);
  const [paymentDialogOpen, setPaymentDialogOpen] = useState(false);

  // Redirect if not authenticated
  if (!isRoleLoading && !user) {
    return <Navigate to="/login" replace />;
  }

  // Redirect admins to main dashboard
  if (!isRoleLoading && role === 'admin') {
    return <Navigate to="/" replace />;
  }

  // Show loading state
  if (isRoleLoading || isDataLoading) {
    return (
      <div className="min-h-screen bg-background p-4 md:p-8">
        <div className="max-w-4xl mx-auto space-y-6">
          <Skeleton className="h-16 w-full" />
          <Skeleton className="h-48 w-full" />
          <Skeleton className="h-64 w-full" />
        </div>
      </div>
    );
  }

  // Show error if no tenant record found
  if (isTenant && !tenantRecord) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center p-4">
        <Card className="max-w-md w-full">
          <CardHeader>
            <CardTitle className="text-destructive">Account Not Linked</CardTitle>
            <CardDescription>
              Your account is not linked to a tenant record. Please contact your landlord.
            </CardDescription>
          </CardHeader>
        </Card>
      </div>
    );
  }

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'paid':
        return (
          <Badge className="bg-success text-success-foreground">
            <CheckCircle className="h-3 w-3 mr-1" />
            PAID
          </Badge>
        );
      case 'partial':
        return (
          <Badge className="bg-warning text-warning-foreground">
            <Clock className="h-3 w-3 mr-1" />
            PARTIAL
          </Badge>
        );
      case 'overdue':
        return (
          <Badge variant="destructive">
            <AlertTriangle className="h-3 w-3 mr-1" />
            OVERDUE
          </Badge>
        );
      default:
        return (
          <Badge variant="secondary">
            <Clock className="h-3 w-3 mr-1" />
            UNPAID
          </Badge>
        );
    }
  };

  const getMonthName = (month: number) => {
    return new Date(2000, month - 1).toLocaleString('default', { month: 'long' });
  };

  const balance = currentPeriod?.balance ?? (tenantRecord?.rent_amount ?? 0);
  const canPay = currentPeriod && currentPeriod.status !== 'paid' && balance > 0;

  return (
    <div className="min-h-screen bg-background">
      <TenantHeader tenantName={tenantRecord?.name ?? ''} />
      
      <main className="max-w-4xl mx-auto p-4 md:p-8 space-y-6">
        {/* Tenant Info Card */}
        <Card>
          <CardHeader className="pb-3">
            <div className="flex items-center gap-2">
              <Home className="h-5 w-5 text-primary" />
              <CardTitle>My Apartment</CardTitle>
            </div>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div>
                <p className="text-sm text-muted-foreground">Name</p>
                <p className="font-medium">{tenantRecord?.name}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Apartment</p>
                <p className="font-medium">{tenantRecord?.apartment_name}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Unit</p>
                <p className="font-medium">{tenantRecord?.unit_number}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Monthly Rent</p>
                <p className="font-medium">{formatCurrency(tenantRecord?.rent_amount ?? 0)}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Current Rent Status Card */}
        <Card className="border-2">
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Calendar className="h-5 w-5 text-primary" />
                <CardTitle>
                  {currentPeriod 
                    ? `${getMonthName(currentPeriod.month)} ${currentPeriod.year} Rent`
                    : `${getMonthName(new Date().getMonth() + 1)} ${new Date().getFullYear()} Rent`
                  }
                </CardTitle>
              </div>
              {currentPeriod && getStatusBadge(currentPeriod.status)}
            </div>
            {currentPeriod?.due_date && (
              <CardDescription>
                Due: {new Date(currentPeriod.due_date).toLocaleDateString()}
              </CardDescription>
            )}
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-3 gap-4 mb-6">
              <div className="text-center p-4 bg-muted rounded-lg">
                <p className="text-sm text-muted-foreground">Rent Amount</p>
                <p className="text-xl font-bold">
                  {formatCurrency(currentPeriod?.rent_amount ?? tenantRecord?.rent_amount ?? 0)}
                </p>
              </div>
              <div className="text-center p-4 bg-success/10 rounded-lg">
                <p className="text-sm text-muted-foreground">Amount Paid</p>
                <p className="text-xl font-bold text-success">
                  {formatCurrency(currentPeriod?.amount_paid ?? 0)}
                </p>
              </div>
              <div className="text-center p-4 bg-destructive/10 rounded-lg">
                <p className="text-sm text-muted-foreground">Balance</p>
                <p className="text-xl font-bold text-destructive">
                  {formatCurrency(balance)}
                </p>
              </div>
            </div>

            {canPay ? (
              <Button 
                size="lg" 
                className="w-full"
                onClick={() => setPaymentDialogOpen(true)}
              >
                <CreditCard className="h-4 w-4 mr-2" />
                Pay Rent Now
              </Button>
            ) : currentPeriod?.status === 'paid' ? (
              <div className="text-center py-4 bg-success/10 rounded-lg">
                <CheckCircle className="h-8 w-8 text-success mx-auto mb-2" />
                <p className="font-medium text-success">Rent Fully Paid</p>
                <p className="text-sm text-muted-foreground">Thank you for your payment!</p>
              </div>
            ) : (
              <div className="text-center py-4 bg-muted rounded-lg">
                <p className="text-muted-foreground">No rent period found for this month</p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Payment History */}
        <TenantPaymentHistory 
          payments={payments} 
          periods={allPeriods}
        />
      </main>

      {/* Payment Dialog */}
      {tenantRecord && currentPeriod && (
        <TenantPaymentDialog
          open={paymentDialogOpen}
          onOpenChange={setPaymentDialogOpen}
          tenantId={tenantRecord.id}
          tenantName={tenantRecord.name}
          unitNumber={tenantRecord.unit_number}
          rentPeriodId={currentPeriod.id}
          amount={balance}
          month={currentPeriod.month}
          year={currentPeriod.year}
        />
      )}
    </div>
  );
};

export default TenantDashboard;
