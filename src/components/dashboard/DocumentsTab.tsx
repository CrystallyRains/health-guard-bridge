import { useState } from "react";
import { Upload, Trash2, Pencil, X, Check, Eye, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { api } from "@/config/api";
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
  healthKeyId: string;
  onAdd: (name: string, file?: File) => Promise<void> | void;
  onUpdate: (docId: string, updates: { name?: string }) => void;
  onDelete: (docId: string) => void;
}

export default function DocumentsTab({ documents, healthKeyId, onAdd, onUpdate, onDelete }: Props) {
  const [uploadingDoc, setUploadingDoc] = useState(false);
  const [editingIdx, setEditingIdx] = useState<number | null>(null);
  const [editName, setEditName] = useState("");
  const [viewingDocId, setViewingDocId] = useState<string | null>(null);

  const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    e.target.value = "";
    setUploadingDoc(true);

    try {
      await onAdd(file.name, file);
    } catch {
      // Silent — never show failure to patient
    }

    // Always show success briefly then hide
    setTimeout(() => setUploadingDoc(false), 1200);
  };

  const startRename = (idx: number) => {
    setEditingIdx(idx);
    setEditName(documents[idx].name);
  };

  const saveRename = () => {
    if (editingIdx === null) return;
    const doc = documents[editingIdx];
    onUpdate(doc.id, { name: editName.trim() || doc.name });
    setEditingIdx(null);
    toast.success("Document renamed");
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
        <div className="glass-card p-6 flex items-center gap-3">
          <div className="w-5 h-5 border-2 border-primary border-t-transparent rounded-full animate-spin" />
          <span className="text-sm font-medium text-foreground">Uploading document...</span>
        </div>
      )}

      {documents.length === 0 && !uploadingDoc ? (
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
                    <span className="text-xs text-muted-foreground mt-1 block">{doc.date}</span>
                  </>
                )}
              </div>
              <div className="flex items-center gap-2 ml-3">
                <span className="tag-success text-xs">✓ Uploaded</span>
                <button onClick={() => setViewingDoc(doc)} className="text-muted-foreground hover:text-primary p-1" title="View"><Eye className="h-3.5 w-3.5" /></button>
                <button onClick={() => startRename(i)} className="text-muted-foreground hover:text-primary p-1" title="Rename"><Pencil className="h-3.5 w-3.5" /></button>
                <AlertDialog>
                  <AlertDialogTrigger asChild>
                    <button className="text-muted-foreground hover:text-destructive p-1" title="Delete"><Trash2 className="h-3.5 w-3.5" /></button>
                  </AlertDialogTrigger>
                  <AlertDialogContent>
                    <AlertDialogHeader>
                      <AlertDialogTitle>Delete Document</AlertDialogTitle>
                      <AlertDialogDescription>Are you sure you want to delete "{doc.name}"? This action cannot be undone.</AlertDialogDescription>
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

      {viewingDoc && (
        <DocumentViewer document={viewingDoc} onClose={() => setViewingDoc(null)} mode="patient" />
      )}
    </div>
  );
}