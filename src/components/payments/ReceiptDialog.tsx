import { useRef } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Tenant, getApartmentById, formatCurrency } from '@/lib/data';
import { Printer, Building2 } from 'lucide-react';

interface ReceiptDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  tenant: Tenant | null;
}

export function ReceiptDialog({ open, onOpenChange, tenant }: ReceiptDialogProps) {
  const receiptRef = useRef<HTMLDivElement>(null);

  if (!tenant) return null;

  const apartment = getApartmentById(tenant.apartmentId);
  const currentDate = new Date().toLocaleDateString('en-KE', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });
  const receiptNumber = `RCP-${Date.now().toString().slice(-8)}`;

  const handlePrint = () => {
    const printContent = receiptRef.current;
    if (!printContent) return;

    const printWindow = window.open('', '_blank');
    if (!printWindow) return;

    printWindow.document.write(`
      <!DOCTYPE html>
      <html>
        <head>
          <title>Receipt - ${tenant.name}</title>
          <style>
            * { margin: 0; padding: 0; box-sizing: border-box; }
            body { font-family: Arial, sans-serif; padding: 40px; max-width: 600px; margin: 0 auto; }
            .header { text-align: center; margin-bottom: 30px; border-bottom: 2px solid #1e40af; padding-bottom: 20px; }
            .logo { display: flex; align-items: center; justify-content: center; gap: 10px; margin-bottom: 10px; }
            .logo-icon { width: 40px; height: 40px; background: #1e40af; border-radius: 8px; display: flex; align-items: center; justify-content: center; color: white; }
            .company-name { font-size: 24px; font-weight: bold; color: #1e40af; }
            .company-subtitle { font-size: 12px; color: #666; }
            .receipt-title { font-size: 20px; margin-top: 15px; color: #333; }
            .receipt-info { display: flex; justify-content: space-between; margin-bottom: 30px; font-size: 14px; }
            .details { margin-bottom: 30px; }
            .detail-row { display: flex; justify-content: space-between; padding: 12px 0; border-bottom: 1px solid #eee; }
            .detail-label { color: #666; }
            .detail-value { font-weight: 600; color: #333; }
            .total-section { background: #f5f5f5; padding: 20px; border-radius: 8px; margin-top: 20px; }
            .total-row { display: flex; justify-content: space-between; margin-bottom: 10px; }
            .total-row.final { font-size: 18px; font-weight: bold; color: #1e40af; border-top: 2px solid #1e40af; padding-top: 10px; margin-top: 10px; }
            .footer { text-align: center; margin-top: 40px; font-size: 12px; color: #666; }
            .status { display: inline-block; padding: 4px 12px; border-radius: 20px; font-size: 12px; font-weight: 600; }
            .status-paid { background: #dcfce7; color: #166534; }
            .status-partial { background: #fef9c3; color: #854d0e; }
            .status-unpaid { background: #fee2e2; color: #991b1b; }
            @media print { body { padding: 20px; } }
          </style>
        </head>
        <body>
          ${printContent.innerHTML}
        </body>
      </html>
    `);
    printWindow.document.close();
    printWindow.print();
  };

  const getStatusClass = () => {
    switch (tenant.paymentStatus) {
      case 'paid': return 'status-paid';
      case 'partial': return 'status-partial';
      case 'unpaid': return 'status-unpaid';
    }
  };

  const getStatusText = () => {
    switch (tenant.paymentStatus) {
      case 'paid': return 'PAID';
      case 'partial': return 'PARTIAL';
      case 'unpaid': return 'UNPAID';
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[550px]">
        <DialogHeader>
          <DialogTitle>Payment Receipt</DialogTitle>
        </DialogHeader>
        
        <div ref={receiptRef} className="bg-background p-6 rounded-lg">
          {/* Header */}
          <div className="header text-center border-b-2 border-primary pb-4 mb-6">
            <div className="logo flex items-center justify-center gap-2 mb-2">
              <div className="logo-icon w-10 h-10 bg-primary rounded-lg flex items-center justify-center">
                <Building2 className="h-6 w-6 text-primary-foreground" />
              </div>
              <div>
                <div className="company-name text-xl font-bold text-primary">Bluetarde</div>
                <div className="company-subtitle text-xs text-muted-foreground">Investments Limited</div>
              </div>
            </div>
            <div className="receipt-title text-lg mt-4 text-foreground">PAYMENT RECEIPT</div>
          </div>

          {/* Receipt Info */}
          <div className="receipt-info flex justify-between mb-6 text-sm">
            <div>
              <span className="text-muted-foreground">Receipt No: </span>
              <span className="font-medium">{receiptNumber}</span>
            </div>
            <div>
              <span className="text-muted-foreground">Date: </span>
              <span className="font-medium">{currentDate}</span>
            </div>
          </div>

          {/* Details */}
          <div className="details space-y-0">
            <div className="detail-row flex justify-between py-3 border-b border-border">
              <span className="detail-label text-muted-foreground">Tenant Name</span>
              <span className="detail-value font-semibold">{tenant.name}</span>
            </div>
            <div className="detail-row flex justify-between py-3 border-b border-border">
              <span className="detail-label text-muted-foreground">Property</span>
              <span className="detail-value font-semibold">{apartment?.name}</span>
            </div>
            <div className="detail-row flex justify-between py-3 border-b border-border">
              <span className="detail-label text-muted-foreground">Unit Number</span>
              <span className="detail-value font-semibold">{tenant.unitNumber}</span>
            </div>
            <div className="detail-row flex justify-between py-3 border-b border-border">
              <span className="detail-label text-muted-foreground">Phone</span>
              <span className="detail-value font-semibold">{tenant.phone}</span>
            </div>
            <div className="detail-row flex justify-between py-3 border-b border-border">
              <span className="detail-label text-muted-foreground">Payment Status</span>
              <span className={`status ${getStatusClass()}`}>{getStatusText()}</span>
            </div>
          </div>

          {/* Total Section */}
          <div className="total-section bg-muted/50 p-4 rounded-lg mt-6">
            <div className="total-row flex justify-between mb-2">
              <span className="text-muted-foreground">Rent Due</span>
              <span className="font-medium">{formatCurrency(tenant.rentAmount)}</span>
            </div>
            <div className="total-row flex justify-between mb-2">
              <span className="text-muted-foreground">Amount Paid</span>
              <span className="font-medium text-success">{formatCurrency(tenant.amountPaid)}</span>
            </div>
            <div className="total-row final flex justify-between border-t-2 border-primary pt-2 mt-2">
              <span className="text-lg font-bold text-primary">Balance</span>
              <span className="text-lg font-bold text-primary">{formatCurrency(tenant.balance)}</span>
            </div>
          </div>

          {/* Footer */}
          <div className="footer text-center mt-8 text-xs text-muted-foreground">
            <p>Thank you for your payment!</p>
            <p className="mt-1">Bluetarde Investments Limited | Roysambu, Nairobi</p>
          </div>
        </div>

        <div className="flex justify-end gap-2 mt-4">
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Close
          </Button>
          <Button onClick={handlePrint}>
            <Printer className="h-4 w-4 mr-2" />
            Print Receipt
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}