import React from "react";
import { Link, useNavigate } from "react-router-dom";
import { Trash2, Minus, Plus, ShoppingBag, ArrowRight } from "lucide-react";
import { useCart, useAuth } from "@/context/AppContexts";
import { formatPrice } from "@/lib/api";

export default function Cart() {
  const { items, update, remove, total, clear } = useCart();
  const { user } = useAuth();
  const navigate = useNavigate();

  if (items.length === 0) {
    return (
      <div className="max-w-3xl mx-auto px-5 py-24 text-center" data-testid="empty-cart">
        <ShoppingBag className="w-12 h-12 mx-auto text-muted-brand mb-4" />
        <h1 className="font-display text-4xl text-heading">Your cart is empty.</h1>
        <p className="mt-3 text-body">Let's find something special for someone special.</p>
        <Link to="/products" className="btn-primary mt-8 inline-flex" data-testid="empty-cart-shop-btn">Browse the collection <ArrowRight className="w-4 h-4" /></Link>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-5 lg:px-10 py-12 lg:py-20" data-testid="cart-page">
      <h1 className="font-display text-5xl font-semibold text-heading mb-10 tracking-tight">Your bag.</h1>
      <div className="grid lg:grid-cols-12 gap-10">
        <div className="lg:col-span-8 space-y-5">
          {items.map((item) => (
            <div key={item.product_id} className="flex gap-5 bg-white border border-brand rounded-3xl p-4 lg:p-5" data-testid={`cart-item-${item.product_id}`}>
              <div className="w-24 h-24 lg:w-32 lg:h-32 rounded-2xl bg-surface-alt overflow-hidden shrink-0">
                {item.image && <img src={item.image} alt={item.title} className="w-full h-full object-cover" />}
              </div>
              <div className="flex-1 flex flex-col justify-between">
                <div>
                  <Link to={`/products/${item.product_id}`} className="font-display text-lg font-semibold text-heading hover:text-primary-brand">{item.title}</Link>
                  <div className="text-sm text-muted-brand mt-1">{formatPrice(item.price)} each</div>
                </div>
                <div className="flex items-center justify-between mt-3">
                  <div className="flex items-center bg-surface-alt rounded-full">
                    <button onClick={() => update(item.product_id, item.qty - 1)} className="p-2 hover:bg-white rounded-full" data-testid={`cart-dec-${item.product_id}`}><Minus className="w-3.5 h-3.5 text-heading" /></button>
                    <span className="px-3 text-sm font-medium text-heading">{item.qty}</span>
                    <button onClick={() => update(item.product_id, item.qty + 1)} className="p-2 hover:bg-white rounded-full" data-testid={`cart-inc-${item.product_id}`}><Plus className="w-3.5 h-3.5 text-heading" /></button>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="font-display text-lg font-semibold text-heading">{formatPrice(item.price * item.qty)}</span>
                    <button onClick={() => remove(item.product_id)} className="p-2 text-muted-brand hover:text-primary-brand" data-testid={`cart-remove-${item.product_id}`}><Trash2 className="w-4 h-4" /></button>
                  </div>
                </div>
              </div>
            </div>
          ))}
          <button onClick={clear} className="text-sm text-primary-brand hover:underline" data-testid="cart-clear-btn">Clear cart</button>
        </div>

        <div className="lg:col-span-4">
          <div className="bg-white border border-brand rounded-3xl p-7 lg:sticky lg:top-28">
            <h2 className="font-display text-2xl font-semibold text-heading mb-6">Summary</h2>
            <div className="space-y-3 text-sm">
              <div className="flex justify-between text-body"><span>Subtotal</span><span>{formatPrice(total)}</span></div>
              <div className="flex justify-between text-body"><span>Shipping</span><span>₹0</span></div>
              <div className="border-t border-brand pt-3 flex justify-between font-display text-lg font-semibold text-heading"><span>Total</span><span data-testid="cart-total">{formatPrice(total)}</span></div>
            </div>
            <button onClick={() => navigate(user ? "/checkout" : "/login")} className="btn-primary w-full mt-6" data-testid="cart-checkout-btn">
              {user ? "Proceed to checkout" : "Sign in to checkout"} <ArrowRight className="w-4 h-4" />
            </button>
            <Link to="/products" className="block text-center text-sm text-muted-brand hover:text-heading mt-4">Continue shopping</Link>
          </div>
        </div>
      </div>
    </div>
  );
}
