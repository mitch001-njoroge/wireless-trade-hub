import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/hooks/use-toast';

interface STKPushParams {
  phoneNumber: string;
  amount: number;
  accountReference: string;
  transactionDesc?: string;
  rentPeriodId?: string;
  tenantId?: string;
}

interface STKPushResponse {
  success: boolean;
  message?: string;
  checkoutRequestId?: string;
  merchantRequestId?: string;
  transactionId?: string;
  error?: string;
}

interface PaymentStatus {
  status: 'pending' | 'completed' | 'failed';
  resultCode?: string;
  resultDesc?: string;
}

export function useMpesaPayment() {
  const [isLoading, setIsLoading] = useState(false);
  const [isPolling, setIsPolling] = useState(false);

  const initiateSTKPush = async (params: STKPushParams): Promise<STKPushResponse> => {
    setIsLoading(true);
    
    try {
      const { data, error } = await supabase.functions.invoke('mpesa-stk-push', {
        body: params,
      });

      if (error) {
        console.error('STK Push error:', error);
        toast({
          title: 'Payment Failed',
          description: error.message || 'Failed to initiate payment',
          variant: 'destructive',
        });
        return { success: false, error: error.message };
      }

      if (data?.success) {
        toast({
          title: 'Payment Initiated',
          description: data.message || 'Check your phone to complete the payment',
        });
        return {
          success: true,
          message: data.message,
          checkoutRequestId: data.checkoutRequestId,
          merchantRequestId: data.merchantRequestId,
          transactionId: data.transactionId,
        };
      }

      toast({
        title: 'Payment Failed',
        description: data?.error || 'Unknown error occurred',
        variant: 'destructive',
      });
      return { success: false, error: data?.error };
      
    } catch (err) {
      console.error('STK Push exception:', err);
      toast({
        title: 'Payment Error',
        description: 'An unexpected error occurred',
        variant: 'destructive',
      });
      return { success: false, error: 'Unexpected error' };
    } finally {
      setIsLoading(false);
    }
  };

  const queryPaymentStatus = async (checkoutRequestId: string): Promise<PaymentStatus> => {
    try {
      const { data, error } = await supabase.functions.invoke('mpesa-query', {
        body: { checkoutRequestId },
      });

      if (error) {
        console.error('Query error:', error);
        return { status: 'pending' };
      }

      return {
        status: data?.status || 'pending',
        resultCode: data?.resultCode,
        resultDesc: data?.resultDesc,
      };
    } catch (err) {
      console.error('Query exception:', err);
      return { status: 'pending' };
    }
  };

  const pollPaymentStatus = async (
    checkoutRequestId: string,
    onComplete: (status: PaymentStatus) => void,
    maxAttempts = 10,
    intervalMs = 5000
  ) => {
    setIsPolling(true);
    let attempts = 0;

    const poll = async () => {
      if (attempts >= maxAttempts) {
        setIsPolling(false);
        onComplete({ status: 'pending', resultDesc: 'Payment status check timed out' });
        return;
      }

      attempts++;
      const status = await queryPaymentStatus(checkoutRequestId);

      if (status.status === 'completed') {
        setIsPolling(false);
        toast({
          title: 'Payment Successful',
          description: 'The rent payment has been received',
        });
        onComplete(status);
        return;
      }

      if (status.status === 'failed') {
        setIsPolling(false);
        toast({
          title: 'Payment Failed',
          description: status.resultDesc || 'The payment was not completed',
          variant: 'destructive',
        });
        onComplete(status);
        return;
      }

      // Continue polling
      setTimeout(poll, intervalMs);
    };

    poll();
  };

  return {
    initiateSTKPush,
    queryPaymentStatus,
    pollPaymentStatus,
    isLoading,
    isPolling,
  };
}
