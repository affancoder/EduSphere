"use client";

import { useEffect, useMemo, useState } from "react";

type Subscription = {
  _id: string;
  amount: number;
  status: "pending" | "paid" | "failed";
  createdAt: string;
  userId?: { _id: string; name: string; email: string };
  courseId?: { _id: string; title: string };
};

type Overview = {
  totalSubscriptions: number;
  paidSubscriptions: number;
  revenue: number;
};

export default function AdminSubscriptionsPage() {
  const [subscriptions, setSubscriptions] = useState<Subscription[]>([]);
  const [overview, setOverview] = useState<Overview>({
    totalSubscriptions: 0,
    paidSubscriptions: 0,
    revenue: 0,
  });
  const [filters, setFilters] = useState({ user: "", course: "", status: "" });

  const query = useMemo(() => {
    const params = new URLSearchParams();
    if (filters.user) params.set("user", filters.user);
    if (filters.course) params.set("course", filters.course);
    if (filters.status) params.set("status", filters.status);
    return params.toString();
  }, [filters]);

  useEffect(() => {
    const load = async () => {
      const res = await fetch(`/api/admin/subscriptions${query ? `?${query}` : ""}`);
      const data = await res.json();
      setSubscriptions(data.subscriptions ?? []);
      setOverview(
        data.overview ?? { totalSubscriptions: 0, paidSubscriptions: 0, revenue: 0 }
      );
    };
    load();
  }, [query]);

  return (
    <section className="space-y-6">
      <h1 className="text-3xl font-display">Subscriptions</h1>

      <div className="grid gap-4 sm:grid-cols-3">
        <div className="rounded-lg border border-white/10 bg-white/5 p-4">
          <p className="text-xs uppercase text-white/60">Total</p>
          <p className="mt-1 text-2xl">{overview.totalSubscriptions}</p>
        </div>
        <div className="rounded-lg border border-white/10 bg-white/5 p-4">
          <p className="text-xs uppercase text-white/60">Paid</p>
          <p className="mt-1 text-2xl">{overview.paidSubscriptions}</p>
        </div>
        <div className="rounded-lg border border-white/10 bg-white/5 p-4">
          <p className="text-xs uppercase text-white/60">Revenue</p>
          <p className="mt-1 text-2xl">Rs. {overview.revenue.toLocaleString()}</p>
        </div>
      </div>

      <div className="grid gap-2 md:grid-cols-3">
        <input
          className="rounded-lg border border-white/10 bg-black/30 px-3 py-2"
          placeholder="Filter by userId"
          value={filters.user}
          onChange={(e) => setFilters((prev) => ({ ...prev, user: e.target.value }))}
        />
        <input
          className="rounded-lg border border-white/10 bg-black/30 px-3 py-2"
          placeholder="Filter by courseId"
          value={filters.course}
          onChange={(e) => setFilters((prev) => ({ ...prev, course: e.target.value }))}
        />
        <select
          className="rounded-lg border border-white/10 bg-black/30 px-3 py-2"
          value={filters.status}
          onChange={(e) => setFilters((prev) => ({ ...prev, status: e.target.value }))}
        >
          <option value="">All status</option>
          <option value="pending">pending</option>
          <option value="paid">paid</option>
          <option value="failed">failed</option>
        </select>
      </div>

      <div className="overflow-x-auto rounded-xl border border-white/10">
        <table className="min-w-full text-left text-sm">
          <thead className="bg-white/5 text-white/70">
            <tr>
              <th className="px-4 py-3">User</th>
              <th className="px-4 py-3">Course</th>
              <th className="px-4 py-3">Amount</th>
              <th className="px-4 py-3">Status</th>
              <th className="px-4 py-3">Created</th>
            </tr>
          </thead>
          <tbody>
            {subscriptions.map((subscription) => (
              <tr key={subscription._id} className="border-t border-white/10">
                <td className="px-4 py-3">
                  {subscription.userId?.name ?? "-"}
                  <p className="text-xs text-white/60">{subscription.userId?.email ?? ""}</p>
                </td>
                <td className="px-4 py-3">{subscription.courseId?.title ?? "-"}</td>
                <td className="px-4 py-3">Rs. {subscription.amount}</td>
                <td className="px-4 py-3">{subscription.status}</td>
                <td className="px-4 py-3">
                  {new Date(subscription.createdAt).toLocaleString()}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </section>
  );
}
