"use client";

import { useEffect, useState } from "react";

type PurchasedCourse = { _id: string; title: string };
type AdminUser = {
  _id: string;
  name: string;
  email: string;
  role: "user" | "admin";
  createdAt: string;
  purchasedCourses: PurchasedCourse[];
};

export default function AdminUsersPage() {
  const [users, setUsers] = useState<AdminUser[]>([]);
  const [loading, setLoading] = useState(true);

  const loadUsers = async () => {
    const res = await fetch("/api/admin/users");
    const data = await res.json();
    setUsers(data.users ?? []);
    setLoading(false);
  };

  useEffect(() => {
    const timer = setTimeout(() => {
      void loadUsers();
    }, 0);
    return () => clearTimeout(timer);
  }, []);

  const updateRole = async (id: string, role: "user" | "admin") => {
    await fetch(`/api/admin/users/${id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ role }),
    });
    loadUsers();
  };

  return (
    <section>
      <h1 className="mb-6 text-3xl font-display">Users</h1>
      <div className="overflow-x-auto rounded-xl border border-white/10">
        <table className="min-w-full text-left text-sm">
          <thead className="bg-white/5 text-white/70">
            <tr>
              <th className="px-4 py-3">Name</th>
              <th className="px-4 py-3">Email</th>
              <th className="px-4 py-3">Role</th>
              <th className="px-4 py-3">Created</th>
              <th className="px-4 py-3">Purchased Courses</th>
              <th className="px-4 py-3">Action</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr>
                <td className="px-4 py-4" colSpan={6}>
                  Loading...
                </td>
              </tr>
            ) : (
              users.map((user) => (
                <tr key={user._id} className="border-t border-white/10">
                  <td className="px-4 py-3">{user.name}</td>
                  <td className="px-4 py-3">{user.email}</td>
                  <td className="px-4 py-3">{user.role}</td>
                  <td className="px-4 py-3">
                    {new Date(user.createdAt).toLocaleDateString()}
                  </td>
                  <td className="px-4 py-3">
                    {user.purchasedCourses?.length
                      ? user.purchasedCourses.map((course) => course.title).join(", ")
                      : "-"}
                  </td>
                  <td className="px-4 py-3">
                    {user.role === "admin" ? (
                      <button
                        onClick={() => updateRole(user._id, "user")}
                        className="rounded border border-white/20 px-3 py-1 text-xs"
                      >
                        Demote
                      </button>
                    ) : (
                      <button
                        onClick={() => updateRole(user._id, "admin")}
                        className="rounded bg-[#d4af37] px-3 py-1 text-xs text-black"
                      >
                        Promote
                      </button>
                    )}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </section>
  );
}
