
-- Fix: Change the healthkey_id SELECT policy from RESTRICTIVE to PERMISSIVE
DROP POLICY IF EXISTS "Authenticated users can read patients by healthkey_id" ON public.patients;
CREATE POLICY "Authenticated users can read patients by healthkey_id"
  ON public.patients FOR SELECT
  TO authenticated
  USING (true);

-- Also allow anon to read by healthkey_id (clinician portal may not be logged in)
CREATE POLICY "Anon can read patients by healthkey_id"
  ON public.patients FOR SELECT
  TO anon
  USING (true);

-- Fix documents: allow authenticated users to read any documents (for clinician access)
CREATE POLICY "Authenticated users can read documents"
  ON public.documents FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Anon can read documents for clinician access"
  ON public.documents FOR SELECT
  TO anon
  USING (true);
