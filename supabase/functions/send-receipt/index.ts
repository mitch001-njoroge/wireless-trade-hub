import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

function formatCurrency(amount: number): string {
  return `KES ${amount.toLocaleString('en-KE')}`;
}

function generateReceiptHTML(data: {
  receiptNumber: string;
  tenantName: string;
  apartmentName: string;
  unitNumber: string;
  phone: string;
  rentAmount: number;
  amountPaid: number;
  balance: number;
  paymentMethod: string;
  paymentDate: string;
  transactionRef: string;
  month: number;
  year: number;
}): string {
  const monthNames = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
  const monthName = monthNames[data.month - 1] || 'Unknown';
  const status = data.balance <= 0 ? 'PAID' : 'PARTIAL';
  const statusColor = data.balance <= 0 ? '#166534' : '#854d0e';
  const statusBg = data.balance <= 0 ? '#dcfce7' : '#fef9c3';

  return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <style>
    * { margin: 0; padding: 0; box-sizing: border-box; }
    body { font-family: 'Segoe UI', Arial, sans-serif; background: #f5f5f5; padding: 20px; }
    .receipt { max-width: 600px; margin: 0 auto; background: white; border-radius: 12px; overflow: hidden; box-shadow: 0 4px 20px rgba(0,0,0,0.08); }
    .header { background: linear-gradient(135deg, #1e40af, #3b82f6); color: white; padding: 30px; text-align: center; }
    .header h1 { font-size: 24px; margin-bottom: 4px; }
    .header p { font-size: 13px; opacity: 0.85; }
    .header .receipt-title { font-size: 18px; margin-top: 16px; letter-spacing: 2px; font-weight: 300; }
    .body { padding: 30px; }
    .info-row { display: flex; justify-content: space-between; margin-bottom: 6px; font-size: 13px; color: #666; }
    .info-row strong { color: #333; }
    .divider { border: none; border-top: 1px solid #eee; margin: 20px 0; }
    .detail-table { width: 100%; border-collapse: collapse; }
    .detail-table td { padding: 12px 0; border-bottom: 1px solid #f0f0f0; font-size: 14px; }
    .detail-table td:first-child { color: #888; }
    .detail-table td:last-child { text-align: right; font-weight: 600; color: #333; }
    .total-box { background: #f8fafc; border-radius: 8px; padding: 20px; margin-top: 20px; }
    .total-row { display: flex; justify-content: space-between; margin-bottom: 8px; font-size: 14px; }
    .total-row.final { font-size: 18px; font-weight: bold; color: #1e40af; border-top: 2px solid #1e40af; padding-top: 12px; margin-top: 8px; }
    .status-badge { display: inline-block; padding: 4px 16px; border-radius: 20px; font-size: 12px; font-weight: 700; background: ${statusBg}; color: ${statusColor}; }
    .footer { text-align: center; padding: 20px; font-size: 12px; color: #999; border-top: 1px solid #eee; }
  </style>
</head>
<body>
  <div class="receipt">
    <div class="header">
      <h1>Wireless Trade</h1>
      <p>Property Management</p>
      <div class="receipt-title">PAYMENT RECEIPT</div>
    </div>
    <div class="body">
      <div class="info-row">
        <span>Receipt No: <strong>${data.receiptNumber}</strong></span>
        <span>Date: <strong>${data.paymentDate}</strong></span>
      </div>
      <div class="info-row">
        <span>Period: <strong>${monthName} ${data.year}</strong></span>
        <span><span class="status-badge">${status}</span></span>
      </div>
      <hr class="divider">
      <table class="detail-table">
        <tr><td>Tenant Name</td><td>${data.tenantName}</td></tr>
        <tr><td>Property</td><td>${data.apartmentName}</td></tr>
        <tr><td>Unit Number</td><td>${data.unitNumber}</td></tr>
        <tr><td>Phone</td><td>${data.phone}</td></tr>
        <tr><td>Payment Method</td><td>${data.paymentMethod.toUpperCase()}</td></tr>
        <tr><td>Transaction Ref</td><td>${data.transactionRef || 'N/A'}</td></tr>
      </table>
      <div class="total-box">
        <div class="total-row"><span>Rent Due</span><span>${formatCurrency(data.rentAmount)}</span></div>
        <div class="total-row"><span>Amount Paid</span><span style="color: #16a34a;">${formatCurrency(data.amountPaid)}</span></div>
        <div class="total-row final"><span>Balance</span><span>${formatCurrency(data.balance)}</span></div>
      </div>
    </div>
    <div class="footer">
      <p>Thank you for your payment!</p>
      <p>Wireless Trade | Nairobi, Kenya</p>
    </div>
  </div>
</body>
</html>`;
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const sendgridKey = Deno.env.get('SENDGRID_API_KEY');
    const fromEmail = Deno.env.get('SENDGRID_FROM_EMAIL');

    if (!sendgridKey || !fromEmail) {
      return new Response(
        JSON.stringify({ error: 'SendGrid not configured' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const { paymentId, tenantEmail } = await req.json();

    if (!paymentId) {
      return new Response(
        JSON.stringify({ error: 'Missing paymentId' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    // Get payment details
    const { data: payment, error: paymentError } = await supabase
      .from('rent_payments')
      .select('*')
      .eq('id', paymentId)
      .single();

    if (paymentError || !payment) {
      return new Response(
        JSON.stringify({ error: 'Payment not found' }),
        { status: 404, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Get rent period
    const { data: period } = await supabase
      .from('rent_periods')
      .select('*')
      .eq('id', payment.rent_period_id)
      .single();

    // Get tenant
    const { data: tenant } = await supabase
      .from('tenants')
      .select('*')
      .eq('id', payment.tenant_id)
      .single();

    if (!tenant || !period) {
      return new Response(
        JSON.stringify({ error: 'Tenant or period not found' }),
        { status: 404, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const receiptNumber = `RCP-${new Date().getFullYear()}${String(period.month).padStart(2, '0')}-${payment.id.slice(0, 6).toUpperCase()}`;

    const receiptData = {
      receiptNumber,
      tenantName: tenant.name,
      apartmentName: tenant.apartment_name,
      unitNumber: tenant.unit_number,
      phone: tenant.phone,
      rentAmount: Number(period.rent_amount),
      amountPaid: Number(period.amount_paid),
      balance: Number(period.rent_amount) - Number(period.amount_paid),
      paymentMethod: payment.payment_method,
      paymentDate: new Date(payment.payment_date).toLocaleDateString('en-KE', { year: 'numeric', month: 'long', day: 'numeric' }),
      transactionRef: payment.mpesa_receipt || payment.bank_reference || payment.transaction_id || '',
      month: period.month,
      year: period.year,
    };

    const htmlContent = generateReceiptHTML(receiptData);
    const recipientEmail = tenantEmail || null;

    // If email provided, send receipt via email
    if (recipientEmail) {
      const emailResponse = await fetch('https://api.sendgrid.com/v3/mail/send', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${sendgridKey}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          personalizations: [{ to: [{ email: recipientEmail }] }],
          from: { email: fromEmail, name: 'Wireless Trade - Rent Management' },
          subject: `Payment Receipt - ${receiptData.receiptNumber}`,
          content: [
            { type: 'text/html', value: htmlContent },
            { type: 'text/plain', value: `Payment Receipt ${receiptData.receiptNumber}\n\nTenant: ${tenant.name}\nProperty: ${tenant.apartment_name} Unit ${tenant.unit_number}\nAmount Paid: ${formatCurrency(Number(payment.amount))}\nPayment Method: ${payment.payment_method}\nDate: ${receiptData.paymentDate}\n\nThank you for your payment!\nWireless Trade` },
          ],
        }),
      });

      if (!emailResponse.ok) {
        const errorText = await emailResponse.text();
        console.error('SendGrid error:', errorText);
        return new Response(
          JSON.stringify({ error: 'Failed to send email receipt', details: errorText }),
          { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }

      console.log('Receipt email sent to:', recipientEmail);
    }

    // Also send SMS confirmation
    const accountSid = Deno.env.get('TWILIO_ACCOUNT_SID');
    const authToken = Deno.env.get('TWILIO_AUTH_TOKEN');
    const twilioPhone = Deno.env.get('TWILIO_PHONE_NUMBER');

    if (accountSid && authToken && twilioPhone) {
      let phone = tenant.phone.replace(/[\s\-\+]/g, '');
      if (phone.startsWith('0')) phone = '+254' + phone.substring(1);
      else if (phone.startsWith('254')) phone = '+' + phone;
      else if (!phone.startsWith('+')) phone = '+254' + phone;

      const smsMessage = `Payment Received! ${formatCurrency(Number(payment.amount))} for ${tenant.apartment_name} Unit ${tenant.unit_number}. Receipt: ${receiptData.receiptNumber}. Balance: ${formatCurrency(receiptData.balance)}. Thank you! - Wireless Trade`;

      const twilioUrl = `https://api.twilio.com/2010-04-01/Accounts/${accountSid}/Messages.json`;
      const auth = btoa(`${accountSid}:${authToken}`);

      await fetch(twilioUrl, {
        method: 'POST',
        headers: { 'Authorization': `Basic ${auth}`, 'Content-Type': 'application/x-www-form-urlencoded' },
        body: new URLSearchParams({ To: phone, From: twilioPhone, Body: smsMessage }).toString(),
      });
    }

    return new Response(
      JSON.stringify({ success: true, receiptNumber, emailSent: !!recipientEmail }),
      { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  } catch (error) {
    console.error('Receipt error:', error);
    return new Response(
      JSON.stringify({ error: error.message || 'Internal server error' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
