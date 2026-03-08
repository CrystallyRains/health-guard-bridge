
-- Create timestamp update function
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SET search_path = public;

-- Patients table
CREATE TABLE public.patients (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE UNIQUE,
  healthkey_id TEXT NOT NULL UNIQUE,
  name TEXT NOT NULL,
  age INTEGER NOT NULL,
  gender TEXT NOT NULL,
  phone TEXT NOT NULL,
  email TEXT NOT NULL,
  blood TEXT NOT NULL,
  state TEXT NOT NULL,
  allergies TEXT[] DEFAULT '{}',
  medications TEXT[] DEFAULT '{}',
  conditions TEXT[] DEFAULT '{}',
  surgeries JSONB DEFAULT '[]',
  emergency_contacts JSONB DEFAULT '[]',
  privacy_toggles JSONB DEFAULT '{"allergies": true, "medications": true, "conditions": true, "surgeries": true}',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

ALTER TABLE public.patients ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own patient record"
  ON public.patients FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own patient record"
  ON public.patients FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own patient record"
  ON public.patients FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own patient record"
  ON public.patients FOR DELETE USING (auth.uid() = user_id);

-- Allow clinicians to read patient by healthkey_id (authenticated users)
CREATE POLICY "Authenticated users can read patients by healthkey_id"
  ON public.patients FOR SELECT TO authenticated USING (true);

CREATE TRIGGER update_patients_updated_at
  BEFORE UPDATE ON public.patients
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- Documents table
CREATE TABLE public.documents (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  patient_id UUID NOT NULL REFERENCES public.patients(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  upload_date TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'Processed',
  lang TEXT NOT NULL DEFAULT 'English',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

ALTER TABLE public.documents ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own documents"
  ON public.documents FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own documents"
  ON public.documents FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own documents"
  ON public.documents FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own documents"
  ON public.documents FOR DELETE USING (auth.uid() = user_id);

CREATE TRIGGER update_documents_updated_at
  BEFORE UPDATE ON public.documents
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- Audit logs table
CREATE TABLE public.audit_logs (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  patient_id UUID NOT NULL REFERENCES public.patients(id) ON DELETE CASCADE,
  doctor_name TEXT NOT NULL,
  hospital TEXT NOT NULL,
  purpose TEXT NOT NULL,
  duration TEXT NOT NULL DEFAULT '30 min',
  status TEXT NOT NULL DEFAULT 'Active',
  accessed_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  expires_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT (now() + interval '30 minutes')
);

ALTER TABLE public.audit_logs ENABLE ROW LEVEL SECURITY;

-- Patients can see their own audit logs
CREATE POLICY "Patients can view their audit logs"
  ON public.audit_logs FOR SELECT USING (
    EXISTS (SELECT 1 FROM public.patients WHERE patients.id = audit_logs.patient_id AND patients.user_id = auth.uid())
  );

-- Authenticated users can create audit logs (clinicians)
CREATE POLICY "Authenticated users can insert audit logs"
  ON public.audit_logs FOR INSERT TO authenticated WITH CHECK (true);

-- Create indexes
CREATE INDEX idx_patients_healthkey_id ON public.patients(healthkey_id);
CREATE INDEX idx_patients_user_id ON public.patients(user_id);
CREATE INDEX idx_documents_patient_id ON public.documents(patient_id);
CREATE INDEX idx_audit_logs_patient_id ON public.audit_logs(patient_id);
