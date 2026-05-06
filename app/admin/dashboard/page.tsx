"use client";

import { useEffect, useState } from "react";

type Stats = {
  users: number;
  courses: number;
  subscriptions: number;
  revenue: number;
  purchasedUsers: number;
  coursesSold: number;
};

export default function AdminDashboardPage() {
  const [stats, setStats] = useState<Stats>({
    users: 0,
    courses: 0,
    subscriptions: 0,
    revenue: 0,
    purchasedUsers: 0,
    coursesSold: 0,
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      try {
        const [usersRes, coursesRes, subscriptionsRes] = await Promise.all([
          fetch("/api/admin/users"),
          fetch("/api/admin/courses"),
          fetch("/api/admin/subscriptions"),
        ]);

        const [usersData, coursesData, subscriptionsData] = await Promise.all([
          usersRes.json(),
          coursesRes.json(),
          subscriptionsRes.json(),
        ]);

        setStats({
          users: usersData.users?.length ?? 0,
          courses: coursesData.courses?.length ?? 0,
          subscriptions: subscriptionsData.overview?.paidSubscriptions ?? 0,
          revenue: subscriptionsData.overview?.revenue ?? 0,
          purchasedUsers: subscriptionsData.overview?.uniqueUsers ?? 0,
          coursesSold: subscriptionsData.overview?.uniqueCourses ?? 0,
        });
      } finally {
        setLoading(false);
      }
    };

    load();
  }, []);

  const cards = [
    { label: "Total Revenue", value: `Rs. ${stats.revenue.toLocaleString()}` },
    { label: "Total Purchases", value: stats.subscriptions },
    { label: "Purchased Users", value: stats.purchasedUsers },
    { label: "Courses Sold", value: stats.coursesSold },
    { label: "Total Users", value: stats.users },
    { label: "Total Courses", value: stats.courses },
  ];

  return (
    <section>
      <h1 className="mb-6 text-3xl font-display">
        Admin <span className="text-[#d4af37] italic">Dashboard</span>
      </h1>
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {cards.map((card) => (
          <div key={card.label} className="rounded-xl border border-white/10 bg-white/5 p-5">
            <p className="text-xs uppercase tracking-widest text-white/60">{card.label}</p>
            <p className="mt-2 text-2xl font-semibold">
              {loading ? "..." : card.value}
            </p>
          </div>
        ))}
      </div>
    </section>
  );
}
