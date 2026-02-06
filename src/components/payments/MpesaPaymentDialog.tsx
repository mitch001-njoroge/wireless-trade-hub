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
import { Loader2, Smartphone, CheckCircle, XCircle } from 'lucide-react';
import { useMpesaPayment } from '@/hooks/useMpesaPayment';
import { formatCurrency } from '@/lib/data';

interface MpesaPaymentDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  tenantName: string;
  tenantPhone: string;
  unitNumber: string;
  amount: number;
  rentPeriodId?: string;
  tenantId?: string;
  onSuccess?: () => void;
}

export function MpesaPaymentDialog({
  open,
  onOpenChange,
  tenantName,
  tenantPhone,
  unitNumber,
  amount,
  rentPeriodId,
  tenantId,
  onSuccess,
}: MpesaPaymentDialogProps) {
  const [phoneNumber, setPhoneNumber] = useState(tenantPhone.replace(/[\s\+]/g, ''));
  const [paymentAmount, setPaymentAmount] = useState(amount.toString());
  const [checkoutRequestId, setCheckoutRequestId] = useState<string | null>(null);
  const [paymentStatus, setPaymentStatus] = useState<'idle' | 'pending' | 'success' | 'failed'>('idle');
  
  const { initiateSTKPush, pollPaymentStatus, isLoading, isPolling } = useMpesaPayment();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    const response = await initiateSTKPush({
      phoneNumber,
      amount: parseFloat(paymentAmount),
      accountReference: `RENT-${unitNumber}`,
      transactionDesc: `Rent payment for ${tenantName} - ${unitNumber}`,
      rentPeriodId,
      tenantId,
    });

    if (response.success && response.checkoutRequestId) {
      setCheckoutRequestId(response.checkoutRequestId);
      setPaymentStatus('pending');
      
      // Start polling for status
      pollPaymentStatus(response.checkoutRequestId, (status) => {
        if (status.status === 'completed') {
          setPaymentStatus('success');
          onSuccess?.();
        } else if (status.status === 'failed') {
          setPaymentStatus('failed');
        }
      });
    }
  };

  const handleClose = () => {
    setPaymentStatus('idle');
    setCheckoutRequestId(null);
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Smartphone className="h-5 w-5 text-primary" />
            M-Pesa Payment
          </DialogTitle>
          <DialogDescription>
            Initiate STK push for {tenantName} - Unit {unitNumber}
          </DialogDescription>
        </DialogHeader>

        {paymentStatus === 'idle' && (
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="phone">Phone Number</Label>
              <Input
                id="phone"
                type="tel"
                value={phoneNumber}
                onChange={(e) => setPhoneNumber(e.target.value)}
                placeholder="07XXXXXXXX"
                required
              />
              <p className="text-xs text-muted-foreground">
                Enter the Safaricom number to receive the STK push
              </p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="amount">Amount (KES)</Label>
              <Input
                id="amount"
                type="number"
                value={paymentAmount}
                onChange={(e) => setPaymentAmount(e.target.value)}
                min="1"
                required
              />
            </div>

            <div className="bg-muted p-3 rounded-lg">
              <p className="text-sm text-muted-foreground">Rent Amount Due</p>
              <p className="text-lg font-semibold">{formatCurrency(amount)}</p>
            </div>

            <DialogFooter>
              <Button type="button" variant="outline" onClick={handleClose}>
                Cancel
              </Button>
              <Button type="submit" disabled={isLoading}>
                {isLoading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Sending...
                  </>
                ) : (
                  'Send STK Push'
                )}
              </Button>
            </DialogFooter>
          </form>
        )}

        {paymentStatus === 'pending' && (
          <div className="py-8 text-center space-y-4">
            <Loader2 className="h-12 w-12 animate-spin mx-auto text-primary" />
            <div>
              <h3 className="font-semibold">Waiting for Payment</h3>
              <p className="text-sm text-muted-foreground">
                Please check the phone ({phoneNumber}) and enter your M-Pesa PIN
              </p>
            </div>
            {isPolling && (
              <p className="text-xs text-muted-foreground">
                Checking payment status...
              </p>
            )}
          </div>
        )}

        {paymentStatus === 'success' && (
          <div className="py-8 text-center space-y-4">
            <CheckCircle className="h-12 w-12 mx-auto text-success" />
            <div>
              <h3 className="font-semibold text-success">Payment Successful!</h3>
              <p className="text-sm text-muted-foreground">
                The rent payment has been received and recorded.
              </p>
            </div>
            <Button onClick={handleClose}>Close</Button>
          </div>
        )}

        {paymentStatus === 'failed' && (
          <div className="py-8 text-center space-y-4">
            <XCircle className="h-12 w-12 mx-auto text-destructive" />
            <div>
              <h3 className="font-semibold text-destructive">Payment Failed</h3>
              <p className="text-sm text-muted-foreground">
                The payment was not completed. Please try again.
              </p>
            </div>
            <div className="flex gap-2 justify-center">
              <Button variant="outline" onClick={handleClose}>
                Close
              </Button>
              <Button onClick={() => setPaymentStatus('idle')}>
                Try Again
              </Button>
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
