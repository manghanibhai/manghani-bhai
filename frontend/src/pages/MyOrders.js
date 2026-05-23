import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { Package } from "lucide-react";
import { api, formatPrice } from "@/lib/api";

export default function MyOrders() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  useEffect(() => { api.get("/orders/mine").then((r) => setOrders(r.data)).finally(() => setLoading(false)); }, []);

  if (loading) return <div className="min-h-[50vh] flex items-center justify-center"><div className="spinner" /></div>;

  return (
    <div className="max-w-5xl mx-auto px-5 py-12 lg:py-20" data-testid="my-orders-page">
      <h1 className="font-display text-5xl font-semibold text-heading tracking-tight mb-10">My orders.</h1>
      {orders.length === 0 ? (
        <div className="text-center py-16">
          <Package className="w-10 h-10 text-muted-brand mx-auto mb-4" />
          <p className="text-body">You haven't placed any orders yet.</p>
          <Link to="/products" className="btn-primary mt-6 inline-flex">Start shopping</Link>
        </div>
      ) : (
        <div className="space-y-4">
          {orders.map((o) => (
            <Link to={`/track/${o.order_no}`} key={o.id} className="block bg-white border border-brand rounded-3xl p-6 hover:shadow-md transition" data-testid={`my-order-${o.order_no}`}>
              <div className="flex flex-wrap justify-between gap-4">
                <div>
                  <div className="text-xs uppercase tracking-[0.2em] text-muted-brand">{new Date(o.created_at).toLocaleString()}</div>
                  <div className="font-display text-xl font-semibold text-heading mt-1">{o.order_no}</div>
                </div>
                <div className="text-right">
                  <div className="text-xs uppercase tracking-[0.2em] text-muted-brand">{o.items.length} items</div>
                  <div className="font-display text-xl font-semibold text-heading mt-1">{formatPrice(o.total_price)}</div>
                </div>
                <div className="w-full sm:w-auto">
                  <span className="chip">{o.status}</span>
                </div>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
