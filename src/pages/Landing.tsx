import { Link } from "react-router-dom";
import { Shield, Zap, Globe, UserPlus, Upload, Stethoscope, Brain } from "lucide-react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";

const features = [
  { icon: Shield, title: "Patient Control", desc: "You decide what data doctors can see. Toggle privacy controls for each category — allergies, medications, conditions, surgeries." },
  { icon: Zap, title: "Emergency Access", desc: "Doctors get time-limited, consent-based access. 30-minute sessions. Family notified instantly via SMS." },
  { icon: Globe, title: "Multilingual AI", desc: "Documents in Marathi, Tamil, Telugu, Hindi? Our AI translates and extracts critical info automatically." },
];

const steps = [
  { icon: UserPlus, step: "01", title: "Register", desc: "Create your HealthKey ID with biometric verification" },
  { icon: Upload, step: "02", title: "Upload Docs", desc: "Upload prescriptions, reports, discharge summaries in any language" },
  { icon: Stethoscope, step: "03", title: "Doctor Requests", desc: "Clinicians request emergency access with their credentials" },
  { icon: Brain, step: "04", title: "AI Summary", desc: "AI generates a clinical summary from your consented data" },
];

export default function Landing() {
  return (
    <div className="min-h-screen">
      <Navbar />

      {/* Hero */}
      <section className="pt-32 pb-20 px-4 relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-b from-primary/5 via-transparent to-transparent pointer-events-none" />
        <div className="max-w-5xl mx-auto text-center relative">
          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-heading font-bold leading-tight animate-fade-up">
            Your Medical History.
            <br />
            <span className="text-primary">Always Ready.</span> Always Private.
          </h1>
          <p className="mt-6 text-lg text-muted-foreground max-w-2xl mx-auto animate-fade-up-delay-1">
            India's medical records are fragmented across hospitals, languages, and paper files. When a patient is unconscious, critical data is lost. HealthKey fixes this with AI-powered emergency access.
          </p>
          <div className="mt-10 flex flex-col sm:flex-row items-center justify-center gap-4 animate-fade-up-delay-2">
            <Link to="/register" className="btn-primary text-base px-8 py-4">
              Get Your HealthKey ID
            </Link>
            <Link to="/clinician" className="btn-secondary text-base px-8 py-4">
              Clinician Portal
            </Link>
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="py-20 px-4">
        <div className="max-w-6xl mx-auto">
          <h2 className="section-title text-center mb-12">Why HealthKey?</h2>
          <div className="grid md:grid-cols-3 gap-6">
            {features.map((f, i) => (
              <div key={f.title} className={`glass-card-hover p-8 animate-fade-up-delay-${Math.min(i + 1, 3)}`}>
                <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center mb-4">
                  <f.icon className="h-6 w-6 text-primary" />
                </div>
                <h3 className="font-heading font-semibold text-lg mb-2">{f.title}</h3>
                <p className="text-muted-foreground text-sm leading-relaxed">{f.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section className="py-20 px-4 bg-card/30">
        <div className="max-w-6xl mx-auto">
          <h2 className="section-title text-center mb-16">How It Works</h2>
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-8">
            {steps.map((s) => (
              <div key={s.step} className="text-center group">
                <div className="w-16 h-16 mx-auto rounded-full bg-secondary border border-border flex items-center justify-center mb-4 group-hover:border-primary/50 group-hover:bg-primary/10 transition-all duration-300">
                  <s.icon className="h-7 w-7 text-primary" />
                </div>
                <span className="font-mono text-primary/60 text-xs">{s.step}</span>
                <h3 className="font-heading font-semibold mt-1 mb-2">{s.title}</h3>
                <p className="text-muted-foreground text-sm">{s.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
}
