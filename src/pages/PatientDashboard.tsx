import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { getPatientByUserId, getDocuments, updatePatient, createDocument, updateDocument, deleteDocument, deletePatient } from "@/lib/api";
import type { PatientRecord, DocumentRecord } from "@/lib/api";
import { fetchAuditLogs, fileToBase64, uploadDocument } from "@/lib/apiHelpers";
import { KeyRound, LogOut, Heart, FileText, Search, Settings } from "lucide-react";
import ProfileTab from "@/components/dashboard/ProfileTab";
import DocumentsTab from "@/components/dashboard/DocumentsTab";
import AccessLogTab from "@/components/dashboard/AccessLogTab";
import SettingsTab from "@/components/dashboard/SettingsTab";
import { toast } from "sonner";

type Tab = "profile" | "documents" | "access" | "settings";

interface AuditLogEntry {
  time: string;
  doctor: string;
  hospital: string;
  purpose: string;
  duration: string;
  status: "Expired" | "Active" | "Pending";
}

export default function PatientDashboard() {
  const navigate = useNavigate();
  const { user, signOut } = useAuth();
  const [tab, setTab] = useState<Tab>("profile");
  const [patient, setPatient] = useState<PatientRecord | null>(null);
  const [documents, setDocuments] = useState<DocumentRecord[]>([]);
  const [auditLogs, setAuditLogs] = useState<AuditLogEntry[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) return;
    loadData();
  }, [user]);

  const loadData = async () => {
    if (!user) return;
    setLoading(true);
    const { patient: p } = await getPatientByUserId(user.id);
    if (p) {
      setPatient(p);
      const [docsResult] = await Promise.all([
        getDocuments(p.id),
      ]);
      setDocuments(docsResult.documents);

      // Fetch audit logs from AWS API
      try {
        const { logs } = await fetchAuditLogs(p.healthkey_id);
        setAuditLogs(logs);
      } catch (err) {
        console.error("Failed to fetch audit logs from API:", err);
        setAuditLogs([]);
      }
    }
    setLoading(false);
  };

  const handleUpdatePatient = async (updates: Partial<PatientRecord>) => {
    if (!patient) return;
    const { patient: updated, error } = await updatePatient(patient.id, updates);
    if (error) {
      toast.error("Failed to update: " + error.message);
      return;
    }
    if (updated) setPatient(updated);
  };

  const handleAddDocument = async (name: string, file?: File) => {
    if (!patient || !user) return;

    let filePath: string | null = null;
    let fileType: string | null = null;
    let fileSize: number | null = null;

    // Upload to AWS API if file provided
    if (file) {
      try {
        const base64 = await fileToBase64(file);
        const result = await uploadDocument({
          healthKeyId: patient.healthkey_id,
          fileName: file.name,
          fileBase64: base64,
          contentType: file.type,
        });
        // Also upload to storage for preview
        const path = `${user.id}/${Date.now()}-${file.name}`;
        const { error: uploadError } = await supabase.storage.from("patient-documents").upload(path, file);
        if (!uploadError) {
          filePath = path;
          fileType = file.type;
          fileSize = file.size;
        }
        toast.success(result.message || "Document uploaded and processed");
      } catch (err: any) {
        toast.error(err.message || "Failed to upload document");
        return;
      }
    }

    const { document: doc, error } = await createDocument({
      patient_id: patient.id,
      user_id: user.id,
      name,
      upload_date: new Date().toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" }),
      status: "Processed",
      lang: "English",
      file_path: filePath,
      file_type: fileType,
      file_size: fileSize,
    });
    if (error) {
      toast.error("Failed to add document");
      return;
    }
    if (doc) setDocuments(prev => [doc, ...prev]);
  };

  const handleUpdateDocument = async (docId: string, updates: Partial<DocumentRecord>) => {
    const { document: doc, error } = await updateDocument(docId, updates);
    if (error) {
      toast.error("Failed to update document");
      return;
    }
    if (doc) setDocuments(prev => prev.map(d => d.id === docId ? doc : d));
  };

  const handleDeleteDocument = async (docId: string) => {
    const { error } = await deleteDocument(docId);
    if (error) {
      toast.error("Failed to delete document");
      return;
    }
    setDocuments(prev => prev.filter(d => d.id !== docId));
  };

  const handleDeleteAccount = async () => {
    if (!patient) return;
    await deletePatient(patient.id);
    await signOut();
    toast.success("Account deleted");
    navigate("/");
  };

  const handleLogout = async () => {
    await signOut();
    navigate("/");
  };

  const tabs: { key: Tab; icon: typeof Heart; label: string }[] = [
    { key: "profile", icon: Heart, label: "Health Profile" },
    { key: "documents", icon: FileText, label: "My Documents" },
    { key: "access", icon: Search, label: "Access Log" },
    { key: "settings", icon: Settings, label: "Settings" },
  ];

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center space-y-4">
          <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin mx-auto" />
          <p className="text-muted-foreground text-sm">Loading your records...</p>
        </div>
      </div>
    );
  }

  if (!patient) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center space-y-4 glass-card p-8">
          <p className="text-muted-foreground">No patient profile found.</p>
          <button onClick={() => navigate("/register")} className="btn-primary">Complete Registration</button>
        </div>
      </div>
    );
  }

  // Convert DB format to component format
  const patientForProfile = {
    id: patient.healthkey_id,
    name: patient.name,
    age: patient.age,
    gender: patient.gender,
    phone: patient.phone,
    email: patient.email,
    blood: patient.blood,
    state: patient.state,
    allergies: patient.allergies || [],
    medications: patient.medications || [],
    conditions: patient.conditions || [],
    surgeries: (patient.surgeries as { name: string; date: string }[]) || [],
    emergencyContacts: (patient.emergency_contacts as { name: string; relation: string; phone: string }[]) || [],
    privacyToggles: (patient.privacy_toggles as { allergies: boolean; medications: boolean; conditions: boolean; surgeries: boolean }) || { allergies: true, medications: true, conditions: true, surgeries: true },
  };

  const docsForTab = documents.map(d => ({
    id: d.id,
    name: d.name,
    date: d.upload_date,
    status: d.status as "Processed" | "Processing" | "Failed",
    lang: d.lang,
    filePath: d.file_path,
    fileType: d.file_type,
  }));

  return (
    <div className="min-h-screen flex flex-col">
      <nav className="fixed top-0 left-0 right-0 z-50 glass-card border-b border-border/50 h-16 flex items-center justify-between px-4 sm:px-8">
        <div className="flex items-center gap-2">
          <KeyRound className="h-5 w-5 text-primary" />
          <span className="font-heading font-bold">Health<span className="text-primary">Key</span></span>
        </div>
        <div className="flex items-center gap-4">
          <span className="text-sm text-muted-foreground hidden sm:block">{patient.name}</span>
          <button onClick={handleLogout} className="text-muted-foreground hover:text-destructive transition-colors">
            <LogOut className="h-5 w-5" />
          </button>
        </div>
      </nav>

      <div className="flex flex-1 pt-16">
        <aside className="hidden md:flex flex-col w-60 border-r border-border bg-card/50 p-4 gap-1">
          {tabs.map(t => (
            <button
              key={t.key}
              onClick={() => setTab(t.key)}
              className={`flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium transition-colors text-left ${
                tab === t.key ? "bg-primary/10 text-primary" : "text-muted-foreground hover:text-foreground hover:bg-secondary"
              }`}
            >
              <t.icon className="h-4 w-4" /> {t.label}
            </button>
          ))}
        </aside>

        <div className="md:hidden fixed bottom-0 left-0 right-0 z-50 glass-card border-t border-border/50 flex">
          {tabs.map(t => (
            <button
              key={t.key}
              onClick={() => setTab(t.key)}
              className={`flex-1 flex flex-col items-center gap-1 py-3 text-xs transition-colors ${
                tab === t.key ? "text-primary" : "text-muted-foreground"
              }`}
            >
              <t.icon className="h-4 w-4" /> {t.label}
            </button>
          ))}
        </div>

        <main className="flex-1 p-4 sm:p-8 pb-24 md:pb-8 overflow-auto">
          {tab === "profile" && (
            <ProfileTab
              patient={patientForProfile}
              onUpdate={(updated) => {
                handleUpdatePatient({
                  name: updated.name,
                  age: updated.age,
                  gender: updated.gender,
                  blood: updated.blood,
                  state: updated.state,
                  allergies: updated.allergies,
                  medications: updated.medications,
                  conditions: updated.conditions,
                  surgeries: updated.surgeries as any,
                  emergency_contacts: updated.emergencyContacts as any,
                  privacy_toggles: updated.privacyToggles as any,
                });
              }}
            />
          )}
          {tab === "documents" && (
            <DocumentsTab
              documents={docsForTab}
              onAdd={handleAddDocument}
              onUpdate={(docId, updates) => { handleUpdateDocument(docId, updates); }}
              onDelete={handleDeleteDocument}
            />
          )}
          {tab === "access" && (
            <AccessLogTab auditLog={auditLogs} patient={patientForProfile} />
          )}
          {tab === "settings" && (
            <SettingsTab
              patient={patientForProfile}
              onUpdate={(updates) => {
                const dbUpdates: Partial<PatientRecord> = {};
                if (updates.phone) dbUpdates.phone = updates.phone;
                if (updates.email) dbUpdates.email = updates.email;
                if (updates.emergencyContacts) dbUpdates.emergency_contacts = updates.emergencyContacts as any;
                handleUpdatePatient(dbUpdates);
              }}
              onDelete={handleDeleteAccount}
            />
          )}
        </main>
      </div>
    </div>
  );
}
