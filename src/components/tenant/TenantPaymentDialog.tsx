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
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Loader2, Building2, CheckCircle, CreditCard } from 'lucide-react';
import { useRecordPayment } from '@/hooks/useRentPeriods';
import { formatCurrency } from '@/lib/data';
import { toast } from '@/hooks/use-toast';

interface TenantPaymentDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  tenantId: string;
  tenantName: string;
  unitNumber: string;
  rentPeriodId: string;
  amount: number;
  month: number;
  year: number;
}

export function TenantPaymentDialog({
  open,
  onOpenChange,
  tenantId,
  tenantName,
  unitNumber,
  rentPeriodId,
  amount,
  month,
  year,
}: TenantPaymentDialogProps) {
  const [paymentAmount, setPaymentAmount] = useState(amount.toString());
  const [bankReference, setBankReference] = useState('');
  const [notes, setNotes] = useState('');
  const [paymentStatus, setPaymentStatus] = useState<'idle' | 'submitting' | 'success'>('idle');
  
  const recordPayment = useRecordPayment();

  const getMonthName = (m: number) => {
    return new Date(2000, m - 1).toLocaleString('default', { month: 'long' });
  };

  const generateReferenceCode = () => {
    const hash = tenantId.substring(0, 4).toUpperCase();
    return `RENT${year}${String(month).padStart(2, '0')}${hash}`;
  };

  const handleBankTransfer = async (e: React.FormEvent) => {
    e.preventDefault();
    
    const payAmount = parseFloat(paymentAmount);
    if (isNaN(payAmount) || payAmount <= 0) {
      toast({
        title: 'Invalid Amount',
        description: 'Please enter a valid payment amount',
        variant: 'destructive',
      });
      return;
    }

    if (payAmount > amount) {
      toast({
        title: 'Amount Too High',
        description: `Payment amount cannot exceed balance of ${formatCurrency(amount)}`,
        variant: 'destructive',
      });
      return;
    }

    if (!bankReference.trim()) {
      toast({
        title: 'Reference Required',
        description: 'Please enter the bank reference number',
        variant: 'destructive',
      });
      return;
    }

    setPaymentStatus('submitting');

    try {
      await recordPayment.mutateAsync({
        rent_period_id: rentPeriodId,
        tenant_id: tenantId,
        amount: payAmount,
        payment_method: 'bank_transfer',
        payment_date: new Date().toISOString(),
        bank_reference: bankReference,
        notes: notes || null,
        transaction_id: null,
        mpesa_receipt: null,
        phone_number: null,
        verified: true, // Auto-verify for now, can add admin verification later
        verified_at: new Date().toISOString(),
      });

      setPaymentStatus('success');
      toast({
        title: 'Payment Recorded',
        description: 'Your payment has been recorded successfully',
      });
    } catch (error) {
      console.error('Error recording payment:', error);
      toast({
        title: 'Payment Failed',
        description: 'Failed to record payment. Please try again.',
        variant: 'destructive',
      });
      setPaymentStatus('idle');
    }
  };

  const handleClose = () => {
    setPaymentStatus('idle');
    setPaymentAmount(amount.toString());
    setBankReference('');
    setNotes('');
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <CreditCard className="h-5 w-5 text-primary" />
            Pay Rent
          </DialogTitle>
          <DialogDescription>
            {getMonthName(month)} {year} rent for Unit {unitNumber}
          </DialogDescription>
        </DialogHeader>

        {paymentStatus === 'success' ? (
          <div className="py-8 text-center space-y-4">
            <CheckCircle className="h-16 w-16 mx-auto text-success" />
            <div>
              <h3 className="text-lg font-semibold text-success">Payment Successful!</h3>
              <p className="text-sm text-muted-foreground mt-1">
                Your rent payment has been recorded.
              </p>
              <p className="text-sm text-muted-foreground">
                Amount: {formatCurrency(parseFloat(paymentAmount))}
              </p>
            </div>
            <Button onClick={handleClose} className="w-full">
              Done
            </Button>
          </div>
        ) : (
          <Tabs defaultValue="bank" className="w-full">
            <TabsList className="grid w-full grid-cols-1">
              <TabsTrigger value="bank" className="flex items-center gap-2">
                <Building2 className="h-4 w-4" />
                Bank Transfer
              </TabsTrigger>
            </TabsList>

            <TabsContent value="bank" className="mt-4">
              <form onSubmit={handleBankTransfer} className="space-y-4">
                <div className="bg-muted p-4 rounded-lg space-y-2">
                  <div>
                    <p className="text-xs text-muted-foreground">Your Payment Reference</p>
                    <p className="text-lg font-mono font-semibold">{generateReferenceCode()}</p>
                    <p className="text-xs text-muted-foreground mt-1">
                      Use this reference when making your bank transfer
                    </p>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="amount">Payment Amount (KES)</Label>
                  <Input
                    id="amount"
                    type="number"
                    value={paymentAmount}
                    onChange={(e) => setPaymentAmount(e.target.value)}
                    min="1"
                    max={amount}
                    required
                  />
                  <p className="text-xs text-muted-foreground">
                    Balance due: {formatCurrency(amount)}
                  </p>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="bankRef">Bank Reference Number*</Label>
                  <Input
                    id="bankRef"
                    type="text"
                    value={bankReference}
                    onChange={(e) => setBankReference(e.target.value)}
                    placeholder="Enter your bank transfer reference"
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="notes">Notes (Optional)</Label>
                  <Textarea
                    id="notes"
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                    placeholder="Any additional notes..."
                    className="min-h-16"
                  />
                </div>

                <DialogFooter className="gap-2 sm:gap-0">
                  <Button type="button" variant="outline" onClick={handleClose}>
                    Cancel
                  </Button>
                  <Button type="submit" disabled={recordPayment.isPending}>
                    {recordPayment.isPending ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Processing...
                      </>
                    ) : (
                      'Submit Payment'
                    )}
                  </Button>
                </DialogFooter>
              </form>
            </TabsContent>
          </Tabs>
        )}
      </DialogContent>
    </Dialog>
  );
}
