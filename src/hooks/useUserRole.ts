import { useEffect, useState } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { User } from '@supabase/supabase-js';

export type AppRole = 'admin' | 'tenant';

interface UseUserRoleResult {
  user: User | null;
  role: AppRole | null;
  isLoading: boolean;
  isAdmin: boolean;
  isTenant: boolean;
  tenantRecord: {
    id: string;
    name: string;
    phone: string;
    unit_number: string;
    apartment_id: string;
    apartment_name: string;
    rent_amount: number;
    due_day: number;
  } | null;
}

export function useUserRole(): UseUserRoleResult {
  const [user, setUser] = useState<User | null>(null);
  const queryClient = useQueryClient();

  useEffect(() => {
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      setUser(session?.user ?? null);
      if (event === 'SIGNED_OUT') {
        queryClient.clear();
      }
    });

    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null);
    });

    return () => subscription.unsubscribe();
  }, [queryClient]);

  const { data: roleData, isLoading: isRoleLoading } = useQuery({
    queryKey: ['user-role', user?.id],
    queryFn: async () => {
      if (!user) return null;
      
      const { data, error } = await supabase
        .from('user_roles')
        .select('role')
        .eq('user_id', user.id)
        .maybeSingle();

      if (error) {
        console.error('Error fetching user role:', error);
        return null;
      }
      
      return data?.role as AppRole | null;
    },
    enabled: !!user,
  });

  const { data: tenantRecord, isLoading: isTenantLoading } = useQuery({
    queryKey: ['tenant-record', user?.id],
    queryFn: async () => {
      if (!user) return null;
      
      const { data, error } = await supabase
        .from('tenants')
        .select('id, name, phone, unit_number, apartment_id, apartment_name, rent_amount, due_day')
        .eq('user_id', user.id)
        .maybeSingle();

      if (error) {
        console.error('Error fetching tenant record:', error);
        return null;
      }
      
      return data;
    },
    enabled: !!user && roleData === 'tenant',
  });

  const isLoading = !user ? false : isRoleLoading || (roleData === 'tenant' && isTenantLoading);

  return {
    user,
    role: roleData ?? null,
    isLoading,
    isAdmin: roleData === 'admin',
    isTenant: roleData === 'tenant',
    tenantRecord: tenantRecord ?? null,
  };
}
