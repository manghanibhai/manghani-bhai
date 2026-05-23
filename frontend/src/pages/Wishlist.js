import React from "react";
import { Link } from "react-router-dom";
import { Heart, Trash2 } from "lucide-react";
import { useWishlist, useCart } from "@/context/AppContexts";
import { formatPrice } from "@/lib/api";
import { toast } from "sonner";

export default function Wishlist() {
  const { items, remove } = useWishlist();
  const { add } = useCart();

  if (items.length === 0) {
    return (
      <div className="max-w-3xl mx-auto px-5 py-24 text-center" data-testid="empty-wishlist">
        <Heart className="w-12 h-12 mx-auto text-muted-brand mb-4" />
        <h1 className="font-display text-4xl text-heading">Your wishlist is empty.</h1>
        <p className="mt-3 text-body">Save your favourites for later — they'll be waiting here.</p>
        <Link to="/products" className="btn-primary mt-8 inline-flex">Discover toys</Link>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-5 lg:px-10 py-12 lg:py-20" data-testid="wishlist-page">
      <h1 className="font-display text-5xl font-semibold text-heading mb-10 tracking-tight">Wishlist.</h1>
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
        {items.map((p) => {
          const price = p.discounted_price ?? p.price;
          return (
            <div key={p.id} className="bg-white border border-brand rounded-3xl overflow-hidden group" data-testid={`wishlist-item-${p.id}`}>
              <Link to={`/products/${p.id}`} className="block aspect-square overflow-hidden bg-surface-alt">
                {p.image && <img src={p.image} alt={p.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />}
              </Link>
              <div className="p-4">
                <Link to={`/products/${p.id}`} className="font-display text-base font-medium text-heading line-clamp-2 hover:text-primary-brand">{p.title}</Link>
                <div className="mt-2 font-display text-lg font-semibold text-heading">{formatPrice(price)}</div>
                <div className="flex gap-2 mt-3">
                  <button onClick={() => { add({ id: p.id, title: p.title, images: [p.image], price: p.price, discounted_price: p.discounted_price }, 1); toast.success("Added to cart"); }} className="btn-primary text-sm py-2 px-4 flex-1" data-testid={`wishlist-add-${p.id}`}>Add to Cart</button>
                  <button onClick={() => remove(p.id)} className="p-2.5 bg-surface-alt rounded-full hover:bg-primary-brand hover:text-white transition" data-testid={`wishlist-remove-${p.id}`}><Trash2 className="w-4 h-4" /></button>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
