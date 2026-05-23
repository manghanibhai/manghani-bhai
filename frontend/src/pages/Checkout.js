import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { ArrowRight, MessageCircle } from "lucide-react";
import { api, formatApiError, formatPrice, buildWhatsAppLink } from "@/lib/api";
import { useAuth, useCart, useContact, useBranding } from "@/context/AppContexts";

export default function Checkout() {
  const { user } = useAuth();
  const { items, total, clear } = useCart();
  const { contact } = useContact();
  const { branding } = useBranding();
  const navigate = useNavigate();
  const [form, setForm] = useState({
    shipping_name: user?.name || "",
    shipping_phone: "",
    shipping_address: "",
    notes: "",
    payment_mode: "cod",
  });

  const [submitting, setSubmitting] = useState(false);

  if (items.length === 0) {
    return (
      <div className="max-w-2xl mx-auto px-5 py-24 text-center">
        <h1 className="font-display text-3xl text-heading">Your cart is empty.</h1>
        <button onClick={() => navigate("/products")} className="btn-primary mt-6 inline-flex">Browse products</button>
      </div>
    );
  }

  const shipping = 0;
  const grand = total;

  const submit = async (e) => {
    e.preventDefault();
    if (!form.shipping_name || !form.shipping_phone || !form.shipping_address) {
      toast.error("Please fill all required fields");
      return;
    }
    setSubmitting(true);
    try {
      // backend OrderIn does not include payment_mode; omit it to avoid 422
      const { payment_mode: _paymentMode, ...requestBody } = form;
      const { data } = await api.post("/orders", { ...requestBody, items });
      clear();
      toast.success("Order placed!", { description: `Order ${data.order_no}` });

      navigate(`/order-success/${data.order_no}`);
    } catch (err) {
      toast.error(formatApiError(err.response?.data?.detail) || "Could not place order");
    } finally { setSubmitting(false); }
  };

  const wa = contact?.whatsapp_numbers?.[0];
  const waMsg = `Hi! I'd like to place an order:\n\n${items.map((i) => `• ${i.title} × ${i.qty} — ${formatPrice(i.price * i.qty)}`).join("\n")}\n\nTotal: ${formatPrice(grand)}`;

  return (
    <div className="max-w-7xl mx-auto px-5 lg:px-10 py-12 lg:py-20" data-testid="checkout-page">
      <h1 className="font-display text-5xl font-semibold text-heading mb-10 tracking-tight">Checkout.</h1>
      <form onSubmit={submit} className="grid lg:grid-cols-12 gap-10">
        <div className="lg:col-span-8 space-y-6">
          <div className="bg-white border border-brand rounded-3xl p-6 lg:p-8">
            <h2 className="font-display text-xl font-semibold text-heading mb-5">Shipping details</h2>
            <div className="grid sm:grid-cols-2 gap-4">
              <div>
                <label className="text-xs uppercase tracking-wider text-muted-brand">Full name *</label>
                <input className="input-brand mt-1.5" value={form.shipping_name} onChange={(e) => setForm({ ...form, shipping_name: e.target.value })} required data-testid="checkout-name" />
              </div>
              <div>
                <label className="text-xs uppercase tracking-wider text-muted-brand">Phone *</label>
                <input className="input-brand mt-1.5" value={form.shipping_phone} onChange={(e) => setForm({ ...form, shipping_phone: e.target.value })} required data-testid="checkout-phone" />
              </div>
              <div className="sm:col-span-2">
                <label className="text-xs uppercase tracking-wider text-muted-brand">Address *</label>
                <textarea rows="3" className="input-brand mt-1.5" value={form.shipping_address} onChange={(e) => setForm({ ...form, shipping_address: e.target.value })} required data-testid="checkout-address" />
              </div>
              <div className="sm:col-span-2">
                <label className="text-xs uppercase tracking-wider text-muted-brand">Notes (gift wrap, delivery time, etc.)</label>
                <textarea rows="2" className="input-brand mt-1.5" value={form.notes} onChange={(e) => setForm({ ...form, notes: e.target.value })} data-testid="checkout-notes" />
              </div>
            </div>
          </div>

          <div className="bg-white border border-brand rounded-3xl p-6 lg:p-8">
            <h2 className="font-display text-xl font-semibold text-heading mb-2">Payment</h2>
            <p className="text-sm text-body">
              Choose your preferred payment method. For online orders, share payment on UPI using the QR below.
            </p>

            <div className="mt-5">
              <label className="text-xs uppercase tracking-wider text-muted-brand">Payment mode</label>
              <div className="mt-2 grid sm:grid-cols-2 gap-3">
                <button
                  type="button"
                  onClick={() => setForm({ ...form, payment_mode: "cod" })}
                  className={`btn-outline w-full ${form.payment_mode === "cod" ? "btn-primary" : ""}`}
                  data-testid="checkout-mode-cod"
                >
                  Cash on Delivery
                </button>
                <button
                  type="button"
                  onClick={() => setForm({ ...form, payment_mode: "online" })}
                  className={`btn-outline w-full ${form.payment_mode === "online" ? "btn-primary" : ""}`}
                  data-testid="checkout-mode-online"
                >
                  Online (UPI)
                </button>
              </div>
            </div>

            {form.payment_mode === "online" && (
              <div className="mt-6 bg-surface-alt border border-brand/40 rounded-3xl p-5" data-testid="checkout-upi-panel">
                <div className="text-sm font-semibold text-heading">UPI ID</div>
                <div className="mt-1 text-body break-all">karanmanghani81@ybl</div>

                <div className="mt-4 flex flex-col sm:flex-row gap-3 items-stretch">
                  <div className="w-40 h-40 bg-white rounded-2xl border border-brand flex items-center justify-center shrink-0" data-testid="checkout-upi-qr">
                    <svg width="160" height="160" viewBox="0 0 160 160" xmlns="http://www.w3.org/2000/svg" role="img" aria-label="UPI QR placeholder">
                      <rect width="160" height="160" fill="#fff" />
                      <rect x="10" y="10" width="35" height="35" fill="#000" />
                      <rect x="115" y="10" width="35" height="35" fill="#000" />
                      <rect x="10" y="115" width="35" height="35" fill="#000" />
                      <rect x="55" y="55" width="50" height="50" fill="#000" />
                      <g fill="#000">
                        <rect x="45" y="45" width="8" height="8" />
                        <rect x="60" y="45" width="8" height="8" />
                        <rect x="75" y="45" width="8" height="8" />
                        <rect x="90" y="45" width="8" height="8" />
                        <rect x="45" y="60" width="8" height="8" />
                        <rect x="90" y="60" width="8" height="8" />
                        <rect x="45" y="75" width="8" height="8" />
                        <rect x="90" y="75" width="8" height="8" />
                        <rect x="45" y="90" width="8" height="8" />
                        <rect x="90" y="90" width="8" height="8" />
                        <rect x="60" y="105" width="8" height="8" />
                        <rect x="75" y="105" width="8" height="8" />
                        <rect x="105" y="60" width="8" height="8" />
                      </g>
                    </svg>
                  </div>

                  <div className="flex-1 flex flex-col justify-center">
                    <label className="text-xs uppercase tracking-wider text-muted-brand">Quick pay</label>
                    <a
                      href={`upi://pay?pa=karanmanghani81@ybl&pn=Manghani%20Toy%20World&am=${encodeURIComponent(String(grand))}&cu=INR&tn=${encodeURIComponent(
                        `Order%20Total%20${grand}`
                      )}`}
                      className="btn-primary w-full mt-3 inline-flex justify-center"
                      data-testid="checkout-upi-open-app-btn"
                    >
                      Open UPI app to Pay
                    </a>
                  </div>
                </div>

                <p className="text-xs text-muted-brand mt-3">
                  After payment, our team will confirm via WhatsApp.
                </p>
              </div>
            )}

          </div>

        </div>

        <div className="lg:col-span-4">
          <div className="bg-white border border-brand rounded-3xl p-7 lg:sticky lg:top-28">
            <h2 className="font-display text-2xl font-semibold text-heading mb-5">Order ({items.length})</h2>
            <div className="space-y-3 max-h-72 overflow-y-auto pr-1">
              {items.map((i) => (
                <div key={i.product_id} className="flex gap-3 text-sm">
                  <div className="w-14 h-14 rounded-xl bg-surface-alt overflow-hidden shrink-0">{i.image && <img src={i.image} alt={i.title} className="w-full h-full object-cover" />}</div>
                  <div className="flex-1">
                    <div className="text-heading line-clamp-2">{i.title}</div>
                    <div className="text-muted-brand text-xs">Qty {i.qty}</div>
                  </div>
                  <div className="text-heading font-medium">{formatPrice(i.price * i.qty)}</div>
                </div>
              ))}
            </div>
            <div className="mt-5 pt-5 border-t border-brand space-y-2 text-sm">
              <div className="flex justify-between text-body"><span>Subtotal</span><span>{formatPrice(total)}</span></div>
              <div className="flex justify-between text-body"><span>Shipping</span><span>₹0</span></div>
              <div className="flex justify-between font-display text-lg font-semibold text-heading pt-2 border-t border-brand"><span>Total</span><span>{formatPrice(grand)}</span></div>
            </div>
            <button type="submit" disabled={submitting} className="btn-primary w-full mt-6" data-testid="checkout-place-order-btn">
              {submitting ? "Placing order…" : "Place order"} <ArrowRight className="w-4 h-4" />
            </button>
            {wa && (
              <a href={buildWhatsAppLink(wa, waMsg)} target="_blank" rel="noreferrer" className="btn-whatsapp w-full mt-3" data-testid="checkout-whatsapp-btn">
                <MessageCircle className="w-4 h-4" /> Or order on WhatsApp
              </a>
            )}
          </div>
        </div>
      </form>
    </div>
  );
}
