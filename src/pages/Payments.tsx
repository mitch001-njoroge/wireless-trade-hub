import { useState } from 'react';
import { Layout } from '@/components/layout/Layout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { PaymentStatusBadge } from '@/components/dashboard/PaymentStatusBadge';
import { ReceiptDialog } from '@/components/payments/ReceiptDialog';
import { loadTenants, saveTenants, apartments, getApartmentById, formatCurrency, Tenant } from '@/lib/data';
import { Search, Filter, CheckCircle, FileText } from 'lucide-react';
import { toast } from '@/hooks/use-toast';

const Payments = () => {
  const [tenantList, setTenantList] = useState<Tenant[]>(() => loadTenants());
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [apartmentFilter, setApartmentFilter] = useState<string>('all');
  const [receiptDialogOpen, setReceiptDialogOpen] = useState(false);
  const [selectedTenant, setSelectedTenant] = useState<Tenant | null>(null);

  const filteredTenants = tenantList.filter((tenant) => {
    const matchesSearch =
      tenant.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      tenant.unitNumber.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus = statusFilter === 'all' || tenant.paymentStatus === statusFilter;
    const matchesApartment = apartmentFilter === 'all' || tenant.apartmentId === apartmentFilter;
    return matchesSearch && matchesStatus && matchesApartment;
  });

  const handleMarkAsPaid = (tenantId: string) => {
    const updatedTenants = tenantList.map((tenant) => {
      if (tenant.id === tenantId) {
        return {
          ...tenant,
          amountPaid: tenant.rentAmount,
          balance: 0,
          paymentStatus: 'paid' as const,
          lastPaymentDate: new Date().toISOString().split('T')[0],
        };
      }
      return tenant;
    });
    
    setTenantList(updatedTenants);
    saveTenants(updatedTenants);
    
    const tenant = tenantList.find(t => t.id === tenantId);
    toast({
      title: 'Payment Recorded',
      description: `${tenant?.name}'s rent has been marked as paid.`,
    });
  };

  const handleGenerateReceipt = (tenant: Tenant) => {
    setSelectedTenant(tenant);
    setReceiptDialogOpen(true);
  };

  return (
    <Layout>
      <div className="space-y-8 pt-12 lg:pt-0">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-foreground">Payments</h1>
            <p className="text-muted-foreground">Track and manage rent payments</p>
          </div>
        </div>

        {/* Filters */}
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search by tenant name or unit..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>
          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="w-full sm:w-[180px]">
              <Filter className="h-4 w-4 mr-2" />
              <SelectValue placeholder="Status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Status</SelectItem>
              <SelectItem value="paid">Paid</SelectItem>
              <SelectItem value="partial">Partial</SelectItem>
              <SelectItem value="unpaid">Not Paid</SelectItem>
            </SelectContent>
          </Select>
          <Select value={apartmentFilter} onValueChange={setApartmentFilter}>
            <SelectTrigger className="w-full sm:w-[200px]">
              <SelectValue placeholder="Apartment" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Apartments</SelectItem>
              {apartments.map((apt) => (
                <SelectItem key={apt.id} value={apt.id}>
                  {apt.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Payment Table */}
        <Card>
          <CardHeader>
            <CardTitle>Payment Status</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-border">
                    <th className="text-left py-3 px-4 text-sm font-medium text-muted-foreground">Tenant</th>
                    <th className="text-left py-3 px-4 text-sm font-medium text-muted-foreground">Apartment</th>
                    <th className="text-left py-3 px-4 text-sm font-medium text-muted-foreground">Rent Due</th>
                    <th className="text-left py-3 px-4 text-sm font-medium text-muted-foreground">Paid</th>
                    <th className="text-left py-3 px-4 text-sm font-medium text-muted-foreground">Balance</th>
                    <th className="text-left py-3 px-4 text-sm font-medium text-muted-foreground">Status</th>
                    <th className="text-left py-3 px-4 text-sm font-medium text-muted-foreground">Last Payment</th>
                    <th className="text-right py-3 px-4 text-sm font-medium text-muted-foreground">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredTenants.map((tenant) => {
                    const apartment = getApartmentById(tenant.apartmentId);
                    return (
                      <tr key={tenant.id} className="border-b border-border last:border-0 hover:bg-muted/50">
                        <td className="py-4 px-4">
                          <div>
                            <p className="font-medium text-foreground">{tenant.name}</p>
                            <p className="text-sm text-muted-foreground">Unit {tenant.unitNumber}</p>
                          </div>
                        </td>
                        <td className="py-4 px-4 text-sm text-foreground">{apartment?.name}</td>
                        <td className="py-4 px-4 text-sm font-medium text-foreground">
                          {formatCurrency(tenant.rentAmount)}
                        </td>
                        <td className="py-4 px-4 text-sm text-success font-medium">
                          {formatCurrency(tenant.amountPaid)}
                        </td>
                        <td className="py-4 px-4 text-sm font-medium">
                          <span className={tenant.balance > 0 ? 'text-destructive' : 'text-success'}>
                            {formatCurrency(tenant.balance)}
                          </span>
                        </td>
                        <td className="py-4 px-4">
                          <PaymentStatusBadge status={tenant.paymentStatus} />
                        </td>
                        <td className="py-4 px-4 text-sm text-muted-foreground">
                          {tenant.lastPaymentDate || '-'}
                        </td>
                        <td className="py-4 px-4">
                          <div className="flex justify-end gap-2">
                            {tenant.paymentStatus !== 'paid' && (
                              <Button
                                size="sm"
                                variant="outline"
                                className="text-success border-success/30 hover:bg-success/10"
                                onClick={() => handleMarkAsPaid(tenant.id)}
                              >
                                <CheckCircle className="h-3 w-3 mr-1" />
                                Mark Paid
                              </Button>
                            )}
                            <Button 
                              size="sm" 
                              variant="outline"
                              onClick={() => handleGenerateReceipt(tenant)}
                            >
                              <FileText className="h-3 w-3 mr-1" />
                              Receipt
                            </Button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>

            {filteredTenants.length === 0 && (
              <div className="text-center py-12">
                <p className="text-muted-foreground">No payments found matching your filters.</p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      <ReceiptDialog
        open={receiptDialogOpen}
        onOpenChange={setReceiptDialogOpen}
        tenant={selectedTenant}
      />
    </Layout>
  );
};

export default Payments;