import { Fingerprint } from "lucide-react";

interface Props {
  scanning: boolean;
  success: boolean;
  onScan: () => void;
  label?: string;
}

export default function FingerprintScanner({ scanning, success, onScan, label = "Scan Fingerprint" }: Props) {
  return (
    <div className="flex flex-col items-center gap-4">
      <div className={`relative w-28 h-28 rounded-full flex items-center justify-center border-2 transition-all duration-500 ${
        success
          ? "border-primary bg-primary/10 teal-glow"
          : scanning
          ? "border-primary/60 bg-primary/5 pulse-teal"
          : "border-border bg-secondary"
      }`}>
        <Fingerprint className={`h-14 w-14 transition-colors duration-500 ${
          success ? "text-primary" : scanning ? "text-primary/70 fingerprint-scanning" : "text-muted-foreground"
        }`} />
        {success && (
          <div className="absolute inset-0 flex items-center justify-center bg-primary/20 rounded-full animate-fade-up">
            <span className="text-3xl">✓</span>
          </div>
        )}
      </div>

      {success ? (
        <p className="text-primary font-heading font-medium animate-fade-up">Biometric Registered Successfully</p>
      ) : scanning ? (
        <p className="text-muted-foreground text-sm animate-pulse">Scanning...</p>
      ) : (
        <button onClick={onScan} className="btn-secondary text-sm" type="button">
          {label}
        </button>
      )}
    </div>
  );
}
