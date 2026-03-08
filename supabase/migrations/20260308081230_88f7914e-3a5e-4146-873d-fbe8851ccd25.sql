
-- Create storage bucket for patient documents
INSERT INTO storage.buckets (id, name, public) VALUES ('patient-documents', 'patient-documents', false);

-- Users can upload to their own folder
CREATE POLICY "Users can upload their own documents"
  ON storage.objects FOR INSERT
  WITH CHECK (bucket_id = 'patient-documents' AND auth.uid()::text = (storage.foldername(name))[1]);

-- Users can view their own documents
CREATE POLICY "Users can view their own documents"
  ON storage.objects FOR SELECT
  USING (bucket_id = 'patient-documents' AND auth.uid()::text = (storage.foldername(name))[1]);

-- Users can delete their own documents
CREATE POLICY "Users can delete their own documents"
  ON storage.objects FOR DELETE
  USING (bucket_id = 'patient-documents' AND auth.uid()::text = (storage.foldername(name))[1]);

-- Authenticated users can view documents (for clinician access)
CREATE POLICY "Authenticated users can view patient documents"
  ON storage.objects FOR SELECT TO authenticated
  USING (bucket_id = 'patient-documents');

-- Add file_path column to documents table to link to storage
ALTER TABLE public.documents ADD COLUMN file_path TEXT;
ALTER TABLE public.documents ADD COLUMN file_type TEXT;
ALTER TABLE public.documents ADD COLUMN file_size BIGINT;
