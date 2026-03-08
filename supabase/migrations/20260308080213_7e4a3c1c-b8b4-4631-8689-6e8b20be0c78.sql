
-- Drop overly permissive insert policy on audit_logs
DROP POLICY "Authenticated users can insert audit logs" ON public.audit_logs;

-- Create a more restrictive policy - only allow inserts where the patient exists
CREATE POLICY "Authenticated users can insert audit logs for existing patients"
  ON public.audit_logs FOR INSERT TO authenticated
  WITH CHECK (
    EXISTS (SELECT 1 FROM public.patients WHERE patients.id = patient_id)
  );
