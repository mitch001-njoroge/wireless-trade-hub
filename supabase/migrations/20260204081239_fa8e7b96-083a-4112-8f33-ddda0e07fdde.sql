-- Create invoice status enum
CREATE TYPE public.invoice_status AS ENUM ('draft', 'pending', 'paid', 'overdue', 'cancelled');

-- Create charge type enum
CREATE TYPE public.charge_type AS ENUM ('rent', 'water', 'electricity', 'garbage', 'security', 'parking', 'other');

-- Create payment method enum
CREATE TYPE public.payment_method AS ENUM ('mpesa', 'bank_transfer', 'cash', 'card');

-- Create invoices table
CREATE TABLE public.invoices (
    id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
    invoice_number TEXT NOT NULL UNIQUE,
    tenant_id TEXT NOT NULL,
    apartment_id TEXT NOT NULL,
    tenant_name TEXT NOT NULL,
    tenant_phone TEXT NOT NULL,
    unit_number TEXT NOT NULL,
    apartment_name TEXT NOT NULL,
    issue_date DATE NOT NULL DEFAULT CURRENT_DATE,
    due_date DATE NOT NULL,
    subtotal NUMERIC(12,2) NOT NULL DEFAULT 0,
    total_amount NUMERIC(12,2) NOT NULL DEFAULT 0,
    amount_paid NUMERIC(12,2) NOT NULL DEFAULT 0,
    balance NUMERIC(12,2) NOT NULL DEFAULT 0,
    status invoice_status NOT NULL DEFAULT 'pending',
    notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create invoice items table
CREATE TABLE public.invoice_items (
    id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
    invoice_id UUID NOT NULL REFERENCES public.invoices(id) ON DELETE CASCADE,
    charge_type charge_type NOT NULL,
    description TEXT NOT NULL,
    quantity NUMERIC(10,2) NOT NULL DEFAULT 1,
    unit_price NUMERIC(12,2) NOT NULL,
    amount NUMERIC(12,2) NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create billing_payments table for payment records
CREATE TABLE public.billing_payments (
    id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
    invoice_id UUID NOT NULL REFERENCES public.invoices(id) ON DELETE CASCADE,
    amount NUMERIC(12,2) NOT NULL,
    payment_method payment_method NOT NULL,
    transaction_id TEXT,
    mpesa_receipt TEXT,
    phone_number TEXT,
    payment_date TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create recurring billing settings table
CREATE TABLE public.recurring_billing (
    id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
    tenant_id TEXT NOT NULL,
    apartment_id TEXT NOT NULL,
    is_active BOOLEAN NOT NULL DEFAULT true,
    billing_day INTEGER NOT NULL DEFAULT 1 CHECK (billing_day >= 1 AND billing_day <= 28),
    due_day INTEGER NOT NULL DEFAULT 5 CHECK (due_day >= 1 AND due_day <= 28),
    items JSONB NOT NULL DEFAULT '[]'::jsonb,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    UNIQUE(tenant_id, apartment_id)
);

-- Enable Row Level Security
ALTER TABLE public.invoices ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.invoice_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.billing_payments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.recurring_billing ENABLE ROW LEVEL SECURITY;

-- Create policies for authenticated users
CREATE POLICY "Authenticated users can view invoices" 
ON public.invoices FOR SELECT 
TO authenticated
USING (true);

CREATE POLICY "Authenticated users can create invoices" 
ON public.invoices FOR INSERT 
TO authenticated
WITH CHECK (true);

CREATE POLICY "Authenticated users can update invoices" 
ON public.invoices FOR UPDATE 
TO authenticated
USING (true);

CREATE POLICY "Authenticated users can delete invoices" 
ON public.invoices FOR DELETE 
TO authenticated
USING (true);

CREATE POLICY "Authenticated users can view invoice items" 
ON public.invoice_items FOR SELECT 
TO authenticated
USING (true);

CREATE POLICY "Authenticated users can create invoice items" 
ON public.invoice_items FOR INSERT 
TO authenticated
WITH CHECK (true);

CREATE POLICY "Authenticated users can update invoice items" 
ON public.invoice_items FOR UPDATE 
TO authenticated
USING (true);

CREATE POLICY "Authenticated users can delete invoice items" 
ON public.invoice_items FOR DELETE 
TO authenticated
USING (true);

CREATE POLICY "Authenticated users can view billing payments" 
ON public.billing_payments FOR SELECT 
TO authenticated
USING (true);

CREATE POLICY "Authenticated users can create billing payments" 
ON public.billing_payments FOR INSERT 
TO authenticated
WITH CHECK (true);

CREATE POLICY "Authenticated users can view recurring billing" 
ON public.recurring_billing FOR SELECT 
TO authenticated
USING (true);

CREATE POLICY "Authenticated users can manage recurring billing" 
ON public.recurring_billing FOR ALL 
TO authenticated
USING (true);

-- Create function to generate invoice number
CREATE OR REPLACE FUNCTION public.generate_invoice_number()
RETURNS TEXT
LANGUAGE plpgsql
SET search_path = public
AS $$
DECLARE
    new_number TEXT;
    year_month TEXT;
    seq_num INTEGER;
BEGIN
    year_month := TO_CHAR(CURRENT_DATE, 'YYMM');
    SELECT COALESCE(MAX(CAST(SUBSTRING(invoice_number FROM 8) AS INTEGER)), 0) + 1
    INTO seq_num
    FROM public.invoices
    WHERE invoice_number LIKE 'INV' || year_month || '%';
    
    new_number := 'INV' || year_month || LPAD(seq_num::TEXT, 4, '0');
    RETURN new_number;
END;
$$;

-- Create function to update invoice totals
CREATE OR REPLACE FUNCTION public.update_invoice_totals()
RETURNS TRIGGER
LANGUAGE plpgsql
SET search_path = public
AS $$
BEGIN
    UPDATE public.invoices
    SET 
        subtotal = (SELECT COALESCE(SUM(amount), 0) FROM public.invoice_items WHERE invoice_id = COALESCE(NEW.invoice_id, OLD.invoice_id)),
        total_amount = (SELECT COALESCE(SUM(amount), 0) FROM public.invoice_items WHERE invoice_id = COALESCE(NEW.invoice_id, OLD.invoice_id)),
        balance = total_amount - amount_paid,
        updated_at = now()
    WHERE id = COALESCE(NEW.invoice_id, OLD.invoice_id);
    
    RETURN COALESCE(NEW, OLD);
END;
$$;

-- Create trigger for invoice items
CREATE TRIGGER update_invoice_totals_trigger
AFTER INSERT OR UPDATE OR DELETE ON public.invoice_items
FOR EACH ROW
EXECUTE FUNCTION public.update_invoice_totals();

-- Create function to update invoice balance after payment
CREATE OR REPLACE FUNCTION public.update_invoice_after_payment()
RETURNS TRIGGER
LANGUAGE plpgsql
SET search_path = public
AS $$
BEGIN
    UPDATE public.invoices
    SET 
        amount_paid = (SELECT COALESCE(SUM(amount), 0) FROM public.billing_payments WHERE invoice_id = NEW.invoice_id),
        balance = total_amount - (SELECT COALESCE(SUM(amount), 0) FROM public.billing_payments WHERE invoice_id = NEW.invoice_id),
        status = CASE 
            WHEN total_amount <= (SELECT COALESCE(SUM(amount), 0) FROM public.billing_payments WHERE invoice_id = NEW.invoice_id) THEN 'paid'::invoice_status
            WHEN (SELECT COALESCE(SUM(amount), 0) FROM public.billing_payments WHERE invoice_id = NEW.invoice_id) > 0 THEN 'pending'::invoice_status
            ELSE status
        END,
        updated_at = now()
    WHERE id = NEW.invoice_id;
    
    RETURN NEW;
END;
$$;

-- Create trigger for payments
CREATE TRIGGER update_invoice_after_payment_trigger
AFTER INSERT ON public.billing_payments
FOR EACH ROW
EXECUTE FUNCTION public.update_invoice_after_payment();

-- Create updated_at trigger function if not exists
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER
LANGUAGE plpgsql
SET search_path = public
AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$;

-- Create triggers for updated_at
CREATE TRIGGER update_invoices_updated_at
BEFORE UPDATE ON public.invoices
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_recurring_billing_updated_at
BEFORE UPDATE ON public.recurring_billing
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- Create indexes for performance
CREATE INDEX idx_invoices_tenant_id ON public.invoices(tenant_id);
CREATE INDEX idx_invoices_status ON public.invoices(status);
CREATE INDEX idx_invoices_due_date ON public.invoices(due_date);
CREATE INDEX idx_invoice_items_invoice_id ON public.invoice_items(invoice_id);
CREATE INDEX idx_billing_payments_invoice_id ON public.billing_payments(invoice_id);