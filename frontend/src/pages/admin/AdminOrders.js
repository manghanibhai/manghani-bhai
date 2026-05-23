import React, { useEffect, useState } from "react";
import { toast } from "sonner";
import { api, formatPrice, formatApiError } from "@/lib/api";

const STATUS_OPTIONS = ["pending", "confirmed", "shipped", "delivered", "cancelled"];

export default function AdminOrders() {
  const [orders, setOrders] = useState([]);
  const [selected, setSelected] = useState(null);

  const reload = () => api.get("/orders").then((r) => setOrders(r.data));
  useEffect(() => { reload(); }, []);

  const updateStatus = async (oid, status) => {
    try {
      await api.patch(`/orders/${oid}/status`, { status });
      toast.success(`Status updated to ${status}`);
      reload();
      if (selected?.id === oid) setSelected((s) => ({ ...s, status }));
    } catch (err) { toast.error(formatApiError(err.response?.data?.detail) || "Failed"); }
  };

  return (
    <div data-testid="admin-orders">
      <div className="mb-8">
        <h1 className="font-display text-4xl font-semibold text-heading tracking-tight">Orders</h1>
        <p className="text-body mt-1">{orders.length} orders total.</p>
      </div>

      <div className="bg-white border border-brand rounded-3xl overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-surface-alt text-heading">
            <tr><th className="text-left p-4 font-medium">Order</th><th className="text-left p-4 font-medium">Customer</th><th className="text-left p-4 font-medium">Total</th><th className="text-left p-4 font-medium">Date</th><th className="text-left p-4 font-medium">Status</th></tr>
          </thead>
          <tbody>
            {orders.map((o) => (
              <tr key={o.id} className="border-t border-brand cursor-pointer hover:bg-surface-alt" onClick={() => setSelected(o)} data-testid={`admin-order-row-${o.order_no}`}>
                <td className="p-4 font-medium text-heading">{o.order_no}</td>
                <td className="p-4 text-body">{o.customer_name}<div className="text-xs text-muted-brand">{o.shipping_phone}</div></td>
                <td className="p-4 text-heading">{formatPrice(o.total_price)}</td>
                <td className="p-4 text-body">{new Date(o.created_at).toLocaleDateString()}</td>
                <td className="p-4">
                  <select value={o.status} onChange={(e) => { e.stopPropagation(); updateStatus(o.id, e.target.value); }} onClick={(e) => e.stopPropagation()} className="bg-surface-alt rounded-full px-3 py-1.5 text-xs text-heading capitalize outline-none" data-testid={`admin-order-status-${o.order_no}`}>
                    {STATUS_OPTIONS.map((s) => <option key={s} value={s}>{s}</option>)}
                  </select>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {selected && (
        <div className="fixed inset-0 z-50 bg-black/40 flex items-center justify-center p-4 overflow-y-auto" onClick={() => setSelected(null)}>
          <div className="bg-white rounded-3xl max-w-2xl w-full p-7 max-h-[90vh] overflow-y-auto" onClick={(e) => e.stopPropagation()} data-testid="admin-order-detail">
            <div className="flex justify-between items-start mb-6">
              <div>
                <div className="text-xs uppercase tracking-[0.25em] text-muted-brand">Order</div>
                <h2 className="font-display text-2xl font-semibold text-heading">{selected.order_no}</h2>
              </div>
              <button onClick={() => setSelected(null)} className="p-2 hover:bg-surface-alt rounded-full">×</button>
            </div>
            <div className="grid grid-cols-2 gap-4 text-sm mb-6">
              <div><div className="text-xs uppercase text-muted-brand tracking-wider">Customer</div><div className="text-heading mt-1">{selected.customer_name}</div><div className="text-body text-xs">{selected.customer_email}</div></div>
              <div><div className="text-xs uppercase text-muted-brand tracking-wider">Phone</div><div className="text-heading mt-1">{selected.shipping_phone}</div></div>
              <div className="col-span-2"><div className="text-xs uppercase text-muted-brand tracking-wider">Address</div><div className="text-heading mt-1">{selected.shipping_address}</div></div>
              {selected.notes && <div className="col-span-2"><div className="text-xs uppercase text-muted-brand tracking-wider">Notes</div><div className="text-heading mt-1">{selected.notes}</div></div>}
            </div>
            <div className="border-t border-brand pt-5">
              <div className="text-xs uppercase text-muted-brand tracking-wider mb-3">Items</div>
              {selected.items.map((i) => (
                <div key={i.product_id} className="flex justify-between text-sm py-2 border-b border-brand last:border-0">
                  <span className="text-body">{i.title} × {i.qty}</span>
                  <span className="text-heading font-medium">{formatPrice(i.price * i.qty)}</span>
                </div>
              ))}
              <div className="flex justify-between font-display text-lg font-semibold text-heading mt-3 pt-3 border-t border-brand"><span>Total</span><span>{formatPrice(selected.total_price)}</span></div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
