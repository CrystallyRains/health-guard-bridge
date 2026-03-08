import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { mockPatient, mockAuditLog } from "@/data/mockData";
import { KeyRound, LogOut, Heart, FileText, Search, Settings } from "lucide-react";
import ProfileTab from "@/components/dashboard/ProfileTab";
import DocumentsTab, { type Document } from "@/components/dashboard/DocumentsTab";
import AccessLogTab from "@/components/dashboard/AccessLogTab";
import SettingsTab from "@/components/dashboard/SettingsTab";
import { toast } from "sonner";

type Tab = "profile" | "documents" | "access" | "settings";

export default function PatientDashboard() {
  const navigate = useNavigate();
  const [tab, setTab] = useState<Tab>("profile");
  const [patient, setPatient] = useState(mockPatient);
  const [documents, setDocuments] = useState<Document[]>(mockPatient.documents);

  const tabs: { key: Tab; icon: typeof Heart; label: string }[] = [
    { key: "profile", icon: Heart, label: "Health Profile" },
    { key: "documents", icon: FileText, label: "My Documents" },
    { key: "access", icon: Search, label: "Access Log" },
    { key: "settings", icon: Settings, label: "Settings" },
  ];

  const handleDeleteAccount = () => {
    toast.success("Account deleted (simulated)");
    navigate("/");
  };

  return (
    <div className="min-h-screen flex flex-col">
      {/* Top nav */}
      <nav className="fixed top-0 left-0 right-0 z-50 glass-card border-b border-border/50 h-16 flex items-center justify-between px-4 sm:px-8">
        <div className="flex items-center gap-2">
          <KeyRound className="h-5 w-5 text-primary" />
          <span className="font-heading font-bold">Health<span className="text-primary">Key</span></span>
        </div>
        <div className="flex items-center gap-4">
          <span className="text-sm text-muted-foreground hidden sm:block">{patient.name}</span>
          <button onClick={() => navigate("/")} className="text-muted-foreground hover:text-destructive transition-colors">
            <LogOut className="h-5 w-5" />
          </button>
        </div>
      </nav>

      <div className="flex flex-1 pt-16">
        {/* Sidebar */}
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

        {/* Mobile tabs */}
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

        {/* Content */}
        <main className="flex-1 p-4 sm:p-8 pb-24 md:pb-8 overflow-auto">
          {tab === "profile" && (
            <ProfileTab patient={patient} onUpdate={(updated) => setPatient(prev => ({ ...prev, ...updated }))} />
          )}
          {tab === "documents" && (
            <DocumentsTab documents={documents} onUpdate={setDocuments} />
          )}
          {tab === "access" && (
            <AccessLogTab auditLog={mockAuditLog} patient={patient} />
          )}
          {tab === "settings" && (
            <SettingsTab
              patient={patient}
              onUpdate={updates => setPatient(prev => ({ ...prev, ...updates }))}
              onDelete={handleDeleteAccount}
            />
          )}
        </main>
      </div>
    </div>
  );
}
