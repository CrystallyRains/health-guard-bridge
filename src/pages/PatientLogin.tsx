import { useState } from "react";
import { useNavigate } from "react-router-dom";
import Navbar from "@/components/Navbar";
import FingerprintScanner from "@/components/FingerprintScanner";
import { KeyRound } from "lucide-react";

export default function PatientLogin() {
  const navigate = useNavigate();
  const [loginId, setLoginId] = useState("");
  const [password, setPassword] = useState("");
  const [scanning, setScanning] = useState(false);
  const [bioSuccess, setBioSuccess] = useState(false);

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    navigate("/patient/dashboard");
  };

  const handleBioLogin = () => {
    setScanning(true);
    setTimeout(() => {
      setScanning(false);
      setBioSuccess(true);
      setTimeout(() => navigate("/patient/dashboard"), 1000);
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
              placeholder="HealthKey ID or Phone Number"
              value={loginId}
              onChange={(e) => setLoginId(e.target.value)}
            />
            <input
              className="input-field"
              type="password"
              placeholder="Password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
            <button type="submit" className="btn-primary w-full">Login</button>
          </form>

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
