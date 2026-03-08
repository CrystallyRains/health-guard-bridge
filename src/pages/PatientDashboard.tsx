import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { mockPatient, mockAuditLog } from "@/data/mockData";
import { KeyRound, Copy, Check, LogOut, Heart, FileText, Search, Settings, Upload, Eye, Trash2, X } from "lucide-react";

type Tab = "profile" | "documents" | "access" | "settings";

export default function PatientDashboard() {
  const navigate = useNavigate();
  const [tab, setTab] = useState<Tab>("profile");
  const [copied, setCopied] = useState(false);
  const [privacyToggles, setPrivacyToggles] = useState(mockPatient.privacyToggles);
  const [uploadingDoc, setUploadingDoc] = useState(false);
  const [uploadStep, setUploadStep] = useState(0);
  const [viewSummaryIdx, setViewSummaryIdx] = useState<number | null>(null);

  const copyId = () => {
    navigator.clipboard.writeText(mockPatient.id);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const tabs: { key: Tab; icon: typeof Heart; label: string }[] = [
    { key: "profile", icon: Heart, label: "Health Profile" },
    { key: "documents", icon: FileText, label: "My Documents" },
    { key: "access", icon: Search, label: "Access Log" },
    { key: "settings", icon: Settings, label: "Settings" },
  ];

  const simulateUpload = () => {
    setUploadingDoc(true);
    setUploadStep(0);
    const steps = [1, 2, 3, 4];
    steps.forEach((s, i) => setTimeout(() => setUploadStep(s), (i + 1) * 1500));
    setTimeout(() => setUploadingDoc(false), 7000);
  };

  const Toggle = ({ on, onToggle }: { on: boolean; onToggle: () => void }) => (
    <button
      type="button"
      onClick={onToggle}
      className={`w-10 h-5 rounded-full transition-colors relative ${on ? "bg-primary" : "bg-border"}`}
    >
      <span className={`absolute top-0.5 w-4 h-4 rounded-full bg-foreground transition-transform ${on ? "left-5" : "left-0.5"}`} />
    </button>
  );

  return (
    <div className="min-h-screen flex flex-col">
      {/* Top nav */}
      <nav className="fixed top-0 left-0 right-0 z-50 glass-card border-b border-border/50 h-16 flex items-center justify-between px-4 sm:px-8">
        <div className="flex items-center gap-2">
          <KeyRound className="h-5 w-5 text-primary" />
          <span className="font-heading font-bold">Health<span className="text-primary">Key</span></span>
        </div>
        <div className="flex items-center gap-4">
          <span className="text-sm text-muted-foreground hidden sm:block">{mockPatient.name}</span>
          <button onClick={() => navigate("/")} className="text-muted-foreground hover:text-destructive transition-colors">
            <LogOut className="h-5 w-5" />
          </button>
        </div>
      </nav>

      <div className="flex flex-1 pt-16">
        {/* Sidebar */}
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

        {/* Mobile tabs */}
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

        {/* Content */}
        <main className="flex-1 p-4 sm:p-8 pb-24 md:pb-8 overflow-auto">
          {tab === "profile" && (
            <div className="max-w-4xl space-y-6 animate-fade-up">
              {/* ID Card */}
              <div className="glass-card p-6 flex items-center justify-between teal-glow">
                <div>
                  <p className="text-xs text-muted-foreground mb-1">HealthKey ID</p>
                  <p className="mono-id text-2xl font-bold">{mockPatient.id}</p>
                  <p className="text-sm text-muted-foreground mt-1">{mockPatient.name} · {mockPatient.age}y · {mockPatient.gender} · {mockPatient.state}</p>
                </div>
                <button onClick={copyId} className="btn-secondary py-2 px-3">
                  {copied ? <Check className="h-4 w-4 text-primary" /> : <Copy className="h-4 w-4" />}
                </button>
              </div>

              {/* Critical Info Grid */}
              <div className="grid sm:grid-cols-2 gap-4">
                <div className="glass-card p-5">
                  <h3 className="font-heading font-semibold text-sm mb-3 flex items-center gap-2">🚨 Allergies</h3>
                  <div className="flex flex-wrap gap-2">
                    {mockPatient.allergies.map((a) => <span key={a} className="tag-allergy">{a}</span>)}
                  </div>
                </div>
                <div className="glass-card p-5">
                  <h3 className="font-heading font-semibold text-sm mb-3 flex items-center gap-2">💊 Medications</h3>
                  <div className="flex flex-wrap gap-2">
                    {mockPatient.medications.map((m) => <span key={m} className="tag-medication">{m}</span>)}
                  </div>
                </div>
                <div className="glass-card p-5">
                  <h3 className="font-heading font-semibold text-sm mb-3 flex items-center gap-2">🫀 Conditions</h3>
                  <div className="flex flex-wrap gap-2">
                    {mockPatient.conditions.map((c) => <span key={c} className="tag-condition">{c}</span>)}
                  </div>
                </div>
                <div className="glass-card p-5 flex items-center justify-center">
                  <div className="text-center">
                    <p className="text-xs text-muted-foreground mb-1">Blood Group</p>
                    <p className="text-4xl font-heading font-bold text-red-400">{mockPatient.blood}</p>
                  </div>
                </div>
              </div>

              {/* Emergency Contacts */}
              <div className="glass-card p-5">
                <h3 className="font-heading font-semibold text-sm mb-3">📞 Emergency Contacts</h3>
                <div className="space-y-2">
                  {mockPatient.emergencyContacts.map((c) => (
                    <div key={c.name} className="flex justify-between text-sm">
                      <span>{c.name} <span className="text-muted-foreground">({c.relation})</span></span>
                      <span className="font-mono text-muted-foreground">{c.phone}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Privacy Controls */}
              <div className="glass-card p-5">
                <h3 className="font-heading font-semibold text-sm mb-4">🔒 Privacy Controls</h3>
                <p className="text-xs text-muted-foreground mb-4">Toggle OFF to hide from emergency summaries</p>
                <div className="space-y-3">
                  {(["allergies", "medications", "conditions", "surgeries"] as const).map((key) => (
                    <div key={key} className="flex items-center justify-between">
                      <span className="text-sm capitalize">{key}</span>
                      <Toggle on={privacyToggles[key]} onToggle={() => setPrivacyToggles({ ...privacyToggles, [key]: !privacyToggles[key] })} />
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {tab === "documents" && (
            <div className="max-w-4xl space-y-6 animate-fade-up">
              <div className="flex items-center justify-between">
                <h2 className="section-title text-xl">My Documents</h2>
                <label className="btn-primary text-sm py-2 cursor-pointer">
                  <Upload className="h-4 w-4 inline mr-2" /> Upload
                  <input type="file" className="hidden" onChange={simulateUpload} />
                </label>
              </div>

              {uploadingDoc && (
                <div className="glass-card p-6 teal-glow">
                  <p className="font-heading font-semibold text-sm mb-4">Processing Document...</p>
                  {[
                    { step: 1, text: "Extracting text with Amazon Textract..." },
                    { step: 2, text: "Translating with Amazon Translate..." },
                    { step: 3, text: "Extracting critical info with Amazon Bedrock..." },
                    { step: 4, text: "✓ Done — Detected: Marathi → Translated to English" },
                  ].map((s) => (
                    <div key={s.step} className={`flex items-center gap-3 py-2 text-sm transition-all ${
                      uploadStep >= s.step ? "text-foreground" : "text-muted-foreground/30"
                    }`}>
                      {uploadStep >= s.step ? (
                        <span className="text-primary">✓</span>
                      ) : (
                        <span className="w-4 h-4 rounded-full border border-border animate-pulse" />
                      )}
                      {s.text}
                    </div>
                  ))}
                </div>
              )}

              <div className="space-y-3">
                {mockPatient.documents.map((doc) => (
                  <div key={doc.name} className="glass-card p-4 flex items-center justify-between">
                    <div>
                      <p className="font-medium text-sm">{doc.name}</p>
                      <p className="text-xs text-muted-foreground mt-1">{doc.date} · {doc.lang}</p>
                    </div>
                    <span className="tag-success text-xs">{doc.status} ✓</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {tab === "access" && (
            <div className="max-w-5xl space-y-6 animate-fade-up">
              <h2 className="section-title text-xl">Access Log</h2>
              <div className="glass-card overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-border text-muted-foreground text-left">
                      <th className="p-4 font-medium">Date/Time</th>
                      <th className="p-4 font-medium">Doctor</th>
                      <th className="p-4 font-medium hidden sm:table-cell">Hospital</th>
                      <th className="p-4 font-medium hidden md:table-cell">Purpose</th>
                      <th className="p-4 font-medium">Status</th>
                      <th className="p-4 font-medium"></th>
                    </tr>
                  </thead>
                  <tbody>
                    {mockAuditLog.map((log, i) => (
                      <tr key={i} className="border-b border-border/50 hover:bg-secondary/30 transition-colors">
                        <td className="p-4 font-mono text-xs">{log.time}</td>
                        <td className="p-4">{log.doctor}</td>
                        <td className="p-4 hidden sm:table-cell text-muted-foreground">{log.hospital}</td>
                        <td className="p-4 hidden md:table-cell text-muted-foreground">{log.purpose}</td>
                        <td className="p-4">
                          <span className={`px-2 py-1 rounded-full text-xs ${
                            log.status === "Expired" ? "bg-muted text-muted-foreground" : log.status === "Active" ? "tag-success" : "tag-condition"
                          }`}>{log.status}</span>
                        </td>
                        <td className="p-4">
                          <button onClick={() => setViewSummaryIdx(i)} className="text-primary hover:underline text-xs flex items-center gap-1">
                            <Eye className="h-3 w-3" /> View
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {viewSummaryIdx !== null && (
                <div className="fixed inset-0 z-50 bg-background/80 backdrop-blur-sm flex items-center justify-center p-4" onClick={() => setViewSummaryIdx(null)}>
                  <div className="glass-card p-6 max-w-lg w-full space-y-4" onClick={(e) => e.stopPropagation()}>
                    <div className="flex items-center justify-between">
                      <h3 className="font-heading font-semibold">Summary Shown to {mockAuditLog[viewSummaryIdx].doctor}</h3>
                      <button onClick={() => setViewSummaryIdx(null)}><X className="h-5 w-5 text-muted-foreground" /></button>
                    </div>
                    <p className="text-xs text-muted-foreground">{mockAuditLog[viewSummaryIdx].hospital} · {mockAuditLog[viewSummaryIdx].purpose}</p>
                    <div className="space-y-3 text-sm">
                      <div><span className="text-muted-foreground">Allergies:</span> {mockPatient.allergies.join(", ")}</div>
                      <div><span className="text-muted-foreground">Medications:</span> {mockPatient.medications.join(", ")}</div>
                      <div><span className="text-muted-foreground">Conditions:</span> {mockPatient.conditions.join(", ")}</div>
                      <div><span className="text-muted-foreground">Blood Group:</span> <span className="text-red-400 font-bold">{mockPatient.blood}</span></div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}

          {tab === "settings" && (
            <div className="max-w-lg space-y-6 animate-fade-up">
              <h2 className="section-title text-xl">Settings</h2>
              <div className="glass-card p-6 space-y-4">
                <div>
                  <label className="text-sm text-muted-foreground">Phone Number</label>
                  <input className="input-field mt-1" defaultValue={mockPatient.phone} />
                </div>
                <div>
                  <label className="text-sm text-muted-foreground">Email</label>
                  <input className="input-field mt-1" defaultValue={mockPatient.email} />
                </div>
                <button className="btn-primary w-full">Save Changes</button>
              </div>

              <div className="glass-card p-6">
                <h3 className="font-heading font-semibold text-sm mb-3">Emergency Contacts</h3>
                {mockPatient.emergencyContacts.map((c) => (
                  <div key={c.name} className="flex justify-between text-sm py-2 border-b border-border/50 last:border-0">
                    <span>{c.name} ({c.relation})</span>
                    <span className="font-mono text-muted-foreground">{c.phone}</span>
                  </div>
                ))}
              </div>

              <div className="glass-card p-6 border-red-500/20">
                <h3 className="font-heading font-semibold text-sm text-red-400 mb-2">Danger Zone</h3>
                <p className="text-xs text-muted-foreground mb-4">Permanently delete your HealthKey account and all associated data.</p>
                <button className="btn-destructive w-full flex items-center justify-center gap-2">
                  <Trash2 className="h-4 w-4" /> Delete Account
                </button>
              </div>
            </div>
          )}
        </main>
      </div>
    </div>
  );
}
