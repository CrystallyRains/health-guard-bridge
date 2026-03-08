import { useState } from "react";
import { X, Languages, FileText, Download, Loader2 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";

interface DocumentViewerProps {
  document: {
    id: string;
    name: string;
    date: string;
    lang: string;
    filePath?: string | null;
    fileType?: string | null;
  };
  onClose: () => void;
  mode?: "patient" | "clinician";
}

const simulatedContent: Record<string, { original: string; translated: string; detectedLang: string }> = {
  default: {
    original: `रुग्ण नाव: स्निग्धा चौधरी
वय: २८ वर्षे | लिंग: स्त्री | रक्तगट: A+

निदान: उच्च रक्तदाब (Hypertension), मधुमेह प्रकार २ (Type 2 Diabetes)

सध्याची औषधे:
• लिसिनोप्रिल १० मिग्रॅ - दररोज सकाळी
• मेटफॉर्मिन ५०० मिग्रॅ - जेवणानंतर दिवसातून दोनदा

ऍलर्जी: पेनिसिलिन, शेंगदाणे, सल्फा औषधे

शस्त्रक्रिया इतिहास:
• ऍपेंडेक्टॉमी - मार्च २०२३

टीप: रुग्णाने नियमित तपासणी करावी. रक्तदाब आणि रक्तशर्करा यांचे सतत निरीक्षण आवश्यक.

डॉ. रमेश पाटील
AIIMS नागपूर`,
    translated: `Patient Name: Snigdha Chaudhari
Age: 28 years | Gender: Female | Blood Group: A+

Diagnosis: Hypertension, Type 2 Diabetes

Current Medications:
• Lisinopril 10mg - Daily morning
• Metformin 500mg - Twice daily after meals

Allergies: Penicillin, Peanuts, Sulfa drugs

Surgery History:
• Appendectomy - March 2023

Note: Patient should undergo regular check-ups. Continuous monitoring of blood pressure and blood sugar is required.

Dr. Ramesh Patil
AIIMS Nagpur`,
    detectedLang: "Marathi",
  },
};

export default function DocumentViewer({ document, onClose, mode = "patient" }: DocumentViewerProps) {
  const [showTranslated, setShowTranslated] = useState(false);
  const [translating, setTranslating] = useState(false);
  const [fileUrl, setFileUrl] = useState<string | null>(null);
  const [loadingFile, setLoadingFile] = useState(false);

  const content = simulatedContent.default;
  const isRegionalLang = document.lang !== "English" && document.lang.includes("→");

  const handleTranslate = () => {
    setTranslating(true);
    setTimeout(() => {
      setTranslating(false);
      setShowTranslated(true);
    }, 1500);
  };

  const handleDownload = async () => {
    if (!document.filePath) return;
    setLoadingFile(true);
    const { data } = await supabase.storage.from("patient-documents").createSignedUrl(document.filePath, 60);
    if (data?.signedUrl) {
      window.open(data.signedUrl, "_blank");
    }
    setLoadingFile(false);
  };

  // Try to load actual file for preview
  const loadFilePreview = async () => {
    if (!document.filePath || fileUrl) return;
    setLoadingFile(true);
    const { data } = await supabase.storage.from("patient-documents").createSignedUrl(document.filePath, 300);
    if (data?.signedUrl) setFileUrl(data.signedUrl);
    setLoadingFile(false);
  };

  const isImage = document.fileType?.startsWith("image/") || /\.(jpg|jpeg|png|webp|gif)$/i.test(document.name);
  const isPdf = document.fileType === "application/pdf" || /\.pdf$/i.test(document.name);

  return (
    <div className="fixed inset-0 z-[70] bg-background/90 backdrop-blur-md flex items-center justify-center p-4" onClick={onClose}>
      <div className="glass-card max-w-3xl w-full max-h-[90vh] flex flex-col overflow-hidden" onClick={e => e.stopPropagation()}>
        {/* Header */}
        <div className="flex items-center justify-between p-5 border-b border-border">
          <div className="flex items-center gap-3 min-w-0">
            <FileText className="h-5 w-5 text-primary shrink-0" />
            <div className="min-w-0">
              <h3 className="font-heading font-semibold text-sm truncate">{document.name}</h3>
              <p className="text-xs text-muted-foreground">{document.date} · {document.lang}</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            {isRegionalLang && (
              <button
                onClick={showTranslated ? () => setShowTranslated(false) : handleTranslate}
                disabled={translating}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${
                  showTranslated
                    ? "bg-primary/20 text-primary"
                    : "bg-secondary text-muted-foreground hover:text-foreground"
                }`}
              >
                {translating ? (
                  <><Loader2 className="h-3.5 w-3.5 animate-spin" /> Translating...</>
                ) : (
                  <><Languages className="h-3.5 w-3.5" /> {showTranslated ? "Show Original" : "Translate to English"}</>
                )}
              </button>
            )}
            {document.filePath && (
              <button onClick={handleDownload} disabled={loadingFile} className="btn-secondary py-1.5 px-3 text-xs flex items-center gap-1">
                <Download className="h-3.5 w-3.5" /> Download
              </button>
            )}
            <button onClick={onClose} className="text-muted-foreground hover:text-foreground p-1">
              <X className="h-5 w-5" />
            </button>
          </div>
        </div>

        {/* Translation banner */}
        {translating && (
          <div className="px-5 py-3 bg-primary/5 border-b border-primary/20 flex items-center gap-3">
            <Loader2 className="h-4 w-4 animate-spin text-primary" />
            <div className="text-xs">
              <span className="text-primary font-medium">Amazon Translate</span>
              <span className="text-muted-foreground"> · Translating from {content.detectedLang} to English...</span>
            </div>
          </div>
        )}
        {showTranslated && (
          <div className="px-5 py-2 bg-primary/5 border-b border-primary/20 flex items-center gap-2">
            <Languages className="h-3.5 w-3.5 text-primary" />
            <span className="text-xs text-primary font-medium">Translated from {content.detectedLang} via Amazon Translate</span>
          </div>
        )}

        {/* Content */}
        <div className="flex-1 overflow-auto p-5">
          {document.filePath && (isImage || isPdf) ? (
            <div>
              {!fileUrl && (
                <button onClick={loadFilePreview} className="btn-secondary mb-4 text-sm">
                  Load File Preview
                </button>
              )}
              {loadingFile && <div className="flex items-center gap-2 text-muted-foreground text-sm"><Loader2 className="h-4 w-4 animate-spin" /> Loading...</div>}
              {fileUrl && isImage && <img src={fileUrl} alt={document.name} className="max-w-full rounded-lg" />}
              {fileUrl && isPdf && <iframe src={fileUrl} className="w-full h-[60vh] rounded-lg border border-border" />}
            </div>
          ) : (
            <div className="font-mono text-sm whitespace-pre-wrap leading-relaxed text-foreground/90">
              {showTranslated ? content.translated : content.original}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-border text-center">
          <p className="text-[10px] text-muted-foreground">
            {mode === "clinician" ? "Document accessed under emergency protocol · " : ""}
            Processed by Amazon Textract · {isRegionalLang ? `Translated by Amazon Translate (${content.detectedLang} → English) · ` : ""}Analyzed by Amazon Bedrock
          </p>
        </div>
      </div>
    </div>
  );
}
