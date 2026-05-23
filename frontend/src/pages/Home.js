import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { ArrowRight, ShieldCheck, Truck, Sparkles, MessageCircle } from "lucide-react";
import { api, buildWhatsAppLink, notifyApiError } from "@/lib/api";
import { useBranding, useContact } from "@/context/AppContexts";
import ProductCard from "@/components/ProductCard";

export default function Home() {
  const { branding } = useBranding();
  const { contact } = useContact();
  const [featured, setFeatured] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      try {
        const [p, c] = await Promise.all([
          api.get("/products", { params: { featured: true, limit: 8 } }),
          api.get("/categories"),
        ]);
        setFeatured(p.data);
        setCategories(c.data);
      } catch (err) {
        notifyApiError(err, "Home");
      } finally { setLoading(false); }
    })();
  }, []);

  const heroBanner = branding?.banner_images?.[0];
  const wa = contact?.whatsapp_numbers?.[0];

  return (
    <div data-testid="home-page">
      {/* HERO */}
      <section className="max-w-7xl mx-auto px-5 lg:px-10 pt-12 lg:pt-20 pb-20">
        <div className="grid lg:grid-cols-12 gap-8 lg:gap-12 items-center">
          <div className="lg:col-span-6 fade-up">
            <div className="inline-flex items-center gap-2 chip mb-6">
              <Sparkles className="w-3.5 h-3.5" />
              <span>Boutique toys · Ajmer since est.</span>
            </div>
            <h1 className="font-display text-5xl sm:text-6xl lg:text-7xl xl:text-[5.5rem] font-semibold leading-[1.02] tracking-tight text-heading">
              {branding?.hero_title || "Where Childhood Wonder Lives."}
            </h1>
            <p className="mt-7 text-lg text-body max-w-xl leading-relaxed">
              {branding?.hero_subtitle || "A boutique collection of premium, hand-picked toys for the modern Indian family. Crafted to spark imagination, built to last generations."}
            </p>
            <div className="mt-9 flex flex-wrap gap-3">
              <Link to="/products" className="btn-primary" data-testid="hero-shop-btn">
                Shop the Collection <ArrowRight className="w-4 h-4" />
              </Link>
              {wa && (
                <a href={buildWhatsAppLink(wa, "Hi, I'd love a personal recommendation from your collection.")} target="_blank" rel="noreferrer" className="btn-whatsapp" data-testid="hero-whatsapp-btn">
                  <MessageCircle className="w-4 h-4" /> Get Recommendation
                </a>
              )}
            </div>

            <div className="mt-12 grid grid-cols-3 gap-4 max-w-md">
              <div><div className="font-display text-2xl font-semibold text-heading">500+</div><div className="text-xs text-muted-brand mt-1">Curated toys</div></div>
              <div><div className="font-display text-2xl font-semibold text-heading">10k+</div><div className="text-xs text-muted-brand mt-1">Happy families</div></div>
              <div><div className="font-display text-2xl font-semibold text-heading">4.9★</div><div className="text-xs text-muted-brand mt-1">Customer rating</div></div>
            </div>
          </div>

          <div className="lg:col-span-6 fade-up" style={{ animationDelay: "120ms" }}>
            <div className="relative">
              <div className="aspect-[4/5] rounded-[2rem] overflow-hidden bg-surface-alt shadow-2xl">
                {heroBanner && <img src={heroBanner} alt="Hero" className="w-full h-full object-cover" />}
              </div>
              <div className="absolute -bottom-6 -left-6 bg-white rounded-2xl p-5 shadow-xl border border-brand hidden md:block float-anim">
                <div className="text-xs uppercase tracking-[0.2em] text-muted-brand">Featured today</div>
                <div className="font-display text-lg text-heading mt-1 max-w-[180px]">Handcrafted wooden heirlooms</div>
              </div>
              <div className="absolute -top-4 -right-4 bg-[#E1A140] text-[#2C4C3B] rounded-full px-5 py-3 shadow-xl text-sm font-semibold rotate-3 hidden md:block">
                Free gift wrap
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Trust strip */}
      <section className="border-y border-brand bg-white/40">
        <div className="max-w-7xl mx-auto px-5 lg:px-10 py-8 grid grid-cols-2 md:grid-cols-4 gap-6">
          {[
            { icon: ShieldCheck, t: "Authenticity Promise", d: "Every toy curated by hand" },
            { icon: Truck, t: "Free delivery", d: "On orders above ₹2,000" },
            { icon: Sparkles, t: "Gift wrapping", d: "Complimentary on request" },
            { icon: MessageCircle, t: "Personal assistance", d: "Chat with us on WhatsApp" },
          ].map((b, i) => (
            <div key={i} className="flex items-start gap-3">
              <b.icon className="w-5 h-5 text-primary-brand shrink-0 mt-0.5" />
              <div>
                <div className="text-sm font-semibold text-heading">{b.t}</div>
                <div className="text-xs text-muted-brand">{b.d}</div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Categories */}
      <section className="max-w-7xl mx-auto px-5 lg:px-10 py-24">
        <div className="flex items-end justify-between mb-12 flex-wrap gap-4">
          <div>
            <div className="text-xs uppercase tracking-[0.25em] text-primary-brand mb-3 font-semibold">Browse by world</div>
            <h2 className="font-display text-4xl lg:text-5xl font-semibold text-heading tracking-tight max-w-xl">A category for every kind of curiosity.</h2>
          </div>
          <Link to="/products" className="text-sm font-medium text-heading underline underline-offset-4 hover:text-primary-brand">View all toys →</Link>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 lg:gap-6">
          {categories.slice(0, 8).map((c, i) => (
            <Link key={c.id} to={`/products?category=${c.id}`} className="group block fade-up" style={{ animationDelay: `${i * 50}ms` }} data-testid={`home-category-${c.slug}`}>
              <div className="aspect-square rounded-3xl bg-gradient-to-br from-[#F3EBE1] to-[#EADECF] p-6 lg:p-8 flex flex-col justify-between hover:from-[#E1A140] hover:to-[#C98B30] transition-all duration-500">
                <div className="font-display text-4xl text-heading/30 group-hover:text-white/40 transition-colors">0{i + 1}</div>
                <div>
                  <div className="font-display text-lg lg:text-xl font-semibold text-heading group-hover:text-white transition-colors">{c.name}</div>
                  <div className="mt-1 text-xs text-muted-brand group-hover:text-white/80 transition-colors flex items-center gap-1">Explore <ArrowRight className="w-3 h-3" /></div>
                </div>
              </div>
            </Link>
          ))}
        </div>
      </section>

      {/* Featured products */}
      <section className="max-w-7xl mx-auto px-5 lg:px-10 pb-24">
        <div className="flex items-end justify-between mb-12 flex-wrap gap-4">
          <div>
            <div className="text-xs uppercase tracking-[0.25em] text-primary-brand mb-3 font-semibold">Hand-picked</div>
            <h2 className="font-display text-4xl lg:text-5xl font-semibold text-heading tracking-tight">This season's favourites.</h2>
          </div>
          <Link to="/products" className="text-sm font-medium text-heading underline underline-offset-4 hover:text-primary-brand">Shop all →</Link>
        </div>
        {loading ? (
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-6">{[...Array(4)].map((_, i) => <div key={i} className="aspect-[4/5] rounded-3xl bg-surface-alt animate-pulse" />)}</div>
        ) : (
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-6 lg:gap-8">
            {featured.map((p, i) => <ProductCard key={p.id} product={p} index={i} />)}
          </div>
        )}
      </section>

      {/* Brand story */}
      <section className="max-w-7xl mx-auto px-5 lg:px-10 pb-24">
        <div className="rounded-[2.5rem] bg-[#2C4C3B] text-[#F9F6F0] p-10 lg:p-20 grid lg:grid-cols-2 gap-10 items-center">
          <div>
            <div className="text-xs uppercase tracking-[0.25em] opacity-70 mb-4">Our promise</div>
            <h2 className="font-display text-4xl lg:text-5xl font-semibold leading-tight tracking-tight">Not just a toy store. A keeper of childhoods.</h2>
            <p className="mt-6 opacity-85 max-w-lg leading-relaxed">For decades, Manghani Toy World has been Ajmer's most-loved boutique for premium toys. Every piece is chosen for its craft, its warmth, and its ability to outlast trends.</p>
            <Link to="/contact" className="btn-secondary mt-8 inline-flex" data-testid="brand-story-contact-btn">Visit our boutique</Link>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="aspect-square rounded-3xl bg-white/10 p-6 flex flex-col justify-between">
              <div className="font-display text-5xl font-semibold">25+</div>
              <div className="text-sm opacity-80">years of curating wonder</div>
            </div>
            <div className="aspect-square rounded-3xl bg-[#E1A140] text-[#2C4C3B] p-6 flex flex-col justify-between mt-8">
              <div className="font-display text-5xl font-semibold">100%</div>
              <div className="text-sm">hand-picked by our family</div>
            </div>
            <div className="aspect-square rounded-3xl bg-[#C85A4F] text-white p-6 flex flex-col justify-between -mt-2">
              <div className="font-display text-5xl font-semibold">50+</div>
              <div className="text-sm opacity-90">trusted toy makers</div>
            </div>
            <div className="aspect-square rounded-3xl bg-white/10 p-6 flex flex-col justify-between mt-6">
              <div className="font-display text-5xl font-semibold">∞</div>
              <div className="text-sm opacity-80">smiles delivered</div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
