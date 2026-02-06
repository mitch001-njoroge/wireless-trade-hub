import { useQuery, useQueryClient } from '@tanstack/react-query';
import { useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import type { RentStatus } from './useRentPeriods';

export interface TenantRentPeriod {
  id: string;
  tenant_id: string;
  month: number;
  year: number;
  rent_amount: number;
  amount_paid: number;
  balance: number | null;
  status: RentStatus;
  due_date: string;
  payment_reference: string | null;
  created_at: string;
  updated_at: string;
}

export interface TenantPaymentHistory {
  id: string;
  rent_period_id: string;
  tenant_id: string;
  amount: number;
  payment_method: 'mpesa' | 'bank_transfer' | 'cash';
  transaction_id: string | null;
  mpesa_receipt: string | null;
  phone_number: string | null;
  bank_reference: string | null;
  payment_date: string;
  verified: boolean;
  verified_at: string | null;
  notes: string | null;
  created_at: string;
}

export function useTenantRentData(tenantId: string | undefined) {
  const queryClient = useQueryClient();

  // Current month rent period
  const currentMonth = new Date().getMonth() + 1;
  const currentYear = new Date().getFullYear();

  const { data: currentPeriod, isLoading: isPeriodLoading } = useQuery({
    queryKey: ['tenant-current-period', tenantId, currentMonth, currentYear],
    queryFn: async () => {
      if (!tenantId) return null;

      const { data, error } = await supabase
        .from('rent_periods')
        .select('*')
        .eq('tenant_id', tenantId)
        .eq('month', currentMonth)
        .eq('year', currentYear)
        .maybeSingle();

      if (error) {
        console.error('Error fetching current rent period:', error);
        return null;
      }

      return data as TenantRentPeriod | null;
    },
    enabled: !!tenantId,
  });

  // All rent periods for history
  const { data: allPeriods, isLoading: isPeriodsLoading } = useQuery({
    queryKey: ['tenant-all-periods', tenantId],
    queryFn: async () => {
      if (!tenantId) return [];

      const { data, error } = await supabase
        .from('rent_periods')
        .select('*')
        .eq('tenant_id', tenantId)
        .order('year', { ascending: false })
        .order('month', { ascending: false });

      if (error) {
        console.error('Error fetching rent periods:', error);
        return [];
      }

      return data as TenantRentPeriod[];
    },
    enabled: !!tenantId,
  });

  // Payment history
  const { data: payments, isLoading: isPaymentsLoading } = useQuery({
    queryKey: ['tenant-payments', tenantId],
    queryFn: async () => {
      if (!tenantId) return [];

      const { data, error } = await supabase
        .from('rent_payments')
        .select('*')
        .eq('tenant_id', tenantId)
        .order('payment_date', { ascending: false });

      if (error) {
        console.error('Error fetching payments:', error);
        return [];
      }

      return data as TenantPaymentHistory[];
    },
    enabled: !!tenantId,
  });

  // Real-time subscription for rent periods
  useEffect(() => {
    if (!tenantId) return;

    const channel = supabase
      .channel(`tenant-rent-${tenantId}`)
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'rent_periods',
          filter: `tenant_id=eq.${tenantId}`,
        },
        () => {
          // Invalidate queries to refetch data
          queryClient.invalidateQueries({ queryKey: ['tenant-current-period', tenantId] });
          queryClient.invalidateQueries({ queryKey: ['tenant-all-periods', tenantId] });
        }
      )
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'rent_payments',
          filter: `tenant_id=eq.${tenantId}`,
        },
        () => {
          queryClient.invalidateQueries({ queryKey: ['tenant-payments', tenantId] });
          queryClient.invalidateQueries({ queryKey: ['tenant-current-period', tenantId] });
          queryClient.invalidateQueries({ queryKey: ['tenant-all-periods', tenantId] });
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [tenantId, queryClient]);

  return {
    currentPeriod,
    allPeriods: allPeriods ?? [],
    payments: payments ?? [],
    isLoading: isPeriodLoading || isPeriodsLoading || isPaymentsLoading,
  };
}
