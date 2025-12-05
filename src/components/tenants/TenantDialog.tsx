import { useState, useEffect } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { apartments, Tenant, PaymentStatus } from '@/lib/data';
import { toast } from '@/hooks/use-toast';

interface TenantDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  tenant?: Tenant | null;
  mode: 'add' | 'edit' | 'view';
  onSave?: (tenant: Partial<Tenant>) => void;
}

export function TenantDialog({ open, onOpenChange, tenant, mode, onSave }: TenantDialogProps) {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    apartmentId: '',
    unitNumber: '',
    rentAmount: '',
    amountPaid: '',
    paymentStatus: 'unpaid' as PaymentStatus,
  });

  useEffect(() => {
    if (tenant && (mode === 'edit' || mode === 'view')) {
      setFormData({
        name: tenant.name,
        email: tenant.email,
        phone: tenant.phone,
        apartmentId: tenant.apartmentId,
        unitNumber: tenant.unitNumber,
        rentAmount: tenant.rentAmount.toString(),
        amountPaid: tenant.amountPaid.toString(),
        paymentStatus: tenant.paymentStatus,
      });
    } else if (mode === 'add') {
      setFormData({
        name: '',
        email: '',
        phone: '',
        apartmentId: '',
        unitNumber: '',
        rentAmount: '',
        amountPaid: '0',
        paymentStatus: 'unpaid',
      });
    }
  }, [tenant, mode, open]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    const rentAmount = parseFloat(formData.rentAmount);
    const amountPaid = parseFloat(formData.amountPaid);
    const balance = rentAmount - amountPaid;
    
    let paymentStatus: PaymentStatus = 'unpaid';
    if (amountPaid >= rentAmount) {
      paymentStatus = 'paid';
    } else if (amountPaid > 0) {
      paymentStatus = 'partial';
    }

    const tenantData: Partial<Tenant> = {
      ...formData,
      rentAmount,
      amountPaid,
      balance,
      paymentStatus,
    };

    if (onSave) {
      onSave(tenantData);
    }

    toast({
      title: mode === 'add' ? 'Tenant Added' : 'Tenant Updated',
      description: `${formData.name} has been ${mode === 'add' ? 'added' : 'updated'} successfully.`,
    });

    onOpenChange(false);
  };

  const isViewMode = mode === 'view';
  const title = mode === 'add' ? 'Add New Tenant' : mode === 'edit' ? 'Edit Tenant' : 'Tenant Details';

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="col-span-2">
              <Label htmlFor="name">Full Name</Label>
              <Input
                id="name"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                disabled={isViewMode}
                required
              />
            </div>
            <div>
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                disabled={isViewMode}
                required
              />
            </div>
            <div>
              <Label htmlFor="phone">Phone</Label>
              <Input
                id="phone"
                value={formData.phone}
                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                disabled={isViewMode}
                required
              />
            </div>
            <div>
              <Label htmlFor="apartment">Apartment</Label>
              <Select
                value={formData.apartmentId}
                onValueChange={(value) => setFormData({ ...formData, apartmentId: value })}
                disabled={isViewMode}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select apartment" />
                </SelectTrigger>
                <SelectContent>
                  {apartments.map((apt) => (
                    <SelectItem key={apt.id} value={apt.id}>
                      {apt.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label htmlFor="unitNumber">Unit Number</Label>
              <Input
                id="unitNumber"
                value={formData.unitNumber}
                onChange={(e) => setFormData({ ...formData, unitNumber: e.target.value })}
                disabled={isViewMode}
                required
              />
            </div>
            <div>
              <Label htmlFor="rentAmount">Rent Amount (KES)</Label>
              <Input
                id="rentAmount"
                type="number"
                value={formData.rentAmount}
                onChange={(e) => setFormData({ ...formData, rentAmount: e.target.value })}
                disabled={isViewMode}
                required
              />
            </div>
            <div>
              <Label htmlFor="amountPaid">Amount Paid (KES)</Label>
              <Input
                id="amountPaid"
                type="number"
                value={formData.amountPaid}
                onChange={(e) => setFormData({ ...formData, amountPaid: e.target.value })}
                disabled={isViewMode}
              />
            </div>
          </div>
          {!isViewMode && (
            <div className="flex justify-end gap-2 pt-4">
              <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
                Cancel
              </Button>
              <Button type="submit">
                {mode === 'add' ? 'Add Tenant' : 'Save Changes'}
              </Button>
            </div>
          )}
          {isViewMode && (
            <div className="flex justify-end pt-4">
              <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
                Close
              </Button>
            </div>
          )}
        </form>
      </DialogContent>
    </Dialog>
  );
}