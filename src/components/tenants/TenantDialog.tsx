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
import { apartments } from '@/lib/data';
import type { Database } from '@/integrations/supabase/types';

type TenantRow = Database['public']['Tables']['tenants']['Row'];
type TenantInsert = Database['public']['Tables']['tenants']['Insert'];

interface TenantDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  tenant?: TenantRow | null;
  mode: 'add' | 'edit' | 'view';
  onSave?: (tenant: TenantInsert) => void;
}

export function TenantDialog({ open, onOpenChange, tenant, mode, onSave }: TenantDialogProps) {
  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    apartment_id: '',
    apartment_name: '',
    unit_number: '',
    rent_amount: '',
    due_day: '5',
  });

  useEffect(() => {
    if (tenant && (mode === 'edit' || mode === 'view')) {
      setFormData({
        name: tenant.name,
        phone: tenant.phone,
        apartment_id: tenant.apartment_id,
        apartment_name: tenant.apartment_name,
        unit_number: tenant.unit_number,
        rent_amount: tenant.rent_amount.toString(),
        due_day: tenant.due_day.toString(),
      });
    } else if (mode === 'add') {
      setFormData({
        name: '',
        phone: '',
        apartment_id: '',
        apartment_name: '',
        unit_number: '',
        rent_amount: '',
        due_day: '5',
      });
    }
  }, [tenant, mode, open]);

  const handleApartmentChange = (apartmentId: string) => {
    const selectedApt = apartments.find(apt => apt.id === apartmentId);
    setFormData({
      ...formData,
      apartment_id: apartmentId,
      apartment_name: selectedApt?.name || '',
    });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    const tenantData: TenantInsert = {
      name: formData.name,
      phone: formData.phone,
      apartment_id: formData.apartment_id,
      apartment_name: formData.apartment_name,
      unit_number: formData.unit_number,
      rent_amount: parseFloat(formData.rent_amount),
      due_day: parseInt(formData.due_day, 10),
    };

    if (onSave) {
      onSave(tenantData);
    }

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
            <div className="col-span-2">
              <Label htmlFor="phone">Phone</Label>
              <Input
                id="phone"
                value={formData.phone}
                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                disabled={isViewMode}
                placeholder="+254 7XX XXX XXX"
                required
              />
            </div>
            <div>
              <Label htmlFor="apartment">Apartment</Label>
              <Select
                value={formData.apartment_id}
                onValueChange={handleApartmentChange}
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
                value={formData.unit_number}
                onChange={(e) => setFormData({ ...formData, unit_number: e.target.value })}
                disabled={isViewMode}
                placeholder="e.g. A1, House 5"
                required
              />
            </div>
            <div>
              <Label htmlFor="rentAmount">Rent Amount (KES)</Label>
              <Input
                id="rentAmount"
                type="number"
                value={formData.rent_amount}
                onChange={(e) => setFormData({ ...formData, rent_amount: e.target.value })}
                disabled={isViewMode}
                required
              />
            </div>
            <div>
              <Label htmlFor="dueDay">Due Day of Month</Label>
              <Input
                id="dueDay"
                type="number"
                min="1"
                max="28"
                value={formData.due_day}
                onChange={(e) => setFormData({ ...formData, due_day: e.target.value })}
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
