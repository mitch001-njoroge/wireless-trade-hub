import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { tenants, formatCurrency, getApartmentById } from '@/lib/data';
import { AlertTriangle } from 'lucide-react';

export function OverdueAlerts() {
  const overdueTenants = tenants.filter((t) => t.paymentStatus === 'unpaid' || t.paymentStatus === 'partial');

  return (
    <Card className="animate-fade-in border-warning/30">
      <CardHeader className="flex flex-row items-center gap-2">
        <AlertTriangle className="h-5 w-5 text-warning" />
        <CardTitle className="text-lg font-semibold">Payment Alerts</CardTitle>
      </CardHeader>
      <CardContent>
        {overdueTenants.length === 0 ? (
          <p className="text-sm text-muted-foreground">No overdue payments</p>
        ) : (
          <div className="space-y-4">
            {overdueTenants.map((tenant) => {
              const apartment = getApartmentById(tenant.apartmentId);
              return (
                <div
                  key={tenant.id}
                  className="flex items-center justify-between py-3 border-b border-border last:border-0"
                >
                  <div>
                    <p className="font-medium text-foreground">{tenant.name}</p>
                    <p className="text-sm text-muted-foreground">
                      {apartment?.name} - Unit {tenant.unitNumber}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="font-semibold text-destructive">
                      {formatCurrency(tenant.balance)}
                    </p>
                    <p className="text-xs text-muted-foreground">Outstanding</p>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
