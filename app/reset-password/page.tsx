"use client";

import { useState, useEffect, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { motion } from "framer-motion";
import { Lock, Loader2, AlertCircle, CheckCircle2, Key } from "lucide-react";
import Card from "@/components/ui/Card";
import GoldButton from "@/components/ui/GoldButton";
import Link from "next/link";

function ResetPasswordForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const token = searchParams.get("token");

  const [formData, setFormData] = useState({
    password: "",
    confirmPassword: "",
  });
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);

  useEffect(() => {
    if (!token) {
      setMessage({ type: "error", text: "Invalid or missing reset token. Please request a new one." });
    }
  }, [token]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (formData.password !== formData.confirmPassword) {
      setMessage({ type: "error", text: "Passwords do not match" });
      return;
    }

    setLoading(true);
    setMessage(null);

    try {
      const res = await fetch("/api/auth/reset-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ token, password: formData.password }),
      });

      const data = await res.json();

      if (res.ok) {
        setMessage({ type: "success", text: "Your password has been updated successfully." });
        setTimeout(() => router.push("/login"), 3000);
      } else {
        setMessage({ type: "error", text: data.error || "Reset failed" });
      }
    } catch (err) {
      setMessage({ type: "error", text: "Failed to connect to server" });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card className="p-8 bg-surface border-border-gold rounded-xl">
      {message?.type === "success" ? (
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="p-6 rounded-xl text-center bg-emerald-500/10 border border-emerald-500/20 text-emerald-500"
        >
          <CheckCircle2 className="w-12 h-12 mx-auto mb-4" />
          <h3 className="font-display text-xl mb-2">Success!</h3>
          <p className="text-sm opacity-80 mb-6">{message.text}</p>
          <p className="text-xs text-text-muted italic">Redirecting to login...</p>
        </motion.div>
      ) : (
        <form onSubmit={handleSubmit} className="space-y-6">
          {message?.type === "error" && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              className="p-4 bg-red-500/10 border border-red-500/20 rounded-xl flex items-center gap-3 text-red-500"
            >
              <AlertCircle className="w-5 h-5 flex-shrink-0" />
              <p className="text-sm font-medium">{message.text}</p>
            </motion.div>
          )}

          {!token ? (
            <Link href="/forgot-password" title="Request New Link">
              <GoldButton variant="filled" className="w-full">Request New Link</GoldButton>
            </Link>
          ) : (
            <>
              <div>
                <label className="block text-xs font-bold text-gold mb-2 tracking-widest uppercase">
                  New Password
                </label>
                <div className="relative">
                  <Key className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-text-muted" />
                  <input
                    type="password"
                    value={formData.password}
                    onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                    className="w-full bg-white/5 border border-white/10 rounded-xl pl-10 pr-4 py-3 text-sm focus:outline-none focus:border-gold/50 transition-colors text-text-primary"
                    placeholder="••••••••"
                    required
                    minLength={6}
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-gold mb-2 tracking-widest uppercase">
                  Confirm Password
                </label>
                <div className="relative">
                  <Key className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-text-muted" />
                  <input
                    type="password"
                    value={formData.confirmPassword}
                    onChange={(e) => setFormData({ ...formData, confirmPassword: e.target.value })}
                    className="w-full bg-white/5 border border-white/10 rounded-xl pl-10 pr-4 py-3 text-sm focus:outline-none focus:border-gold/50 transition-colors text-text-primary"
                    placeholder="••••••••"
                    required
                    minLength={6}
                  />
                </div>
              </div>

              <GoldButton className="w-full py-4 text-base" variant="filled" disabled={loading || !token}>
                {loading ? (
                  <>
                    <Loader2 className="w-5 h-5 animate-spin" />
                    <span>Updating Password...</span>
                  </>
                ) : (
                  "Reset Password"
                )}
              </GoldButton>
            </>
          )}
        </form>
      )}
    </Card>
  );
}

export default function ResetPasswordPage() {
  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-6">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="w-full max-w-md"
      >
        <div className="text-center mb-8">
          <div className="inline-flex p-4 rounded-full bg-gold/10 mb-4">
            <Lock className="w-8 h-8 text-gold" />
          </div>
          <h1 className="font-display text-4xl text-text-primary mb-2">Secure <span className="text-gold italic">Reset</span></h1>
          <p className="text-text-muted text-sm">Choose a strong new password for your sanctuary account.</p>
        </div>

        <Suspense fallback={
          <Card className="p-12 bg-surface border-border-gold flex flex-col items-center justify-center">
            <Loader2 className="w-10 h-10 text-gold animate-spin mb-4" />
            <p className="text-text-muted text-xs animate-pulse uppercase tracking-widest">Validating Token...</p>
          </Card>
        }>
          <ResetPasswordForm />
        </Suspense>
      </motion.div>
    </div>
  );
}
