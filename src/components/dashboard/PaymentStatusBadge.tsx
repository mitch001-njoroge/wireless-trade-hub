import { PaymentStatus, getStatusColor } from '@/lib/data';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';

interface PaymentStatusBadgeProps {
  status: PaymentStatus;
}

const statusLabels: Record<PaymentStatus, string> = {
  paid: 'Paid',
  partial: 'Partial',
  unpaid: 'Not Paid',
};

export function PaymentStatusBadge({ status }: PaymentStatusBadgeProps) {
  return (
    <Badge
      variant="outline"
      className={cn('font-medium', getStatusColor(status))}
    >
      {statusLabels[status]}
    </Badge>
  );
}
