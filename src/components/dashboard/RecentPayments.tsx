import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { recentPayments, formatCurrency } from '@/lib/data';

export function RecentPayments() {
  return (
    <Card className="animate-fade-in">
      <CardHeader>
        <CardTitle className="text-lg font-semibold">Recent Payments</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {recentPayments.map((payment) => (
            <div
              key={payment.id}
              className="flex items-center justify-between py-3 border-b border-border last:border-0"
            >
              <div>
                <p className="font-medium text-foreground">{payment.tenantName}</p>
                <p className="text-sm text-muted-foreground">{payment.apartmentName}</p>
              </div>
              <div className="text-right">
                <p className="font-semibold text-success">{formatCurrency(payment.amount)}</p>
                <p className="text-xs text-muted-foreground">{payment.date}</p>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
