-- Allow admin operations on voters table
CREATE POLICY "Admins can insert voters" 
ON public.voters 
FOR INSERT 
WITH CHECK (public.is_current_user_admin());

CREATE POLICY "Admins can delete voters" 
ON public.voters 
FOR DELETE 
USING (public.is_current_user_admin());

-- Drop the restrictive admin_users policy and create more permissive ones for admins
DROP POLICY IF EXISTS "Deny all admin users access" ON public.admin_users;

CREATE POLICY "Admins can view admin users" 
ON public.admin_users 
FOR SELECT 
USING (public.is_current_user_admin());

CREATE POLICY "Admins can insert admin users" 
ON public.admin_users 
FOR INSERT 
WITH CHECK (public.is_current_user_admin());

CREATE POLICY "Admins can update admin users" 
ON public.admin_users 
FOR UPDATE 
USING (public.is_current_user_admin());

CREATE POLICY "Admins can delete admin users" 
ON public.admin_users 
FOR DELETE 
USING (public.is_current_user_admin());