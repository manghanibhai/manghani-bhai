import React from "react";
import { Link } from "react-router-dom";
import { Heart } from "lucide-react";
import { useWishlist } from "@/context/AppContexts";
import { formatPrice } from "@/lib/api";

export default function ProductCard({ product, index = 0 }) {
  const { has, toggle } = useWishlist();
  const wished = has(product.id);
  const finalPrice = product.discounted_price ?? product.price;
  const hasDiscount = product.discounted_price && product.discounted_price < product.price;
  const off = hasDiscount ? Math.round(((product.price - product.discounted_price) / product.price) * 100) : 0;

  return (
    <div className="product-card group fade-up" style={{ animationDelay: `${Math.min(index * 60, 600)}ms` }} data-testid={`product-card-${product.id}`}>
      <Link to={`/products/${product.id}`} className="block">
        <div className="relative overflow-hidden rounded-3xl bg-surface-alt aspect-[4/5]">
          {product.images?.[0] ? (
            <img src={product.images[0]} alt={product.title} loading="lazy" className="product-image w-full h-full object-cover" />
          ) : (
            <div className="w-full h-full flex items-center justify-center text-muted-brand text-sm">No image</div>
          )}
          {hasDiscount && (
            <div className="absolute top-4 left-4 bg-primary-brand text-white text-xs font-semibold px-3 py-1.5 rounded-full">{off}% OFF</div>
          )}
          <button
            onClick={(e) => { e.preventDefault(); toggle(product); }}
            className="absolute top-4 right-4 w-10 h-10 rounded-full bg-white/85 backdrop-blur flex items-center justify-center hover:scale-110 transition"
            aria-label="Toggle wishlist"
            data-testid={`product-wishlist-${product.id}`}
          >
            <Heart className={`w-4 h-4 ${wished ? "fill-current text-[#C85A4F]" : "text-heading"}`} />
          </button>
        </div>
        <div className="pt-5 px-1">
          {product.category_name && <div className="text-xs uppercase tracking-[0.2em] text-muted-brand mb-1.5">{product.category_name}</div>}
          <h3 className="font-display text-lg font-medium text-heading group-hover:text-primary-brand transition-colors leading-snug line-clamp-2">{product.title}</h3>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="font-display text-lg font-semibold text-heading">{formatPrice(finalPrice)}</span>
            {hasDiscount && <span className="text-sm text-muted-brand line-through">{formatPrice(product.price)}</span>}
          </div>
        </div>
      </Link>
    </div>
  );
}
