import { useState, useEffect, useCallback } from "react";
import { clinicianTranslations, bloodGroupNames } from "@/data/mockData";
import { requestEmergencyAccess } from "@/lib/apiHelpers";
import { api } from "@/config/api";
import { supabase } from "@/integrations/supabase/client";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import FingerprintScanner from "@/components/FingerprintScanner";
import { Lock, AlertTriangle, LogOut } from "lucide-react";
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

interface SummaryResponse {
  sessionId: string;
  patientName: string;
  expiresAt: string;
  sessionDurationMinutes: number;
  summary: {
    criticalAlert: string;
    allergies: string[];
    medications: string[];
    conditions: string[];
    surgeries: any[];
    bloodGroup: string;
    emergencyNotes: string;
    dataSources: string[];
    drugContraindications?: string | string[];
    labHighlights?: string | string[];
  };
}


export default function Clinician() {
  const [phase, setPhase] = useState<Phase>("form");
  const [doctorName, setDoctorName] = useState("");
  const [hospital, setHospital] = useState("");
  const [patientId, setPatientId] = useState("");
  const [purpose, setPurpose] = useState("");
  const [scanning, setScanning] = useState(false);
  const [bioSuccess, setBioSuccess] = useState(false);
  const [responseData, setResponseData] = useState<SummaryResponse | null>(null);
  const [requestData, setRequestData] = useState<{ healthKeyId: string; doctorName: string; hospitalName: string; purpose: string } | null>(null);
  const [englishSummary, setEnglishSummary] = useState<SummaryResponse["summary"] | null>(null);
  

  const [verifyStep, setVerifyStep] = useState(0);
  const [lang, setLang] = useState("EN");
  const [timeLeft, setTimeLeft] = useState(1800);
  const [expired, setExpired] = useState(false);
  const [apiLoading, setApiLoading] = useState(false);
  const [translating, setTranslating] = useState(false);

  const t = clinicianTranslations[lang];




  const startVerification = useCallback(async () => {
    setPhase("verifying");
    setVerifyStep(0);
    setApiLoading(true);
    setTimeout(() => setVerifyStep(1), 1500);
    setTimeout(() => setVerifyStep(2), 3000);

    const reqData = {
      healthKeyId: patientId.trim(),
      doctorName,
      hospitalName: hospital,
      purpose,
    };

    try {
      const response = await requestEmergencyAccess({
        ...reqData,
        preferredLang: "EN",
      });

      setResponseData(response);
      setRequestData(reqData);
      setEnglishSummary(response.summary);
      setLang("EN");




      const expiresAt = new Date(response.expiresAt).getTime();
      const now = Date.now();
      const remainingSeconds = Math.max(0, Math.floor((expiresAt - now) / 1000));
      setTimeLeft(remainingSeconds);

      setTimeout(() => setVerifyStep(3), 5000);
      setTimeout(() => {
        setPhase("summary");
        setApiLoading(false);
      }, 6000);
    } catch (err: any) {
      toast.error(err.message || "Failed to access patient records");
      setPhase("form");
      setApiLoading(false);
    }
  }, [patientId, doctorName, hospital, purpose]);

  const handleLangSwitch = useCallback(async (newLang: string) => {
    if (newLang === lang) return;
    setLang(newLang);

    if (newLang === "EN" && englishSummary) {
      setResponseData((prev) => prev ? { ...prev, summary: englishSummary } : prev);
      return;
    }

    if (!requestData) return;
    setTranslating(true);
    try {
      const res = await fetch(api.emergencyAccess, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...requestData,
          preferredLang: newLang,
        }),
      });
      if (!res.ok) throw new Error("Translation request failed");
      const data = await res.json();
      console.log("[LangSwitch] API response for", newLang, ":", JSON.stringify(data.summary, null, 2));

      setResponseData((prev) => {
        if (!prev) return prev;
        return {
          ...prev,
          summary: {
            criticalAlert: data.summary?.criticalAlert ?? prev.summary.criticalAlert,
            allergies: data.summary?.allergies ?? prev.summary.allergies,
            medications: data.summary?.medications ?? prev.summary.medications,
            conditions: data.summary?.conditions ?? prev.summary.conditions,
            surgeries: data.summary?.surgeries ?? prev.summary.surgeries,
            bloodGroup: data.summary?.bloodGroup ?? prev.summary.bloodGroup,
            emergencyNotes: data.summary?.emergencyNotes ?? prev.summary.emergencyNotes,
            dataSources: data.summary?.dataSources ?? prev.summary.dataSources,
            drugContraindications: data.summary?.drugContraindications ?? prev.summary.drugContraindications,
            labHighlights: data.summary?.labHighlights ?? prev.summary.labHighlights,
          },
        };
      });
    } catch (err: any) {
      console.error("[LangSwitch] Failed:", err);
      toast.error("Translation failed. Showing English.");
      setLang("EN");
      if (englishSummary) {
        setResponseData((prev) => prev ? { ...prev, summary: englishSummary } : prev);
      }
    } finally {
      setTranslating(false);
    }
  }, [lang, requestData, englishSummary]);

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

  const summary = responseData?.summary;

  // Get translated blood group display name
  const getBloodGroupDisplay = (bg: string) => {
    const raw = bg?.replace(/[^A-Za-z+-]/g, "").toUpperCase(); // normalize e.g. "B+" 
    const match = bloodGroupNames[raw];
    if (match && match[lang]) return match[lang];
    return bg || "—";
  };

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
          {verifyStep >= 2 && responseData && (
            <div className="glass-card p-4 text-left text-xs text-muted-foreground mt-4 animate-fade-up">
              <p className="font-mono">SMS notification sent:</p>
              <p className="mt-2 italic">"HealthKey Alert: {doctorName} at {hospital} has requested emergency access to {responseData.patientName}'s medical summary at {new Date().toLocaleTimeString()}."</p>
            </div>
          )}
        </div>
      </div>
    );
  }

  if (phase === "summary" && summary) {
    const durationMinutes = responseData?.sessionDurationMinutes || 30;

    return (
      <div className="min-h-screen relative">
        <div className="fixed top-0 left-0 right-0 z-50 glass-card border-b border-border/50 px-4 py-3">
          <div className="max-w-5xl mx-auto flex items-center justify-between">
            <span className="font-heading font-semibold text-sm">Clinical Summary — {responseData?.patientName}</span>
            <div className="flex items-center gap-4">
              <div className="flex gap-1">
                {langOptions.map((l) => (
                  <button key={l.code} onClick={() => handleLangSwitch(l.code)} disabled={translating}
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
                      onClick={() => { setPhase("form"); setTimeLeft(1800); setExpired(false); setResponseData(null); setRequestData(null); setEnglishSummary(null); setLang("EN"); }}>
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
                style={{ width: `${(timeLeft / (durationMinutes * 60)) * 100}%` }} />
            </div>
          </div>
        </div>

        <div className="pt-24 pb-16 px-4 max-w-5xl mx-auto relative">
          {translating && (
            <div className="absolute inset-0 z-10 bg-background/60 backdrop-blur-sm flex items-center justify-center rounded-lg">
              <div className="flex items-center gap-3 glass-card p-4">
                <div className="w-5 h-5 border-2 border-primary border-t-transparent rounded-full animate-spin" />
                <span className="text-sm font-medium">Translating...</span>
              </div>
            </div>
          )}
          {/* Critical Alert Banner */}
          {summary.criticalAlert && (
            <div className="flex items-center gap-3 bg-red-500/15 border border-red-500/40 rounded-lg p-4 mb-4">
              <span className="text-lg">🚨</span>
              <div>
                <p className="text-sm font-semibold text-red-400">{t.criticalAlert}</p>
                <p className="text-sm text-red-300">{summary.criticalAlert}</p>
              </div>
            </div>
          )}

          <div className="flex items-center gap-3 bg-amber-500/10 border border-amber-500/30 rounded-lg p-4 mb-6">
            <AlertTriangle className="h-5 w-5 text-amber-400 shrink-0" />
            <p className="text-sm text-amber-300">{t.warning}</p>
          </div>

          {/* Session ID */}
          <p className="text-xs text-muted-foreground mb-4">Session ID: <span className="font-mono">{responseData?.sessionId}</span></p>

          <div className="grid md:grid-cols-2 gap-4">
            {/* Allergies */}
            <div className="glass-card p-5 border-red-500/30 md:col-span-2">
              <h3 className="font-heading font-semibold text-sm mb-3 text-red-400">⚠️ {t.allergies}</h3>
              <div className="flex flex-wrap gap-2">
                {(summary.allergies || []).length > 0
                  ? summary.allergies.map((a) => <span key={a} className="tag-allergy text-base">{a}</span>)
                  : <span className="text-muted-foreground text-sm">None recorded</span>}
              </div>
            </div>

            {/* Medications */}
            <div className="glass-card p-5 border-blue-500/20">
              <h3 className="font-heading font-semibold text-sm mb-3 text-blue-400">💊 {t.medications}</h3>
              <ul className="space-y-1">
                {(summary.medications || []).length > 0
                  ? summary.medications.map((m) => <li key={m} className="text-sm tag-medication inline-block mr-2 mb-2">{m}</li>)
                  : <li className="text-muted-foreground text-sm">None recorded</li>}
              </ul>
            </div>

            {/* Conditions */}
            <div className="glass-card p-5 border-amber-500/20">
              <h3 className="font-heading font-semibold text-sm mb-3 text-amber-400">🫀 {t.conditions}</h3>
              <div className="flex flex-wrap gap-2">
                {(summary.conditions || []).length > 0
                  ? summary.conditions.map((c) => <span key={c} className="tag-condition">{c}</span>)
                  : <span className="text-muted-foreground text-sm">None recorded</span>}
              </div>
            </div>

            {/* Blood Group — translated */}
            <div className="glass-card p-5 flex items-center justify-center">
              <div className="text-center">
                <p className="text-xs text-muted-foreground mb-1">🩸 {t.bloodGroup}</p>
                <p className="text-5xl font-heading font-bold text-red-400">
                  {getBloodGroupDisplay(summary.bloodGroup)}
                </p>
              </div>
            </div>

            {/* Surgeries */}
            <div className="glass-card p-5">
              <h3 className="font-heading font-semibold text-sm mb-3">🔪 {t.surgeries}</h3>
              {(summary.surgeries || []).length > 0 ? summary.surgeries.map((s: any, i: number) => (
                <div key={i} className="text-sm">
                  <span>{typeof s === "string" ? s : s.name || s.procedure || JSON.stringify(s)}</span>
                  {s.date && <span className="text-muted-foreground ml-2 font-mono text-xs">{s.date}</span>}
                </div>
              )) : <span className="text-muted-foreground text-sm">None recorded</span>}
            </div>

            {/* Emergency Notes */}
            <div className="glass-card p-5">
              <h3 className="font-heading font-semibold text-sm mb-3">📋 {t.emergencyNotes}</h3>
              {summary.emergencyNotes
                ? <p className="text-sm">{summary.emergencyNotes}</p>
                : <span className="text-muted-foreground text-sm">None recorded</span>}
            </div>

            {/* Drug Contraindications */}
            {summary.drugContraindications && summary.drugContraindications !== "Not available" && (
              Array.isArray(summary.drugContraindications) ? summary.drugContraindications.length > 0 : true
            ) && (
              <div className="glass-card p-5 border-red-500/40 md:col-span-2">
                <h3 className="font-heading font-semibold text-sm mb-3 text-red-400">💊 {t.drugsToAvoid}</h3>
                {Array.isArray(summary.drugContraindications) ? (
                  <div className="flex flex-wrap gap-2">
                    {summary.drugContraindications.map((d: string) => (
                      <span key={d} className="tag-allergy text-base">{d}</span>
                    ))}
                  </div>
                ) : (
                  <p className="text-sm">{summary.drugContraindications}</p>
                )}
              </div>
            )}

            {/* Lab Highlights */}
            {summary.labHighlights && summary.labHighlights !== "Not available" && (
              Array.isArray(summary.labHighlights) ? summary.labHighlights.length > 0 : true
            ) && (
              <div className="glass-card p-5 border-purple-500/40 md:col-span-2">
                <h3 className="font-heading font-semibold text-sm mb-3 text-purple-400">🧪 {t.recentLabValues}</h3>
                {Array.isArray(summary.labHighlights) ? (
                  <ul className="space-y-1">
                    {summary.labHighlights.map((l: string, i: number) => (
                      <li key={i} className="text-sm">{l}</li>
                    ))}
                  </ul>
                ) : (
                  <p className="text-sm">{summary.labHighlights}</p>
                )}
              </div>
            )}

          </div>

          {/* Data Sources */}
          {(summary.dataSources || []).length > 0 && (
            <p className="text-center text-xs text-muted-foreground mt-8">
              Data sources: {summary.dataSources.join(" · ")}
            </p>
          )}

          <p className="text-center text-xs text-muted-foreground mt-4">
            AI Summary generated by Amazon Bedrock · Translated by Amazon Translate · Documents processed by Amazon Textract
          </p>
        </div>

        {expired && (
          <div className="fixed inset-0 z-[100] bg-background/95 backdrop-blur-md flex items-center justify-center">
            <div className="text-center space-y-6 animate-fade-up">
              <div className="w-24 h-24 mx-auto rounded-full bg-destructive/20 flex items-center justify-center">
                <Lock className="h-12 w-12 text-destructive" />
              </div>
              <h2 className="font-heading font-bold text-2xl">{t.sessionExpired}</h2>
              <button onClick={() => { setPhase("form"); setTimeLeft(1800); setExpired(false); setResponseData(null); setRequestData(null); setEnglishSummary(null); setLang("EN"); }} className="btn-secondary">
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
            <input className="input-field font-mono" placeholder="Patient HealthKey ID (e.g. HK-1234-ABCD)" value={patientId} onChange={(e) => setPatientId(e.target.value)} required />
            <select className="select-field" value={purpose} onChange={(e) => setPurpose(e.target.value)} required>
              <option value="">Purpose of Access</option>
              {purposes.map((p) => <option key={p}>{p}</option>)}
            </select>

            <div className="flex gap-2">
              {langOptions.map((l) => (
                <button key={l.code} type="button" onClick={() => setLang(l.code)}
                  className={`flex-1 py-2 rounded-lg text-xs font-medium transition-colors ${
                    lang === l.code ? "bg-primary text-primary-foreground" : "bg-secondary text-muted-foreground hover:text-foreground"
                  }`}>
                  {l.flag} {l.label}
                </button>
              ))}
            </div>

            <div className="bg-secondary/50 rounded-lg p-4 text-xs text-muted-foreground space-y-1">
              <p>⏱ Access Duration: <span className="text-foreground">30 minutes</span></p>
              <p>🔒 One-time only · Family will be notified via SMS</p>
            </div>

            <button type="submit" className="btn-primary w-full text-base py-4" disabled={apiLoading}>
              {apiLoading ? (
                <span className="flex items-center justify-center gap-2">
                  <span className="w-4 h-4 border-2 border-primary-foreground border-t-transparent rounded-full animate-spin" />
                  Requesting access...
                </span>
              ) : "Request Emergency Access"}
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
