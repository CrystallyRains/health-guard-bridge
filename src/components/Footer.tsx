import { KeyRound } from "lucide-react";

export default function Footer() {
  return (
    <footer className="border-t border-border/50 bg-card/50 py-10">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="flex items-center gap-2">
            <KeyRound className="h-5 w-5 text-primary" />
            <span className="font-heading font-bold text-lg">
              Health<span className="text-primary">Key</span>
            </span>
          </div>

          <p className="text-muted-foreground text-sm text-center">
            Built for Bharat · Recognized by ISRO, AHPI, NitiAayog · AI for Bharat Hackathon 2026
          </p>

          <div className="flex flex-wrap items-center gap-2 justify-center">
            <span className="text-xs text-muted-foreground">Powered by AWS</span>
            {["Bedrock", "Textract", "Translate", "DynamoDB", "SNS", "Cognito", "Lambda", "Amplify"].map((s) => (
              <span key={s} className="text-[10px] bg-secondary px-2 py-0.5 rounded text-muted-foreground">
                {s}
              </span>
            ))}
          </div>
        </div>
      </div>
    </footer>
  );
}
