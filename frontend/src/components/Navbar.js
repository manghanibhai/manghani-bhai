import React, { useState } from "react";
import { Link, NavLink, useNavigate } from "react-router-dom";
import { ShoppingBag, Heart, User, Search, Menu, X, LogOut, Package, LayoutDashboard } from "lucide-react";
import { useAuth, useBranding, useCart, useWishlist } from "@/context/AppContexts";

export default function Navbar() {
  const { branding } = useBranding();
  const { user, logout } = useAuth();
  const { count } = useCart();
  const { items: wlItems } = useWishlist();
  const navigate = useNavigate();
  const [open, setOpen] = useState(false);
  const [q, setQ] = useState("");

  const submitSearch = (e) => {
    e.preventDefault();
    if (q.trim()) { navigate(`/products?q=${encodeURIComponent(q.trim())}`); setOpen(false); setQ(""); }
  };

  const navLinks = [
    { to: "/", label: "Home" },
    { to: "/products", label: "Shop" },
    { to: "/track", label: "Track Order" },
    { to: "/contact", label: "Contact" },
  ];

  return (
    <header className="sticky top-0 z-40 header-glass" data-testid="navbar">
      <div className="max-w-7xl mx-auto px-5 lg:px-10">
        <div className="flex items-center justify-between h-20">
          {/* Logo */}
          <Link to="/" className="flex items-center gap-3" data-testid="navbar-logo-link">
            {branding?.logo_url && (
              <img src={branding.logo_url} alt={branding?.brand_name || "Logo"} className="h-11 w-11 rounded-full object-cover" />
            )}
            <div className="flex flex-col leading-none">
              <span className="font-display text-lg lg:text-xl font-semibold text-heading tracking-tight">
                {branding?.brand_name || "Manghani Toy World"}
              </span>
              <span className="text-[10px] uppercase tracking-[0.25em] text-muted-brand">Boutique · Est. Ajmer</span>
            </div>
          </Link>

          {/* Center nav */}
          <nav className="hidden lg:flex items-center gap-9">
            {navLinks.map((l) => (
              <NavLink
                key={l.to}
                to={l.to}
                end={l.to === "/"}
                className={({ isActive }) => `text-sm font-medium transition-colors ${isActive ? "text-heading" : "text-body hover:text-heading"}`}
                data-testid={`nav-link-${l.label.toLowerCase().replace(/\s/g, "-")}`}
              >
                {l.label}
              </NavLink>
            ))}
          </nav>

          {/* Right cluster */}
          <div className="flex items-center gap-2 lg:gap-3">
            <form onSubmit={submitSearch} className="hidden md:flex items-center bg-white/60 border border-brand rounded-full px-4 py-2 w-56">
              <Search className="w-4 h-4 text-muted-brand" />
              <input
                value={q}
                onChange={(e) => setQ(e.target.value)}
                placeholder="Search toys…"
                className="bg-transparent ml-2 outline-none text-sm w-full text-heading placeholder:text-muted-brand"
                data-testid="navbar-search-input"
              />
            </form>

            <Link to="/wishlist" className="relative p-2.5 rounded-full hover:bg-surface-alt transition" data-testid="navbar-wishlist-btn">
              <Heart className="w-5 h-5 text-heading" />
              {wlItems.length > 0 && (
                <span className="absolute -top-0.5 -right-0.5 bg-primary-brand text-[10px] text-white rounded-full w-4 h-4 flex items-center justify-center font-semibold">{wlItems.length}</span>
              )}
            </Link>
            <Link to="/cart" className="relative p-2.5 rounded-full hover:bg-surface-alt transition" data-testid="navbar-cart-btn">
              <ShoppingBag className="w-5 h-5 text-heading" />
              {count > 0 && (
                <span className="absolute -top-0.5 -right-0.5 bg-primary-brand text-[10px] text-white rounded-full w-4 h-4 flex items-center justify-center font-semibold" data-testid="navbar-cart-count">{count}</span>
              )}
            </Link>

            {user ? (
              <div className="hidden md:block relative group">
                <button className="p-2.5 rounded-full hover:bg-surface-alt transition flex items-center gap-2" data-testid="navbar-user-btn">
                  <User className="w-5 h-5 text-heading" />
                </button>
                <div className="absolute right-0 top-full mt-1 w-52 bg-white rounded-2xl shadow-xl border border-brand opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all py-2">
                  <div className="px-4 py-2 border-b border-brand">
                    <div className="text-sm font-medium text-heading truncate">{user.name}</div>
                    <div className="text-xs text-muted-brand truncate">{user.email}</div>
                  </div>
                  {user.role === "admin" && (
                    <Link to="/admin" className="flex items-center gap-2 px-4 py-2 text-sm text-body hover:bg-surface-alt" data-testid="navbar-admin-link">
                      <LayoutDashboard className="w-4 h-4" /> Admin Panel
                    </Link>
                  )}
                  <Link to="/my-orders" className="flex items-center gap-2 px-4 py-2 text-sm text-body hover:bg-surface-alt" data-testid="navbar-my-orders-link">
                    <Package className="w-4 h-4" /> My Orders
                  </Link>
                  <button onClick={() => { logout(); navigate("/"); }} className="w-full text-left flex items-center gap-2 px-4 py-2 text-sm text-body hover:bg-surface-alt" data-testid="navbar-logout-btn">
                    <LogOut className="w-4 h-4" /> Sign out
                  </button>
                </div>
              </div>
            ) : (
              <Link to="/login" className="hidden md:inline-flex items-center text-sm font-medium text-heading hover:text-primary-brand transition px-3" data-testid="navbar-login-link">
                Sign in
              </Link>
            )}

            <button className="lg:hidden p-2.5 rounded-full hover:bg-surface-alt transition" onClick={() => setOpen(!open)} data-testid="navbar-menu-toggle">
              {open ? <X className="w-5 h-5 text-heading" /> : <Menu className="w-5 h-5 text-heading" />}
            </button>
          </div>
        </div>

        {/* Mobile menu */}
        {open && (
          <div className="lg:hidden pb-6 fade-up" data-testid="mobile-menu">
            <form onSubmit={submitSearch} className="flex items-center bg-white/70 border border-brand rounded-full px-4 py-2.5 mb-4">
              <Search className="w-4 h-4 text-muted-brand" />
              <input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Search toys…" className="bg-transparent ml-2 outline-none text-sm w-full text-heading" />
            </form>
            <div className="flex flex-col gap-1">
              {navLinks.map((l) => (
                <Link key={l.to} to={l.to} onClick={() => setOpen(false)} className="py-3 px-4 rounded-xl hover:bg-surface-alt text-heading font-medium">{l.label}</Link>
              ))}
              {user ? (
                <>
                  {user.role === "admin" && <Link to="/admin" onClick={() => setOpen(false)} className="py-3 px-4 rounded-xl hover:bg-surface-alt text-heading font-medium">Admin Panel</Link>}
                  <Link to="/my-orders" onClick={() => setOpen(false)} className="py-3 px-4 rounded-xl hover:bg-surface-alt text-heading font-medium">My Orders</Link>
                  <button onClick={() => { logout(); setOpen(false); navigate("/"); }} className="py-3 px-4 rounded-xl hover:bg-surface-alt text-heading font-medium text-left">Sign out</button>
                </>
              ) : (
                <>
                  <Link to="/login" onClick={() => setOpen(false)} className="py-3 px-4 rounded-xl hover:bg-surface-alt text-heading font-medium">Sign in</Link>
                  <Link to="/register" onClick={() => setOpen(false)} className="py-3 px-4 rounded-xl hover:bg-surface-alt text-heading font-medium">Create account</Link>
                </>
              )}
            </div>
          </div>
        )}
      </div>
    </header>
  );
}
