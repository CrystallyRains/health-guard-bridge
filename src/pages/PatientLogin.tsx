import { useState } from "react";
import { useNavigate } from "react-router-dom";
import Navbar from "@/components/Navbar";
import FingerprintScanner from "@/components/FingerprintScanner";
import { KeyRound, Sparkles } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { toast } from "sonner";

const DEMO_EMAIL = "demo@healthkey.in";
const DEMO_PASSWORD = "demo123456";

export default function PatientLogin() {
  const navigate = useNavigate();
  const { signIn, user } = useAuth();
  const [loginId, setLoginId] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [scanning, setScanning] = useState(false);
  const [bioSuccess, setBioSuccess] = useState(false);

  // If already logged in, redirect
  if (user) {
    navigate("/patient/dashboard", { replace: true });
    return null;
  }

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    // Use email directly or treat HealthKey ID login
    const email = loginId.includes("@") ? loginId : loginId; // For now, require email
    if (!loginId.includes("@")) {
      toast.error("Please use your registered email to login");
      setLoading(false);
      return;
    }

    const { error } = await signIn(email, password);
    if (error) {
      toast.error(error.message);
    } else {
      toast.success("Welcome back!");
      navigate("/patient/dashboard");
    }
    setLoading(false);
  };

  const handleTryDemo = () => {
    setLoginId(DEMO_EMAIL);
    setPassword(DEMO_PASSWORD);
    toast.info("Demo credentials filled! Click Login to continue.");
  };

  const handleBioLogin = () => {
    setScanning(true);
    setTimeout(() => {
      setScanning(false);
      setBioSuccess(true);
      toast.info("Biometric login is simulated. Please use email & password.");
    }, 2000);
  };

  return (
    <div className="min-h-screen">
      <Navbar />
      <div className="pt-32 pb-16 px-4 max-w-md mx-auto">
        <div className="glass-card p-8 animate-fade-up">
          <div className="text-center mb-8">
            <div className="w-16 h-16 mx-auto rounded-full bg-primary/10 flex items-center justify-center mb-4">
              <KeyRound className="h-8 w-8 text-primary" />
            </div>
            <h1 className="font-heading font-bold text-2xl">Patient Login</h1>
            <p className="text-muted-foreground text-sm mt-1">Access your HealthKey dashboard</p>
          </div>

          <form onSubmit={handleLogin} className="space-y-4">
            <input
              className="input-field"
              placeholder="HealthKey ID or Email"
              type="text"
              value={loginId}
              onChange={(e) => setLoginId(e.target.value)}
              required
            />
            <input
              className="input-field"
              type="password"
              placeholder="Password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
            <button type="submit" className="btn-primary w-full" disabled={loading}>
              {loading ? "Signing in..." : "Login"}
            </button>
          </form>

          {/* Try Demo */}
          <button
            onClick={handleTryDemo}
            className="w-full mt-3 flex items-center justify-center gap-2 py-2.5 rounded-lg border border-primary/30 text-primary text-sm font-medium hover:bg-primary/5 transition-colors"
          >
            <Sparkles className="h-4 w-4" />
            Try Demo
          </button>

          <div className="relative my-8">
            <div className="absolute inset-0 flex items-center"><div className="w-full border-t border-border" /></div>
            <div className="relative flex justify-center"><span className="bg-card px-3 text-xs text-muted-foreground">OR</span></div>
          </div>

          <FingerprintScanner scanning={scanning} success={bioSuccess} onScan={handleBioLogin} label="Login with Biometric" />

          <p className="text-center text-sm text-muted-foreground mt-6">
            Don't have an account?{" "}
            <a href="/register" className="text-primary hover:underline">Register here</a>
          </p>
        </div>
      </div>
    </div>
  );
}
