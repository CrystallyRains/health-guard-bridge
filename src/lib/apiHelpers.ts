import { api } from "@/config/api";

export const fileToBase64 = (file: File): Promise<string> =>
  new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve((reader.result as string).split(",")[1]);
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });

export async function registerPatient(data: {
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
  emergencyContacts: { name: string; relation: string; phone: string }[];
  privacyToggles: { allergies: boolean; medications: boolean; conditions: boolean; surgeries: boolean };
}) {
  const res = await fetch(api.register, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({ message: "Registration failed" }));
    throw new Error(err.message || "Registration failed");
  }
  return res.json() as Promise<{ healthKeyId: string }>;
}

export async function uploadDocument(data: {
  healthKeyId: string;
  fileName: string;
  fileBase64: string;
  contentType: string;
}) {
  const res = await fetch(api.uploadDocument, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({ message: "Upload failed" }));
    throw new Error(err.message || "Upload failed");
  }
  return res.json();
}

export async function requestEmergencyAccess(data: {
  healthKeyId: string;
  doctorName: string;
  hospitalName: string;
  doctorLicense: string;
  purpose: string;
  preferredLang: string;
}) {
  const res = await fetch(api.emergencyAccess, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({ message: "Access request failed" }));
    throw new Error(err.message || "Access request failed");
  }
  return res.json() as Promise<{
    summary: {
      name: string;
      age: number;
      gender: string;
      blood: string;
      allergies: string[];
      medications: string[];
      conditions: string[];
      surgeries: { name: string; date: string }[];
      emergencyContacts: { name: string; relation: string; phone: string }[];
      privacyToggles?: { allergies: boolean; medications: boolean; conditions: boolean; surgeries: boolean };
      documents?: { id: string; name: string; date: string; lang: string; filePath?: string; fileType?: string }[];
    };
    sessionId: string;
    expiresAt: string;
  }>;
}

export async function fetchAuditLogs(healthKeyId: string) {
  const res = await fetch(api.auditLog(healthKeyId), {
    method: "GET",
    headers: { "Content-Type": "application/json" },
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({ message: "Failed to fetch audit logs" }));
    throw new Error(err.message || "Failed to fetch audit logs");
  }
  return res.json() as Promise<{
    logs: {
      time: string;
      doctor: string;
      hospital: string;
      purpose: string;
      duration: string;
      status: "Expired" | "Active" | "Pending";
    }[];
  }>;
}
