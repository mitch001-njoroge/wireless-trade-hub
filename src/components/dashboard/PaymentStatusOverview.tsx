import { useEffect } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { CheckCircle, Clock, AlertTriangle, CreditCard } from 'lucide-react';
import { formatCurrency, loadTenants } from '@/lib/data';
import { supabase } from '@/integrations/supabase/client';

export function PaymentStatusOverview() {
  const queryClient = useQueryClient();
  
  // Fetch from database for real-time stats
  const { data: dbStats } = useQuery({
    queryKey: ['rent-period-stats'],
    queryFn: async () => {
      const currentMonth = new Date().getMonth() + 1;
      const currentYear = new Date().getFullYear();
      
      const { data, error } = await supabase
        .from('rent_periods')
        .select('status, rent_amount, amount_paid')
        .eq('month', currentMonth)
        .eq('year', currentYear);

      if (error) {
        console.error('Error fetching rent period stats:', error);
        return null;
      }

      const stats = {
        paid: 0,
        partial: 0,
        unpaid: 0,
        overdue: 0,
        totalExpected: 0,
        totalCollected: 0,
      };

      (data || []).forEach((period) => {
        if (period.status === 'paid') stats.paid++;
        else if (period.status === 'partial') stats.partial++;
        else if (period.status === 'overdue') stats.overdue++;
        else stats.unpaid++;
        
        stats.totalExpected += Number(period.rent_amount);
        stats.totalCollected += Number(period.amount_paid);
      });

      return {
        ...stats,
        total: data?.length || 0,
      };
    },
    refetchInterval: 30000, // Refetch every 30 seconds
  });

  // Subscribe to real-time updates
  useEffect(() => {
    const channel = supabase
      .channel('admin-rent-updates')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'rent_periods',
        },
        () => {
          // Invalidate and refetch stats
          queryClient.invalidateQueries({ queryKey: ['rent-period-stats'] });
        }
      )
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'rent_payments',
        },
        () => {
          queryClient.invalidateQueries({ queryKey: ['rent-period-stats'] });
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [queryClient]);

  // Fallback to local storage data if DB not available
  const tenants = loadTenants();
  const localStats = {
    paid: tenants.filter(t => t.paymentStatus === 'paid').length,
    partial: tenants.filter(t => t.paymentStatus === 'partial').length,
    unpaid: tenants.filter(t => t.paymentStatus === 'unpaid').length,
    overdue: 0,
    total: tenants.length,
    totalExpected: tenants.reduce((sum, t) => sum + t.rentAmount, 0),
    totalCollected: tenants.reduce((sum, t) => sum + t.amountPaid, 0),
  };

  const stats = dbStats || localStats;
  const paidPercentage = stats.total > 0 ? Math.round((stats.paid / stats.total) * 100) : 0;
  const collectionRate = stats.totalExpected > 0 ? Math.round((stats.totalCollected / stats.totalExpected) * 100) : 0;

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
        <div className="grid grid-cols-4 gap-3">
          <div className="text-center p-3 rounded-lg bg-success/10 border border-success/20">
            <div className="flex items-center justify-center gap-1 mb-1">
              <CheckCircle className="h-4 w-4 text-success" />
              <span className="text-2xl font-bold text-success">{stats.paid}</span>
            </div>
            <p className="text-xs text-muted-foreground">Paid</p>
          </div>
          
          <div className="text-center p-3 rounded-lg bg-warning/10 border border-warning/20">
            <div className="flex items-center justify-center gap-1 mb-1">
              <Clock className="h-4 w-4 text-warning" />
              <span className="text-2xl font-bold text-warning">{stats.partial}</span>
            </div>
            <p className="text-xs text-muted-foreground">Partial</p>
          </div>
          
          <div className="text-center p-3 rounded-lg bg-muted border border-border">
            <div className="flex items-center justify-center gap-1 mb-1">
              <Clock className="h-4 w-4 text-muted-foreground" />
              <span className="text-2xl font-bold text-foreground">{stats.unpaid}</span>
            </div>
            <p className="text-xs text-muted-foreground">Unpaid</p>
          </div>
          
          <div className="text-center p-3 rounded-lg bg-destructive/10 border border-destructive/20">
            <div className="flex items-center justify-center gap-1 mb-1">
              <AlertTriangle className="h-4 w-4 text-destructive" />
              <span className="text-2xl font-bold text-destructive">{stats.overdue}</span>
            </div>
            <p className="text-xs text-muted-foreground">Overdue</p>
          </div>
        </div>

        {/* Collection Progress */}
        <div className="space-y-2">
          <div className="flex justify-between text-sm">
            <span className="text-muted-foreground">Collection Rate</span>
            <span className="font-medium">{collectionRate}%</span>
          </div>
          <Progress value={collectionRate} className="h-2" />
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
            <span className="font-medium text-success">{paidPercentage}% fully paid</span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
