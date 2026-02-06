import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface STKPushRequest {
  phoneNumber: string;
  amount: number;
  accountReference: string;
  transactionDesc?: string;
  rentPeriodId?: string;
  tenantId?: string;
}

interface MpesaAuthResponse {
  access_token: string;
  expires_in: string;
}

interface MpesaSTKResponse {
  MerchantRequestID: string;
  CheckoutRequestID: string;
  ResponseCode: string;
  ResponseDescription: string;
  CustomerMessage: string;
}

async function getMpesaAccessToken(): Promise<string> {
  const consumerKey = Deno.env.get('MPESA_CONSUMER_KEY');
  const consumerSecret = Deno.env.get('MPESA_CONSUMER_SECRET');
  const environment = Deno.env.get('MPESA_ENVIRONMENT') || 'sandbox';
  
  if (!consumerKey || !consumerSecret) {
    throw new Error('M-Pesa credentials not configured');
  }
  
  const baseUrl = environment === 'production' 
    ? 'https://api.safaricom.co.ke'
    : 'https://sandbox.safaricom.co.ke';
  
  const auth = btoa(`${consumerKey}:${consumerSecret}`);
  
  const response = await fetch(`${baseUrl}/oauth/v1/generate?grant_type=client_credentials`, {
    method: 'GET',
    headers: {
      'Authorization': `Basic ${auth}`,
    },
  });
  
  if (!response.ok) {
    const errorText = await response.text();
    console.error('M-Pesa auth error:', errorText);
    throw new Error(`M-Pesa authentication failed: ${response.status}`);
  }
  
  const data: MpesaAuthResponse = await response.json();
  console.log('M-Pesa access token obtained successfully');
  return data.access_token;
}

function formatPhoneNumber(phone: string): string {
  // Remove any spaces, dashes, or plus signs
  let cleaned = phone.replace(/[\s\-\+]/g, '');
  
  // Handle different formats
  if (cleaned.startsWith('0')) {
    cleaned = '254' + cleaned.substring(1);
  } else if (cleaned.startsWith('+254')) {
    cleaned = cleaned.substring(1);
  } else if (!cleaned.startsWith('254')) {
    cleaned = '254' + cleaned;
  }
  
  return cleaned;
}

function generateTimestamp(): string {
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, '0');
  const day = String(now.getDate()).padStart(2, '0');
  const hours = String(now.getHours()).padStart(2, '0');
  const minutes = String(now.getMinutes()).padStart(2, '0');
  const seconds = String(now.getSeconds()).padStart(2, '0');
  
  return `${year}${month}${day}${hours}${minutes}${seconds}`;
}

function generatePassword(shortcode: string, passkey: string, timestamp: string): string {
  const encoder = new TextEncoder();
  const data = encoder.encode(`${shortcode}${passkey}${timestamp}`);
  
  // Base64 encode the concatenation
  return btoa(`${shortcode}${passkey}${timestamp}`);
}

Deno.serve(async (req) => {
  // Handle CORS preflight
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    // Get environment variables
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const shortcode = Deno.env.get('MPESA_SHORTCODE');
    const passkey = Deno.env.get('MPESA_PASSKEY');
    const callbackUrl = Deno.env.get('MPESA_CALLBACK_URL');
    const environment = Deno.env.get('MPESA_ENVIRONMENT') || 'sandbox';
    
    if (!shortcode || !passkey) {
      console.error('Missing M-Pesa shortcode or passkey');
      return new Response(
        JSON.stringify({ error: 'M-Pesa configuration incomplete' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Parse request body
    const body: STKPushRequest = await req.json();
    const { phoneNumber, amount, accountReference, transactionDesc, rentPeriodId, tenantId } = body;
    
    console.log('STK Push request:', { phoneNumber, amount, accountReference, rentPeriodId, tenantId });
    
    // Validate required fields
    if (!phoneNumber || !amount || !accountReference) {
      return new Response(
        JSON.stringify({ error: 'Missing required fields: phoneNumber, amount, accountReference' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }
    
    // Format phone number
    const formattedPhone = formatPhoneNumber(phoneNumber);
    console.log('Formatted phone:', formattedPhone);
    
    // Get M-Pesa access token
    const accessToken = await getMpesaAccessToken();
    
    // Generate timestamp and password
    const timestamp = generateTimestamp();
    const password = generatePassword(shortcode, passkey, timestamp);
    
    // Determine callback URL
    const finalCallbackUrl = callbackUrl || `${supabaseUrl}/functions/v1/mpesa-callback`;
    
    // Prepare STK Push request
    const baseUrl = environment === 'production' 
      ? 'https://api.safaricom.co.ke'
      : 'https://sandbox.safaricom.co.ke';
    
    const stkPayload = {
      BusinessShortCode: shortcode,
      Password: password,
      Timestamp: timestamp,
      TransactionType: 'CustomerPayBillOnline',
      Amount: Math.round(amount),
      PartyA: formattedPhone,
      PartyB: shortcode,
      PhoneNumber: formattedPhone,
      CallBackURL: finalCallbackUrl,
      AccountReference: accountReference,
      TransactionDesc: transactionDesc || `Rent payment for ${accountReference}`,
    };
    
    console.log('Sending STK Push request to M-Pesa...');
    
    const stkResponse = await fetch(`${baseUrl}/mpesa/stkpush/v1/processrequest`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${accessToken}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(stkPayload),
    });
    
    const stkResult: MpesaSTKResponse = await stkResponse.json();
    console.log('M-Pesa STK response:', stkResult);
    
    if (stkResult.ResponseCode !== '0') {
      console.error('M-Pesa STK Push failed:', stkResult);
      return new Response(
        JSON.stringify({ 
          error: 'STK Push failed', 
          details: stkResult.ResponseDescription || stkResult.CustomerMessage 
        }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }
    
    // Save transaction to database
    const supabase = createClient(supabaseUrl, supabaseServiceKey);
    
    const { data: transaction, error: dbError } = await supabase
      .from('mpesa_transactions')
      .insert({
        checkout_request_id: stkResult.CheckoutRequestID,
        merchant_request_id: stkResult.MerchantRequestID,
        rent_period_id: rentPeriodId || null,
        tenant_id: tenantId || null,
        phone_number: formattedPhone,
        amount: amount,
        account_reference: accountReference,
        transaction_desc: transactionDesc || `Rent payment for ${accountReference}`,
        status: 'pending',
      })
      .select()
      .single();
    
    if (dbError) {
      console.error('Failed to save transaction:', dbError);
      // Don't fail the request, transaction was already sent to M-Pesa
    }
    
    console.log('STK Push initiated successfully:', stkResult.CheckoutRequestID);
    
    return new Response(
      JSON.stringify({
        success: true,
        message: stkResult.CustomerMessage,
        checkoutRequestId: stkResult.CheckoutRequestID,
        merchantRequestId: stkResult.MerchantRequestID,
        transactionId: transaction?.id,
      }),
      { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
    
  } catch (error) {
    console.error('STK Push error:', error);
    return new Response(
      JSON.stringify({ error: error.message || 'Internal server error' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
