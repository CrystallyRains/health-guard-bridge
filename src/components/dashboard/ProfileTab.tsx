import { useState } from "react";
import { Copy, Check, Pencil, X, Plus, Save } from "lucide-react";
import TagInput from "@/components/TagInput";
import { bloodGroups, indianStates } from "@/data/mockData";
import { toast } from "sonner";

interface PatientData {
  id: string;
  name: string;
  age: number;
  gender: string;
  phone: string;
  email: string;
  blood: string;
  state: string;
  allergies: string[];
  medications: string[];
  conditions: string[];
  surgeries: { name: string; date: string }[];
  emergencyContacts: { name: string; relation: string; phone: string }[];
  privacyToggles: { allergies: boolean; medications: boolean; conditions: boolean; surgeries: boolean };
}

interface Props {
  patient: PatientData;
  onUpdate: (patient: PatientData) => void;
}

const Toggle = ({ on, onToggle }: { on: boolean; onToggle: () => void }) => (
  <button
    type="button"
    onClick={onToggle}
    className={`w-10 h-5 rounded-full transition-colors relative ${on ? "bg-primary" : "bg-border"}`}
  >
    <span className={`absolute top-0.5 w-4 h-4 rounded-full bg-foreground transition-transform ${on ? "left-5" : "left-0.5"}`} />
  </button>
);

export default function ProfileTab({ patient, onUpdate }: Props) {
  const [copied, setCopied] = useState(false);
  const [editingSection, setEditingSection] = useState<string | null>(null);

  // Edit state for personal info
  const [editName, setEditName] = useState(patient.name);
  const [editAge, setEditAge] = useState(String(patient.age));
  const [editGender, setEditGender] = useState(patient.gender);
  const [editBlood, setEditBlood] = useState(patient.blood);
  const [editState, setEditState] = useState(patient.state);

  // Edit state for surgeries
  const [editSurgeries, setEditSurgeries] = useState(patient.surgeries);

  // Edit state for contacts
  const [editContacts, setEditContacts] = useState(patient.emergencyContacts);

  const copyId = () => {
    navigator.clipboard.writeText(patient.id);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const startEdit = (section: string) => {
    setEditingSection(section);
    if (section === "personal") {
      setEditName(patient.name);
      setEditAge(String(patient.age));
      setEditGender(patient.gender);
      setEditBlood(patient.blood);
      setEditState(patient.state);
    } else if (section === "surgeries") {
      setEditSurgeries([...patient.surgeries]);
    } else if (section === "contacts") {
      setEditContacts([...patient.emergencyContacts]);
    }
  };

  const saveSection = (section: string) => {
    let updated = { ...patient };
    if (section === "personal") {
      updated = { ...updated, name: editName, age: Number(editAge), gender: editGender, blood: editBlood, state: editState };
    } else if (section === "surgeries") {
      updated = { ...updated, surgeries: editSurgeries.filter(s => s.name.trim()) };
    } else if (section === "contacts") {
      updated = { ...updated, emergencyContacts: editContacts.filter(c => c.name.trim()) };
    }
    onUpdate(updated);
    setEditingSection(null);
    toast.success("Profile updated successfully");
  };

  const SectionHeader = ({ title, section }: { title: string; section: string }) => (
    <div className="flex items-center justify-between mb-3">
      <h3 className="font-heading font-semibold text-sm flex items-center gap-2">{title}</h3>
      {editingSection === section ? (
        <div className="flex gap-2">
          <button onClick={() => setEditingSection(null)} className="text-muted-foreground hover:text-foreground text-xs flex items-center gap-1">
            <X className="h-3 w-3" /> Cancel
          </button>
          <button onClick={() => saveSection(section)} className="text-primary hover:underline text-xs flex items-center gap-1">
            <Save className="h-3 w-3" /> Save
          </button>
        </div>
      ) : (
        <button onClick={() => startEdit(section)} className="text-muted-foreground hover:text-primary text-xs flex items-center gap-1">
          <Pencil className="h-3 w-3" /> Edit
        </button>
      )}
    </div>
  );

  return (
    <div className="max-w-4xl space-y-6 animate-fade-up">
      {/* ID Card */}
      <div className="glass-card p-6 flex items-center justify-between teal-glow">
        <div>
          <p className="text-xs text-muted-foreground mb-1">HealthKey ID</p>
          <p className="mono-id text-2xl font-bold">{patient.id}</p>
          {editingSection === "personal" ? (
            <div className="mt-3 space-y-2">
              <input className="input-field text-sm" placeholder="Full Name" value={editName} onChange={e => setEditName(e.target.value)} />
              <div className="grid grid-cols-3 gap-2">
                <input className="input-field text-sm" placeholder="Age" type="number" value={editAge} onChange={e => setEditAge(e.target.value)} />
                <select className="select-field text-sm" value={editGender} onChange={e => setEditGender(e.target.value)}>
                  <option>Male</option><option>Female</option><option>Other</option>
                </select>
                <select className="select-field text-sm" value={editState} onChange={e => setEditState(e.target.value)}>
                  {indianStates.map(s => <option key={s}>{s}</option>)}
                </select>
              </div>
              <div className="flex gap-2 justify-end">
                <button onClick={() => setEditingSection(null)} className="btn-secondary text-xs py-1 px-3">Cancel</button>
                <button onClick={() => saveSection("personal")} className="btn-primary text-xs py-1 px-3">Save</button>
              </div>
            </div>
          ) : (
            <div className="flex items-center gap-2 mt-1">
              <p className="text-sm text-muted-foreground">{patient.name} · {patient.age}y · {patient.gender} · {patient.state}</p>
              <button onClick={() => startEdit("personal")} className="text-muted-foreground hover:text-primary">
                <Pencil className="h-3 w-3" />
              </button>
            </div>
          )}
        </div>
        <button onClick={copyId} className="btn-secondary py-2 px-3">
          {copied ? <Check className="h-4 w-4 text-primary" /> : <Copy className="h-4 w-4" />}
        </button>
      </div>

      {/* Critical Info Grid */}
      <div className="grid sm:grid-cols-2 gap-4">
        <div className="glass-card p-5">
          <SectionHeader title="🚨 Allergies" section="allergies" />
          {editingSection === "allergies" ? (
            <div>
              <TagInput tags={patient.allergies} onChange={tags => onUpdate({ ...patient, allergies: tags })} variant="allergy" placeholder="Add allergy..." />
              <button onClick={() => setEditingSection(null)} className="text-primary text-xs mt-2 hover:underline">Done</button>
            </div>
          ) : (
            <div className="flex flex-wrap gap-2">
              {patient.allergies.length > 0 ? patient.allergies.map(a => <span key={a} className="tag-allergy">{a}</span>) : <span className="text-xs text-muted-foreground">No allergies added</span>}
            </div>
          )}
        </div>

        <div className="glass-card p-5">
          <SectionHeader title="💊 Medications" section="medications" />
          {editingSection === "medications" ? (
            <div>
              <TagInput tags={patient.medications} onChange={tags => onUpdate({ ...patient, medications: tags })} variant="medication" placeholder="Add medication..." />
              <button onClick={() => setEditingSection(null)} className="text-primary text-xs mt-2 hover:underline">Done</button>
            </div>
          ) : (
            <div className="flex flex-wrap gap-2">
              {patient.medications.length > 0 ? patient.medications.map(m => <span key={m} className="tag-medication">{m}</span>) : <span className="text-xs text-muted-foreground">No medications added</span>}
            </div>
          )}
        </div>

        <div className="glass-card p-5">
          <SectionHeader title="🫀 Conditions" section="conditions" />
          {editingSection === "conditions" ? (
            <div>
              <TagInput tags={patient.conditions} onChange={tags => onUpdate({ ...patient, conditions: tags })} variant="condition" placeholder="Add condition..." />
              <button onClick={() => setEditingSection(null)} className="text-primary text-xs mt-2 hover:underline">Done</button>
            </div>
          ) : (
            <div className="flex flex-wrap gap-2">
              {patient.conditions.length > 0 ? patient.conditions.map(c => <span key={c} className="tag-condition">{c}</span>) : <span className="text-xs text-muted-foreground">No conditions added</span>}
            </div>
          )}
        </div>

        <div className="glass-card p-5">
          <div className="flex items-center justify-between mb-3">
            <h3 className="font-heading font-semibold text-sm">🩸 Blood Group</h3>
            {editingSection === "blood" ? (
              <div className="flex gap-2">
                <button onClick={() => setEditingSection(null)} className="text-muted-foreground text-xs">Cancel</button>
                <button onClick={() => setEditingSection(null)} className="text-primary text-xs">Done</button>
              </div>
            ) : (
              <button onClick={() => startEdit("blood")} className="text-muted-foreground hover:text-primary text-xs flex items-center gap-1">
                <Pencil className="h-3 w-3" /> Edit
              </button>
            )}
          </div>
          {editingSection === "blood" ? (
            <select className="select-field" value={patient.blood} onChange={e => onUpdate({ ...patient, blood: e.target.value })}>
              {bloodGroups.map(b => <option key={b}>{b}</option>)}
            </select>
          ) : (
            <div className="text-center">
              <p className="text-4xl font-heading font-bold text-red-400">{patient.blood}</p>
            </div>
          )}
        </div>
      </div>

      {/* Surgeries */}
      <div className="glass-card p-5">
        <SectionHeader title="🔪 Recent Surgeries" section="surgeries" />
        {editingSection === "surgeries" ? (
          <div className="space-y-2">
            {editSurgeries.map((s, i) => (
              <div key={i} className="flex gap-2">
                <input className="input-field flex-1 text-sm" placeholder="Surgery name" value={s.name} onChange={e => { const arr = [...editSurgeries]; arr[i] = { ...arr[i], name: e.target.value }; setEditSurgeries(arr); }} />
                <input className="input-field w-36 text-sm" placeholder="Date" value={s.date} onChange={e => { const arr = [...editSurgeries]; arr[i] = { ...arr[i], date: e.target.value }; setEditSurgeries(arr); }} />
                <button onClick={() => setEditSurgeries(editSurgeries.filter((_, j) => j !== i))} className="text-muted-foreground hover:text-destructive"><X className="h-4 w-4" /></button>
              </div>
            ))}
            <button onClick={() => setEditSurgeries([...editSurgeries, { name: "", date: "" }])} className="text-primary text-sm flex items-center gap-1 hover:underline">
              <Plus className="h-3 w-3" /> Add surgery
            </button>
          </div>
        ) : (
          <div className="space-y-2">
            {patient.surgeries.length > 0 ? patient.surgeries.map((s, i) => (
              <div key={i} className="flex justify-between text-sm">
                <span>{s.name}</span>
                <span className="text-muted-foreground">{s.date}</span>
              </div>
            )) : <span className="text-xs text-muted-foreground">No surgeries recorded</span>}
          </div>
        )}
      </div>

      {/* Emergency Contacts */}
      <div className="glass-card p-5">
        <SectionHeader title="📞 Emergency Contacts" section="contacts" />
        {editingSection === "contacts" ? (
          <div className="space-y-2">
            {editContacts.map((c, i) => (
              <div key={i} className="flex gap-2">
                <input className="input-field flex-1 text-sm" placeholder="Name" value={c.name} onChange={e => { const arr = [...editContacts]; arr[i] = { ...arr[i], name: e.target.value }; setEditContacts(arr); }} />
                <input className="input-field w-28 text-sm" placeholder="Relation" value={c.relation} onChange={e => { const arr = [...editContacts]; arr[i] = { ...arr[i], relation: e.target.value }; setEditContacts(arr); }} />
                <input className="input-field w-40 text-sm" placeholder="Phone" value={c.phone} onChange={e => { const arr = [...editContacts]; arr[i] = { ...arr[i], phone: e.target.value }; setEditContacts(arr); }} />
                {editContacts.length > 1 && <button onClick={() => setEditContacts(editContacts.filter((_, j) => j !== i))} className="text-muted-foreground hover:text-destructive"><X className="h-4 w-4" /></button>}
              </div>
            ))}
            {editContacts.length < 3 && (
              <button onClick={() => setEditContacts([...editContacts, { name: "", relation: "", phone: "" }])} className="text-primary text-sm flex items-center gap-1 hover:underline">
                <Plus className="h-3 w-3" /> Add contact
              </button>
            )}
          </div>
        ) : (
          <div className="space-y-2">
            {patient.emergencyContacts.map(c => (
              <div key={c.name} className="flex justify-between text-sm">
                <span>{c.name} <span className="text-muted-foreground">({c.relation})</span></span>
                <span className="font-mono text-muted-foreground">{c.phone}</span>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Privacy Controls */}
      <div className="glass-card p-5">
        <h3 className="font-heading font-semibold text-sm mb-4">🔒 Privacy Controls</h3>
        <p className="text-xs text-muted-foreground mb-4">Toggle OFF to hide from emergency summaries</p>
        <div className="space-y-3">
          {(["allergies", "medications", "conditions", "surgeries"] as const).map(key => (
            <div key={key} className="flex items-center justify-between">
              <span className="text-sm capitalize">{key}</span>
              <Toggle on={patient.privacyToggles[key]} onToggle={() => onUpdate({ ...patient, privacyToggles: { ...patient.privacyToggles, [key]: !patient.privacyToggles[key] } })} />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
