import { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Loader2, Building2, CheckCircle } from 'lucide-react';
import { useRecordPayment } from '@/hooks/useRentPeriods';
import { formatCurrency } from '@/lib/data';

interface BankTransferPaymentDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  tenantName: string;
  unitNumber: string;
  amount: number;
  rentPeriodId?: string;
  tenantId?: string;
  referenceCode?: string;
  onSuccess?: () => void;
}

export function BankTransferPaymentDialog({
  open,
  onOpenChange,
  tenantName,
  unitNumber,
  amount,
  rentPeriodId,
  tenantId,
  referenceCode,
  onSuccess,
}: BankTransferPaymentDialogProps) {
  const [bankReference, setBankReference] = useState('');
  const [paymentDate, setPaymentDate] = useState(new Date().toISOString().split('T')[0]);
  const [notes, setNotes] = useState('');
  const [paymentStatus, setPaymentStatus] = useState<'idle' | 'submitting' | 'success'>('idle');
  
  const recordPayment = useRecordPayment();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!bankReference.trim()) {
      alert('Please enter the bank reference number');
      return;
    }

    if (!rentPeriodId || !tenantId) {
      alert('Missing rent period or tenant information');
      return;
    }

    setPaymentStatus('submitting');

    try {
      await recordPayment.mutateAsync({
        rent_period_id: rentPeriodId,
        tenant_id: tenantId,
        amount: amount,
        payment_method: 'bank_transfer',
        payment_date: new Date(paymentDate).toISOString(),
        bank_reference: bankReference,
        notes: notes || null,
        transaction_id: null,
        mpesa_receipt: null,
        phone_number: null,
        verified: true,
        verified_at: new Date().toISOString(),
      });

      setPaymentStatus('success');
      onSuccess?.();
    } catch (error) {
      console.error('Error recording payment:', error);
      alert('Failed to record payment. Please try again.');
      setPaymentStatus('idle');
    }
  };

  const handleClose = () => {
    setPaymentStatus('idle');
    setBankReference('');
    setNotes('');
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Building2 className="h-5 w-5 text-primary" />
            Bank Transfer Payment
          </DialogTitle>
          <DialogDescription>
            Record bank transfer for {tenantName} - Unit {unitNumber}
          </DialogDescription>
        </DialogHeader>

        {paymentStatus === 'idle' && (
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="bg-muted p-3 rounded-lg space-y-2">
              <div>
                <p className="text-xs text-muted-foreground">Tenant Reference Code</p>
                <p className="text-lg font-mono font-semibold text-foreground">{referenceCode || 'N/A'}</p>
              </div>
              <div>
                <p className="text-xs text-muted-foreground">Amount Due (KES)</p>
                <p className="text-lg font-semibold text-foreground">{formatCurrency(amount)}</p>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="bankRef">Bank Reference Number*</Label>
              <Input
                id="bankRef"
                type="text"
                value={bankReference}
                onChange={(e) => setBankReference(e.target.value)}
                placeholder="e.g., TRANS-123456 or bank slip reference"
                required
              />
              <p className="text-xs text-muted-foreground">
                Enter the bank transfer reference from the bank statement or receipt
              </p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="paymentDate">Payment Date*</Label>
              <Input
                id="paymentDate"
                type="date"
                value={paymentDate}
                onChange={(e) => setPaymentDate(e.target.value)}
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="notes">Notes (Optional)</Label>
              <Textarea
                id="notes"
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="e.g., Payment received via bank transfer..."
                className="min-h-20"
              />
            </div>

            <DialogFooter className="gap-2">
              <Button type="button" variant="outline" onClick={handleClose}>
                Cancel
              </Button>
              <Button type="submit" disabled={recordPayment.isPending}>
                {recordPayment.isPending ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Recording...
                  </>
                ) : (
                  'Record Payment'
                )}
              </Button>
            </DialogFooter>
          </form>
        )}

        {paymentStatus === 'success' && (
          <div className="py-8 text-center space-y-4">
            <CheckCircle className="h-12 w-12 mx-auto text-success" />
            <div>
              <h3 className="font-semibold text-success">Payment Recorded!</h3>
              <p className="text-sm text-muted-foreground">
                Bank transfer payment has been recorded and verified.
              </p>
            </div>
            <Button onClick={handleClose}>Close</Button>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
