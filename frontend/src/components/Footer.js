import React from "react";
import { Link } from "react-router-dom";
import { Phone, MessageCircle, MapPin, Instagram, Facebook } from "lucide-react";
import { useBranding, useContact } from "@/context/AppContexts";
import { buildWhatsAppLink } from "@/lib/api";

export default function Footer() {
  const { branding } = useBranding();
  const { contact } = useContact();
  const wa = contact?.whatsapp_numbers?.[0];

  return (
    <footer className="mt-24 bg-[#2C4C3B] text-[#F9F6F0]" data-testid="footer">
      <div className="max-w-7xl mx-auto px-5 lg:px-10 pt-24 pb-12">
        <div className="grid lg:grid-cols-12 gap-12">
          <div className="lg:col-span-5">
            <div className="flex items-center gap-3 mb-6">
              {branding?.logo_url && <img src={branding.logo_url} alt="logo" className="h-12 w-12 rounded-full object-cover" />}
              <span className="font-display text-2xl font-semibold">{branding?.brand_name || "Manghani Toy World"}</span>
            </div>
            <p className="font-display text-4xl lg:text-5xl leading-tight tracking-tight max-w-md">
              Crafting wonder. <br />One toy at a time.
            </p>
            <p className="mt-6 text-sm opacity-75 max-w-md">A boutique single-vendor collection of premium toys, curated in Ajmer for families across India.</p>
          </div>

          <div className="lg:col-span-2">
            <div className="text-xs uppercase tracking-[0.25em] opacity-60 mb-4">Shop</div>
            <ul className="space-y-3 text-sm">
              <li><Link to="/products" className="hover:opacity-100 opacity-85">All Products</Link></li>
              <li><Link to="/products?featured=true" className="hover:opacity-100 opacity-85">Featured</Link></li>
              <li><Link to="/wishlist" className="hover:opacity-100 opacity-85">Wishlist</Link></li>
              <li><Link to="/cart" className="hover:opacity-100 opacity-85">Cart</Link></li>
            </ul>
          </div>

          <div className="lg:col-span-2">
            <div className="text-xs uppercase tracking-[0.25em] opacity-60 mb-4">Support</div>
            <ul className="space-y-3 text-sm">
              <li><Link to="/track" className="hover:opacity-100 opacity-85">Track Order</Link></li>
              <li><Link to="/contact" className="hover:opacity-100 opacity-85">Contact</Link></li>
              <li><Link to="/login" className="hover:opacity-100 opacity-85">Account</Link></li>
            </ul>
          </div>

          <div className="lg:col-span-3">
            <div className="text-xs uppercase tracking-[0.25em] opacity-60 mb-4">Visit & Connect</div>
            <div className="space-y-3 text-sm">
              <p className="flex gap-2 opacity-90"><MapPin className="w-4 h-4 mt-0.5 shrink-0" /> {contact?.address || "Shree Talkish Mall, Near Madar Gate, Ajmer, Rajasthan"}</p>
              {contact?.phone_numbers?.map((p) => (
                <a key={p} href={`tel:${p}`} className="flex items-center gap-2 hover:opacity-100 opacity-90" data-testid={`footer-phone-${p}`}>
                  <Phone className="w-4 h-4" /> {p}
                </a>
              ))}
              {wa && (
                <a href={buildWhatsAppLink(wa, `Hi, I'd like to know more about ${branding?.brand_name || "your toys"}.`)} target="_blank" rel="noreferrer" className="inline-flex items-center gap-2 text-[#25D366] hover:opacity-100" data-testid="footer-whatsapp">
                  <MessageCircle className="w-4 h-4" /> Chat on WhatsApp
                </a>
              )}
            </div>
            <div className="mt-6 flex gap-3">
              <a href="#" aria-label="Instagram" className="p-2.5 rounded-full bg-white/10 hover:bg-white/20 transition"><Instagram className="w-4 h-4" /></a>
              <a href="#" aria-label="Facebook" className="p-2.5 rounded-full bg-white/10 hover:bg-white/20 transition"><Facebook className="w-4 h-4" /></a>
            </div>
          </div>
        </div>

        <div className="mt-16 pt-8 border-t border-white/10 flex flex-col md:flex-row justify-between items-center gap-3 text-xs opacity-70">
          <p>© {new Date().getFullYear()} {branding?.brand_name || "Manghani Toy World"}. All rights reserved.</p>
          <p>Handcrafted with care in Ajmer, Rajasthan.</p>
        </div>
      </div>
    </footer>
  );
}
