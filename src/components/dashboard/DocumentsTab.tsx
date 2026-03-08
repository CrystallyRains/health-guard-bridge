import { useState } from "react";
import { Upload, Trash2, Pencil, X, Check, Eye } from "lucide-react";
import { toast } from "sonner";
import DocumentViewer from "@/components/DocumentViewer";
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

export interface DocumentDisplay {
  id: string;
  name: string;
  date: string;
  status: "Processed" | "Processing" | "Failed";
  lang: string;
  filePath?: string | null;
  fileType?: string | null;
}

interface Props {
  documents: DocumentDisplay[];
  onAdd: (name: string, file?: File) => void;
  onUpdate: (docId: string, updates: { name?: string }) => void;
  onDelete: (docId: string) => void;
}

export default function DocumentsTab({ documents, onAdd, onUpdate, onDelete }: Props) {
  const [uploadingDoc, setUploadingDoc] = useState(false);
  const [uploadStep, setUploadStep] = useState(0);
  const [editingIdx, setEditingIdx] = useState<number | null>(null);
  const [editName, setEditName] = useState("");
  const [viewingDoc, setViewingDoc] = useState<DocumentDisplay | null>(null);

  const handleUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploadingDoc(true);
    setUploadStep(0);
    const steps = [1, 2, 3, 4];
    steps.forEach((s, i) => setTimeout(() => setUploadStep(s), (i + 1) * 1500));
    setTimeout(() => {
      setUploadingDoc(false);
      onAdd(file.name, file);
    }, 7000);
    e.target.value = "";
  };

  const startRename = (idx: number) => {
    setEditingIdx(idx);
    setEditName(documents[idx].name);
  };

  const saveRename = () => {
    if (editingIdx === null) return;
    const doc = documents[editingIdx];
    const newName = editName.trim() || doc.name;
    onUpdate(doc.id, { name: newName });
    setEditingIdx(null);
    toast.success("Document renamed");
  };

  // Format language display
  const formatLang = (lang: string) => {
    if (!lang || lang === "English" || lang === "en") return "English";
    const langMap: Record<string, string> = {
      mr: "Marathi", hi: "Hindi", ta: "Tamil", te: "Telugu",
      Marathi: "Marathi", Hindi: "Hindi", Tamil: "Tamil", Telugu: "Telugu",
    };
    const displayLang = langMap[lang] || lang;
    if (displayLang !== "English") return `${displayLang} → English`;
    return displayLang;
  };

  return (
    <div className="max-w-4xl space-y-6 animate-fade-up">
      <div className="flex items-center justify-between">
        <h2 className="section-title text-xl">My Documents</h2>
        <label className="btn-primary text-sm py-2 cursor-pointer">
          <Upload className="h-4 w-4 inline mr-2" /> Upload
          <input type="file" className="hidden" onChange={handleUpload} accept=".pdf" />
        </label>
      </div>

      {uploadingDoc && (
        <div className="glass-card p-6 teal-glow">
          <p className="font-heading font-semibold text-sm mb-4">Processing Document...</p>
          {[
            { step: 1, text: "Extracting text with Amazon Textract..." },
            { step: 2, text: "Translating with Amazon Translate..." },
            { step: 3, text: "Extracting critical info with Amazon Bedrock..." },
            { step: 4, text: "✓ Done — Document processed successfully" },
          ].map(s => (
            <div key={s.step} className={`flex items-center gap-3 py-2 text-sm transition-all ${uploadStep >= s.step ? "text-foreground" : "text-muted-foreground/30"}`}>
              {uploadStep >= s.step ? <span className="text-primary">✓</span> : <span className="w-4 h-4 rounded-full border border-border animate-pulse" />}
              {s.text}
            </div>
          ))}
        </div>
      )}

      {documents.length === 0 ? (
        <div className="glass-card p-8 text-center">
          <p className="text-muted-foreground text-sm">No documents uploaded yet. Click Upload to add your first document.</p>
        </div>
      ) : (
        <div className="space-y-3">
          {documents.map((doc, i) => (
            <div key={doc.id} className="glass-card p-4 flex items-center justify-between group">
              <div className="flex-1 min-w-0 cursor-pointer" onClick={() => setViewingDoc(doc)}>
                {editingIdx === i ? (
                  <div className="flex items-center gap-2" onClick={e => e.stopPropagation()}>
                    <input className="input-field text-sm flex-1" value={editName} onChange={e => setEditName(e.target.value)} onKeyDown={e => e.key === "Enter" && saveRename()} autoFocus />
                    <button onClick={saveRename} className="text-primary"><Check className="h-4 w-4" /></button>
                    <button onClick={() => setEditingIdx(null)} className="text-muted-foreground"><X className="h-4 w-4" /></button>
                  </div>
                ) : (
                  <>
                    <p className="font-medium text-sm truncate group-hover:text-primary transition-colors">📄 {doc.name}</p>
                    <div className="flex items-center gap-2 mt-1">
                      <span className="text-xs text-muted-foreground">{doc.date}</span>
                      <span className="text-xs px-2 py-0.5 rounded-full bg-secondary text-muted-foreground">{formatLang(doc.lang)}</span>
                    </div>
                  </>
                )}
              </div>
              <div className="flex items-center gap-2 ml-3">
                <span className="tag-success text-xs">{doc.status} ✓</span>
                <button onClick={() => setViewingDoc(doc)} className="text-muted-foreground hover:text-primary p-1" title="View document">
                  <Eye className="h-3.5 w-3.5" />
                </button>
                <button onClick={() => startRename(i)} className="text-muted-foreground hover:text-primary p-1" title="Rename">
                  <Pencil className="h-3.5 w-3.5" />
                </button>
                <AlertDialog>
                  <AlertDialogTrigger asChild>
                    <button className="text-muted-foreground hover:text-destructive p-1" title="Delete">
                      <Trash2 className="h-3.5 w-3.5" />
                    </button>
                  </AlertDialogTrigger>
                  <AlertDialogContent>
                    <AlertDialogHeader>
                      <AlertDialogTitle>Delete Document</AlertDialogTitle>
                      <AlertDialogDescription>
                        Are you sure you want to delete "{doc.name}"? This action cannot be undone.
                      </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                      <AlertDialogCancel>Cancel</AlertDialogCancel>
                      <AlertDialogAction onClick={() => onDelete(doc.id)} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">Delete</AlertDialogAction>
                    </AlertDialogFooter>
                  </AlertDialogContent>
                </AlertDialog>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Document Viewer Modal */}
      {viewingDoc && (
        <DocumentViewer
          document={viewingDoc}
          onClose={() => setViewingDoc(null)}
          mode="patient"
        />
      )}
    </div>
  );
}
