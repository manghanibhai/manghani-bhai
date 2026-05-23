import React, { createContext, useContext, useEffect, useState, useCallback } from "react";
import { api, notifyApiError } from "@/lib/api";

// notifyApiError is used to surface API failures in production logs.

// ---------- Auth ----------
const AuthCtx = createContext(null);
export const useAuth = () => useContext(AuthCtx);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  const refresh = useCallback(async () => {
    const token = localStorage.getItem("mtw_token");
    if (!token) { setUser(null); setLoading(false); return; }
    try {
      const { data } = await api.get("/auth/me");
      setUser(data);
    } catch {
      localStorage.removeItem("mtw_token");
      setUser(null);
    } finally { setLoading(false); }
  }, []);

  useEffect(() => { refresh(); }, [refresh]);

  const login = async (email, password) => {
    const { data } = await api.post("/auth/login", { email, password });
    localStorage.setItem("mtw_token", data.token);
    setUser(data.user);
    return data.user;
  };
  const register = async (name, email, password) => {
    const { data } = await api.post("/auth/register", { name, email, password });
    localStorage.setItem("mtw_token", data.token);
    setUser(data.user);
    return data.user;
  };
  const logout = () => {
    localStorage.removeItem("mtw_token");
    setUser(null);
  };

  return (
    <AuthCtx.Provider value={{ user, loading, login, register, logout, refresh }}>
      {children}
    </AuthCtx.Provider>
  );
}

// ---------- Branding ----------
const BrandingCtx = createContext(null);
export const useBranding = () => useContext(BrandingCtx);

export function BrandingProvider({ children }) {
  const [branding, setBranding] = useState(null);
  const reload = useCallback(async () => {
    try {
      const { data } = await api.get("/branding");
      setBranding(data);
      if (data?.favicon_url) {
        let link = document.querySelector("link[rel*='icon']");
        if (!link) { link = document.createElement("link"); link.rel = "icon"; document.head.appendChild(link); }
        link.href = data.favicon_url;
      }
      if (data?.brand_name) document.title = "Manghani Toy World - ";
    } catch (e) { notifyApiError(e, "Branding"); /* keep defaults */ }
  }, []);
  useEffect(() => { reload(); }, [reload]);
  return <BrandingCtx.Provider value={{ branding, reload }}>{children}</BrandingCtx.Provider>;
}

// ---------- Contact ----------
const ContactCtx = createContext(null);
export const useContact = () => useContext(ContactCtx);

export function ContactProvider({ children }) {
  const [contact, setContact] = useState(null);
  const reload = useCallback(async () => {
    try {
      const { data } = await api.get("/contact-settings");
      setContact(data);
    } catch (e) { notifyApiError(e, "Contact settings"); /* defaults */ }
  }, []);
  useEffect(() => { reload(); }, [reload]);
  return <ContactCtx.Provider value={{ contact, reload }}>{children}</ContactCtx.Provider>;
}

// ---------- Cart ----------
const CartCtx = createContext(null);
export const useCart = () => useContext(CartCtx);

export function CartProvider({ children }) {
  const [items, setItems] = useState(() => {
    try { return JSON.parse(localStorage.getItem("mtw_cart") || "[]"); } catch { return []; }
  });
  useEffect(() => { localStorage.setItem("mtw_cart", JSON.stringify(items)); }, [items]);

  const add = (product, qty = 1) => {
    setItems((prev) => {
      const existing = prev.find((i) => i.product_id === product.id);
      const price = product.discounted_price ?? product.price;
      if (existing) return prev.map((i) => i.product_id === product.id ? { ...i, qty: i.qty + qty } : i);
      return [...prev, { product_id: product.id, title: product.title, image: product.images?.[0], price, qty }];
    });
  };
  const remove = (pid) => setItems((prev) => prev.filter((i) => i.product_id !== pid));
  const update = (pid, qty) => setItems((prev) => prev.map((i) => i.product_id === pid ? { ...i, qty: Math.max(1, qty) } : i));
  const clear = () => setItems([]);
  const total = items.reduce((s, i) => s + i.price * i.qty, 0);
  const count = items.reduce((s, i) => s + i.qty, 0);

  return <CartCtx.Provider value={{ items, add, remove, update, clear, total, count }}>{children}</CartCtx.Provider>;
}

// ---------- Wishlist ----------
const WishlistCtx = createContext(null);
export const useWishlist = () => useContext(WishlistCtx);

export function WishlistProvider({ children }) {
  const [items, setItems] = useState(() => {
    try { return JSON.parse(localStorage.getItem("mtw_wishlist") || "[]"); } catch { return []; }
  });
  useEffect(() => { localStorage.setItem("mtw_wishlist", JSON.stringify(items)); }, [items]);

  const toggle = (product) => {
    setItems((prev) => {
      if (prev.find((p) => p.id === product.id)) return prev.filter((p) => p.id !== product.id);
      return [...prev, { id: product.id, title: product.title, image: product.images?.[0], price: product.price, discounted_price: product.discounted_price }];
    });
  };
  const has = (id) => !!items.find((p) => p.id === id);
  const remove = (id) => setItems((prev) => prev.filter((p) => p.id !== id));
  return <WishlistCtx.Provider value={{ items, toggle, has, remove }}>{children}</WishlistCtx.Provider>;
}
