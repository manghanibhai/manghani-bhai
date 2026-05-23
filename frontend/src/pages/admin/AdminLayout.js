import React from "react";
import { NavLink, Outlet, Link, useNavigate } from "react-router-dom";
import { LayoutDashboard, Package, ShoppingBag, Tag, Users, Palette, Phone, LogOut, ExternalLink } from "lucide-react";
import { useAuth, useBranding } from "@/context/AppContexts";

const links = [
  { to: "/admin", label: "Dashboard", icon: LayoutDashboard, end: true },
  { to: "/admin/products", label: "Products", icon: Package },
  { to: "/admin/orders", label: "Orders", icon: ShoppingBag },
  { to: "/admin/categories", label: "Categories", icon: Tag },
  { to: "/admin/customers", label: "Customers", icon: Users },
  { to: "/admin/branding", label: "Branding", icon: Palette },
  { to: "/admin/contact", label: "Contact", icon: Phone },
];

export default function AdminLayout() {
  const { branding } = useBranding();
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  return (
    <div className="min-h-screen flex bg-brand" data-testid="admin-layout">
      <aside className="w-64 bg-[#2C4C3B] text-[#F9F6F0] flex flex-col sticky top-0 h-screen">
        <div className="p-6 border-b border-white/10">
          <Link to="/" className="flex items-center gap-3">
            {branding?.logo_url && <img src={branding.logo_url} alt="logo" className="h-10 w-10 rounded-full object-cover" />}
            <div className="flex flex-col leading-tight">
              <span className="font-display text-base font-semibold">{branding?.brand_name || "Manghani"}</span>
              <span className="text-[10px] uppercase tracking-[0.25em] opacity-60">Admin</span>
            </div>
          </Link>
        </div>
        <nav className="flex-1 p-4 space-y-1">
          {links.map((l) => (
            <NavLink key={l.to} to={l.to} end={l.end}
              className={({ isActive }) => `flex items-center gap-3 px-4 py-3 rounded-xl text-sm transition ${isActive ? "bg-white/10 font-medium" : "opacity-80 hover:bg-white/5 hover:opacity-100"}`}
              data-testid={`admin-nav-${l.label.toLowerCase()}`}
            >
              <l.icon className="w-4 h-4" /> {l.label}
            </NavLink>
          ))}
        </nav>
        <div className="p-4 border-t border-white/10">
          <div className="text-xs opacity-70 mb-2">{user?.name}</div>
          <Link to="/" className="flex items-center gap-2 text-xs opacity-80 hover:opacity-100 mb-2"><ExternalLink className="w-3 h-3" /> View store</Link>
          <button onClick={() => { logout(); navigate("/"); }} className="flex items-center gap-2 text-xs opacity-80 hover:opacity-100" data-testid="admin-logout-btn">
            <LogOut className="w-3 h-3" /> Sign out
          </button>
        </div>
      </aside>
      <main className="flex-1 p-6 lg:p-10 overflow-x-auto">
        <Outlet />
      </main>
    </div>
  );
}
