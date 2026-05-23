import React, { useEffect, useState } from "react";
import { toast } from "sonner";
import { Plus, Trash2, Edit, Check, X } from "lucide-react";
import { api, formatApiError } from "@/lib/api";

export default function AdminCategories() {
  const [cats, setCats] = useState([]);
  const [name, setName] = useState("");
  const [editing, setEditing] = useState(null);
  const [editValue, setEditValue] = useState("");

  const reload = () => api.get("/categories").then((r) => setCats(r.data));
  useEffect(() => { reload(); }, []);

  const create = async (e) => {
    e.preventDefault();
    if (!name.trim()) return;
    try { await api.post("/categories", { name }); setName(""); toast.success("Category added"); reload(); }
    catch (err) { toast.error(formatApiError(err.response?.data?.detail) || "Failed"); }
  };

  const save = async (id) => {
    try { await api.put(`/categories/${id}`, { name: editValue }); setEditing(null); toast.success("Updated"); reload(); }
    catch (err) { toast.error(formatApiError(err.response?.data?.detail) || "Failed"); }
  };

  const remove = async (id) => {
    if (!window.confirm("Delete category?")) return;
    await api.delete(`/categories/${id}`); toast.success("Deleted"); reload();
  };

  return (
    <div data-testid="admin-categories">
      <div className="mb-8">
        <h1 className="font-display text-4xl font-semibold text-heading tracking-tight">Categories</h1>
        <p className="text-body mt-1">{cats.length} categories.</p>
      </div>

      <form onSubmit={create} className="bg-white border border-brand rounded-3xl p-6 flex gap-3 mb-6">
        <input value={name} onChange={(e) => setName(e.target.value)} placeholder="New category name…" className="input-brand flex-1" data-testid="admin-category-input" />
        <button type="submit" className="btn-primary" data-testid="admin-category-add-btn"><Plus className="w-4 h-4" /> Add</button>
      </form>

      <div className="bg-white border border-brand rounded-3xl divide-y divide-[#EADECF]">
        {cats.map((c) => (
          <div key={c.id} className="p-5 flex items-center justify-between" data-testid={`admin-cat-${c.slug}`}>
            {editing === c.id ? (
              <input value={editValue} onChange={(e) => setEditValue(e.target.value)} className="input-brand flex-1 mr-3" autoFocus />
            ) : (
              <div>
                <div className="font-medium text-heading">{c.name}</div>
                <div className="text-xs text-muted-brand">{c.slug}</div>
              </div>
            )}
            <div className="flex gap-2">
              {editing === c.id ? (
                <>
                  <button onClick={() => save(c.id)} className="p-2 hover:bg-surface-alt rounded-full"><Check className="w-4 h-4 text-heading" /></button>
                  <button onClick={() => setEditing(null)} className="p-2 hover:bg-surface-alt rounded-full"><X className="w-4 h-4 text-heading" /></button>
                </>
              ) : (
                <>
                  <button onClick={() => { setEditing(c.id); setEditValue(c.name); }} className="p-2 hover:bg-surface-alt rounded-full"><Edit className="w-4 h-4 text-heading" /></button>
                  <button onClick={() => remove(c.id)} className="p-2 hover:bg-primary-brand hover:text-white rounded-full"><Trash2 className="w-4 h-4" /></button>
                </>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
