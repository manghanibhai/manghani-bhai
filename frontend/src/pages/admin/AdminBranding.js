import React, { useEffect, useState } from "react";
import { toast } from "sonner";
import { Upload, X, Save } from "lucide-react";
import { api, formatApiError } from "@/lib/api";
import { useBranding } from "@/context/AppContexts";

export default function AdminBranding() {
  const { branding, reload } = useBranding();
  const [form, setForm] = useState(null);
  const [saving, setSaving] = useState(false);

  useEffect(() => { if (branding) setForm({ ...branding, banner_images: branding.banner_images || [] }); }, [branding]);

  if (!form) return <div className="flex justify-center py-20"><div className="spinner" /></div>;

  const fileToBase64 = (file) => new Promise((res, rej) => {
    if (file.size > 1024 * 1024 * 2) return rej(new Error("File too large (max 2MB)"));
    const r = new FileReader();
    r.onload = () => res(r.result);
    r.onerror = rej;
    r.readAsDataURL(file);
  });

  const uploadLogo = async (e) => {
    const f = e.target.files?.[0]; if (!f) return;
    try { const b = await fileToBase64(f); setForm({ ...form, logo_url: b }); }
    catch (err) { toast.error(err.message); }
  };
  const uploadFavicon = async (e) => {
    const f = e.target.files?.[0]; if (!f) return;
    try { const b = await fileToBase64(f); setForm({ ...form, favicon_url: b }); }
    catch (err) { toast.error(err.message); }
  };
  const uploadBanner = async (e) => {
    const files = Array.from(e.target.files || []);
    try {
      for (const f of files) {
        const b = await fileToBase64(f);
        setForm((cur) => ({ ...cur, banner_images: [...cur.banner_images, b] }));
      }
      e.target.value = "";
    } catch (err) { toast.error(err.message); }
  };

  const save = async () => {
    setSaving(true);
    try {
      await api.put("/branding", form);
      toast.success("Branding updated");
      reload();
    } catch (err) { toast.error(formatApiError(err.response?.data?.detail) || "Failed"); }
    finally { setSaving(false); }
  };

  return (
    <div data-testid="admin-branding">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="font-display text-4xl font-semibold text-heading tracking-tight">Branding</h1>
          <p className="text-body mt-1">Control the look & feel of your store — instantly.</p>
        </div>
        <button onClick={save} disabled={saving} className="btn-primary" data-testid="admin-branding-save-btn">
          <Save className="w-4 h-4" /> {saving ? "Saving…" : "Save changes"}
        </button>
      </div>

      <div className="grid lg:grid-cols-2 gap-6">
        <section className="bg-white border border-brand rounded-3xl p-6 space-y-5">
          <h3 className="font-display text-lg font-semibold text-heading">Identity</h3>
          <div>
            <label className="text-xs uppercase tracking-wider text-muted-brand">Brand name</label>
            <input className="input-brand mt-1.5" value={form.brand_name || ""} onChange={(e) => setForm({ ...form, brand_name: e.target.value })} data-testid="branding-name" />
          </div>
          <div>
            <label className="text-xs uppercase tracking-wider text-muted-brand">Logo</label>
            <div className="mt-2 flex items-center gap-4">
              {form.logo_url && <img src={form.logo_url} alt="logo" className="w-16 h-16 rounded-full object-cover border border-brand" />}
              <label className="px-4 py-2 bg-surface-alt rounded-full text-sm font-medium text-heading hover:bg-brand cursor-pointer flex items-center gap-1">
                <Upload className="w-3.5 h-3.5" /> Upload
                <input type="file" accept="image/*" onChange={uploadLogo} className="hidden" data-testid="branding-logo-upload" />
              </label>
              {form.logo_url && <button onClick={() => setForm({ ...form, logo_url: "" })} className="text-sm text-primary-brand">Remove</button>}
            </div>
            <input placeholder="Or paste image URL" className="input-brand mt-3" value={form.logo_url?.startsWith("data:") ? "" : (form.logo_url || "")} onChange={(e) => setForm({ ...form, logo_url: e.target.value })} />
          </div>
          <div>
            <label className="text-xs uppercase tracking-wider text-muted-brand">Favicon</label>
            <div className="mt-2 flex items-center gap-4">
              {form.favicon_url && <img src={form.favicon_url} alt="favicon" className="w-10 h-10 rounded object-cover border border-brand" />}
              <label className="px-4 py-2 bg-surface-alt rounded-full text-sm font-medium text-heading hover:bg-brand cursor-pointer flex items-center gap-1">
                <Upload className="w-3.5 h-3.5" /> Upload
                <input type="file" accept="image/*" onChange={uploadFavicon} className="hidden" data-testid="branding-favicon-upload" />
              </label>
            </div>
          </div>
        </section>

        <section className="bg-white border border-brand rounded-3xl p-6 space-y-5">
          <h3 className="font-display text-lg font-semibold text-heading">Colors</h3>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-xs uppercase tracking-wider text-muted-brand">Primary</label>
              <div className="mt-1.5 flex items-center gap-2">
                <input type="color" value={form.primary_color || "#C85A4F"} onChange={(e) => setForm({ ...form, primary_color: e.target.value })} className="w-12 h-10 rounded-lg border border-brand cursor-pointer" />
                <input className="input-brand flex-1" value={form.primary_color || ""} onChange={(e) => setForm({ ...form, primary_color: e.target.value })} />
              </div>
            </div>
            <div>
              <label className="text-xs uppercase tracking-wider text-muted-brand">Secondary</label>
              <div className="mt-1.5 flex items-center gap-2">
                <input type="color" value={form.secondary_color || "#E1A140"} onChange={(e) => setForm({ ...form, secondary_color: e.target.value })} className="w-12 h-10 rounded-lg border border-brand cursor-pointer" />
                <input className="input-brand flex-1" value={form.secondary_color || ""} onChange={(e) => setForm({ ...form, secondary_color: e.target.value })} />
              </div>
            </div>
          </div>
          <p className="text-xs text-muted-brand">Color changes apply across CTAs and accents after saving.</p>
        </section>

        <section className="bg-white border border-brand rounded-3xl p-6 space-y-5 lg:col-span-2">
          <h3 className="font-display text-lg font-semibold text-heading">Homepage hero</h3>
          <div>
            <label className="text-xs uppercase tracking-wider text-muted-brand">Hero title</label>
            <input className="input-brand mt-1.5" value={form.hero_title || ""} onChange={(e) => setForm({ ...form, hero_title: e.target.value })} data-testid="branding-hero-title" />
          </div>
          <div>
            <label className="text-xs uppercase tracking-wider text-muted-brand">Hero subtitle</label>
            <textarea rows="2" className="input-brand mt-1.5" value={form.hero_subtitle || ""} onChange={(e) => setForm({ ...form, hero_subtitle: e.target.value })} />
          </div>
          <div>
            <label className="text-xs uppercase tracking-wider text-muted-brand">Banner images</label>
            <div className="mt-2 flex gap-2 items-center">
              <label className="px-4 py-2 bg-surface-alt rounded-full text-sm font-medium text-heading hover:bg-brand cursor-pointer flex items-center gap-1">
                <Upload className="w-3.5 h-3.5" /> Upload
                <input type="file" multiple accept="image/*" onChange={uploadBanner} className="hidden" data-testid="branding-banner-upload" />
              </label>
            </div>
            {form.banner_images.length > 0 && (
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mt-4">
                {form.banner_images.map((b, i) => (
                  <div key={i} className="relative aspect-video rounded-2xl overflow-hidden bg-surface-alt group">
                    <img src={b} alt="" className="w-full h-full object-cover" />
                    <button onClick={() => setForm({ ...form, banner_images: form.banner_images.filter((_, idx) => idx !== i) })} className="absolute top-2 right-2 bg-white/90 rounded-full p-1 opacity-0 group-hover:opacity-100"><X className="w-3 h-3" /></button>
                  </div>
                ))}
              </div>
            )}
          </div>
        </section>
      </div>
    </div>
  );
}
