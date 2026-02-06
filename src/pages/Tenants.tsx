import { useState } from 'react';
import { Layout } from '@/components/layout/Layout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { TenantDialog } from '@/components/tenants/TenantDialog';
import { CreateTenantAccountDialog } from '@/components/tenants/CreateTenantAccountDialog';
import { useTenants, TenantWithStatus } from '@/hooks/useTenants';
import { formatCurrency } from '@/lib/data';
import { Search, Plus, Phone, Building2, UserMinus, UserPlus, Loader2, UserCheck } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog';
import type { Database } from '@/integrations/supabase/types';

type TenantInsert = Database['public']['Tables']['tenants']['Insert'];

const Tenants = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [dialogOpen, setDialogOpen] = useState(false);
  const [dialogMode, setDialogMode] = useState<'add' | 'edit' | 'view'>('add');
  const [selectedTenant, setSelectedTenant] = useState<TenantWithStatus | null>(null);
  const [accountDialogOpen, setAccountDialogOpen] = useState(false);
  const [selectedTenantForAccount, setSelectedTenantForAccount] = useState<TenantWithStatus | null>(null);

  const { tenants, isLoading, createTenant, updateTenant, deleteTenant, refetch } = useTenants();

  const filteredTenants = tenants.filter(
    (tenant) =>
      tenant.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      tenant.phone.toLowerCase().includes(searchQuery.toLowerCase()) ||
      tenant.unit_number.toLowerCase().includes(searchQuery.toLowerCase()) ||
      tenant.apartment_name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleAddTenant = () => {
    setSelectedTenant(null);
    setDialogMode('add');
    setDialogOpen(true);
  };

  const handleEditTenant = (tenant: TenantWithStatus) => {
    setSelectedTenant(tenant);
    setDialogMode('edit');
    setDialogOpen(true);
  };

  const handleViewTenant = (tenant: TenantWithStatus) => {
    setSelectedTenant(tenant);
    setDialogMode('view');
    setDialogOpen(true);
  };

  const handleSaveTenant = (tenantData: TenantInsert) => {
    if (dialogMode === 'add') {
      createTenant.mutate(tenantData);
    } else if (dialogMode === 'edit' && selectedTenant) {
      updateTenant.mutate({ id: selectedTenant.id, ...tenantData });
    }
  };

  const handleVacateTenant = (tenant: TenantWithStatus) => {
    deleteTenant.mutate(tenant.id);
  };

  const handleCreateAccount = (tenant: TenantWithStatus) => {
    setSelectedTenantForAccount(tenant);
    setAccountDialogOpen(true);
  };

  if (isLoading) {
    return (
      <Layout>
        <div className="flex items-center justify-center min-h-[400px]">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="space-y-8 pt-12 lg:pt-0">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-foreground">Tenants</h1>
            <p className="text-muted-foreground">Manage all your tenants ({tenants.length} total)</p>
          </div>
          <Button onClick={handleAddTenant}>
            <Plus className="h-4 w-4 mr-2" />
            Add Tenant
          </Button>
        </div>

        {/* Search */}
        <div className="relative max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search tenants..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10"
          />
        </div>

        {/* Tenants List */}
        {filteredTenants.length === 0 && tenants.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-muted-foreground mb-4">No tenants found. Add your first tenant to get started.</p>
            <Button onClick={handleAddTenant}>
              <Plus className="h-4 w-4 mr-2" />
              Add Tenant
            </Button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredTenants.map((tenant) => (
              <Card key={tenant.id} className="animate-fade-in hover:shadow-lg transition-shadow">
                <CardHeader className="pb-3">
                  <div className="flex items-start justify-between">
                    <div>
                      <CardTitle className="text-lg">{tenant.name}</CardTitle>
                      <div className="flex items-center gap-2 text-sm text-muted-foreground mt-1">
                        <Building2 className="h-3 w-3" />
                        {tenant.apartment_name} - {tenant.unit_number}
                      </div>
                    </div>
                    {tenant.hasAccount ? (
                      <Badge variant="outline" className="text-success border-success">
                        <UserCheck className="h-3 w-3 mr-1" />
                        Has Account
                      </Badge>
                    ) : (
                      <Badge variant="outline" className="text-muted-foreground">
                        No Account
                      </Badge>
                    )}
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  {/* Contact Info */}
                  <div className="space-y-2 text-sm">
                    <div className="flex items-center gap-2 text-muted-foreground">
                      <Phone className="h-3 w-3" />
                      {tenant.phone}
                    </div>
                  </div>

                  {/* Rent Info */}
                  <div className="grid grid-cols-2 gap-4 pt-4 border-t border-border">
                    <div>
                      <p className="text-xs text-muted-foreground">Monthly Rent</p>
                      <p className="font-semibold text-foreground">{formatCurrency(tenant.rent_amount)}</p>
                    </div>
                    <div>
                      <p className="text-xs text-muted-foreground">Due Day</p>
                      <p className="font-semibold text-foreground">{tenant.due_day}th</p>
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex flex-wrap gap-2 pt-2">
                    <Button variant="outline" size="sm" onClick={() => handleEditTenant(tenant)}>
                      Edit
                    </Button>
                    <Button variant="outline" size="sm" onClick={() => handleViewTenant(tenant)}>
                      View
                    </Button>
                    {!tenant.hasAccount && (
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleCreateAccount(tenant)}
                      >
                        <UserPlus className="h-3 w-3 mr-1" />
                        Account
                      </Button>
                    )}
                    <AlertDialog>
                      <AlertDialogTrigger asChild>
                        <Button variant="destructive" size="sm">
                          <UserMinus className="h-3 w-3 mr-1" />
                          Vacate
                        </Button>
                      </AlertDialogTrigger>
                      <AlertDialogContent>
                        <AlertDialogHeader>
                          <AlertDialogTitle>Remove Tenant</AlertDialogTitle>
                          <AlertDialogDescription>
                            Are you sure you want to remove <strong>{tenant.name}</strong> from the system?
                            This action cannot be undone and will permanently delete all their records.
                          </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                          <AlertDialogCancel>Cancel</AlertDialogCancel>
                          <AlertDialogAction onClick={() => handleVacateTenant(tenant)}>
                            Confirm Vacate
                          </AlertDialogAction>
                        </AlertDialogFooter>
                      </AlertDialogContent>
                    </AlertDialog>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}

        {filteredTenants.length === 0 && tenants.length > 0 && (
          <div className="text-center py-12">
            <p className="text-muted-foreground">No tenants found matching your search.</p>
          </div>
        )}
      </div>

      <TenantDialog
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        tenant={selectedTenant}
        mode={dialogMode}
        onSave={handleSaveTenant}
      />

      {selectedTenantForAccount && (
        <CreateTenantAccountDialog
          open={accountDialogOpen}
          onOpenChange={setAccountDialogOpen}
          tenantId={selectedTenantForAccount.id}
          tenantName={selectedTenantForAccount.name}
          onSuccess={refetch}
        />
      )}
    </Layout>
  );
};

export default Tenants;
