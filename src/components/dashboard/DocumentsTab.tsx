import { useState } from "react";
import { Upload, Trash2, Pencil, X, Check } from "lucide-react";
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

export interface DocumentDisplay {
  id: string;
  name: string;
  date: string;
  status: "Processed" | "Processing" | "Failed";
  lang: string;
}

interface Props {
  documents: DocumentDisplay[];
  onAdd: (name: string) => void;
  onUpdate: (docId: string, updates: { name?: string }) => void;
  onDelete: (docId: string) => void;
}

export default function DocumentsTab({ documents, onAdd, onUpdate, onDelete }: Props) {
  const [uploadingDoc, setUploadingDoc] = useState(false);
  const [uploadStep, setUploadStep] = useState(0);
  const [editingIdx, setEditingIdx] = useState<number | null>(null);
  const [editName, setEditName] = useState("");

  const simulateUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploadingDoc(true);
    setUploadStep(0);
    const steps = [1, 2, 3, 4];
    steps.forEach((s, i) => setTimeout(() => setUploadStep(s), (i + 1) * 1500));
    setTimeout(() => {
      setUploadingDoc(false);
      onAdd(file.name);
      toast.success("Document processed successfully");
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

  return (
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
            <div key={doc.id} className="glass-card p-4 flex items-center justify-between">
              <div className="flex-1 min-w-0">
                {editingIdx === i ? (
                  <div className="flex items-center gap-2">
                    <input className="input-field text-sm flex-1" value={editName} onChange={e => setEditName(e.target.value)} onKeyDown={e => e.key === "Enter" && saveRename()} autoFocus />
                    <button onClick={saveRename} className="text-primary"><Check className="h-4 w-4" /></button>
                    <button onClick={() => setEditingIdx(null)} className="text-muted-foreground"><X className="h-4 w-4" /></button>
                  </div>
                ) : (
                  <>
                    <p className="font-medium text-sm truncate">{doc.name}</p>
                    <p className="text-xs text-muted-foreground mt-1">{doc.date} · {doc.lang}</p>
                  </>
                )}
              </div>
              <div className="flex items-center gap-2 ml-3">
                <span className="tag-success text-xs">{doc.status} ✓</span>
                <button onClick={() => startRename(i)} className="text-muted-foreground hover:text-primary p-1">
                  <Pencil className="h-3.5 w-3.5" />
                </button>
                <AlertDialog>
                  <AlertDialogTrigger asChild>
                    <button className="text-muted-foreground hover:text-destructive p-1">
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
    </div>
  );
}
