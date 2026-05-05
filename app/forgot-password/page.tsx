"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { Mail, Loader2, AlertCircle, CheckCircle2, ChevronLeft } from "lucide-react";
import Card from "@/components/ui/Card";
import GoldButton from "@/components/ui/GoldButton";
import Link from "next/link";

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setMessage(null);

    try {
      const res = await fetch("/api/auth/forgot-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });

      const data = await res.json();

      if (res.ok) {
        setMessage({ type: "success", text: data.message });
      } else {
        setMessage({ type: "error", text: data.error || "Something went wrong" });
      }
    } catch (err) {
      setMessage({ type: "error", text: "Failed to connect to server" });
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
        <Link href="/login" className="inline-flex items-center gap-2 text-text-muted hover:text-gold transition-colors mb-8 group">
          <ChevronLeft className="w-4 h-4 transition-transform group-hover:-translate-x-1" />
          Back to Login
        </Link>

        <div className="text-center mb-8">
          <div className="inline-flex p-4 rounded-full bg-gold/10 mb-4">
            <Mail className="w-8 h-8 text-gold" />
          </div>
          <h1 className="font-display text-4xl text-text-primary mb-2">Forgot <span className="text-gold italic">Password?</span></h1>
          <p className="text-text-muted text-sm">Enter your email and we'll send you a recovery link.</p>
        </div>

        <Card className="p-8 bg-surface border-border-gold rounded-xl">
          {message ? (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className={`p-6 rounded-xl text-center ${
                message.type === "success" 
                  ? "bg-emerald-500/10 border border-emerald-500/20 text-emerald-500" 
                  : "bg-red-500/10 border border-red-500/20 text-red-500"
              }`}
            >
              {message.type === "success" ? (
                <CheckCircle2 className="w-12 h-12 mx-auto mb-4" />
              ) : (
                <AlertCircle className="w-12 h-12 mx-auto mb-4" />
              )}
              <h3 className="font-display text-xl mb-2">{message.type === "success" ? "Check Your Email" : "Error"}</h3>
              <p className="text-sm opacity-80 mb-6">{message.text}</p>
              {message.type === "success" && (
                <GoldButton variant="ghost" className="w-full" onClick={() => setMessage(null)}>
                  Try another email
                </GoldButton>
              )}
            </motion.div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-6">
              <div>
                <label className="block text-xs font-bold text-gold mb-2 tracking-widest uppercase">
                  Email Address
                </label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-text-muted" />
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full bg-white/5 border border-white/10 rounded-xl pl-10 pr-4 py-3 text-sm focus:outline-none focus:border-gold/50 transition-colors text-text-primary"
                    placeholder="your@email.com"
                    required
                  />
                </div>
              </div>

              <GoldButton className="w-full py-4 text-base" variant="filled" disabled={loading}>
                {loading ? (
                  <>
                    <Loader2 className="w-5 h-5 animate-spin" />
                    <span>Sending Link...</span>
                  </>
                ) : (
                  "Send Recovery Link"
                )}
              </GoldButton>
            </form>
          )}
        </Card>
      </motion.div>
    </div>
  );
}
