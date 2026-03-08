import { useState, useEffect, useCallback } from "react";
import { clinicianTranslations } from "@/data/mockData";
import { requestEmergencyAccess } from "@/lib/apiHelpers";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import FingerprintScanner from "@/components/FingerprintScanner";
import DocumentViewer from "@/components/DocumentViewer";
import { Lock, AlertTriangle, LogOut, FileText, Eye } from "lucide-react";
import { toast } from "sonner";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";

type Phase = "form" | "verifying" | "summary";

const purposes = ["Emergency Treatment", "OPD Consultation", "Pre-surgery Review", "ICU Monitoring"];
const langOptions = [
  { code: "EN", label: "EN", flag: "🇬🇧" },
  { code: "HI", label: "HI", flag: "🇮🇳" },
  { code: "MR", label: "MR", flag: "🟠" },
  { code: "TA", label: "TA", flag: "🔵" },
  { code: "TE", label: "TE", flag: "🟡" },
];

interface SummaryData {
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
}

export default function Clinician() {
  const [phase, setPhase] = useState<Phase>("form");
  const [doctorName, setDoctorName] = useState("");
  const [hospital, setHospital] = useState("");
  const [doctorId, setDoctorId] = useState("");
  const [patientId, setPatientId] = useState("");
  const [purpose, setPurpose] = useState("");
  const [scanning, setScanning] = useState(false);
  const [bioSuccess, setBioSuccess] = useState(false);
  const [summaryData, setSummaryData] = useState<SummaryData | null>(null);
  const [sessionId, setSessionId] = useState("");
  const [viewingDoc, setViewingDoc] = useState<{ id: string; name: string; date: string; lang: string; filePath?: string; fileType?: string } | null>(null);

  const [verifyStep, setVerifyStep] = useState(0);
  const [lang, setLang] = useState("EN");
  const [timeLeft, setTimeLeft] = useState(1800);
  const [expired, setExpired] = useState(false);

  const t = clinicianTranslations[lang];

  const startVerification = useCallback(async () => {
    setPhase("verifying");
    setVerifyStep(0);
    setTimeout(() => setVerifyStep(1), 1500);
    setTimeout(() => setVerifyStep(2), 3000);

    try {
      const response = await requestEmergencyAccess({
        healthKeyId: patientId.trim(),
        doctorName,
        hospitalName: hospital,
        doctorLicense: doctorId,
        purpose,
        preferredLang: lang,
      });

      setSummaryData(response.summary);
      setSessionId(response.sessionId);

      // Calculate real countdown from expiresAt
      const expiresAt = new Date(response.expiresAt).getTime();
      const now = Date.now();
      const remainingSeconds = Math.max(0, Math.floor((expiresAt - now) / 1000));
      setTimeLeft(remainingSeconds);

      setTimeout(() => setVerifyStep(3), 5000);
      setTimeout(() => {
        setPhase("summary");
      }, 6000);
    } catch (err: any) {
      toast.error(err.message || "Failed to access patient records");
      setPhase("form");
    }
  }, [patientId, doctorName, hospital, doctorId, purpose, lang]);

  const handleRequestAccess = (e: React.FormEvent) => {
    e.preventDefault();
    startVerification();
  };

  const handleBioScan = () => {
    setScanning(true);
    setTimeout(() => {
      setScanning(false);
      setBioSuccess(true);
      toast.info("Biometric scan is simulated. Please enter patient HealthKey ID.");
    }, 2000);
  };

  useEffect(() => {
    if (phase !== "summary" || expired) return;
    const interval = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          setExpired(true);
          clearInterval(interval);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(interval);
  }, [phase, expired]);

  const formatTime = (s: number) => `${Math.floor(s / 60).toString().padStart(2, "0")}:${(s % 60).toString().padStart(2, "0")}`;
  const timerDanger = timeLeft < 300;

  const privacyToggles = summaryData?.privacyToggles;
  const emergencyContacts = summaryData?.emergencyContacts ?? [];
  const surgeries = summaryData?.surgeries ?? [];
  const patientDocs = summaryData?.documents ?? [];

  if (phase === "verifying") {
    return (
      <div className="min-h-screen flex items-center justify-center px-4">
        <div className="glass-card p-10 max-w-md w-full text-center space-y-6">
          <h2 className="font-heading font-bold text-xl">Accessing Patient Records</h2>
          {[
            { step: 1, text: "🔐 Verifying doctor credentials..." },
            { step: 2, text: `📲 Notifying patient's emergency contacts via SMS...` },
            { step: 3, text: "🤖 Generating AI clinical summary with Amazon Bedrock..." },
          ].map((s) => (
            <div key={s.step} className={`flex items-center gap-3 text-sm text-left transition-all duration-300 ${
              verifyStep >= s.step ? "text-foreground" : "text-muted-foreground/30"
            }`}>
              {verifyStep >= s.step ? <span className="text-primary">✓</span> : <span className="w-4 h-4 rounded-full border border-border animate-pulse" />}
              {s.text}
            </div>
          ))}
          {verifyStep >= 2 && summaryData && (
            <div className="glass-card p-4 text-left text-xs text-muted-foreground mt-4 animate-fade-up">
              <p className="font-mono">SMS notification sent:</p>
              <p className="mt-2 italic">"HealthKey Alert: {doctorName} at {hospital} has requested emergency access to {summaryData.name}'s medical summary at {new Date().toLocaleTimeString()}."</p>
            </div>
          )}
        </div>
      </div>
    );
  }

  if (phase === "summary" && summaryData) {
    return (
      <div className="min-h-screen relative">
        <div className="fixed top-0 left-0 right-0 z-50 glass-card border-b border-border/50 px-4 py-3">
          <div className="max-w-5xl mx-auto flex items-center justify-between">
            <span className="font-heading font-semibold text-sm">Clinical Summary — {summaryData.name}</span>
            <div className="flex items-center gap-4">
              <div className="flex gap-1">
                {langOptions.map((l) => (
                  <button key={l.code} onClick={() => setLang(l.code)}
                    className={`px-3 py-1 rounded text-xs font-medium transition-colors ${
                      lang === l.code ? "bg-primary text-primary-foreground" : "bg-secondary text-muted-foreground hover:text-foreground"
                    }`}>
                    {l.flag} {l.label}
                  </button>
                ))}
              </div>
              <div className={`font-mono font-bold text-lg ${timerDanger ? "text-destructive animate-pulse" : "text-primary"}`}>
                {formatTime(timeLeft)}
              </div>
              <AlertDialog>
                <AlertDialogTrigger asChild>
                  <button className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-destructive/20 text-destructive hover:bg-destructive/30 transition-colors text-xs font-medium">
                    <LogOut className="h-3.5 w-3.5" /> End Session
                  </button>
                </AlertDialogTrigger>
                <AlertDialogContent className="glass-card border-destructive/30">
                  <AlertDialogHeader>
                    <AlertDialogTitle className="flex items-center gap-2 text-destructive">
                      <AlertTriangle className="h-5 w-5" /> End Emergency Session?
                    </AlertDialogTitle>
                    <AlertDialogDescription>
                      This will immediately revoke your access to the patient's medical summary. This action will be logged.
                    </AlertDialogDescription>
                  </AlertDialogHeader>
                  <AlertDialogFooter>
                    <AlertDialogCancel className="btn-secondary">Cancel</AlertDialogCancel>
                    <AlertDialogAction className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                      onClick={() => { setPhase("form"); setTimeLeft(1800); setExpired(false); setSummaryData(null); }}>
                      End Session
                    </AlertDialogAction>
                  </AlertDialogFooter>
                </AlertDialogContent>
              </AlertDialog>
            </div>
          </div>
          <div className="max-w-5xl mx-auto mt-2">
            <div className="h-1 bg-border rounded-full overflow-hidden">
              <div className={`h-full transition-all duration-1000 rounded-full ${timerDanger ? "bg-destructive" : "bg-primary"}`}
                style={{ width: `${(timeLeft / 1800) * 100}%` }} />
            </div>
          </div>
        </div>

        <div className="pt-24 pb-16 px-4 max-w-5xl mx-auto">
          <div className="flex items-center gap-3 bg-amber-500/10 border border-amber-500/30 rounded-lg p-4 mb-6">
            <AlertTriangle className="h-5 w-5 text-amber-400 shrink-0" />
            <p className="text-sm text-amber-300">{t.warning}</p>
          </div>

          <div className="grid md:grid-cols-2 gap-4">
            {(!privacyToggles || privacyToggles.allergies) && (
              <div className="glass-card p-5 border-red-500/30 md:col-span-2">
                <h3 className="font-heading font-semibold text-sm mb-3 text-red-400">🚨 {t.allergies}</h3>
                <div className="flex flex-wrap gap-2">
                  {(summaryData.allergies || []).map((a) => <span key={a} className="tag-allergy text-base">{a}</span>)}
                  {(summaryData.allergies || []).length === 0 && <span className="text-muted-foreground text-sm">None recorded</span>}
                </div>
                <p className="text-[10px] text-muted-foreground mt-3">Source: Patient-entered</p>
              </div>
            )}

            {(!privacyToggles || privacyToggles.medications) && (
              <div className="glass-card p-5 border-blue-500/20">
                <h3 className="font-heading font-semibold text-sm mb-3 text-blue-400">💊 {t.medications}</h3>
                <ul className="space-y-1">
                  {(summaryData.medications || []).map((m) => <li key={m} className="text-sm tag-medication inline-block mr-2 mb-2">{m}</li>)}
                  {(summaryData.medications || []).length === 0 && <li className="text-muted-foreground text-sm">None recorded</li>}
                </ul>
              </div>
            )}

            {(!privacyToggles || privacyToggles.conditions) && (
              <div className="glass-card p-5 border-amber-500/20">
                <h3 className="font-heading font-semibold text-sm mb-3 text-amber-400">🫀 {t.conditions}</h3>
                <div className="flex flex-wrap gap-2">
                  {(summaryData.conditions || []).map((c) => <span key={c} className="tag-condition">{c}</span>)}
                  {(summaryData.conditions || []).length === 0 && <span className="text-muted-foreground text-sm">None recorded</span>}
                </div>
              </div>
            )}

            <div className="glass-card p-5 flex items-center justify-center">
              <div className="text-center">
                <p className="text-xs text-muted-foreground mb-1">{t.bloodGroup}</p>
                <p className="text-5xl font-heading font-bold text-red-400">{summaryData.blood}</p>
              </div>
            </div>

            {(!privacyToggles || privacyToggles.surgeries) && (
              <div className="glass-card p-5">
                <h3 className="font-heading font-semibold text-sm mb-3">🔪 {t.surgeries}</h3>
                {surgeries.length > 0 ? surgeries.map((s) => (
                  <div key={s.name} className="text-sm">
                    <span>{s.name}</span>
                    <span className="text-muted-foreground ml-2 font-mono text-xs">{s.date}</span>
                  </div>
                )) : <span className="text-muted-foreground text-sm">None recorded</span>}
              </div>
            )}

            <div className="glass-card p-5">
              <h3 className="font-heading font-semibold text-sm mb-3">📞 {t.emergencyContacts}</h3>
              {emergencyContacts.length > 0 ? emergencyContacts.map((c) => (
                <div key={c.name} className="text-sm flex justify-between py-1">
                  <span>{c.name} <span className="text-muted-foreground">({c.relation})</span></span>
                  <span className="font-mono text-muted-foreground">{c.phone}</span>
                </div>
              )) : <span className="text-muted-foreground text-sm">None recorded</span>}
            </div>
          </div>

          {/* Original Documents */}
          {patientDocs.length > 0 && (
            <div className="mt-6">
              <h3 className="font-heading font-semibold text-sm mb-3 flex items-center gap-2">
                <FileText className="h-4 w-4 text-primary" /> Original Documents
              </h3>
              <div className="space-y-2">
                {patientDocs.map(doc => (
                  <div key={doc.id} className="glass-card p-3 flex items-center justify-between">
                    <div className="min-w-0">
                      <p className="font-medium text-sm truncate">{doc.name}</p>
                      <p className="text-xs text-muted-foreground">{doc.date} · {doc.lang}</p>
                    </div>
                    <button
                      onClick={() => setViewingDoc(doc)}
                      className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-primary/10 text-primary hover:bg-primary/20 transition-colors text-xs font-medium shrink-0"
                    >
                      <Eye className="h-3.5 w-3.5" /> View Original
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}

          <p className="text-center text-xs text-muted-foreground mt-8">
            AI Summary generated by Amazon Bedrock · Translated by Amazon Translate · Documents processed by Amazon Textract
          </p>
        </div>

        {/* Document Viewer for clinician */}
        {viewingDoc && (
          <DocumentViewer
            document={{
              id: viewingDoc.id,
              name: viewingDoc.name,
              date: viewingDoc.date,
              lang: viewingDoc.lang,
              filePath: viewingDoc.filePath,
              fileType: viewingDoc.fileType,
            }}
            onClose={() => setViewingDoc(null)}
            mode="clinician"
          />
        )}

        {expired && (
          <div className="fixed inset-0 z-[100] bg-background/95 backdrop-blur-md flex items-center justify-center">
            <div className="text-center space-y-6 animate-fade-up">
              <div className="w-24 h-24 mx-auto rounded-full bg-destructive/20 flex items-center justify-center">
                <Lock className="h-12 w-12 text-destructive" />
              </div>
              <h2 className="font-heading font-bold text-2xl">{t.sessionExpired}</h2>
              <button onClick={() => { setPhase("form"); setTimeLeft(1800); setExpired(false); setSummaryData(null); }} className="btn-secondary">
                Back to Portal
              </button>
            </div>
          </div>
        )}
      </div>
    );
  }

  return (
    <div className="min-h-screen">
      <Navbar />
      <div className="pt-28 pb-16 px-4 max-w-xl mx-auto">
        <div className="glass-card p-8 animate-fade-up">
          <h1 className="font-heading font-bold text-2xl mb-2 text-center">Clinician Portal</h1>
          <p className="text-muted-foreground text-sm text-center mb-8">Request emergency access to patient records</p>

          <form onSubmit={handleRequestAccess} className="space-y-4">
            <input className="input-field" placeholder="Doctor Name" value={doctorName} onChange={(e) => setDoctorName(e.target.value)} required />
            <input className="input-field" placeholder="Hospital Name" value={hospital} onChange={(e) => setHospital(e.target.value)} required />
            <input className="input-field" placeholder="Doctor ID / License Number" value={doctorId} onChange={(e) => setDoctorId(e.target.value)} required />
            <input className="input-field font-mono" placeholder="Patient HealthKey ID (e.g. HK-1234-ABCD)" value={patientId} onChange={(e) => setPatientId(e.target.value)} required />
            <select className="select-field" value={purpose} onChange={(e) => setPurpose(e.target.value)} required>
              <option value="">Purpose of Access</option>
              {purposes.map((p) => <option key={p}>{p}</option>)}
            </select>

            <div className="bg-secondary/50 rounded-lg p-4 text-xs text-muted-foreground space-y-1">
              <p>⏱ Access Duration: <span className="text-foreground">30 minutes</span></p>
              <p>🔒 One-time only · Family will be notified via SMS</p>
            </div>

            <button type="submit" className="btn-primary w-full text-base py-4">
              Request Emergency Access
            </button>

            <button type="button" onClick={() => {
              setDoctorName("Dr. Ramesh Patil");
              setHospital("AIIMS Nagpur");
              setDoctorId("MH-DOC-29471");
              setPatientId("HK-2847-NKGP");
              setPurpose("Emergency Treatment");
              toast.info("Demo credentials filled. Click 'Request Emergency Access' to proceed.");
            }} className="w-full py-2.5 rounded-lg border border-border bg-secondary/50 text-sm text-muted-foreground hover:text-foreground hover:bg-secondary transition-colors font-medium">
              🧪 Try Demo
            </button>
          </form>

          <div className="relative my-8">
            <div className="absolute inset-0 flex items-center"><div className="w-full border-t border-border" /></div>
            <div className="relative flex justify-center"><span className="bg-card px-3 text-xs text-muted-foreground">OR — Unconscious Patient</span></div>
          </div>

          <div className="text-center">
            <p className="text-sm text-muted-foreground mb-4">Use patient's biometric for identification</p>
            <FingerprintScanner scanning={scanning} success={bioSuccess} onScan={handleBioScan} label="Use Patient Biometric" />
          </div>
        </div>
      </div>
      <Footer />
    </div>
  );
}
