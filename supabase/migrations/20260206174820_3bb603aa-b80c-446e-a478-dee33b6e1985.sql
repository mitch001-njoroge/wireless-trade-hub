-- Create enum for payment methods
CREATE TYPE public.rent_payment_method AS ENUM ('mpesa', 'bank_transfer', 'cash');

-- Create enum for rent payment status
CREATE TYPE public.rent_status AS ENUM ('paid', 'unpaid', 'overdue', 'partial');

-- Create tenants table (moving from localStorage to database)
CREATE TABLE public.tenants (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  phone TEXT NOT NULL,
  unit_number TEXT NOT NULL,
  apartment_id TEXT NOT NULL,
  apartment_name TEXT NOT NULL,
  rent_amount NUMERIC NOT NULL DEFAULT 0,
  due_day INTEGER NOT NULL DEFAULT 5,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS on tenants
ALTER TABLE public.tenants ENABLE ROW LEVEL SECURITY;

-- RLS policies for tenants (admin-only access)
CREATE POLICY "Authenticated users can view tenants"
ON public.tenants FOR SELECT
TO authenticated
USING (true);

CREATE POLICY "Authenticated users can create tenants"
ON public.tenants FOR INSERT
TO authenticated
WITH CHECK (true);

CREATE POLICY "Authenticated users can update tenants"
ON public.tenants FOR UPDATE
TO authenticated
USING (true);

CREATE POLICY "Authenticated users can delete tenants"
ON public.tenants FOR DELETE
TO authenticated
USING (true);

-- Create rent_periods table to track monthly rent per tenant
CREATE TABLE public.rent_periods (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  tenant_id UUID NOT NULL REFERENCES public.tenants(id) ON DELETE CASCADE,
  month INTEGER NOT NULL CHECK (month >= 1 AND month <= 12),
  year INTEGER NOT NULL CHECK (year >= 2020),
  rent_amount NUMERIC NOT NULL,
  amount_paid NUMERIC NOT NULL DEFAULT 0,
  balance NUMERIC GENERATED ALWAYS AS (rent_amount - amount_paid) STORED,
  status rent_status NOT NULL DEFAULT 'unpaid',
  due_date DATE NOT NULL,
  payment_reference TEXT UNIQUE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(tenant_id, month, year)
);

-- Enable RLS on rent_periods
ALTER TABLE public.rent_periods ENABLE ROW LEVEL SECURITY;

-- RLS policies for rent_periods
CREATE POLICY "Authenticated users can view rent periods"
ON public.rent_periods FOR SELECT
TO authenticated
USING (true);

CREATE POLICY "Authenticated users can create rent periods"
ON public.rent_periods FOR INSERT
TO authenticated
WITH CHECK (true);

CREATE POLICY "Authenticated users can update rent periods"
ON public.rent_periods FOR UPDATE
TO authenticated
USING (true);

-- Create rent_payments table to track individual payments
CREATE TABLE public.rent_payments (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  rent_period_id UUID NOT NULL REFERENCES public.rent_periods(id) ON DELETE CASCADE,
  tenant_id UUID NOT NULL REFERENCES public.tenants(id) ON DELETE CASCADE,
  amount NUMERIC NOT NULL CHECK (amount > 0),
  payment_method rent_payment_method NOT NULL,
  transaction_id TEXT UNIQUE,
  mpesa_receipt TEXT,
  phone_number TEXT,
  bank_reference TEXT,
  payment_date TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  verified BOOLEAN NOT NULL DEFAULT false,
  verified_at TIMESTAMP WITH TIME ZONE,
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS on rent_payments
ALTER TABLE public.rent_payments ENABLE ROW LEVEL SECURITY;

-- RLS policies for rent_payments
CREATE POLICY "Authenticated users can view rent payments"
ON public.rent_payments FOR SELECT
TO authenticated
USING (true);

CREATE POLICY "Authenticated users can create rent payments"
ON public.rent_payments FOR INSERT
TO authenticated
WITH CHECK (true);

CREATE POLICY "Authenticated users can update rent payments"
ON public.rent_payments FOR UPDATE
TO authenticated
USING (true);

-- Create mpesa_transactions table for STK Push tracking
CREATE TABLE public.mpesa_transactions (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  checkout_request_id TEXT UNIQUE NOT NULL,
  merchant_request_id TEXT,
  rent_period_id UUID REFERENCES public.rent_periods(id),
  tenant_id UUID REFERENCES public.tenants(id),
  phone_number TEXT NOT NULL,
  amount NUMERIC NOT NULL,
  account_reference TEXT,
  transaction_desc TEXT,
  status TEXT NOT NULL DEFAULT 'pending',
  result_code INTEGER,
  result_desc TEXT,
  mpesa_receipt_number TEXT,
  transaction_date TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS on mpesa_transactions
ALTER TABLE public.mpesa_transactions ENABLE ROW LEVEL SECURITY;

-- RLS policies for mpesa_transactions
CREATE POLICY "Authenticated users can view mpesa transactions"
ON public.mpesa_transactions FOR SELECT
TO authenticated
USING (true);

CREATE POLICY "Authenticated users can create mpesa transactions"
ON public.mpesa_transactions FOR INSERT
TO authenticated
WITH CHECK (true);

CREATE POLICY "Public can update mpesa transactions (for callback)"
ON public.mpesa_transactions FOR UPDATE
USING (true);

-- Function to update rent period status after payment
CREATE OR REPLACE FUNCTION public.update_rent_period_after_payment()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  total_paid NUMERIC;
  rent_amt NUMERIC;
  new_status rent_status;
BEGIN
  -- Get total payments for this rent period
  SELECT COALESCE(SUM(amount), 0) INTO total_paid
  FROM public.rent_payments
  WHERE rent_period_id = NEW.rent_period_id AND verified = true;
  
  -- Get rent amount
  SELECT rent_amount INTO rent_amt
  FROM public.rent_periods
  WHERE id = NEW.rent_period_id;
  
  -- Determine status
  IF total_paid >= rent_amt THEN
    new_status := 'paid';
  ELSIF total_paid > 0 THEN
    new_status := 'partial';
  ELSE
    new_status := 'unpaid';
  END IF;
  
  -- Update rent period
  UPDATE public.rent_periods
  SET 
    amount_paid = total_paid,
    status = new_status,
    updated_at = now()
  WHERE id = NEW.rent_period_id;
  
  RETURN NEW;
END;
$$;

-- Trigger to update rent period on payment insert/update
CREATE TRIGGER update_rent_period_on_payment
AFTER INSERT OR UPDATE ON public.rent_payments
FOR EACH ROW
EXECUTE FUNCTION public.update_rent_period_after_payment();

-- Function to mark overdue rent periods
CREATE OR REPLACE FUNCTION public.mark_overdue_rent_periods()
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  UPDATE public.rent_periods
  SET status = 'overdue', updated_at = now()
  WHERE status = 'unpaid'
    AND due_date < CURRENT_DATE;
END;
$$;

-- Function to generate unique payment reference
CREATE OR REPLACE FUNCTION public.generate_payment_reference()
RETURNS TEXT
LANGUAGE plpgsql
SET search_path = public
AS $$
DECLARE
  ref TEXT;
BEGIN
  ref := 'PAY' || TO_CHAR(CURRENT_DATE, 'YYMM') || LPAD((floor(random() * 10000)::int)::text, 4, '0');
  RETURN ref;
END;
$$;

-- Create updated_at trigger function if not exists
CREATE OR REPLACE FUNCTION public.set_updated_at()
RETURNS TRIGGER
LANGUAGE plpgsql
SET search_path = public
AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$;

-- Add updated_at triggers
CREATE TRIGGER set_tenants_updated_at
BEFORE UPDATE ON public.tenants
FOR EACH ROW
EXECUTE FUNCTION public.set_updated_at();

CREATE TRIGGER set_rent_periods_updated_at
BEFORE UPDATE ON public.rent_periods
FOR EACH ROW
EXECUTE FUNCTION public.set_updated_at();

CREATE TRIGGER set_mpesa_transactions_updated_at
BEFORE UPDATE ON public.mpesa_transactions
FOR EACH ROW
EXECUTE FUNCTION public.set_updated_at();

-- Create indexes for performance
CREATE INDEX idx_tenants_apartment ON public.tenants(apartment_id);
CREATE INDEX idx_rent_periods_tenant ON public.rent_periods(tenant_id);
CREATE INDEX idx_rent_periods_status ON public.rent_periods(status);
CREATE INDEX idx_rent_periods_month_year ON public.rent_periods(month, year);
CREATE INDEX idx_rent_payments_tenant ON public.rent_payments(tenant_id);
CREATE INDEX idx_rent_payments_period ON public.rent_payments(rent_period_id);
CREATE INDEX idx_mpesa_checkout ON public.mpesa_transactions(checkout_request_id);