import React, { useEffect, useMemo, useState } from "react";
import { useSearchParams } from "react-router-dom";
import { Search, SlidersHorizontal, X } from "lucide-react";
import { api, notifyApiError } from "@/lib/api";
import ProductCard from "@/components/ProductCard";

export default function Products() {
  const [params, setParams] = useSearchParams();
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [q, setQ] = useState(params.get("q") || "");
  const [sort, setSort] = useState(params.get("sort") || "newest");
  const [showFilters, setShowFilters] = useState(false);

  const activeCat = params.get("category") || "";
  const isFeatured = params.get("featured") === "true";

  useEffect(() => {
    api.get("/categories").then((r) => setCategories(r.data)).catch((err) => notifyApiError(err, "Products:categories"));
  }, []);

  useEffect(() => {
    setLoading(true);
    const queryParams = { sort };
    if (q) queryParams.q = q;
    if (activeCat) queryParams.category_id = activeCat;
    if (isFeatured) queryParams.featured = true;
    api
      .get("/products", { params: queryParams })
      .then((r) => setProducts(r.data))
      .catch((err) => notifyApiError(err, "Products:products"))
      .finally(() => setLoading(false));
  }, [q, activeCat, isFeatured, sort]);

  const updateParam = (key, value) => {
    const next = new URLSearchParams(params);
    if (value) next.set(key, value); else next.delete(key);
    setParams(next);
  };

  const filtered = useMemo(() => products, [products]);

  return (
    <div className="max-w-7xl mx-auto px-5 lg:px-10 py-12 lg:py-20" data-testid="products-page">
      <div className="mb-10">
        <h1 className="font-display text-5xl lg:text-6xl font-semibold text-heading tracking-tight">The collection.</h1>
        <p className="mt-3 text-body max-w-xl">Every piece, hand-selected. {filtered.length} treasures await.</p>
      </div>

      <div className="flex flex-wrap items-center gap-3 mb-8">
        <div className="flex items-center bg-white border border-brand rounded-full px-4 py-2.5 flex-1 min-w-[240px] max-w-md">
          <Search className="w-4 h-4 text-muted-brand" />
          <input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Search the collection…" className="bg-transparent ml-2 outline-none text-sm w-full text-heading" data-testid="products-search-input" />
        </div>
        <button onClick={() => setShowFilters(!showFilters)} className="md:hidden chip" data-testid="products-toggle-filters">
          <SlidersHorizontal className="w-3.5 h-3.5 mr-1" /> Filter
        </button>
        <select value={sort} onChange={(e) => setSort(e.target.value)} className="bg-white border border-brand rounded-full px-4 py-2.5 text-sm text-heading outline-none" data-testid="products-sort-select">
          <option value="newest">Newest</option>
          <option value="price_asc">Price: low to high</option>
          <option value="price_desc">Price: high to low</option>
        </select>
      </div>

      <div className="grid lg:grid-cols-12 gap-10">
        <aside className={`lg:col-span-3 ${showFilters ? "block" : "hidden lg:block"}`}>
          <div className="lg:sticky lg:top-28">
            <div className="text-xs uppercase tracking-[0.25em] text-muted-brand mb-4">Category</div>
            <div className="flex flex-wrap lg:flex-col gap-2">
              <button onClick={() => updateParam("category", "")} className={`chip ${!activeCat ? "chip-active" : ""}`} data-testid="filter-cat-all">All</button>
              {categories.map((c) => (
                <button key={c.id} onClick={() => updateParam("category", c.id)} className={`chip ${activeCat === c.id ? "chip-active" : ""}`} data-testid={`filter-cat-${c.slug}`}>{c.name}</button>
              ))}
            </div>

            {(activeCat || q || isFeatured) && (
              <button onClick={() => { setParams({}); setQ(""); }} className="mt-6 inline-flex items-center text-xs text-primary-brand font-medium gap-1 hover:underline" data-testid="filter-clear-btn">
                <X className="w-3 h-3" /> Clear filters
              </button>
            )}
          </div>
        </aside>

        <div className="lg:col-span-9">
          {loading ? (
            <div className="grid grid-cols-2 lg:grid-cols-3 gap-6">{[...Array(6)].map((_, i) => <div key={i} className="aspect-[4/5] rounded-3xl bg-surface-alt animate-pulse" />)}</div>
          ) : filtered.length === 0 ? (
            <div className="py-24 text-center">
              <div className="font-display text-3xl text-heading">No toys match your search.</div>
              <p className="mt-3 text-body">Try adjusting your filters or browse the full collection.</p>
            </div>
          ) : (
            <div className="grid grid-cols-2 lg:grid-cols-3 gap-6 lg:gap-8">
              {filtered.map((p, i) => <ProductCard key={p.id} product={p} index={i} />)}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
