import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface NotificationRequest {
  type: 'sms' | 'whatsapp' | 'email' | 'all';
  to: string; // phone number for sms/whatsapp, email for email
  subject?: string;
  message: string;
  htmlContent?: string;
  tenantName?: string;
}

async function sendSMS(to: string, message: string): Promise<{ success: boolean; error?: string }> {
  const accountSid = Deno.env.get('TWILIO_ACCOUNT_SID');
  const authToken = Deno.env.get('TWILIO_AUTH_TOKEN');
  const fromNumber = Deno.env.get('TWILIO_PHONE_NUMBER');

  if (!accountSid || !authToken || !fromNumber) {
    return { success: false, error: 'Twilio SMS credentials not configured' };
  }

  try {
    const url = `https://api.twilio.com/2010-04-01/Accounts/${accountSid}/Messages.json`;
    const auth = btoa(`${accountSid}:${authToken}`);

    const body = new URLSearchParams({
      To: to,
      From: fromNumber,
      Body: message,
    });

    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Authorization': `Basic ${auth}`,
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: body.toString(),
    });

    const data = await response.json();
    if (!response.ok) {
      console.error('Twilio SMS error:', data);
      return { success: false, error: data.message || 'SMS send failed' };
    }

    console.log('SMS sent successfully:', data.sid);
    return { success: true };
  } catch (err) {
    console.error('SMS exception:', err);
    return { success: false, error: err.message };
  }
}

async function sendWhatsApp(to: string, message: string): Promise<{ success: boolean; error?: string }> {
  const accountSid = Deno.env.get('TWILIO_ACCOUNT_SID');
  const authToken = Deno.env.get('TWILIO_AUTH_TOKEN');
  const fromWhatsApp = Deno.env.get('TWILIO_WHATSAPP_NUMBER');

  if (!accountSid || !authToken || !fromWhatsApp) {
    return { success: false, error: 'Twilio WhatsApp credentials not configured' };
  }

  try {
    const url = `https://api.twilio.com/2010-04-01/Accounts/${accountSid}/Messages.json`;
    const auth = btoa(`${accountSid}:${authToken}`);

    const whatsappTo = to.startsWith('whatsapp:') ? to : `whatsapp:${to}`;
    const whatsappFrom = fromWhatsApp.startsWith('whatsapp:') ? fromWhatsApp : `whatsapp:${fromWhatsApp}`;

    const body = new URLSearchParams({
      To: whatsappTo,
      From: whatsappFrom,
      Body: message,
    });

    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Authorization': `Basic ${auth}`,
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: body.toString(),
    });

    const data = await response.json();
    if (!response.ok) {
      console.error('Twilio WhatsApp error:', data);
      return { success: false, error: data.message || 'WhatsApp send failed' };
    }

    console.log('WhatsApp sent successfully:', data.sid);
    return { success: true };
  } catch (err) {
    console.error('WhatsApp exception:', err);
    return { success: false, error: err.message };
  }
}

async function sendEmail(to: string, subject: string, textContent: string, htmlContent?: string): Promise<{ success: boolean; error?: string }> {
  const apiKey = Deno.env.get('SENDGRID_API_KEY');
  const fromEmail = Deno.env.get('SENDGRID_FROM_EMAIL');

  if (!apiKey || !fromEmail) {
    return { success: false, error: 'SendGrid credentials not configured' };
  }

  try {
    const response = await fetch('https://api.sendgrid.com/v3/mail/send', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        personalizations: [{ to: [{ email: to }] }],
        from: { email: fromEmail, name: 'Wireless Trade - Rent Management' },
        subject,
        content: [
          ...(htmlContent ? [{ type: 'text/html', value: htmlContent }] : []),
          { type: 'text/plain', value: textContent },
        ],
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('SendGrid error:', errorText);
      return { success: false, error: `SendGrid failed: ${response.status}` };
    }

    console.log('Email sent successfully to:', to);
    return { success: true };
  } catch (err) {
    console.error('Email exception:', err);
    return { success: false, error: err.message };
  }
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const body: NotificationRequest = await req.json();
    const { type, to, subject, message, htmlContent } = body;

    if (!to || !message) {
      return new Response(
        JSON.stringify({ error: 'Missing required fields: to, message' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const results: Record<string, { success: boolean; error?: string }> = {};

    if (type === 'sms' || type === 'all') {
      results.sms = await sendSMS(to, message);
    }

    if (type === 'whatsapp' || type === 'all') {
      results.whatsapp = await sendWhatsApp(to, message);
    }

    if (type === 'email' || type === 'all') {
      results.email = await sendEmail(to, subject || 'Notification', message, htmlContent);
    }

    return new Response(
      JSON.stringify({ success: true, results }),
      { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  } catch (error) {
    console.error('Notification error:', error);
    return new Response(
      JSON.stringify({ error: error.message || 'Internal server error' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
