import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { Search, CheckCircle2, Package, Truck, Home as HomeIcon } from "lucide-react";
import { api, formatPrice } from "@/lib/api";

const STEPS = [
  { key: "pending", label: "Order placed", icon: CheckCircle2 },
  { key: "confirmed", label: "Confirmed", icon: Package },
  { key: "shipped", label: "Shipped", icon: Truck },
  { key: "delivered", label: "Delivered", icon: HomeIcon },
];

export default function OrderTracking() {
  const { orderNo: paramNo } = useParams();
  const navigate = useNavigate();
  const [input, setInput] = useState(paramNo || "");
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => { if (paramNo) fetchOrder(paramNo); }, [paramNo]); // eslint-disable-line

  const fetchOrder = async (no) => {
    setLoading(true);
    try {
      const { data } = await api.get(`/orders/track/${no}`);
      setOrder(data);
    } catch {
      setOrder(null);
      toast.error("Order not found");
    } finally { setLoading(false); }
  };

  const submit = (e) => {
    e.preventDefault();
    if (input.trim()) navigate(`/track/${input.trim()}`);
  };

  const currentIdx = order ? STEPS.findIndex((s) => s.key === order.status) : -1;

  return (
    <div className="max-w-3xl mx-auto px-5 py-12 lg:py-20" data-testid="order-tracking-page">
      <h1 className="font-display text-5xl font-semibold text-heading tracking-tight">Track your order.</h1>
      <p className="mt-3 text-body">Enter your order number to see real-time status.</p>

      <form onSubmit={submit} className="mt-8 flex gap-3">
        <div className="flex-1 flex items-center bg-white border border-brand rounded-full px-5 py-3">
          <Search className="w-4 h-4 text-muted-brand" />
          <input value={input} onChange={(e) => setInput(e.target.value)} placeholder="e.g. MTW-260201-ABC123" className="bg-transparent ml-2 outline-none text-sm w-full text-heading" data-testid="track-input" />
        </div>
        <button type="submit" className="btn-primary" data-testid="track-submit-btn">Track</button>
      </form>

      {loading && <div className="mt-10 flex justify-center"><div className="spinner" /></div>}

      {order && !loading && (
        <div className="mt-10 bg-white border border-brand rounded-3xl p-7 lg:p-9" data-testid="track-result">
          <div className="flex flex-wrap justify-between gap-4 mb-8">
            <div>
              <div className="text-xs uppercase tracking-[0.25em] text-muted-brand">Order</div>
              <div className="font-display text-2xl font-semibold text-heading">{order.order_no}</div>
            </div>
            <div className="text-right">
              <div className="text-xs uppercase tracking-[0.25em] text-muted-brand">Total</div>
              <div className="font-display text-2xl font-semibold text-heading">{formatPrice(order.total_price)}</div>
            </div>
          </div>

          <div className="relative">
            <div className="absolute left-5 top-5 bottom-5 w-px bg-brand" />
            <div className="space-y-6">
              {STEPS.map((s, i) => {
                const Icon = s.icon;
                const done = i <= currentIdx && order.status !== "cancelled";
                return (
                  <div key={s.key} className="flex items-start gap-4 relative">
                    <div className={`w-10 h-10 rounded-full flex items-center justify-center ${done ? "bg-[#2C4C3B] text-[#F9F6F0]" : "bg-surface-alt text-muted-brand"}`}>
                      <Icon className="w-4 h-4" />
                    </div>
                    <div>
                      <div className={`font-medium ${done ? "text-heading" : "text-muted-brand"}`}>{s.label}</div>
                      <div className="text-xs text-muted-brand">{done ? "Completed" : "Pending"}</div>
                    </div>
                  </div>
                );
              })}
              {order.status === "cancelled" && (
                <div className="text-primary-brand font-medium">This order was cancelled.</div>
              )}
            </div>
          </div>

          <div className="mt-8 pt-6 border-t border-brand">
            <div className="text-xs uppercase tracking-[0.25em] text-muted-brand mb-3">Items</div>
            <div className="space-y-3">
              {order.items.map((i) => (
                <div key={i.product_id} className="flex justify-between text-sm">
                  <span className="text-body">{i.title} × {i.qty}</span>
                  <span className="text-heading font-medium">{formatPrice(i.price * i.qty)}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
