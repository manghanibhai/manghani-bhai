import React, { useEffect, useState } from "react";
import { api, formatPrice } from "@/lib/api";

export default function AdminCustomers() {
  const [customers, setCustomers] = useState([]);
  useEffect(() => { api.get("/customers").then((r) => setCustomers(r.data)); }, []);

  return (
    <div data-testid="admin-customers">
      <div className="mb-8">
        <h1 className="font-display text-4xl font-semibold text-heading tracking-tight">Customers</h1>
        <p className="text-body mt-1">{customers.length} registered customers.</p>
      </div>

      <div className="bg-white border border-brand rounded-3xl overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-surface-alt text-heading">
            <tr><th className="text-left p-4 font-medium">Name</th><th className="text-left p-4 font-medium">Email</th><th className="text-left p-4 font-medium">Orders</th><th className="text-left p-4 font-medium">Total Spent</th><th className="text-left p-4 font-medium">Joined</th></tr>
          </thead>
          <tbody>
            {customers.map((c) => (
              <tr key={c.id} className="border-t border-brand" data-testid={`admin-customer-${c.id}`}>
                <td className="p-4 font-medium text-heading">{c.name}</td>
                <td className="p-4 text-body">{c.email}</td>
                <td className="p-4 text-body">{c.orders_count}</td>
                <td className="p-4 text-heading">{formatPrice(c.total_spent)}</td>
                <td className="p-4 text-body">{c.created_at ? new Date(c.created_at).toLocaleDateString() : "—"}</td>
              </tr>
            ))}
            {customers.length === 0 && (
              <tr><td colSpan="5" className="p-10 text-center text-muted-brand">No customers yet.</td></tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
