import { supabase } from "@/integrations/supabase/client";

export interface PatientRecord {
  id: string;
  user_id: string;
  healthkey_id: string;
  name: string;
  age: number;
  gender: string;
  phone: string;
  email: string;
  blood: string;
  state: string;
  allergies: string[];
  medications: string[];
  conditions: string[];
  surgeries: { name: string; date: string }[];
  emergency_contacts: { name: string; relation: string; phone: string }[];
  privacy_toggles: { allergies: boolean; medications: boolean; conditions: boolean; surgeries: boolean };
  created_at: string;
  updated_at: string;
}

export interface DocumentRecord {
  id: string;
  patient_id: string;
  user_id: string;
  name: string;
  upload_date: string;
  status: string;
  lang: string;
  created_at: string;
  updated_at: string;
}

export interface AuditLogRecord {
  id: string;
  patient_id: string;
  doctor_name: string;
  hospital: string;
  purpose: string;
  duration: string;
  status: string;
  accessed_at: string;
  expires_at: string;
}

export function generateHealthKeyId() {
  const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";
  const nums = "0123456789";
  const r = (s: string, n: number) => Array.from({ length: n }, () => s[Math.floor(Math.random() * s.length)]).join("");
  return `HK-${r(nums, 4)}-${r(chars, 4)}`;
}

// Patient CRUD
export async function createPatient(userId: string, data: Omit<PatientRecord, "id" | "user_id" | "created_at" | "updated_at">) {
  const { data: patient, error } = await supabase
    .from("patients")
    .insert({ ...data, user_id: userId })
    .select()
    .single();
  return { patient, error };
}

export async function getPatientByUserId(userId: string) {
  const { data, error } = await supabase
    .from("patients")
    .select("*")
    .eq("user_id", userId)
    .single();
  return { patient: data as PatientRecord | null, error };
}

export async function getPatientByHealthKeyId(healthkeyId: string) {
  const { data, error } = await supabase
    .from("patients")
    .select("*")
    .eq("healthkey_id", healthkeyId)
    .single();
  return { patient: data as PatientRecord | null, error };
}

export async function updatePatient(patientId: string, updates: Partial<PatientRecord>) {
  const { data, error } = await supabase
    .from("patients")
    .update(updates)
    .eq("id", patientId)
    .select()
    .single();
  return { patient: data as PatientRecord | null, error };
}

export async function deletePatient(patientId: string) {
  const { error } = await supabase
    .from("patients")
    .delete()
    .eq("id", patientId);
  return { error };
}

// Documents CRUD
export async function getDocuments(patientId: string) {
  const { data, error } = await supabase
    .from("documents")
    .select("*")
    .eq("patient_id", patientId)
    .order("created_at", { ascending: false });
  return { documents: (data ?? []) as DocumentRecord[], error };
}

export async function createDocument(doc: Omit<DocumentRecord, "id" | "created_at" | "updated_at">) {
  const { data, error } = await supabase
    .from("documents")
    .insert(doc)
    .select()
    .single();
  return { document: data as DocumentRecord | null, error };
}

export async function updateDocument(docId: string, updates: Partial<DocumentRecord>) {
  const { data, error } = await supabase
    .from("documents")
    .update(updates)
    .eq("id", docId)
    .select()
    .single();
  return { document: data as DocumentRecord | null, error };
}

export async function deleteDocument(docId: string) {
  const { error } = await supabase
    .from("documents")
    .delete()
    .eq("id", docId);
  return { error };
}

// Audit Logs
export async function getAuditLogs(patientId: string) {
  const { data, error } = await supabase
    .from("audit_logs")
    .select("*")
    .eq("patient_id", patientId)
    .order("accessed_at", { ascending: false });
  return { logs: (data ?? []) as AuditLogRecord[], error };
}

export async function createAuditLog(log: Omit<AuditLogRecord, "id" | "accessed_at" | "expires_at">) {
  const { data, error } = await supabase
    .from("audit_logs")
    .insert(log)
    .select()
    .single();
  return { log: data as AuditLogRecord | null, error };
}
