"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { 
  User, 
  Mail, 
  Lock, 
  Camera, 
  Save, 
  Loader2, 
  ChevronLeft,
  CheckCircle2,
  AlertCircle
} from "lucide-react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import Card from "@/components/ui/Card";
import GoldButton from "@/components/ui/GoldButton";
import Link from "next/link";

interface User {
  _id: string;
  name: string;
  email: string;
  role: string;
  profileImage?: string;
}

export default function SettingsPage() {
  const router = useRouter();
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(false);
  const [message, setMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);

  const [formData, setFormData] = useState({
    name: "",
    email: "",
    profileImage: "",
    password: "",
    confirmPassword: "",
  });

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const res = await fetch("/api/auth/me");
        const data = await res.json();
        if (res.ok) {
          setUser(data.user);
          setFormData({
            name: data.user.name,
            email: data.user.email,
            profileImage: data.user.profileImage || "",
            password: "",
            confirmPassword: "",
          });
        } else {
          router.push("/login");
        }
      } catch (err) {
        console.error("Failed to fetch user:", err);
        router.push("/login");
      } finally {
        setLoading(false);
      }
    };

    fetchUser();
  }, [router]);

  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (formData.password && formData.password !== formData.confirmPassword) {
      setMessage({ type: "error", text: "Passwords do not match" });
      return;
    }

    setUpdating(true);
    setMessage(null);

    try {
      const res = await fetch("/api/user/update", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: formData.name,
          email: formData.email,
          profileImage: formData.profileImage,
          password: formData.password || undefined,
        }),
      });

      const data = await res.json();
      if (res.ok) {
        setUser(data.user);
        setMessage({ type: "success", text: "Profile updated successfully" });
        setFormData(prev => ({ ...prev, password: "", confirmPassword: "" }));
      } else {
        setMessage({ type: "error", text: data.error || "Update failed" });
      }
    } catch (err) {
      console.error("Update error:", err);
      setMessage({ type: "error", text: "An unexpected error occurred" });
    } finally {
      setUpdating(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Loader2 className="w-10 h-10 text-gold animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Navbar />
      
      <main className="flex-1 container mx-auto px-6 pt-32 pb-20">
        <div className="max-w-4xl mx-auto">
          <Link href="/dashboard" className="inline-flex items-center gap-2 text-text-muted hover:text-gold transition-colors mb-8 group">
            <ChevronLeft className="w-4 h-4 transition-transform group-hover:-translate-x-1" />
            Back to Dashboard
          </Link>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
          >
            <h1 className="font-display text-4xl text-text-primary mb-2">Account <span className="text-gold italic">Settings</span></h1>
            <p className="text-text-muted mb-12">Manage your presence in the digital sanctuary.</p>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-12">
              {/* Profile Preview */}
              <div className="md:col-span-1">
                <Card className="p-8 bg-surface border-border-gold text-center">
                  <div className="relative inline-block mb-6">
                    <div className="w-32 h-32 rounded-full bg-gold/10 border-2 border-gold/30 overflow-hidden flex items-center justify-center mx-auto">
                      {formData.profileImage ? (
                        <img src={formData.profileImage} alt="Profile" className="w-full h-full object-cover" />
                      ) : (
                        <User className="w-12 h-12 text-gold opacity-50" />
                      )}
                    </div>
                    <button className="absolute bottom-0 right-0 p-2 bg-gold text-background rounded-full hover:bg-champagne transition-colors shadow-lg">
                      <Camera className="w-4 h-4" />
                    </button>
                  </div>
                  <h3 className="font-display text-2xl text-text-primary mb-1">{user?.name}</h3>
                  <p className="text-text-muted text-xs uppercase tracking-widest font-bold">{user?.role}</p>
                </Card>
              </div>

              {/* Edit Form */}
              <div className="md:col-span-2">
                <Card className="p-8 bg-surface border-border-gold">
                  <form onSubmit={handleUpdate} className="space-y-6">
                    {message && (
                      <motion.div
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        className={`p-4 rounded-xl flex items-center gap-3 ${
                          message.type === "success" 
                            ? "bg-emerald-500/10 border border-emerald-500/20 text-emerald-500" 
                            : "bg-red-500/10 border border-red-500/20 text-red-500"
                        }`}
                      >
                        {message.type === "success" ? <CheckCircle2 className="w-5 h-5" /> : <AlertCircle className="w-5 h-5" />}
                        <p className="text-sm font-medium">{message.text}</p>
                      </motion.div>
                    )}

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                      <div>
                        <label className="block text-xs font-bold text-gold mb-2 tracking-widest uppercase">Full Name</label>
                        <div className="relative">
                          <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-text-muted" />
                          <input 
                            type="text"
                            value={formData.name}
                            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                            className="w-full bg-white/5 border border-white/10 rounded-xl pl-10 pr-4 py-3 text-sm text-text-primary focus:outline-none focus:border-gold/50 transition-colors"
                          />
                        </div>
                      </div>
                      <div>
                        <label className="block text-xs font-bold text-gold mb-2 tracking-widest uppercase">Email Address</label>
                        <div className="relative">
                          <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-text-muted" />
                          <input 
                            type="email"
                            value={formData.email}
                            onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                            className="w-full bg-white/5 border border-white/10 rounded-xl pl-10 pr-4 py-3 text-sm text-text-primary focus:outline-none focus:border-gold/50 transition-colors"
                          />
                        </div>
                      </div>
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-gold mb-2 tracking-widest uppercase">Profile Image URL</label>
                      <input 
                        type="text"
                        value={formData.profileImage}
                        onChange={(e) => setFormData({ ...formData, profileImage: e.target.value })}
                        placeholder="https://example.com/avatar.jpg"
                        className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-sm text-text-primary focus:outline-none focus:border-gold/50 transition-colors"
                      />
                    </div>

                    <div className="border-t border-white/5 pt-6 mt-6">
                      <h4 className="text-text-primary font-display text-xl mb-4">Security Update</h4>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                        <div>
                          <label className="block text-xs font-bold text-gold mb-2 tracking-widest uppercase">New Password</label>
                          <div className="relative">
                            <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-text-muted" />
                            <input 
                              type="password"
                              value={formData.password}
                              onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                              placeholder="••••••••"
                              className="w-full bg-white/5 border border-white/10 rounded-xl pl-10 pr-4 py-3 text-sm text-text-primary focus:outline-none focus:border-gold/50 transition-colors"
                            />
                          </div>
                        </div>
                        <div>
                          <label className="block text-xs font-bold text-gold mb-2 tracking-widest uppercase">Confirm Password</label>
                          <div className="relative">
                            <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-text-muted" />
                            <input 
                              type="password"
                              value={formData.confirmPassword}
                              onChange={(e) => setFormData({ ...formData, confirmPassword: e.target.value })}
                              placeholder="••••••••"
                              className="w-full bg-white/5 border border-white/10 rounded-xl pl-10 pr-4 py-3 text-sm text-text-primary focus:outline-none focus:border-gold/50 transition-colors"
                            />
                          </div>
                        </div>
                      </div>
                    </div>

                    <GoldButton className="w-full py-4 mt-4" disabled={updating}>
                      {updating ? (
                        <>
                          <Loader2 className="w-5 h-5 animate-spin" />
                          Saving Changes...
                        </>
                      ) : (
                        <>
                          <Save className="w-4 h-4" />
                          Update Profile
                        </>
                      )}
                    </GoldButton>
                  </form>
                </Card>
              </div>
            </div>
          </motion.div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
