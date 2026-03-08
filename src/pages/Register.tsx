import { useState } from "react";
import { useNavigate } from "react-router-dom";
import Navbar from "@/components/Navbar";
import TagInput from "@/components/TagInput";
import FingerprintScanner from "@/components/FingerprintScanner";
import { indianStates, bloodGroups } from "@/data/mockData";
import { Copy, Check, Plus, X } from "lucide-react";

export default function Register() {
  const navigate = useNavigate();
  const [step, setStep] = useState(1);
  const [healthKeyId, setHealthKeyId] = useState("");
  const [copied, setCopied] = useState(false);

  // Step 1
  const [name, setName] = useState("");
  const [age, setAge] = useState("");
  const [gender, setGender] = useState("");
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");
  const [blood, setBlood] = useState("");
  const [state, setState] = useState("");

  // Step 2
  const [allergies, setAllergies] = useState<string[]>([]);
  const [medications, setMedications] = useState<string[]>([]);
  const [conditions, setConditions] = useState<string[]>([]);
  const [surgeries, setSurgeries] = useState<{ name: string; date: string }[]>([]);
  const [contacts, setContacts] = useState<{ name: string; phone: string }[]>([{ name: "", phone: "" }]);
  const [toggles, setToggles] = useState({ allergies: true, medications: true, conditions: true, surgeries: true });

  // Step 3
  const [scanning, setScanning] = useState(false);
  const [bioSuccess, setBioSuccess] = useState(false);

  const generateId = () => {
    const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";
    const nums = "0123456789";
    const r = (s: string, n: number) => Array.from({ length: n }, () => s[Math.floor(Math.random() * s.length)]).join("");
    return `HK-${r(nums, 4)}-${r(chars, 4)}`;
  };

  const handleStep1 = (e: React.FormEvent) => {
    e.preventDefault();
    const id = generateId();
    setHealthKeyId(id);
    setStep(2);
  };

  const copyId = () => {
    navigator.clipboard.writeText(healthKeyId);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleScan = () => {
    setScanning(true);
    setTimeout(() => {
      setScanning(false);
      setBioSuccess(true);
    }, 2000);
  };

  return (
    <div className="min-h-screen">
      <Navbar />
      <div className="pt-24 pb-16 px-4 max-w-2xl mx-auto">
        {/* Progress */}
        <div className="flex items-center justify-center gap-2 mb-10">
          {[1, 2, 3].map((s) => (
            <div key={s} className="flex items-center gap-2">
              <div className={`w-10 h-10 rounded-full flex items-center justify-center font-heading font-semibold text-sm transition-all ${
                step >= s ? "bg-primary text-primary-foreground" : "bg-secondary text-muted-foreground"
              }`}>
                {s}
              </div>
              {s < 3 && <div className={`w-12 sm:w-20 h-0.5 ${step > s ? "bg-primary" : "bg-border"}`} />}
            </div>
          ))}
        </div>

        {healthKeyId && step >= 2 && (
          <div className="glass-card p-4 mb-8 flex items-center justify-between teal-glow">
            <div>
              <p className="text-xs text-muted-foreground">Your HealthKey ID</p>
              <p className="mono-id text-xl font-bold">{healthKeyId}</p>
            </div>
            <button onClick={copyId} className="btn-secondary py-2 px-3">
              {copied ? <Check className="h-4 w-4 text-primary" /> : <Copy className="h-4 w-4" />}
            </button>
          </div>
        )}

        {step === 1 && (
          <form onSubmit={handleStep1} className="glass-card p-8 space-y-5 animate-fade-up">
            <h2 className="section-title text-xl">Personal Information</h2>
            <input className="input-field" placeholder="Full Name" value={name} onChange={(e) => setName(e.target.value)} required />
            <div className="grid grid-cols-2 gap-4">
              <input className="input-field" placeholder="Age" type="number" value={age} onChange={(e) => setAge(e.target.value)} required />
              <select className="select-field" value={gender} onChange={(e) => setGender(e.target.value)} required>
                <option value="">Gender</option>
                <option>Male</option>
                <option>Female</option>
                <option>Other</option>
              </select>
            </div>
            <input className="input-field" placeholder="Phone Number" value={phone} onChange={(e) => setPhone(e.target.value)} required />
            <input className="input-field" placeholder="Email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} required />
            <div className="grid grid-cols-2 gap-4">
              <select className="select-field" value={blood} onChange={(e) => setBlood(e.target.value)} required>
                <option value="">Blood Group</option>
                {bloodGroups.map((b) => <option key={b}>{b}</option>)}
              </select>
              <select className="select-field" value={state} onChange={(e) => setState(e.target.value)} required>
                <option value="">State</option>
                {indianStates.map((s) => <option key={s}>{s}</option>)}
              </select>
            </div>
            <button type="submit" className="btn-primary w-full">Continue</button>
          </form>
        )}

        {step === 2 && (
          <div className="glass-card p-8 space-y-8 animate-fade-up">
            <h2 className="section-title text-xl">Critical Health Info</h2>

            {[
              { key: "allergies" as const, label: "Known Allergies", tags: allergies, setTags: setAllergies, variant: "allergy" as const },
              { key: "medications" as const, label: "Current Medications", tags: medications, setTags: setMedications, variant: "medication" as const },
              { key: "conditions" as const, label: "Existing Conditions", tags: conditions, setTags: setConditions, variant: "condition" as const },
            ].map((section) => (
              <div key={section.key}>
                <div className="flex items-center justify-between mb-2">
                  <label className="font-heading font-medium text-sm">{section.label}</label>
                  <label className="flex items-center gap-2 text-xs text-muted-foreground cursor-pointer">
                    <span>Include in emergency</span>
                    <button
                      type="button"
                      onClick={() => setToggles({ ...toggles, [section.key]: !toggles[section.key] })}
                      className={`w-10 h-5 rounded-full transition-colors relative ${toggles[section.key] ? "bg-primary" : "bg-border"}`}
                    >
                      <span className={`absolute top-0.5 w-4 h-4 rounded-full bg-foreground transition-transform ${toggles[section.key] ? "left-5" : "left-0.5"}`} />
                    </button>
                  </label>
                </div>
                <TagInput tags={section.tags} onChange={section.setTags} variant={section.variant} placeholder={`Add ${section.label.toLowerCase()}...`} />
              </div>
            ))}

            <div>
              <div className="flex items-center justify-between mb-2">
                <label className="font-heading font-medium text-sm">Recent Surgeries</label>
                <label className="flex items-center gap-2 text-xs text-muted-foreground cursor-pointer">
                  <span>Include in emergency</span>
                  <button
                    type="button"
                    onClick={() => setToggles({ ...toggles, surgeries: !toggles.surgeries })}
                    className={`w-10 h-5 rounded-full transition-colors relative ${toggles.surgeries ? "bg-primary" : "bg-border"}`}
                  >
                    <span className={`absolute top-0.5 w-4 h-4 rounded-full bg-foreground transition-transform ${toggles.surgeries ? "left-5" : "left-0.5"}`} />
                  </button>
                </label>
              </div>
              {surgeries.map((s, i) => (
                <div key={i} className="flex gap-2 mb-2">
                  <input className="input-field flex-1 text-sm" placeholder="Surgery name" value={s.name} onChange={(e) => { const arr = [...surgeries]; arr[i].name = e.target.value; setSurgeries(arr); }} />
                  <input className="input-field w-36 text-sm" placeholder="Date" value={s.date} onChange={(e) => { const arr = [...surgeries]; arr[i].date = e.target.value; setSurgeries(arr); }} />
                  <button type="button" onClick={() => setSurgeries(surgeries.filter((_, j) => j !== i))} className="text-muted-foreground hover:text-destructive"><X className="h-4 w-4" /></button>
                </div>
              ))}
              <button type="button" onClick={() => setSurgeries([...surgeries, { name: "", date: "" }])} className="text-primary text-sm flex items-center gap-1 hover:underline">
                <Plus className="h-3 w-3" /> Add surgery
              </button>
            </div>

            <div>
              <label className="font-heading font-medium text-sm mb-2 block">Emergency Contacts (up to 3)</label>
              {contacts.map((c, i) => (
                <div key={i} className="flex gap-2 mb-2">
                  <input className="input-field flex-1 text-sm" placeholder="Name" value={c.name} onChange={(e) => { const arr = [...contacts]; arr[i].name = e.target.value; setContacts(arr); }} />
                  <input className="input-field w-40 text-sm" placeholder="Phone" value={c.phone} onChange={(e) => { const arr = [...contacts]; arr[i].phone = e.target.value; setContacts(arr); }} />
                  {contacts.length > 1 && <button type="button" onClick={() => setContacts(contacts.filter((_, j) => j !== i))} className="text-muted-foreground hover:text-destructive"><X className="h-4 w-4" /></button>}
                </div>
              ))}
              {contacts.length < 3 && (
                <button type="button" onClick={() => setContacts([...contacts, { name: "", phone: "" }])} className="text-primary text-sm flex items-center gap-1 hover:underline">
                  <Plus className="h-3 w-3" /> Add contact
                </button>
              )}
            </div>

            <button onClick={() => setStep(3)} className="btn-primary w-full">Continue to Biometric Setup</button>
          </div>
        )}

        {step === 3 && (
          <div className="glass-card p-8 text-center space-y-8 animate-fade-up">
            <h2 className="section-title text-xl">Biometric Setup</h2>
            <p className="text-muted-foreground text-sm">Simulated fingerprint registration for emergency identification</p>
            <FingerprintScanner scanning={scanning} success={bioSuccess} onScan={handleScan} />
            {bioSuccess && (
              <button onClick={() => navigate("/patient/dashboard")} className="btn-primary w-full animate-fade-up">
                Go to Dashboard
              </button>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
