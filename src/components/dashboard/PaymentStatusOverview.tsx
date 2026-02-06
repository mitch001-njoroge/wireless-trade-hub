import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { CheckCircle, Clock, AlertTriangle, CreditCard } from 'lucide-react';
import { formatCurrency, loadTenants } from '@/lib/data';
import { useMemo } from 'react';

export function PaymentStatusOverview() {
  const tenants = loadTenants();
  
  const stats = useMemo(() => {
    const paid = tenants.filter(t => t.paymentStatus === 'paid').length;
    const partial = tenants.filter(t => t.paymentStatus === 'partial').length;
    const unpaid = tenants.filter(t => t.paymentStatus === 'unpaid').length;
    const total = tenants.length;
    
    const totalExpected = tenants.reduce((sum, t) => sum + t.rentAmount, 0);
    const totalCollected = tenants.reduce((sum, t) => sum + t.amountPaid, 0);
    
    return {
      paid,
      partial,
      unpaid,
      total,
      totalExpected,
      totalCollected,
      paidPercentage: total > 0 ? Math.round((paid / total) * 100) : 0,
      collectionRate: totalExpected > 0 ? Math.round((totalCollected / totalExpected) * 100) : 0,
    };
  }, [tenants]);

  return (
    <Card className="animate-fade-in">
      <CardHeader className="pb-2">
        <CardTitle className="text-lg flex items-center gap-2">
          <CreditCard className="h-5 w-5 text-primary" />
          Payment Status Overview
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Status Indicators */}
        <div className="grid grid-cols-3 gap-4">
          <div className="text-center p-3 rounded-lg bg-success/10 border border-success/20">
            <div className="flex items-center justify-center gap-1 mb-1">
              <CheckCircle className="h-4 w-4 text-success" />
              <span className="text-2xl font-bold text-success">{stats.paid}</span>
            </div>
            <p className="text-xs text-muted-foreground">Paid</p>
          </div>
          
          <div className="text-center p-3 rounded-lg bg-amber-500/10 border border-amber-500/20">
            <div className="flex items-center justify-center gap-1 mb-1">
              <Clock className="h-4 w-4 text-amber-500" />
              <span className="text-2xl font-bold text-amber-500">{stats.partial}</span>
            </div>
            <p className="text-xs text-muted-foreground">Partial</p>
          </div>
          
          <div className="text-center p-3 rounded-lg bg-destructive/10 border border-destructive/20">
            <div className="flex items-center justify-center gap-1 mb-1">
              <AlertTriangle className="h-4 w-4 text-destructive" />
              <span className="text-2xl font-bold text-destructive">{stats.unpaid}</span>
            </div>
            <p className="text-xs text-muted-foreground">Unpaid</p>
          </div>
        </div>

        {/* Collection Progress */}
        <div className="space-y-2">
          <div className="flex justify-between text-sm">
            <span className="text-muted-foreground">Collection Rate</span>
            <span className="font-medium">{stats.collectionRate}%</span>
          </div>
          <Progress value={stats.collectionRate} className="h-2" />
          <div className="flex justify-between text-xs text-muted-foreground">
            <span>Collected: {formatCurrency(stats.totalCollected)}</span>
            <span>Expected: {formatCurrency(stats.totalExpected)}</span>
          </div>
        </div>

        {/* Quick Stats */}
        <div className="pt-2 border-t">
          <div className="flex justify-between items-center">
            <span className="text-sm text-muted-foreground">Total Units</span>
            <span className="font-medium">{stats.total}</span>
          </div>
          <div className="flex justify-between items-center mt-1">
            <span className="text-sm text-muted-foreground">Payment Rate</span>
            <span className="font-medium text-success">{stats.paidPercentage}% fully paid</span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
