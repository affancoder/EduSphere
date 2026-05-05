"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { LogIn, Mail, Key, Loader2, AlertCircle } from "lucide-react";
import Card from "@/components/ui/Card";
import GoldButton from "@/components/ui/GoldButton";
import Link from "next/link";

export default function LoginPage() {
  const router = useRouter();
  const [formData, setFormData] = useState({
    email: "",
    password: "",
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      const data = await res.json();

      if (res.ok) {
        // Successful login
        localStorage.setItem("isLoggedIn", "true");
        router.push("/dashboard");
        router.refresh();
      } else {
        setError(data.error || "Login failed. Please check your credentials.");
      }
    } catch (err) {
      setError("An unexpected error occurred. Please try again.");
    } finally {
      setLoading(false);
    }
  };

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
              <label className="block text-sm font-medium text-gold mb-2 tracking-widest uppercase">
                Password
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
                />
              </div>
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
