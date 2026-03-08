import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { fetchAuditLogs, uploadDocument, fileToBase64 } from "@/lib/apiHelpers";
import { KeyRound, LogOut, Heart, FileText, Search, Settings } from "lucide-react";
import ProfileTab from "@/components/dashboard/ProfileTab";
import DocumentsTab from "@/components/dashboard/DocumentsTab";
import AccessLogTab from "@/components/dashboard/AccessLogTab";
import SettingsTab from "@/components/dashboard/SettingsTab";
import { toast } from "sonner";

type Tab = "profile" | "documents" | "access" | "settings";

export default function PatientDashboard() {
  const navigate = useNavigate();
  const [tab, setTab] = useState<Tab>("profile");
  const [patient, setPatient] = useState<any>(null);
  const [documents, setDocuments] = useState<any[]>([]);
  const [auditLogs, setAuditLogs] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [auditLoading, setAuditLoading] = useState(false);

  useEffect(() => {
    const stored = localStorage.getItem("healthkey_patient");
    if (!stored) {
      navigate("/patient-login", { replace: true });
      return;
    }
    try {
      const parsed = JSON.parse(stored);
      setPatient(parsed);
      setDocuments(parsed.documents || []);
    } catch {
      navigate("/patient-login", { replace: true });
      return;
    }
    setLoading(false);
  }, [navigate]);

  // Load audit logs when tab switches to access
  useEffect(() => {
    if (tab !== "access" || !patient) return;
    const healthKeyId = localStorage.getItem("healthkey_patient_id");
    if (!healthKeyId) return;

    setAuditLoading(true);
    fetchAuditLogs(healthKeyId)
      .then(({ logs }) => setAuditLogs(logs || []))
      .catch((err) => {
        console.error("Failed to fetch audit logs:", err);
        setAuditLogs([]);
      })
      .finally(() => setAuditLoading(false));
  }, [tab, patient]);

  const handleAddDocument = async (name: string, file?: File) => {
    if (!patient || !file) return;
    const healthKeyId = localStorage.getItem("healthkey_patient_id");
    if (!healthKeyId) return;

    try {
      console.log("[Upload] Starting upload:", file.name, "size:", file.size, "type:", file.type);
      const base64 = await fileToBase64(file);
      console.log("[Upload] Base64 length:", base64.length);
      const result = await uploadDocument({
        healthKeyId,
        fileName: file.name,
        fileBase64: base64,
        contentType: file.type,
      });
      console.log("[Upload] API response:", result);

      const newDoc = {
        docId: result.docId,
        fileName: result.fileName,
        uploadedAt: result.uploadedAt,
        detectedLang: result.detectedLang,
      };

      const updatedDocs = [newDoc, ...documents];
      setDocuments(updatedDocs);

      // Persist to localStorage
      const updatedPatient = { ...patient, documents: updatedDocs };
      setPatient(updatedPatient);
      localStorage.setItem("healthkey_patient", JSON.stringify(updatedPatient));

      toast.success(result.message || "Document processed successfully");
    } catch (err: any) {
      console.error("[Upload] Error:", err);
      toast.error(err.message || "Failed to upload document");
      throw err; // Re-throw so DocumentsTab animation handles it
    }
  };

  const handleUpdateDocument = async (docId: string, updates: { name?: string }) => {
    setDocuments((prev) =>
      prev.map((d) => (d.docId === docId ? { ...d, ...updates } : d))
    );
    toast.success("Document updated");
  };

  const handleDeleteDocument = async (docId: string) => {
    const updatedDocs = documents.filter((d) => d.docId !== docId);
    setDocuments(updatedDocs);
    const updatedPatient = { ...patient, documents: updatedDocs };
    setPatient(updatedPatient);
    localStorage.setItem("healthkey_patient", JSON.stringify(updatedPatient));
    toast.success("Document removed");
  };

  const handleLogout = () => {
    localStorage.removeItem("healthkey_patient");
    localStorage.removeItem("healthkey_patient_id");
    navigate("/");
  };

  const handleDeleteAccount = () => {
    localStorage.removeItem("healthkey_patient");
    localStorage.removeItem("healthkey_patient_id");
    toast.success("Account data cleared");
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

  // Map AWS data to component format
  const patientForProfile = {
    id: patient.healthKeyId || patient.healthkey_id || "",
    name: patient.name || "",
    age: patient.age || 0,
    gender: patient.gender || "",
    phone: patient.phone || "",
    email: patient.email || "",
    blood: patient.blood || patient.bloodGroup || "",
    state: patient.state || "",
    allergies: patient.allergies || [],
    medications: patient.medications || [],
    conditions: patient.conditions || [],
    surgeries: patient.surgeries || [],
    emergencyContacts: patient.emergencyContacts || [],
    privacyToggles: patient.privacyToggles || { allergies: true, medications: true, conditions: true, surgeries: true },
  };

  const docsForTab = documents.map((d: any) => ({
    id: d.docId || d.id || Math.random().toString(),
    name: d.fileName || d.name || "Untitled",
    date: d.uploadedAt
      ? new Date(d.uploadedAt).toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" })
      : d.date || "",
    status: "Processed" as const,
    lang: d.detectedLang || d.lang || "English",
    filePath: d.filePath || null,
    fileType: d.fileType || null,
  }));

  const auditForTab = auditLogs.map((log: any) => ({
    time: log.accessedAt
      ? new Date(log.accessedAt).toLocaleString("en-IN")
      : log.time || "",
    doctor: log.doctorName || log.doctor || "",
    hospital: log.hospitalName || log.hospital || "",
    purpose: log.purpose || "",
    duration: log.duration || "30 min",
    status: (log.status === "ACTIVE" ? "Active" : log.status === "EXPIRED" ? "Expired" : log.status) as "Active" | "Expired" | "Pending",
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
          {tabs.map((t) => (
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
          {tabs.map((t) => (
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
                const updatedPatient = { ...patient, ...updated };
                setPatient(updatedPatient);
                localStorage.setItem("healthkey_patient", JSON.stringify(updatedPatient));
              }}
            />
          )}
          {tab === "documents" && (
            <DocumentsTab
              documents={docsForTab}
              onAdd={handleAddDocument}
              onUpdate={(docId, updates) => handleUpdateDocument(docId, updates)}
              onDelete={handleDeleteDocument}
            />
          )}
          {tab === "access" && (
            auditLoading ? (
              <div className="flex items-center justify-center py-16">
                <div className="text-center space-y-4">
                  <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin mx-auto" />
                  <p className="text-muted-foreground text-sm">Loading access logs...</p>
                </div>
              </div>
            ) : (
              <AccessLogTab auditLog={auditForTab} patient={patientForProfile} />
            )
          )}
          {tab === "settings" && (
            <SettingsTab
              patient={patientForProfile}
              onUpdate={(updates) => {
                const updatedPatient = { ...patient, ...updates };
                setPatient(updatedPatient);
                localStorage.setItem("healthkey_patient", JSON.stringify(updatedPatient));
              }}
              onDelete={handleDeleteAccount}
            />
          )}
        </main>
      </div>
    </div>
  );
}
