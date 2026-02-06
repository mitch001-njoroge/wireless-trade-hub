import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface MpesaCallbackItem {
  Name: string;
  Value: string | number;
}

interface MpesaCallbackMetadata {
  Item: MpesaCallbackItem[];
}

interface MpesaStkCallback {
  MerchantRequestID: string;
  CheckoutRequestID: string;
  ResultCode: number;
  ResultDesc: string;
  CallbackMetadata?: MpesaCallbackMetadata;
}

interface MpesaCallbackBody {
  Body: {
    stkCallback: MpesaStkCallback;
  };
}

function extractCallbackValue(items: MpesaCallbackItem[], name: string): string | number | undefined {
  const item = items.find(i => i.Name === name);
  return item?.Value;
}

Deno.serve(async (req) => {
  // Handle CORS preflight
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    
    // Parse callback body
    const body: MpesaCallbackBody = await req.json();
    const stkCallback = body.Body?.stkCallback;
    
    if (!stkCallback) {
      console.error('Invalid callback format - missing stkCallback');
      return new Response(
        JSON.stringify({ ResultCode: 1, ResultDesc: 'Invalid callback format' }),
        { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }
    
    console.log('M-Pesa callback received:', {
      checkoutRequestId: stkCallback.CheckoutRequestID,
      resultCode: stkCallback.ResultCode,
      resultDesc: stkCallback.ResultDesc,
    });
    
    const supabase = createClient(supabaseUrl, supabaseServiceKey);
    
    // Find the transaction
    const { data: existingTransaction, error: findError } = await supabase
      .from('mpesa_transactions')
      .select('*, rent_period_id, tenant_id')
      .eq('checkout_request_id', stkCallback.CheckoutRequestID)
      .single();
    
    if (findError || !existingTransaction) {
      console.error('Transaction not found:', stkCallback.CheckoutRequestID, findError);
      // Still return success to M-Pesa to prevent retries
      return new Response(
        JSON.stringify({ ResultCode: 0, ResultDesc: 'Accepted' }),
        { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }
    
    // Check for duplicate callback (idempotency)
    if (existingTransaction.status !== 'pending') {
      console.log('Duplicate callback ignored for:', stkCallback.CheckoutRequestID);
      return new Response(
        JSON.stringify({ ResultCode: 0, ResultDesc: 'Accepted' }),
        { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }
    
    // Extract payment details from callback metadata
    let mpesaReceiptNumber: string | undefined;
    let transactionDate: string | undefined;
    let amount: number | undefined;
    let phoneNumber: string | undefined;
    
    if (stkCallback.ResultCode === 0 && stkCallback.CallbackMetadata?.Item) {
      const items = stkCallback.CallbackMetadata.Item;
      mpesaReceiptNumber = extractCallbackValue(items, 'MpesaReceiptNumber') as string;
      transactionDate = extractCallbackValue(items, 'TransactionDate')?.toString();
      amount = extractCallbackValue(items, 'Amount') as number;
      phoneNumber = extractCallbackValue(items, 'PhoneNumber')?.toString();
      
      console.log('Payment successful:', {
        receipt: mpesaReceiptNumber,
        amount,
        phone: phoneNumber,
        date: transactionDate,
      });
    }
    
    // Determine status based on result code
    const status = stkCallback.ResultCode === 0 ? 'completed' : 'failed';
    
    // Update transaction record
    const { error: updateError } = await supabase
      .from('mpesa_transactions')
      .update({
        status: status,
        result_code: stkCallback.ResultCode,
        result_desc: stkCallback.ResultDesc,
        mpesa_receipt_number: mpesaReceiptNumber,
        transaction_date: transactionDate,
        updated_at: new Date().toISOString(),
      })
      .eq('checkout_request_id', stkCallback.CheckoutRequestID);
    
    if (updateError) {
      console.error('Failed to update transaction:', updateError);
    }
    
    // If payment successful, create rent payment record
    if (stkCallback.ResultCode === 0 && existingTransaction.rent_period_id) {
      const paymentAmount = amount || existingTransaction.amount;
      
      const { data: payment, error: paymentError } = await supabase
        .from('rent_payments')
        .insert({
          rent_period_id: existingTransaction.rent_period_id,
          tenant_id: existingTransaction.tenant_id,
          amount: paymentAmount,
          payment_method: 'mpesa',
          transaction_id: stkCallback.CheckoutRequestID,
          mpesa_receipt: mpesaReceiptNumber,
          phone_number: phoneNumber || existingTransaction.phone_number,
          verified: true,
          verified_at: new Date().toISOString(),
          notes: `M-Pesa payment - ${stkCallback.ResultDesc}`,
        })
        .select()
        .single();
      
      if (paymentError) {
        console.error('Failed to create payment record:', paymentError);
      } else {
        console.log('Payment record created:', payment.id);
      }
    }
    
    console.log('Callback processed successfully');
    
    // Return success to M-Pesa
    return new Response(
      JSON.stringify({ ResultCode: 0, ResultDesc: 'Accepted' }),
      { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
    
  } catch (error) {
    console.error('Callback processing error:', error);
    // Return success anyway to prevent M-Pesa retries
    return new Response(
      JSON.stringify({ ResultCode: 0, ResultDesc: 'Accepted' }),
      { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
