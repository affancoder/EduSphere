"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { LogIn, Mail, Key, Loader2, AlertCircle, Eye, EyeOff, CheckCircle2 } from "lucide-react";
import Card from "@/components/ui/Card";
import GoldButton from "@/components/ui/GoldButton";
import Link from "next/link";

export default function LoginPage() {
  const router = useRouter();
  const [formData, setFormData] = useState({
    email: "",
    password: "",
  });
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isMounted, setIsMounted] = useState(false);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    const email = formData.email.trim();
    const password = formData.password.trim();

    if (!email || !password) {
      setError("Please provide both email and password.");
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });

      const data = await res.json();

      if (res.ok) {
        // Successful login
        if (rememberMe) {
          localStorage.setItem("remembered_email", email);
        } else {
          localStorage.removeItem("remembered_email");
        }
        localStorage.setItem("isLoggedIn", "true");
        
        // Use window.location for a hard refresh to ensure middleware picks up the new cookie
        window.location.href = "/dashboard";
      } else {
        setError(data.error || "Authentication failed. Please check your credentials.");
      }
    } catch (err) {
      setError("Network error. Please ensure you are connected and try again.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    setIsMounted(true);
    const savedEmail = localStorage.getItem("remembered_email");
    if (savedEmail) {
      setFormData(prev => ({ ...prev, email: savedEmail }));
      setRememberMe(true);
    }
  }, []);

  if (!isMounted) return null;

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-6">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="w-full max-w-md"
      >
        <div className="text-center mb-8">
          <div className="inline-flex p-4 rounded-full bg-gold/10 mb-4">
            <LogIn className="w-8 h-8 text-gold" />
          </div>
          <h1 className="font-display text-4xl text-text-primary mb-2">Welcome <span className="text-gold italic">Back</span></h1>
          <p className="text-text-muted">Continue your journey in the sanctuary</p>
        </div>

        <Card className="p-8 bg-surface border-border-gold rounded-xl">
          <form onSubmit={handleLogin} className="space-y-6">
            {error && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                className="p-4 bg-red-500/10 border border-red-500/20 rounded-xl flex items-center gap-3 text-red-500"
              >
                <AlertCircle className="w-5 h-5 flex-shrink-0" />
                <p className="text-sm font-medium">{error}</p>
              </motion.div>
            )}

            <div>
              <label className="block text-sm font-medium text-gold mb-2 tracking-widest uppercase">
                Email Address
              </label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-text-muted" />
                <input
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  className="w-full bg-white/5 border border-white/10 rounded-xl pl-10 pr-4 py-3 text-sm focus:outline-none focus:border-gold/50 transition-colors text-text-primary"
                  placeholder="your@email.com"
                  required
                />
              </div>
            </div>

            <div>
              <div className="flex items-center justify-between mb-2">
                <label className="block text-xs font-bold text-gold tracking-widest uppercase">
                  Password
                </label>
                <Link 
                  href="/forgot-password" 
                  className="text-[10px] font-bold text-gold/60 hover:text-gold uppercase tracking-tighter transition-colors"
                >
                  Forgot Password?
                </Link>
              </div>
              <div className="relative">
                <Key className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-text-muted" />
                <input
                  type={showPassword ? "text" : "password"}
                  value={formData.password}
                  onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                  className="w-full bg-white/5 border border-white/10 rounded-xl pl-10 pr-12 py-3 text-sm focus:outline-none focus:border-gold/50 transition-colors text-text-primary"
                  placeholder="••••••••"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 p-1.5 text-text-muted hover:text-gold transition-colors"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            <div className="flex items-center">
              <label className="flex items-center gap-2 cursor-pointer group">
                <div className="relative">
                  <input
                    type="checkbox"
                    checked={rememberMe}
                    onChange={(e) => setRememberMe(e.target.checked)}
                    className="sr-only"
                  />
                  <div className={`w-4 h-4 border rounded border-gold/30 transition-all ${rememberMe ? 'bg-gold border-gold' : 'bg-white/5'}`}>
                    {rememberMe && <CheckCircle2 className="w-3 h-3 text-background absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2" />}
                  </div>
                </div>
                <span className="text-[11px] text-text-muted group-hover:text-text-primary transition-colors font-medium uppercase tracking-wider">Remember Me</span>
              </label>
            </div>

            <GoldButton className="w-full py-4 text-base" variant="filled" disabled={loading}>
              {loading ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin" />
                  <span>Authenticating...</span>
                </>
              ) : (
                "Login to Sanctuary"
              )}
            </GoldButton>
          </form>

          <div className="mt-8 text-center border-t border-white/5 pt-6">
            <p className="text-text-muted text-sm">
              New to EduSphere?{" "}
              <Link href="/signup" className="text-gold hover:underline">
                Create an account
              </Link>
            </p>
          </div>
        </Card>
      </motion.div>
    </div>
  );
}
