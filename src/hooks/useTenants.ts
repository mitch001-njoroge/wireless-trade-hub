import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/hooks/use-toast';
import type { Database } from '@/integrations/supabase/types';

type TenantRow = Database['public']['Tables']['tenants']['Row'];
type TenantInsert = Database['public']['Tables']['tenants']['Insert'];
type TenantUpdate = Database['public']['Tables']['tenants']['Update'];

export interface TenantWithStatus extends TenantRow {
  hasAccount: boolean;
}

export function useTenants() {
  const queryClient = useQueryClient();

  const { data: tenants = [], isLoading, error } = useQuery({
    queryKey: ['tenants'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('tenants')
        .select('*')
        .order('apartment_name', { ascending: true })
        .order('unit_number', { ascending: true });

      if (error) {
        console.error('Error fetching tenants:', error);
        throw error;
      }

      // Map to include hasAccount status
      const tenantsWithStatus: TenantWithStatus[] = (data || []).map(tenant => ({
        ...tenant,
        hasAccount: !!tenant.user_id,
      }));

      return tenantsWithStatus;
    },
  });

  const createTenant = useMutation({
    mutationFn: async (tenantData: TenantInsert) => {
      const { data, error } = await supabase
        .from('tenants')
        .insert(tenantData)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['tenants'] });
      toast({
        title: 'Success',
        description: 'Tenant added successfully',
      });
    },
    onError: (error: Error) => {
      toast({
        title: 'Error',
        description: error.message || 'Failed to add tenant',
        variant: 'destructive',
      });
    },
  });

  const updateTenant = useMutation({
    mutationFn: async ({ id, ...updates }: TenantUpdate & { id: string }) => {
      const { data, error } = await supabase
        .from('tenants')
        .update(updates)
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['tenants'] });
      toast({
        title: 'Success',
        description: 'Tenant updated successfully',
      });
    },
    onError: (error: Error) => {
      toast({
        title: 'Error',
        description: error.message || 'Failed to update tenant',
        variant: 'destructive',
      });
    },
  });

  const deleteTenant = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from('tenants')
        .delete()
        .eq('id', id);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['tenants'] });
      toast({
        title: 'Success',
        description: 'Tenant removed from the system',
      });
    },
    onError: (error: Error) => {
      toast({
        title: 'Error',
        description: error.message || 'Failed to remove tenant',
        variant: 'destructive',
      });
    },
  });

  return {
    tenants,
    isLoading,
    error,
    createTenant,
    updateTenant,
    deleteTenant,
    refetch: () => queryClient.invalidateQueries({ queryKey: ['tenants'] }),
  };
}
