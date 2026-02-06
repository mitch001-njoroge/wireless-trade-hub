-- Create role enum for users
CREATE TYPE public.app_role AS ENUM ('admin', 'tenant');

-- Create user roles table
CREATE TABLE public.user_roles (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
    role app_role NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    UNIQUE (user_id, role)
);

-- Enable RLS on user_roles
ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;

-- Create security definer function to check roles
CREATE OR REPLACE FUNCTION public.has_role(_user_id UUID, _role app_role)
RETURNS BOOLEAN
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.user_roles
    WHERE user_id = _user_id
      AND role = _role
  )
$$;

-- Policy: users can read their own roles
CREATE POLICY "Users can view own roles"
ON public.user_roles
FOR SELECT
TO authenticated
USING (auth.uid() = user_id);

-- Policy: admins can manage all roles
CREATE POLICY "Admins can manage all roles"
ON public.user_roles
FOR ALL
TO authenticated
USING (public.has_role(auth.uid(), 'admin'));

-- Add user_id column to tenants table to link tenant records to auth accounts
ALTER TABLE public.tenants 
ADD COLUMN user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL UNIQUE;

-- Update tenants RLS policies to allow tenants to view their own data
CREATE POLICY "Tenants can view own data"
ON public.tenants
FOR SELECT
TO authenticated
USING (auth.uid() = user_id OR public.has_role(auth.uid(), 'admin'));

-- Allow tenants to view their own rent periods
DROP POLICY IF EXISTS "Authenticated users can view rent periods" ON public.rent_periods;
CREATE POLICY "Users can view relevant rent periods"
ON public.rent_periods
FOR SELECT
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM public.tenants 
    WHERE tenants.id = rent_periods.tenant_id 
    AND (tenants.user_id = auth.uid() OR public.has_role(auth.uid(), 'admin'))
  )
);

-- Allow tenants to view their own rent payments
DROP POLICY IF EXISTS "Authenticated users can view rent payments" ON public.rent_payments;
CREATE POLICY "Users can view relevant rent payments"
ON public.rent_payments
FOR SELECT
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM public.tenants 
    WHERE tenants.id = rent_payments.tenant_id 
    AND (tenants.user_id = auth.uid() OR public.has_role(auth.uid(), 'admin'))
  )
);

-- Allow tenants to create their own payments
DROP POLICY IF EXISTS "Authenticated users can create rent payments" ON public.rent_payments;
CREATE POLICY "Users can create relevant rent payments"
ON public.rent_payments
FOR INSERT
TO authenticated
WITH CHECK (
  EXISTS (
    SELECT 1 FROM public.tenants 
    WHERE tenants.id = rent_payments.tenant_id 
    AND (tenants.user_id = auth.uid() OR public.has_role(auth.uid(), 'admin'))
  )
);

-- Enable realtime for rent_periods table for instant status sync
ALTER PUBLICATION supabase_realtime ADD TABLE public.rent_periods;
ALTER PUBLICATION supabase_realtime ADD TABLE public.rent_payments;

-- Make the existing user an admin (first user is admin by default)
INSERT INTO public.user_roles (user_id, role)
SELECT id, 'admin'::app_role FROM auth.users
ON CONFLICT (user_id, role) DO NOTHING;