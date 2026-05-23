import React, { useEffect, useState } from "react";
import { toast } from "sonner";
import { Save, Plus, X } from "lucide-react";
import { api, formatApiError } from "@/lib/api";
import { useContact } from "@/context/AppContexts";

export default function AdminContact() {
  const { contact, reload } = useContact();
  const [form, setForm] = useState(null);
  const [saving, setSaving] = useState(false);

  useEffect(() => { if (contact) setForm({
    whatsapp_numbers: contact.whatsapp_numbers || [],
    phone_numbers: contact.phone_numbers || [],
    address: contact.address || "",
    map_embed_url: contact.map_embed_url || "",
    instagram_url: contact.instagram_url || "",
    youtube_url: contact.youtube_url || "",
    show_map: contact.show_map ?? true,
  }); }, [contact]);


  if (!form) return <div className="flex justify-center py-20"><div className="spinner" /></div>;

  const addItem = (key) => setForm({ ...form, [key]: [...form[key], ""] });
  const updItem = (key, i, v) => setForm({ ...form, [key]: form[key].map((x, idx) => idx === i ? v : x) });
  const rmItem = (key, i) => setForm({ ...form, [key]: form[key].filter((_, idx) => idx !== i) });

  const save = async () => {
    setSaving(true);
    try {
      const cleaned = { ...form,
        whatsapp_numbers: form.whatsapp_numbers.filter((x) => x.trim()),
        phone_numbers: form.phone_numbers.filter((x) => x.trim()),
      };
      await api.put("/contact-settings", cleaned);
      toast.success("Contact settings saved");
      reload();
    } catch (err) { toast.error(formatApiError(err.response?.data?.detail) || "Failed"); }
    finally { setSaving(false); }
  };

  return (
    <div data-testid="admin-contact">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="font-display text-4xl font-semibold text-heading tracking-tight">Contact</h1>
          <p className="text-body mt-1">Manage WhatsApp, phone, address & map.</p>
        </div>
        <button onClick={save} disabled={saving} className="btn-primary" data-testid="admin-contact-save-btn">
          <Save className="w-4 h-4" /> {saving ? "Saving…" : "Save changes"}
        </button>
      </div>

      <div className="grid lg:grid-cols-2 gap-6">
        <section className="bg-white border border-brand rounded-3xl p-6 space-y-3">
          <div className="flex justify-between items-center">
            <h3 className="font-display text-lg font-semibold text-heading">WhatsApp numbers</h3>
            <button onClick={() => addItem("whatsapp_numbers")} className="text-sm text-primary-brand flex items-center gap-1" data-testid="admin-add-wa"><Plus className="w-3.5 h-3.5" /> Add</button>
          </div>
          {form.whatsapp_numbers.map((n, i) => (
            <div key={i} className="flex gap-2">
              <input value={n} onChange={(e) => updItem("whatsapp_numbers", i, e.target.value)} placeholder="+91 XXXXXXXXXX" className="input-brand flex-1" />
              <button onClick={() => rmItem("whatsapp_numbers", i)} className="p-2 hover:bg-surface-alt rounded-full"><X className="w-4 h-4" /></button>
            </div>
          ))}
        </section>

        <section className="bg-white border border-brand rounded-3xl p-6 space-y-3">
          <div className="flex justify-between items-center">
            <h3 className="font-display text-lg font-semibold text-heading">Phone numbers</h3>
            <button onClick={() => addItem("phone_numbers")} className="text-sm text-primary-brand flex items-center gap-1" data-testid="admin-add-phone"><Plus className="w-3.5 h-3.5" /> Add</button>
          </div>
          {form.phone_numbers.map((n, i) => (
            <div key={i} className="flex gap-2">
              <input value={n} onChange={(e) => updItem("phone_numbers", i, e.target.value)} placeholder="+91 XXXXXXXXXX" className="input-brand flex-1" />
              <button onClick={() => rmItem("phone_numbers", i)} className="p-2 hover:bg-surface-alt rounded-full"><X className="w-4 h-4" /></button>
            </div>
          ))}
        </section>

        <section className="bg-white border border-brand rounded-3xl p-6 space-y-3 lg:col-span-2">
          <h3 className="font-display text-lg font-semibold text-heading">Address & Map</h3>
          <div>
            <label className="text-xs uppercase tracking-wider text-muted-brand">Business address</label>
            <textarea rows="2" className="input-brand mt-1.5" value={form.address} onChange={(e) => setForm({ ...form, address: e.target.value })} data-testid="admin-contact-address" />
          </div>
          <div>
            <label className="text-xs uppercase tracking-wider text-muted-brand">Google Maps embed URL</label>
            <input className="input-brand mt-1.5" value={form.map_embed_url} onChange={(e) => setForm({ ...form, map_embed_url: e.target.value })} placeholder="https://www.google.com/maps/embed?pb=..." />
          </div>

          <div className="grid sm:grid-cols-2 gap-4">
            <div>
              <label className="text-xs uppercase tracking-wider text-muted-brand">Instagram URL</label>
              <input className="input-brand mt-1.5" value={form.instagram_url} onChange={(e) => setForm({ ...form, instagram_url: e.target.value })} placeholder="https://instagram.com/yourpage" data-testid="admin-contact-instagram-url" />
            </div>
            <div>
              <label className="text-xs uppercase tracking-wider text-muted-brand">YouTube URL</label>
              <input className="input-brand mt-1.5" value={form.youtube_url} onChange={(e) => setForm({ ...form, youtube_url: e.target.value })} placeholder="https://youtube.com/@yourchannel" data-testid="admin-contact-youtube-url" />
            </div>
          </div>

          <label className="flex items-center gap-2 text-sm text-heading">
            <input type="checkbox" checked={form.show_map} onChange={(e) => setForm({ ...form, show_map: e.target.checked })} />
            Display map on Contact page
          </label>

        </section>
      </div>
    </div>
  );
}
