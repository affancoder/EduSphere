"use client";

import { motion } from "framer-motion";
import { 
  MessageSquare, 
  CheckCircle2, 
  Clock, 
  TrendingUp, 
  ChevronRight,
  ArrowUpRight
} from "lucide-react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import Card from "@/components/ui/Card";

const statsData = {
  total: 12,
  understood: 8,
  pending: 4,
};

const recentDoubts = [
  {
    title: "Closure in JavaScript",
    subject: "JavaScript",
    date: "2 hours ago",
    status: "Understood",
  },
  {
    title: "QuickSort vs MergeSort",
    subject: "DSA",
    date: "5 hours ago",
    status: "Pending",
  },
  {
    title: "useEffect Cleanup Function",
    subject: "React",
    date: "Yesterday",
    status: "Understood",
  },
];

export default function DashboardPage() {
  // TODO: Fetch from /api/doubts
  // TODO: Replace dummy data with DB data
  const { total, understood, pending } = statsData;
  const progressValue = Math.round((understood / total) * 100);

  const statsCards = [
    {
      label: "Total Doubts",
      value: total,
      icon: <MessageSquare className="w-6 h-6 text-[#d4af37]" />,
      trend: "All time requests",
    },
    {
      label: "Understood",
      value: understood,
      icon: <CheckCircle2 className="w-6 h-6 text-emerald-500" />,
      trend: `${progressValue}% completion`,
    },
    {
      label: "Pending",
      value: pending,
      icon: <Clock className="w-6 h-6 text-amber-500" />,
      trend: "Awaiting review",
    },
  ];

  return (
    <div className="min-h-screen bg-[#0b0b0f] text-text-primary font-body">
      <Navbar />

      <main className="container mx-auto px-6 pt-32 pb-20">
        {/* Page Header */}
        <div className="mb-12">
          <motion.h1
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            className="font-display text-4xl md:text-5xl text-text-primary mb-2"
          >
            Your Learning <span className="text-[#d4af37] italic">Dashboard</span>
          </motion.h1>
          <p className="text-text-muted">Welcome back, track your progress and insights here.</p>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
          {statsCards.map((stat, i) => (
            <Card key={i} className="p-6 bg-white/5 backdrop-blur-xl border-white/10 rounded-xl group hover:border-[#d4af37]/30 transition-all duration-300">
              <div className="flex justify-between items-start mb-4">
                <div className="p-3 rounded-xl bg-white/5 border border-white/10 group-hover:bg-[#d4af37]/10 transition-colors">
                  {stat.icon}
                </div>
                <ArrowUpRight className="w-4 h-4 text-text-muted opacity-0 group-hover:opacity-100 transition-opacity" />
              </div>
              <h3 className="text-text-muted text-sm tracking-widest uppercase mb-1">{stat.label}</h3>
              <div className="flex items-baseline gap-3">
                <span className="text-4xl font-display text-text-primary">{stat.value}</span>
                <span className="text-xs text-[#d4af37]/60">{stat.trend}</span>
              </div>
            </Card>
          ))}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Progress Section */}
          <div className="lg:col-span-1">
            <Card className="p-8 h-full bg-white/5 backdrop-blur-xl border-white/10 rounded-xl">
              <div className="flex items-center gap-3 mb-8">
                <TrendingUp className="w-5 h-5 text-[#d4af37]" />
                <h3 className="font-display text-2xl">Learning Progress</h3>
              </div>
              
              <div className="relative pt-1">
                <div className="flex mb-4 items-center justify-between">
                  <div>
                    <span className="text-xs font-semibold inline-block py-1 px-2 uppercase rounded-full text-[#d4af37] bg-[#d4af37]/10">
                      Overall Mastery
                    </span>
                  </div>
                  <div className="text-right">
                    <span className="text-sm font-semibold inline-block text-[#d4af37]">
                      {progressValue}%
                    </span>
                  </div>
                </div>
                <div className="overflow-hidden h-2 mb-8 text-xs flex rounded-full bg-white/5 border border-white/5">
                  <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: `${progressValue}%` }}
                    transition={{ duration: 1.5, ease: "easeOut" }}
                    className="shadow-none flex flex-col text-center whitespace-nowrap text-white justify-center bg-linear-to-r from-[#d4af37]/40 to-[#d4af37]"
                  ></motion.div>
                </div>
              </div>

              <ul className="space-y-4">
                <li className="flex items-center justify-between text-sm">
                  <span className="text-text-muted">Understood Doubts</span>
                  <span className="text-text-primary font-semibold">{understood}</span>
                </li>
                <li className="flex items-center justify-between text-sm">
                  <span className="text-text-muted">Pending Review</span>
                  <span className="text-text-primary font-semibold">{pending}</span>
                </li>
                <li className="flex items-center justify-between text-sm">
                  <span className="text-text-muted">Total Activity</span>
                  <span className="text-text-primary font-semibold">{total}</span>
                </li>
              </ul>
            </Card>
          </div>

          {/* Recent Activity Section */}
          <div className="lg:col-span-2">
            <Card className="p-8 h-full bg-white/5 backdrop-blur-xl border-white/10 rounded-xl">
              <div className="flex items-center justify-between mb-8">
                <div className="flex items-center gap-3">
                  <Clock className="w-5 h-5 text-[#d4af37]" />
                  <h3 className="font-display text-2xl">Recent Activity</h3>
                </div>
                <button className="text-xs tracking-widest uppercase text-[#d4af37] hover:text-champagne transition-colors flex items-center gap-1">
                  View All <ChevronRight className="w-3 h-3" />
                </button>
              </div>

              <div className="space-y-4">
                {recentDoubts.map((activity, i) => (
                  <div 
                    key={i}
                    className="flex items-center justify-between p-4 rounded-xl bg-white/5 border border-white/5 hover:border-[#d4af37]/10 hover:bg-white/[0.07] transition-all cursor-pointer group"
                  >
                    <div className="flex items-center gap-4">
                      <div className={`w-2 h-2 rounded-full ${activity.status === 'Understood' ? 'bg-emerald-500' : 'bg-amber-500 shadow-[0_0_8px_rgba(245,158,11,0.5)]'}`} />
                      <div>
                        <h4 className="text-text-primary font-medium group-hover:text-[#d4af37] transition-colors">{activity.title}</h4>
                        <div className="flex gap-3 text-xs text-text-muted mt-1">
                          <span>{activity.subject}</span>
                          <span>•</span>
                          <span>{activity.date}</span>
                        </div>
                      </div>
                    </div>
                    <span className={`text-[10px] tracking-widest uppercase px-3 py-1 rounded-full border ${activity.status === 'Understood' ? 'border-emerald-500/20 text-emerald-500 bg-emerald-500/5' : 'border-amber-500/20 text-amber-500 bg-amber-500/5'}`}>
                      {activity.status}
                    </span>
                  </div>
                ))}
              </div>
            </Card>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
