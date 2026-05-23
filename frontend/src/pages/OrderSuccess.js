import React, { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import { Check, Package, MessageCircle } from "lucide-react";
import { api, buildWhatsAppLink, formatPrice } from "@/lib/api";
import { useContact, useBranding } from "@/context/AppContexts";

export default function OrderSuccess() {
  const { orderNo } = useParams();
  const [order, setOrder] = useState(null);
  const { contact } = useContact();
  const { branding } = useBranding();

  useEffect(() => { api.get(`/orders/track/${orderNo}`).then((r) => setOrder(r.data)).catch(() => {}); }, [orderNo]);

  const wa = contact?.whatsapp_numbers?.[0];
  const waMsg = order ? `Hi, I just placed order ${order.order_no} on ${branding?.brand_name}. Please confirm delivery details.` : "";

  return (
    <div className="max-w-3xl mx-auto px-5 py-20 lg:py-28 text-center" data-testid="order-success-page">
      <div className="w-20 h-20 mx-auto bg-[#2C4C3B] rounded-full flex items-center justify-center">
        <Check className="w-10 h-10 text-[#F9F6F0]" strokeWidth={2.5} />
      </div>
      <h1 className="font-display text-5xl font-semibold text-heading tracking-tight mt-8">Thank you.</h1>
      <p className="mt-4 text-body text-lg">Your order has been placed. We'll reach out shortly to confirm delivery.</p>

      {order && (
        <div className="mt-10 bg-white border border-brand rounded-3xl p-7 text-left">
          <div className="text-xs uppercase tracking-[0.25em] text-muted-brand">Order number</div>
          <div className="font-display text-3xl font-semibold text-heading mt-1" data-testid="order-success-no">{order.order_no}</div>
          <div className="mt-4 text-sm text-body">Total · <span className="font-medium text-heading">{formatPrice(order.total_price)}</span></div>
          <div className="text-sm text-body">Status · <span className="font-medium text-heading capitalize">{order.status}</span></div>
        </div>
      )}

      <div className="mt-8 flex flex-wrap justify-center gap-3">
        <Link to={`/track/${orderNo}`} className="btn-primary" data-testid="order-success-track-btn"><Package className="w-4 h-4" /> Track Order</Link>
        {wa && (
          <a href={buildWhatsAppLink(wa, waMsg)} target="_blank" rel="noreferrer" className="btn-whatsapp" data-testid="order-success-wa-btn">
            <MessageCircle className="w-4 h-4" /> Message Us
          </a>
        )}
        <Link to="/products" className="btn-outline">Continue shopping</Link>
      </div>
    </div>
  );
}
