import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface QueryRequest {
  checkoutRequestId: string;
}

interface MpesaAuthResponse {
  access_token: string;
  expires_in: string;
}

interface MpesaQueryResponse {
  ResponseCode: string;
  ResponseDescription: string;
  MerchantRequestID: string;
  CheckoutRequestID: string;
  ResultCode: string;
  ResultDesc: string;
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
    throw new Error(`M-Pesa authentication failed: ${response.status}`);
  }
  
  const data: MpesaAuthResponse = await response.json();
  return data.access_token;
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

Deno.serve(async (req) => {
  // Handle CORS preflight
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    const shortcode = Deno.env.get('MPESA_SHORTCODE');
    const passkey = Deno.env.get('MPESA_PASSKEY');
    const environment = Deno.env.get('MPESA_ENVIRONMENT') || 'sandbox';
    
    if (!shortcode || !passkey) {
      return new Response(
        JSON.stringify({ error: 'M-Pesa configuration incomplete' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Parse request body
    const body: QueryRequest = await req.json();
    const { checkoutRequestId } = body;
    
    if (!checkoutRequestId) {
      return new Response(
        JSON.stringify({ error: 'Missing checkoutRequestId' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }
    
    console.log('Querying transaction status:', checkoutRequestId);
    
    // Get M-Pesa access token
    const accessToken = await getMpesaAccessToken();
    
    // Generate timestamp and password
    const timestamp = generateTimestamp();
    const password = btoa(`${shortcode}${passkey}${timestamp}`);
    
    // Prepare query request
    const baseUrl = environment === 'production' 
      ? 'https://api.safaricom.co.ke'
      : 'https://sandbox.safaricom.co.ke';
    
    const queryPayload = {
      BusinessShortCode: shortcode,
      Password: password,
      Timestamp: timestamp,
      CheckoutRequestID: checkoutRequestId,
    };
    
    const queryResponse = await fetch(`${baseUrl}/mpesa/stkpushquery/v1/query`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${accessToken}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(queryPayload),
    });
    
    const queryResult: MpesaQueryResponse = await queryResponse.json();
    console.log('M-Pesa query response:', queryResult);
    
    // Interpret result
    let status = 'pending';
    if (queryResult.ResultCode === '0') {
      status = 'completed';
    } else if (queryResult.ResultCode !== undefined && queryResult.ResultCode !== '') {
      status = 'failed';
    }
    
    // Update local database if we have a definitive status
    if (status !== 'pending') {
      const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
      const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
      const supabase = createClient(supabaseUrl, supabaseServiceKey);
      
      await supabase
        .from('mpesa_transactions')
        .update({
          status: status,
          result_code: parseInt(queryResult.ResultCode) || null,
          result_desc: queryResult.ResultDesc,
          updated_at: new Date().toISOString(),
        })
        .eq('checkout_request_id', checkoutRequestId);
    }
    
    return new Response(
      JSON.stringify({
        success: true,
        status: status,
        resultCode: queryResult.ResultCode,
        resultDesc: queryResult.ResultDesc,
        responseCode: queryResult.ResponseCode,
        responseDescription: queryResult.ResponseDescription,
      }),
      { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
    
  } catch (error) {
    console.error('Query error:', error);
    return new Response(
      JSON.stringify({ error: error.message || 'Internal server error' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
