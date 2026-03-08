import { useState } from "react";
import { Eye, X } from "lucide-react";

interface AuditEntry {
  time: string;
  doctor: string;
  hospital: string;
  purpose: string;
  duration: string;
  status: "Expired" | "Active" | "Pending";
}

interface PatientSummary {
  allergies: string[];
  medications: string[];
  conditions: string[];
  blood: string;
}

interface Props {
  auditLog: AuditEntry[];
  patient: PatientSummary;
}

export default function AccessLogTab({ auditLog, patient }: Props) {
  const [viewSummaryIdx, setViewSummaryIdx] = useState<number | null>(null);

  return (
    <div className="max-w-5xl space-y-6 animate-fade-up">
      <h2 className="section-title text-xl">Access Log</h2>

      {auditLog.length === 0 ? (
        <div className="glass-card p-8 text-center">
          <p className="text-muted-foreground text-sm">No access events yet</p>
        </div>
      ) : (
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
              {auditLog.map((log, i) => (
                <tr key={i} className="border-b border-border/50 hover:bg-secondary/30 transition-colors">
                  <td className="p-4 font-mono text-xs">{log.time}</td>
                  <td className="p-4">{log.doctor}</td>
                  <td className="p-4 hidden sm:table-cell text-muted-foreground">{log.hospital}</td>
                  <td className="p-4 hidden md:table-cell text-muted-foreground">{log.purpose}</td>
                  <td className="p-4">
                    <span className={`px-2 py-1 rounded-full text-xs ${
                      log.status === "Active" ? "tag-success" : log.status === "Expired" ? "bg-muted text-muted-foreground" : "tag-condition"
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
      )}

      {viewSummaryIdx !== null && (
        <div className="fixed inset-0 z-50 bg-background/80 backdrop-blur-sm flex items-center justify-center p-4" onClick={() => setViewSummaryIdx(null)}>
          <div className="glass-card p-6 max-w-lg w-full space-y-4" onClick={e => e.stopPropagation()}>
            <div className="flex items-center justify-between">
              <h3 className="font-heading font-semibold">Summary Shown to {auditLog[viewSummaryIdx].doctor}</h3>
              <button onClick={() => setViewSummaryIdx(null)}><X className="h-5 w-5 text-muted-foreground" /></button>
            </div>
            <p className="text-xs text-muted-foreground">{auditLog[viewSummaryIdx].hospital} · {auditLog[viewSummaryIdx].purpose}</p>
            <div className="space-y-3 text-sm">
              <div><span className="text-muted-foreground">Allergies:</span> {patient.allergies.length > 0 ? patient.allergies.join(", ") : "None recorded"}</div>
              <div><span className="text-muted-foreground">Medications:</span> {patient.medications.length > 0 ? patient.medications.join(", ") : "None recorded"}</div>
              <div><span className="text-muted-foreground">Conditions:</span> {patient.conditions.length > 0 ? patient.conditions.join(", ") : "None recorded"}</div>
              <div><span className="text-muted-foreground">Blood Group:</span> <span className="text-red-400 font-bold">{patient.blood || "—"}</span></div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
