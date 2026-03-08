import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { Shield, Globe, Server, Database, Brain, MessageSquare, Lock, Zap, Cloud } from "lucide-react";

export default function About() {
  return (
    <div className="min-h-screen">
      <Navbar />

      <section className="pt-28 pb-16 px-4">
        <div className="max-w-4xl mx-auto">
          <h1 className="section-title text-center mb-4 animate-fade-up">How HealthKey Works</h1>
          <p className="text-center text-muted-foreground max-w-2xl mx-auto animate-fade-up-delay-1">
            From recognition by India's top institutions to a production-ready platform — here's the HealthKey journey.
          </p>
        </div>
      </section>


      {/* ABDM */}
      <section className="py-16 px-4 bg-card/30">
        <div className="max-w-3xl mx-auto text-center">
          <h2 className="section-title text-xl mb-6">ABDM Compatibility</h2>
          <p className="text-muted-foreground mb-8">
            HealthKey is designed to work alongside India's Ayushman Bharat Digital Mission (ABDM) infrastructure. 
            It complements the existing ABHA ID system by providing AI-powered emergency summaries and multilingual document processing, 
            bridging the gap between paper-based records and digital health infrastructure.
          </p>
          <div className="grid sm:grid-cols-3 gap-4">
            {[
              { icon: Shield, title: "ABHA Compatible", desc: "Links with existing ABHA health IDs" },
              { icon: Globe, title: "Multilingual", desc: "Supports 22+ Indian languages" },
              { icon: Lock, title: "DISHA Compliant", desc: "Follows Digital Health Data Protection" },
            ].map((f) => (
              <div key={f.title} className="glass-card p-5">
                <f.icon className="h-6 w-6 text-primary mx-auto mb-3" />
                <h3 className="font-heading font-semibold text-sm mb-1">{f.title}</h3>
                <p className="text-xs text-muted-foreground">{f.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Architecture */}
      <section className="py-16 px-4">
        <div className="max-w-4xl mx-auto">
          <h2 className="section-title text-xl text-center mb-10">AWS Architecture</h2>
          <div className="glass-card p-8">
            {/* Simple visual arch */}
            <div className="grid grid-cols-3 gap-4 text-center">
              {/* Frontend layer */}
              <div className="col-span-3 mb-4">
                <div className="bg-primary/10 border border-primary/30 rounded-lg p-4">
                  <Cloud className="h-5 w-5 text-primary mx-auto mb-2" />
                  <p className="font-heading font-semibold text-sm">AWS Amplify</p>
                  <p className="text-xs text-muted-foreground">Frontend Hosting + CI/CD</p>
                </div>
              </div>

              {/* Arrow */}
              <div className="col-span-3 text-primary text-2xl mb-2">↓</div>

              {/* API + Auth layer */}
              <div className="bg-secondary border border-border rounded-lg p-4">
                <Zap className="h-5 w-5 text-primary mx-auto mb-2" />
                <p className="font-heading font-semibold text-xs">Lambda</p>
                <p className="text-[10px] text-muted-foreground">API + Logic</p>
              </div>
              <div className="bg-secondary border border-border rounded-lg p-4">
                <Lock className="h-5 w-5 text-primary mx-auto mb-2" />
                <p className="font-heading font-semibold text-xs">Cognito</p>
                <p className="text-[10px] text-muted-foreground">Auth + Biometric</p>
              </div>
              <div className="bg-secondary border border-border rounded-lg p-4">
                <MessageSquare className="h-5 w-5 text-primary mx-auto mb-2" />
                <p className="font-heading font-semibold text-xs">SNS</p>
                <p className="text-[10px] text-muted-foreground">SMS Alerts</p>
              </div>

              {/* Arrow */}
              <div className="col-span-3 text-primary text-2xl my-2">↓</div>

              {/* Data + AI layer */}
              <div className="bg-secondary border border-border rounded-lg p-4">
                <Database className="h-5 w-5 text-primary mx-auto mb-2" />
                <p className="font-heading font-semibold text-xs">DynamoDB</p>
                <p className="text-[10px] text-muted-foreground">Patient Data</p>
              </div>
              <div className="bg-secondary border border-border rounded-lg p-4">
                <Brain className="h-5 w-5 text-primary mx-auto mb-2" />
                <p className="font-heading font-semibold text-xs">Bedrock</p>
                <p className="text-[10px] text-muted-foreground">AI Summary</p>
              </div>
              <div className="bg-secondary border border-border rounded-lg p-4">
                <Server className="h-5 w-5 text-primary mx-auto mb-2" />
                <p className="font-heading font-semibold text-xs">Textract + Translate</p>
                <p className="text-[10px] text-muted-foreground">Doc Processing</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
}
