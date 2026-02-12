import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

function formatCurrency(amount: number): string {
  return `KES ${amount.toLocaleString('en-KE')}`;
}

function formatPhoneForTwilio(phone: string): string {
  let cleaned = phone.replace(/[\s\-\+]/g, '');
  if (cleaned.startsWith('0')) {
    cleaned = '+254' + cleaned.substring(1);
  } else if (cleaned.startsWith('254')) {
    cleaned = '+' + cleaned;
  } else if (!cleaned.startsWith('+')) {
    cleaned = '+254' + cleaned;
  }
  return cleaned;
}

async function sendSMS(to: string, message: string) {
  const accountSid = Deno.env.get('TWILIO_ACCOUNT_SID');
  const authToken = Deno.env.get('TWILIO_AUTH_TOKEN');
  const fromNumber = Deno.env.get('TWILIO_PHONE_NUMBER');
  if (!accountSid || !authToken || !fromNumber) return;

  const url = `https://api.twilio.com/2010-04-01/Accounts/${accountSid}/Messages.json`;
  const auth = btoa(`${accountSid}:${authToken}`);

  await fetch(url, {
    method: 'POST',
    headers: { 'Authorization': `Basic ${auth}`, 'Content-Type': 'application/x-www-form-urlencoded' },
    body: new URLSearchParams({ To: to, From: fromNumber, Body: message }).toString(),
  });
}

async function sendWhatsApp(to: string, message: string) {
  const accountSid = Deno.env.get('TWILIO_ACCOUNT_SID');
  const authToken = Deno.env.get('TWILIO_AUTH_TOKEN');
  const fromWhatsApp = Deno.env.get('TWILIO_WHATSAPP_NUMBER');
  if (!accountSid || !authToken || !fromWhatsApp) return;

  const url = `https://api.twilio.com/2010-04-01/Accounts/${accountSid}/Messages.json`;
  const auth = btoa(`${accountSid}:${authToken}`);
  const whatsappTo = to.startsWith('whatsapp:') ? to : `whatsapp:${to}`;
  const whatsappFrom = fromWhatsApp.startsWith('whatsapp:') ? fromWhatsApp : `whatsapp:${fromWhatsApp}`;

  await fetch(url, {
    method: 'POST',
    headers: { 'Authorization': `Basic ${auth}`, 'Content-Type': 'application/x-www-form-urlencoded' },
    body: new URLSearchParams({ To: whatsappTo, From: whatsappFrom, Body: message }).toString(),
  });
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    const today = new Date();
    const threeDaysFromNow = new Date(today);
    threeDaysFromNow.setDate(today.getDate() + 3);
    const targetDate = threeDaysFromNow.toISOString().split('T')[0];

    console.log(`Checking for rent due on ${targetDate}...`);

    // 1. Send reminders for rent due in 3 days
    const { data: upcomingPeriods, error: upcomingError } = await supabase
      .from('rent_periods')
      .select('*, tenant_id')
      .eq('due_date', targetDate)
      .in('status', ['unpaid', 'partial']);

    if (upcomingError) {
      console.error('Error fetching upcoming periods:', upcomingError);
    }

    let remindersSent = 0;
    let overdueAlertsSent = 0;

    if (upcomingPeriods && upcomingPeriods.length > 0) {
      const tenantIds = [...new Set(upcomingPeriods.map(p => p.tenant_id))];
      const { data: tenants } = await supabase
        .from('tenants')
        .select('*')
        .in('id', tenantIds);

      const tenantMap = new Map((tenants || []).map(t => [t.id, t]));

      for (const period of upcomingPeriods) {
        const tenant = tenantMap.get(period.tenant_id);
        if (!tenant) continue;

        const balance = period.rent_amount - period.amount_paid;
        const phone = formatPhoneForTwilio(tenant.phone);

        const message = `Hi ${tenant.name}, your rent of ${formatCurrency(balance)} for ${tenant.apartment_name} Unit ${tenant.unit_number} is due on ${period.due_date}. Please make your payment before the due date to avoid late fees. - Wireless Trade`;

        console.log(`Sending reminder to ${tenant.name} (${phone})`);

        await Promise.allSettled([
          sendSMS(phone, message),
          sendWhatsApp(phone, message),
        ]);

        remindersSent++;
      }
    }

    // 2. Send overdue alerts
    const todayStr = today.toISOString().split('T')[0];

    // Mark overdue first
    await supabase.rpc('mark_overdue_rent_periods');

    // Get newly overdue periods (due date was yesterday)
    const yesterday = new Date(today);
    yesterday.setDate(today.getDate() - 1);
    const yesterdayStr = yesterday.toISOString().split('T')[0];

    const { data: overduePeriods, error: overdueError } = await supabase
      .from('rent_periods')
      .select('*')
      .eq('due_date', yesterdayStr)
      .eq('status', 'overdue');

    if (overdueError) {
      console.error('Error fetching overdue periods:', overdueError);
    }

    if (overduePeriods && overduePeriods.length > 0) {
      const tenantIds = [...new Set(overduePeriods.map(p => p.tenant_id))];
      const { data: tenants } = await supabase
        .from('tenants')
        .select('*')
        .in('id', tenantIds);

      const tenantMap = new Map((tenants || []).map(t => [t.id, t]));

      for (const period of overduePeriods) {
        const tenant = tenantMap.get(period.tenant_id);
        if (!tenant) continue;

        const balance = period.rent_amount - period.amount_paid;
        const phone = formatPhoneForTwilio(tenant.phone);

        const message = `OVERDUE NOTICE: Hi ${tenant.name}, your rent of ${formatCurrency(balance)} for ${tenant.apartment_name} Unit ${tenant.unit_number} was due on ${period.due_date} and is now overdue. Please make payment immediately. - Wireless Trade`;

        console.log(`Sending overdue alert to ${tenant.name} (${phone})`);

        await Promise.allSettled([
          sendSMS(phone, message),
          sendWhatsApp(phone, message),
        ]);

        overdueAlertsSent++;
      }
    }

    const summary = {
      remindersSent,
      overdueAlertsSent,
      checkedDate: targetDate,
      overdueCheckDate: yesterdayStr,
    };

    console.log('Reminder job completed:', summary);

    return new Response(
      JSON.stringify({ success: true, ...summary }),
      { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  } catch (error) {
    console.error('Reminder job error:', error);
    return new Response(
      JSON.stringify({ error: error.message || 'Internal server error' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
