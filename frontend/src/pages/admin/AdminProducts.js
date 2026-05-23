import React, { useEffect, useState } from "react";
import { toast } from "sonner";
import { Plus, Edit, Trash2, X, Star, Upload } from "lucide-react";
import { api, formatPrice, formatApiError } from "@/lib/api";

const EMPTY = { title: "", description: "", images: [], price: 0, discounted_price: null, stock: 0, category_id: "", featured: false };

export default function AdminProducts() {
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState(EMPTY);
  const [imageInput, setImageInput] = useState("");

  const reload = () => api.get("/products").then((r) => setProducts(r.data));
  useEffect(() => { reload(); api.get("/categories").then((r) => setCategories(r.data)); }, []);

  const openCreate = () => { setEditing(null); setForm(EMPTY); setShowForm(true); };
  const openEdit = (p) => {
    setEditing(p);
    setForm({
      title: p.title, description: p.description, images: p.images || [], price: p.price,
      discounted_price: p.discounted_price ?? null, stock: p.stock, category_id: p.category_id || "", featured: !!p.featured,
    });
    setShowForm(true);
  };

  const submit = async (e) => {
    e.preventDefault();
    try {
      const payload = { ...form, price: parseFloat(form.price) || 0, stock: parseInt(form.stock) || 0,
        discounted_price: form.discounted_price ? parseFloat(form.discounted_price) : null,
        category_id: form.category_id || null };
      if (editing) await api.put(`/products/${editing.id}`, payload);
      else await api.post("/products", payload);
      toast.success(editing ? "Product updated" : "Product added");
      setShowForm(false);
      reload();
    } catch (err) { toast.error(formatApiError(err.response?.data?.detail) || "Failed"); }
  };

  const remove = async (p) => {
    if (!window.confirm(`Delete "${p.title}"?`)) return;
    await api.delete(`/products/${p.id}`);
    toast.success("Product deleted");
    reload();
  };

  const handleFileUpload = (e) => {
    const files = Array.from(e.target.files || []);
    files.forEach((f) => {
      if (f.size > 1024 * 1024 * 2) { toast.error(`${f.name} is too large (max 2MB)`); return; }
      const reader = new FileReader();
      reader.onload = () => setForm((cur) => ({ ...cur, images: [...cur.images, reader.result] }));
      reader.readAsDataURL(f);
    });
    e.target.value = "";
  };

  const addImageUrl = () => {
    if (!imageInput.trim()) return;
    setForm((cur) => ({ ...cur, images: [...cur.images, imageInput.trim()] }));
    setImageInput("");
  };

  return (
    <div data-testid="admin-products">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="font-display text-4xl font-semibold text-heading tracking-tight">Products</h1>
          <p className="text-body mt-1">{products.length} items in your boutique.</p>
        </div>
        <button onClick={openCreate} className="btn-primary" data-testid="admin-add-product-btn"><Plus className="w-4 h-4" /> Add Product</button>
      </div>

      <div className="bg-white border border-brand rounded-3xl overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-surface-alt text-heading">
            <tr><th className="text-left p-4 font-medium">Product</th><th className="text-left p-4 font-medium">Category</th><th className="text-left p-4 font-medium">Price</th><th className="text-left p-4 font-medium">Stock</th><th className="text-left p-4 font-medium">Featured</th><th className="text-right p-4 font-medium">Actions</th></tr>
          </thead>
          <tbody>
            {products.map((p) => (
              <tr key={p.id} className="border-t border-brand" data-testid={`admin-product-row-${p.id}`}>
                <td className="p-4 flex items-center gap-3">
                  <div className="w-12 h-12 rounded-xl bg-surface-alt overflow-hidden shrink-0">{p.images?.[0] && <img src={p.images[0]} alt={p.title} className="w-full h-full object-cover" />}</div>
                  <div className="font-medium text-heading">{p.title}</div>
                </td>
                <td className="p-4 text-body">{p.category_name || "—"}</td>
                <td className="p-4 text-heading">{formatPrice(p.discounted_price ?? p.price)}</td>
                <td className="p-4 text-body">{p.stock}</td>
                <td className="p-4">{p.featured && <Star className="w-4 h-4 text-[#E1A140] fill-current" />}</td>
                <td className="p-4 text-right">
                  <button onClick={() => openEdit(p)} className="p-2 hover:bg-surface-alt rounded-full" data-testid={`admin-edit-product-${p.id}`}><Edit className="w-4 h-4 text-heading" /></button>
                  <button onClick={() => remove(p)} className="p-2 hover:bg-primary-brand hover:text-white rounded-full" data-testid={`admin-delete-product-${p.id}`}><Trash2 className="w-4 h-4" /></button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {showForm && (
        <div className="fixed inset-0 z-50 bg-black/40 flex items-center justify-center p-4 overflow-y-auto" onClick={() => setShowForm(false)}>
          <div className="bg-white rounded-3xl max-w-2xl w-full p-7 max-h-[90vh] overflow-y-auto" onClick={(e) => e.stopPropagation()} data-testid="admin-product-form">
            <div className="flex justify-between items-start mb-6">
              <h2 className="font-display text-2xl font-semibold text-heading">{editing ? "Edit product" : "New product"}</h2>
              <button onClick={() => setShowForm(false)} className="p-2 hover:bg-surface-alt rounded-full"><X className="w-4 h-4" /></button>
            </div>
            <form onSubmit={submit} className="space-y-5">
              <div>
                <label className="text-xs uppercase tracking-wider text-muted-brand">Title *</label>
                <input className="input-brand mt-1.5" value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} required data-testid="product-form-title" />
              </div>
              <div>
                <label className="text-xs uppercase tracking-wider text-muted-brand">Description</label>
                <textarea rows="4" className="input-brand mt-1.5" value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} data-testid="product-form-desc" />
              </div>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                <div>
                  <label className="text-xs uppercase tracking-wider text-muted-brand">Price *</label>
                  <input type="number" step="any" className="input-brand mt-1.5" value={form.price} onChange={(e) => setForm({ ...form, price: e.target.value })} required data-testid="product-form-price" />
                </div>
                <div>
                  <label className="text-xs uppercase tracking-wider text-muted-brand">Discounted</label>
                  <input type="number" step="any" className="input-brand mt-1.5" value={form.discounted_price ?? ""} onChange={(e) => setForm({ ...form, discounted_price: e.target.value || null })} />
                </div>
                <div>
                  <label className="text-xs uppercase tracking-wider text-muted-brand">Stock *</label>
                  <input type="number" className="input-brand mt-1.5" value={form.stock} onChange={(e) => setForm({ ...form, stock: e.target.value })} required data-testid="product-form-stock" />
                </div>
              </div>
              <div>
                <label className="text-xs uppercase tracking-wider text-muted-brand">Category</label>
                <select className="input-brand mt-1.5" value={form.category_id} onChange={(e) => setForm({ ...form, category_id: e.target.value })} data-testid="product-form-category">
                  <option value="">— None —</option>
                  {categories.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
                </select>
              </div>
              <div>
                <label className="text-xs uppercase tracking-wider text-muted-brand">Images</label>
                <div className="mt-1.5 flex gap-2">
                  <input value={imageInput} onChange={(e) => setImageInput(e.target.value)} placeholder="Paste image URL" className="input-brand flex-1" />
                  <button type="button" onClick={addImageUrl} className="px-4 py-2 bg-surface-alt rounded-full text-sm font-medium text-heading hover:bg-brand">Add URL</button>
                  <label className="px-4 py-2 bg-surface-alt rounded-full text-sm font-medium text-heading hover:bg-brand cursor-pointer flex items-center gap-1">
                    <Upload className="w-3.5 h-3.5" /> Upload
                    <input type="file" multiple accept="image/*" onChange={handleFileUpload} className="hidden" data-testid="product-form-upload" />
                  </label>
                </div>
                {form.images.length > 0 && (
                  <div className="mt-3 grid grid-cols-4 gap-2">
                    {form.images.map((img, i) => (
                      <div key={i} className="relative aspect-square rounded-xl overflow-hidden bg-surface-alt group">
                        <img src={img} alt="" className="w-full h-full object-cover" />
                        <button type="button" onClick={() => setForm({ ...form, images: form.images.filter((_, idx) => idx !== i) })} className="absolute top-1 right-1 bg-white/90 rounded-full p-1 opacity-0 group-hover:opacity-100"><X className="w-3 h-3" /></button>
                      </div>
                    ))}
                  </div>
                )}
              </div>
              <label className="flex items-center gap-2 text-sm text-heading">
                <input type="checkbox" checked={form.featured} onChange={(e) => setForm({ ...form, featured: e.target.checked })} data-testid="product-form-featured" />
                Feature on homepage
              </label>
              <div className="flex justify-end gap-3 pt-4">
                <button type="button" onClick={() => setShowForm(false)} className="btn-outline">Cancel</button>
                <button type="submit" className="btn-primary" data-testid="product-form-submit">{editing ? "Save changes" : "Create product"}</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
