import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { formatCurrency } from '@/lib/data';
import { History, CheckCircle, Clock } from 'lucide-react';
import type { TenantPaymentHistory as PaymentType, TenantRentPeriod } from '@/hooks/useTenantRentData';

interface TenantPaymentHistoryProps {
  payments: PaymentType[];
  periods: TenantRentPeriod[];
}

export function TenantPaymentHistory({ payments, periods }: TenantPaymentHistoryProps) {
  const getMonthName = (month: number) => {
    return new Date(2000, month - 1).toLocaleString('default', { month: 'short' });
  };

  const getPeriodForPayment = (rentPeriodId: string) => {
    return periods.find(p => p.id === rentPeriodId);
  };

  const getPaymentMethodLabel = (method: string) => {
    switch (method) {
      case 'mpesa':
        return 'M-Pesa';
      case 'bank_transfer':
        return 'Bank Transfer';
      case 'cash':
        return 'Cash';
      default:
        return method;
    }
  };

  if (payments.length === 0) {
    return (
      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <History className="h-5 w-5 text-primary" />
            <CardTitle>Payment History</CardTitle>
          </div>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8 text-muted-foreground">
            <History className="h-12 w-12 mx-auto mb-3 opacity-50" />
            <p>No payment history yet</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center gap-2">
          <History className="h-5 w-5 text-primary" />
          <CardTitle>Payment History</CardTitle>
        </div>
      </CardHeader>
      <CardContent>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b">
                <th className="text-left py-3 px-2 text-sm font-medium text-muted-foreground">Month</th>
                <th className="text-left py-3 px-2 text-sm font-medium text-muted-foreground">Amount</th>
                <th className="text-left py-3 px-2 text-sm font-medium text-muted-foreground">Method</th>
                <th className="text-left py-3 px-2 text-sm font-medium text-muted-foreground">Reference</th>
                <th className="text-left py-3 px-2 text-sm font-medium text-muted-foreground">Date</th>
                <th className="text-left py-3 px-2 text-sm font-medium text-muted-foreground">Status</th>
              </tr>
            </thead>
            <tbody>
              {payments.map((payment) => {
                const period = getPeriodForPayment(payment.rent_period_id);
                return (
                  <tr key={payment.id} className="border-b last:border-0">
                    <td className="py-3 px-2 text-sm">
                      {period 
                        ? `${getMonthName(period.month)} ${period.year}`
                        : '-'
                      }
                    </td>
                    <td className="py-3 px-2 text-sm font-medium">
                      {formatCurrency(payment.amount)}
                    </td>
                    <td className="py-3 px-2 text-sm">
                      {getPaymentMethodLabel(payment.payment_method)}
                    </td>
                    <td className="py-3 px-2 text-sm font-mono text-xs">
                      {payment.mpesa_receipt || payment.bank_reference || payment.transaction_id || '-'}
                    </td>
                    <td className="py-3 px-2 text-sm text-muted-foreground">
                      {new Date(payment.payment_date).toLocaleDateString()}
                    </td>
                    <td className="py-3 px-2">
                      {payment.verified ? (
                        <Badge className="bg-success text-success-foreground text-xs">
                          <CheckCircle className="h-3 w-3 mr-1" />
                          Verified
                        </Badge>
                      ) : (
                        <Badge variant="secondary" className="text-xs">
                          <Clock className="h-3 w-3 mr-1" />
                          Pending
                        </Badge>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </CardContent>
    </Card>
  );
}
