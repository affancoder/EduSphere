"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { UserPlus, Mail, Key, User } from "lucide-react";
import Card from "@/components/ui/Card";
import GoldButton from "@/components/ui/GoldButton";
import Link from "next/link";

export default function SignupPage() {
  const router = useRouter();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSignup = (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    
    // Simple mock signup
    setTimeout(() => {
      localStorage.setItem("isLoggedIn", "true");
      setLoading(false);
      window.location.href = "/dashboard";
    }, 1000);
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
            <UserPlus className="w-8 h-8 text-gold" />
          </div>
          <h1 className="font-display text-4xl text-text-primary mb-2">Begin Your <span className="text-gold italic">Journey</span></h1>
          <p className="text-text-muted">Join the elite community of learners</p>
        </div>

        <Card className="p-8 bg-surface border-border-gold rounded-xl">
          <form onSubmit={handleSignup} className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-gold mb-2 tracking-widest uppercase">
                Full Name
              </label>
              <div className="relative">
                <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-text-muted" />
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full bg-white/5 border border-white/10 rounded-xl pl-10 pr-4 py-3 text-sm focus:outline-none focus:border-gold/50 transition-colors text-text-primary"
                  placeholder="Alexander Thorne"
                  required
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gold mb-2 tracking-widest uppercase">
                Email Address
              </label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-text-muted" />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full bg-white/5 border border-white/10 rounded-xl pl-10 pr-4 py-3 text-sm focus:outline-none focus:border-gold/50 transition-colors text-text-primary"
                  placeholder="alex@sanctuary.com"
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
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full bg-white/5 border border-white/10 rounded-xl pl-10 pr-4 py-3 text-sm focus:outline-none focus:border-gold/50 transition-colors text-text-primary"
                  placeholder="••••••••"
                  required
                />
              </div>
            </div>

            <GoldButton className="w-full py-4 text-base" variant="filled">
              {loading ? "Creating Profile..." : "Create Sanctuary Account"}
            </GoldButton>
          </form>

          <div className="mt-8 text-center border-t border-white/5 pt-6">
            <p className="text-text-muted text-sm">
              Already a member?{" "}
              <Link href="/login" className="text-gold hover:underline">
                Login here
              </Link>
            </p>
          </div>
        </Card>
      </motion.div>
    </div>
  );
}
