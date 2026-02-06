import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/hooks/use-toast';

export type RentStatus = 'paid' | 'unpaid' | 'overdue' | 'partial';

export interface RentPeriod {
  id: string;
  tenant_id: string;
  month: number;
  year: number;
  rent_amount: number;
  amount_paid: number;
  balance: number;
  status: RentStatus;
  due_date: string;
  payment_reference: string | null;
  created_at: string;
  updated_at: string;
}

export interface RentPayment {
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

export interface DBTenant {
  id: string;
  name: string;
  phone: string;
  unit_number: string;
  apartment_id: string;
  apartment_name: string;
  rent_amount: number;
  due_day: number;
  created_at: string;
  updated_at: string;
}

export function useDBTenants() {
  return useQuery({
    queryKey: ['db-tenants'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('tenants')
        .select('*')
        .order('apartment_id', { ascending: true })
        .order('unit_number', { ascending: true });

      if (error) throw error;
      return data as DBTenant[];
    },
  });
}

export function useRentPeriods(month?: number, year?: number) {
  return useQuery({
    queryKey: ['rent-periods', month, year],
    queryFn: async () => {
      let query = supabase
        .from('rent_periods')
        .select('*')
        .order('due_date', { ascending: false });

      if (month !== undefined) {
        query = query.eq('month', month);
      }
      if (year !== undefined) {
        query = query.eq('year', year);
      }

      const { data, error } = await query;
      if (error) throw error;
      return data as RentPeriod[];
    },
  });
}

export function useRentPayments(rentPeriodId?: string) {
  return useQuery({
    queryKey: ['rent-payments', rentPeriodId],
    queryFn: async () => {
      let query = supabase
        .from('rent_payments')
        .select('*')
        .order('payment_date', { ascending: false });

      if (rentPeriodId) {
        query = query.eq('rent_period_id', rentPeriodId);
      }

      const { data, error } = await query;
      if (error) throw error;
      return data as RentPayment[];
    },
  });
}

export function useCreateRentPeriod() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (period: Omit<RentPeriod, 'id' | 'balance' | 'created_at' | 'updated_at'>) => {
      const { data, error } = await supabase
        .from('rent_periods')
        .insert(period)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['rent-periods'] });
      toast({
        title: 'Rent Period Created',
        description: 'Monthly rent record has been created',
      });
    },
    onError: (error: Error) => {
      toast({
        title: 'Error',
        description: error.message,
        variant: 'destructive',
      });
    },
  });
}

export function useRecordPayment() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (payment: Omit<RentPayment, 'id' | 'created_at'>) => {
      const { data, error } = await supabase
        .from('rent_payments')
        .insert(payment)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['rent-periods'] });
      queryClient.invalidateQueries({ queryKey: ['rent-payments'] });
      toast({
        title: 'Payment Recorded',
        description: 'The payment has been recorded successfully',
      });
    },
    onError: (error: Error) => {
      toast({
        title: 'Error',
        description: error.message,
        variant: 'destructive',
      });
    },
  });
}

export function useVerifyPayment() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (paymentId: string) => {
      const { data, error } = await supabase
        .from('rent_payments')
        .update({
          verified: true,
          verified_at: new Date().toISOString(),
        })
        .eq('id', paymentId)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['rent-periods'] });
      queryClient.invalidateQueries({ queryKey: ['rent-payments'] });
      toast({
        title: 'Payment Verified',
        description: 'The payment has been verified and rent status updated',
      });
    },
    onError: (error: Error) => {
      toast({
        title: 'Error',
        description: error.message,
        variant: 'destructive',
      });
    },
  });
}

export function useRentStats(month?: number, year?: number) {
  return useQuery({
    queryKey: ['rent-stats', month, year],
    queryFn: async () => {
      let query = supabase
        .from('rent_periods')
        .select('status, rent_amount, amount_paid');

      if (month !== undefined) {
        query = query.eq('month', month);
      }
      if (year !== undefined) {
        query = query.eq('year', year);
      }

      const { data, error } = await query;
      if (error) throw error;

      const stats = {
        paid: 0,
        unpaid: 0,
        overdue: 0,
        partial: 0,
        totalExpected: 0,
        totalCollected: 0,
      };

      (data || []).forEach((period: { status: RentStatus; rent_amount: number; amount_paid: number }) => {
        stats[period.status]++;
        stats.totalExpected += Number(period.rent_amount);
        stats.totalCollected += Number(period.amount_paid);
      });

      return stats;
    },
  });
}
