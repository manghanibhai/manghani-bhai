import React, { useEffect, useState } from "react";
import { Package, ShoppingBag, Users, Wallet } from "lucide-react";
import { ResponsiveContainer, AreaChart, Area, XAxis, YAxis, Tooltip, CartesianGrid, BarChart, Bar } from "recharts";
import { api, formatPrice } from "@/lib/api";

export default function Dashboard() {
  const [stats, setStats] = useState(null);
  useEffect(() => { api.get("/admin/stats").then((r) => setStats(r.data)); }, []);

  if (!stats) return <div className="flex justify-center py-20"><div className="spinner" /></div>;

  const cards = [
    { label: "Revenue", value: formatPrice(stats.revenue), icon: Wallet, color: "#C85A4F" },
    { label: "Total Orders", value: stats.total_orders, icon: ShoppingBag, color: "#E1A140" },
    { label: "Products", value: stats.total_products, icon: Package, color: "#2C4C3B" },
    { label: "Customers", value: stats.total_customers, icon: Users, color: "#8A9992" },
  ];

  return (
    <div data-testid="admin-dashboard">
      <div className="mb-8">
        <h1 className="font-display text-4xl font-semibold text-heading tracking-tight">Dashboard</h1>
        <p className="text-body mt-1">A snapshot of your boutique.</p>
      </div>

      <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-5 mb-8">
        {cards.map((c) => (
          <div key={c.label} className="bg-white border border-brand rounded-3xl p-6" data-testid={`stat-${c.label.toLowerCase().replace(/\s/g, "-")}`}>
            <div className="w-10 h-10 rounded-full flex items-center justify-center" style={{ background: `${c.color}20`, color: c.color }}>
              <c.icon className="w-4 h-4" />
            </div>
            <div className="mt-4 text-xs uppercase tracking-[0.2em] text-muted-brand">{c.label}</div>
            <div className="font-display text-3xl font-semibold text-heading mt-1">{c.value}</div>
          </div>
        ))}
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 bg-white border border-brand rounded-3xl p-6">
          <h3 className="font-display text-lg font-semibold text-heading mb-1">Revenue · last 7 days</h3>
          <p className="text-xs text-muted-brand mb-6">Daily order totals (excluding cancelled)</p>
          <ResponsiveContainer width="100%" height={260}>
            <AreaChart data={stats.sales_chart}>
              <defs>
                <linearGradient id="rev" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#C85A4F" stopOpacity={0.4} />
                  <stop offset="100%" stopColor="#C85A4F" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid stroke="#EADECF" strokeDasharray="3 3" />
              <XAxis dataKey="date" stroke="#8A9992" fontSize={11} tickFormatter={(v) => v.slice(5)} />
              <YAxis stroke="#8A9992" fontSize={11} />
              <Tooltip contentStyle={{ borderRadius: 12, border: "1px solid #EADECF" }} formatter={(v) => formatPrice(v)} />
              <Area type="monotone" dataKey="revenue" stroke="#C85A4F" strokeWidth={2} fill="url(#rev)" />
            </AreaChart>
          </ResponsiveContainer>
        </div>

        <div className="bg-white border border-brand rounded-3xl p-6">
          <h3 className="font-display text-lg font-semibold text-heading mb-1">Order status</h3>
          <p className="text-xs text-muted-brand mb-6">Breakdown by stage</p>
          <ResponsiveContainer width="100%" height={260}>
            <BarChart data={stats.status_breakdown}>
              <CartesianGrid stroke="#EADECF" strokeDasharray="3 3" />
              <XAxis dataKey="status" stroke="#8A9992" fontSize={11} />
              <YAxis stroke="#8A9992" fontSize={11} allowDecimals={false} />
              <Tooltip contentStyle={{ borderRadius: 12, border: "1px solid #EADECF" }} />
              <Bar dataKey="count" fill="#E1A140" radius={[8, 8, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {stats.pending_orders > 0 && (
        <div className="mt-6 bg-[#E1A140]/15 border border-[#E1A140]/40 rounded-3xl p-5 text-sm text-heading">
          <span className="font-semibold">{stats.pending_orders}</span> orders awaiting confirmation.
        </div>
      )}
    </div>
  );
}
