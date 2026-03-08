import { Link, useLocation } from "react-router-dom";
import { KeyRound, Menu, X } from "lucide-react";
import { useState } from "react";

export default function Navbar() {
  const [mobileOpen, setMobileOpen] = useState(false);
  const location = useLocation();
  const isLanding = location.pathname === "/";

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 glass-card border-b border-border/50 backdrop-blur-xl">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <Link to="/" className="flex items-center gap-2 group">
            <KeyRound className="h-6 w-6 text-primary transition-transform group-hover:rotate-12" />
            <span className="font-heading font-bold text-xl text-foreground">
              Health<span className="text-primary">Key</span>
            </span>
          </Link>

          <div className="hidden md:flex items-center gap-3">
            {isLanding && (
              <Link to="/about" className="text-muted-foreground hover:text-foreground transition-colors px-4 py-2 text-sm">
                How It Works
              </Link>
            )}
            <Link to="/patient-login" className="btn-secondary text-sm py-2">
              Patient Login
            </Link>
            <Link to="/clinician" className="btn-primary text-sm py-2">
              Clinician Access
            </Link>
          </div>

          <button className="md:hidden text-foreground" onClick={() => setMobileOpen(!mobileOpen)}>
            {mobileOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
          </button>
        </div>
      </div>

      {mobileOpen && (
        <div className="md:hidden glass-card border-t border-border/50 p-4 space-y-3">
          {isLanding && (
            <Link to="/about" className="block text-muted-foreground hover:text-foreground py-2" onClick={() => setMobileOpen(false)}>
              How It Works
            </Link>
          )}
          <Link to="/patient-login" className="block btn-secondary text-sm py-2 text-center" onClick={() => setMobileOpen(false)}>
            Patient Login
          </Link>
          <Link to="/clinician" className="block btn-primary text-sm py-2 text-center" onClick={() => setMobileOpen(false)}>
            Clinician Access
          </Link>
        </div>
      )}
    </nav>
  );
}
