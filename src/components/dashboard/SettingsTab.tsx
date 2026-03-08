import { useState } from "react";
import { Trash2, Plus, X, Save } from "lucide-react";
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

interface PatientData {
  phone: string;
  email: string;
  emergencyContacts: { name: string; relation: string; phone: string }[];
}

interface Props {
  patient: PatientData;
  onUpdate: (updates: Partial<PatientData>) => void;
  onDelete: () => void;
}

export default function SettingsTab({ patient, onUpdate, onDelete }: Props) {
  const [phone, setPhone] = useState(patient.phone);
  const [email, setEmail] = useState(patient.email);
  const [contacts, setContacts] = useState(patient.emergencyContacts);
  const [editingContacts, setEditingContacts] = useState(false);

  const saveInfo = () => {
    onUpdate({ phone, email });
    toast.success("Settings saved");
  };

  const saveContacts = () => {
    onUpdate({ emergencyContacts: contacts.filter(c => c.name.trim()) });
    setEditingContacts(false);
    toast.success("Emergency contacts updated");
  };

  return (
    <div className="max-w-lg space-y-6 animate-fade-up">
      <h2 className="section-title text-xl">Settings</h2>

      <div className="glass-card p-6 space-y-4">
        <div>
          <label className="text-sm text-muted-foreground">Phone Number</label>
          <input className="input-field mt-1" value={phone} onChange={e => setPhone(e.target.value)} />
        </div>
        <div>
          <label className="text-sm text-muted-foreground">Email</label>
          <input className="input-field mt-1" value={email} onChange={e => setEmail(e.target.value)} />
        </div>
        <button onClick={saveInfo} className="btn-primary w-full flex items-center justify-center gap-2">
          <Save className="h-4 w-4" /> Save Changes
        </button>
      </div>

      <div className="glass-card p-6">
        <div className="flex items-center justify-between mb-3">
          <h3 className="font-heading font-semibold text-sm">Emergency Contacts</h3>
          {editingContacts ? (
            <div className="flex gap-2">
              <button onClick={() => { setContacts(patient.emergencyContacts); setEditingContacts(false); }} className="text-muted-foreground text-xs">Cancel</button>
              <button onClick={saveContacts} className="text-primary text-xs flex items-center gap-1"><Save className="h-3 w-3" /> Save</button>
            </div>
          ) : (
            <button onClick={() => setEditingContacts(true)} className="text-primary text-xs hover:underline">Edit</button>
          )}
        </div>
        {editingContacts ? (
          <div className="space-y-2">
            {contacts.map((c, i) => (
              <div key={i} className="flex gap-2">
                <input className="input-field flex-1 text-sm" placeholder="Name" value={c.name} onChange={e => { const arr = [...contacts]; arr[i] = { ...arr[i], name: e.target.value }; setContacts(arr); }} />
                <input className="input-field w-24 text-sm" placeholder="Relation" value={c.relation} onChange={e => { const arr = [...contacts]; arr[i] = { ...arr[i], relation: e.target.value }; setContacts(arr); }} />
                <input className="input-field w-36 text-sm" placeholder="Phone" value={c.phone} onChange={e => { const arr = [...contacts]; arr[i] = { ...arr[i], phone: e.target.value }; setContacts(arr); }} />
                {contacts.length > 1 && <button onClick={() => setContacts(contacts.filter((_, j) => j !== i))} className="text-muted-foreground hover:text-destructive"><X className="h-4 w-4" /></button>}
              </div>
            ))}
            {contacts.length < 3 && (
              <button onClick={() => setContacts([...contacts, { name: "", relation: "", phone: "" }])} className="text-primary text-sm flex items-center gap-1 hover:underline">
                <Plus className="h-3 w-3" /> Add contact
              </button>
            )}
          </div>
        ) : (
          contacts.map(c => (
            <div key={c.name} className="flex justify-between text-sm py-2 border-b border-border/50 last:border-0">
              <span>{c.name} ({c.relation})</span>
              <span className="font-mono text-muted-foreground">{c.phone}</span>
            </div>
          ))
        )}
      </div>

      <div className="glass-card p-6 border-red-500/20">
        <h3 className="font-heading font-semibold text-sm text-red-400 mb-2">Danger Zone</h3>
        <p className="text-xs text-muted-foreground mb-4">Permanently delete your HealthKey account and all associated data.</p>
        <AlertDialog>
          <AlertDialogTrigger asChild>
            <button className="btn-destructive w-full flex items-center justify-center gap-2">
              <Trash2 className="h-4 w-4" /> Delete Account
            </button>
          </AlertDialogTrigger>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Delete Account</AlertDialogTitle>
              <AlertDialogDescription>
                This will permanently delete your HealthKey account, all health records, documents, and access logs. This action cannot be undone.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Cancel</AlertDialogCancel>
              <AlertDialogAction onClick={onDelete} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">Delete Forever</AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </div>
    </div>
  );
}
