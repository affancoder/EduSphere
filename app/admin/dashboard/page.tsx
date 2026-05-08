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

type PurchaseItem = {
  _id: string;
  amount: number;
  status: "pending" | "completed" | "failed" | "refunded";
  purchasedAt?: string;
  createdAt?: string;
  stripeSessionId?: string;
  stripePaymentIntentId?: string;
  userId?: { _id: string; name: string; email: string };
  courseId?: { _id: string; title: string };
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
  const [recentPurchases, setRecentPurchases] = useState<PurchaseItem[]>([]);

  useEffect(() => {
    const load = async () => {
      try {
        const [usersRes, coursesRes, subscriptionsRes] = await Promise.all([
          fetch("/api/admin/users", { cache: "no-store" }),
          fetch("/api/admin/courses", { cache: "no-store" }),
          fetch("/api/admin/subscriptions", { cache: "no-store" }),
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
        setRecentPurchases(subscriptionsData.subscriptions?.slice(0, 10) ?? []);
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

      <div className="mt-8 overflow-x-auto rounded-xl border border-white/10">
        <table className="min-w-full text-left text-sm">
          <thead className="bg-white/5 text-white/70">
            <tr>
              <th className="px-4 py-3">User</th>
              <th className="px-4 py-3">Course</th>
              <th className="px-4 py-3">Amount</th>
              <th className="px-4 py-3">Stripe IDs</th>
              <th className="px-4 py-3">Status</th>
              <th className="px-4 py-3">Purchased</th>
            </tr>
          </thead>
          <tbody>
            {recentPurchases.map((purchase) => (
              <tr key={purchase._id} className="border-t border-white/10">
                <td className="px-4 py-3">
                  {purchase.userId?.name ?? "-"}
                  <p className="text-xs text-white/60">{purchase.userId?.email ?? ""}</p>
                </td>
                <td className="px-4 py-3">{purchase.courseId?.title ?? "-"}</td>
                <td className="px-4 py-3">Rs. {purchase.amount}</td>
                <td className="px-4 py-3 text-xs text-white/70">
                  <p>{purchase.stripeSessionId ?? "-"}</p>
                  <p className="mt-1">{purchase.stripePaymentIntentId ?? "-"}</p>
                </td>
                <td className="px-4 py-3">{purchase.status}</td>
                <td className="px-4 py-3">
                  {purchase.purchasedAt
                    ? new Date(purchase.purchasedAt).toLocaleString()
                    : purchase.createdAt
                      ? new Date(purchase.createdAt).toLocaleString()
                      : "-"}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </section>
  );
}
