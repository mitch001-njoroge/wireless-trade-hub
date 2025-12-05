import { useState, useEffect } from 'react';
import { Layout } from '@/components/layout/Layout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { PaymentStatusBadge } from '@/components/dashboard/PaymentStatusBadge';
import { TenantDialog } from '@/components/tenants/TenantDialog';
import { loadTenants, saveTenants, getApartmentById, formatCurrency, Tenant } from '@/lib/data';
import { Search, Plus, Phone, Mail, Building2 } from 'lucide-react';
import { toast } from 'sonner';

const Tenants = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [tenantsList, setTenantsList] = useState<Tenant[]>(() => loadTenants());
  const [dialogOpen, setDialogOpen] = useState(false);
  const [dialogMode, setDialogMode] = useState<'add' | 'edit' | 'view'>('add');
  const [selectedTenant, setSelectedTenant] = useState<Tenant | null>(null);

  const filteredTenants = tenantsList.filter(
    (tenant) =>
      tenant.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      tenant.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
      tenant.unitNumber.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleAddTenant = () => {
    setSelectedTenant(null);
    setDialogMode('add');
    setDialogOpen(true);
  };

  const handleEditTenant = (tenant: Tenant) => {
    setSelectedTenant(tenant);
    setDialogMode('edit');
    setDialogOpen(true);
  };

  const handleViewTenant = (tenant: Tenant) => {
    setSelectedTenant(tenant);
    setDialogMode('view');
    setDialogOpen(true);
  };

  const handleSaveTenant = (tenantData: Partial<Tenant>) => {
    let updatedList: Tenant[];
    
    if (dialogMode === 'add') {
      const newTenant: Tenant = {
        id: Date.now().toString(),
        name: tenantData.name || '',
        email: tenantData.email || '',
        phone: tenantData.phone || '',
        apartmentId: tenantData.apartmentId || '',
        unitNumber: tenantData.unitNumber || '',
        rentAmount: tenantData.rentAmount || 0,
        amountPaid: tenantData.amountPaid || 0,
        balance: tenantData.balance || 0,
        paymentStatus: tenantData.paymentStatus || 'unpaid',
        lastPaymentDate: null,
        moveInDate: new Date().toISOString().split('T')[0],
      };
      updatedList = [...tenantsList, newTenant];
      toast.success('Tenant added successfully');
    } else if (dialogMode === 'edit' && selectedTenant) {
      updatedList = tenantsList.map((t) =>
        t.id === selectedTenant.id ? { ...t, ...tenantData } : t
      );
      toast.success('Tenant updated successfully');
    } else {
      return;
    }
    
    setTenantsList(updatedList);
    saveTenants(updatedList);
  };

  return (
    <Layout>
      <div className="space-y-8 pt-12 lg:pt-0">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-foreground">Tenants</h1>
            <p className="text-muted-foreground">Manage all your tenants</p>
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
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredTenants.map((tenant) => {
            const apartment = getApartmentById(tenant.apartmentId);
            return (
              <Card key={tenant.id} className="animate-fade-in hover:shadow-lg transition-shadow">
                <CardHeader className="pb-3">
                  <div className="flex items-start justify-between">
                    <div>
                      <CardTitle className="text-lg">{tenant.name}</CardTitle>
                      <div className="flex items-center gap-2 text-sm text-muted-foreground mt-1">
                        <Building2 className="h-3 w-3" />
                        {apartment?.name} - Unit {tenant.unitNumber}
                      </div>
                    </div>
                    <PaymentStatusBadge status={tenant.paymentStatus} />
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  {/* Contact Info */}
                  <div className="space-y-2 text-sm">
                    <div className="flex items-center gap-2 text-muted-foreground">
                      <Phone className="h-3 w-3" />
                      {tenant.phone}
                    </div>
                    <div className="flex items-center gap-2 text-muted-foreground">
                      <Mail className="h-3 w-3" />
                      {tenant.email}
                    </div>
                  </div>

                  {/* Payment Info */}
                  <div className="grid grid-cols-2 gap-4 pt-4 border-t border-border">
                    <div>
                      <p className="text-xs text-muted-foreground">Rent Amount</p>
                      <p className="font-semibold text-foreground">{formatCurrency(tenant.rentAmount)}</p>
                    </div>
                    <div>
                      <p className="text-xs text-muted-foreground">Balance</p>
                      <p className={`font-semibold ${tenant.balance > 0 ? 'text-destructive' : 'text-success'}`}>
                        {formatCurrency(tenant.balance)}
                      </p>
                    </div>
                  </div>

                  {/* Last Payment */}
                  {tenant.lastPaymentDate && (
                    <div className="text-xs text-muted-foreground">
                      Last payment: {tenant.lastPaymentDate}
                    </div>
                  )}

                  {/* Actions */}
                  <div className="flex gap-2 pt-2">
                    <Button variant="outline" size="sm" className="flex-1" onClick={() => handleEditTenant(tenant)}>
                      Edit
                    </Button>
                    <Button variant="outline" size="sm" className="flex-1" onClick={() => handleViewTenant(tenant)}>
                      View
                    </Button>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>

        {filteredTenants.length === 0 && (
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
    </Layout>
  );
};

export default Tenants;