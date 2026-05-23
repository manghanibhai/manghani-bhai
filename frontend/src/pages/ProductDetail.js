import React, { useEffect, useState } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { Heart, Minus, Plus, MessageCircle, Phone, ShoppingBag, Check, Truck, Shield } from "lucide-react";
import { api, buildWhatsAppLink, formatPrice } from "@/lib/api";
import { useCart, useContact, useWishlist } from "@/context/AppContexts";

export default function ProductDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [product, setProduct] = useState(null);
  const [activeImg, setActiveImg] = useState(0);
  const [qty, setQty] = useState(1);
  const { add } = useCart();
  const { contact } = useContact();
  const { has, toggle } = useWishlist();

  useEffect(() => { setActiveImg(0); api.get(`/products/${id}`).then((r) => setProduct(r.data)).catch(() => navigate("/products")); }, [id, navigate]);

  if (!product) return <div className="min-h-[60vh] flex items-center justify-center"><div className="spinner" /></div>;

  const finalPrice = product.discounted_price ?? product.price;
  const hasDiscount = product.discounted_price && product.discounted_price < product.price;
  const inStock = product.stock > 0;
  const wa = contact?.whatsapp_numbers?.[0];
  const phone = contact?.phone_numbers?.[0];
  const waMsg = `Hi, I am interested in this product: ${product.title}`;

  const handleAdd = () => {
    add(product, qty);
    toast.success("Added to cart", { description: product.title });
  };
  const handleBuy = () => { add(product, qty); navigate("/cart"); };

  return (
    <div className="max-w-7xl mx-auto px-5 lg:px-10 py-10 lg:py-16" data-testid="product-detail-page">
      <Link to="/products" className="text-sm text-muted-brand hover:text-heading" data-testid="back-to-products">← Back to collection</Link>

      <div className="grid lg:grid-cols-12 gap-10 lg:gap-16 mt-6">
        {/* Gallery */}
        <div className="lg:col-span-7">
          <div className="rounded-3xl overflow-hidden bg-surface-alt aspect-square">
            {product.images?.[activeImg] && (
              <img src={product.images[activeImg]} alt={product.title} className="w-full h-full object-cover" data-testid="product-main-image" />
            )}
          </div>
          {product.images?.length > 1 && (
            <div className="mt-4 grid grid-cols-5 gap-3">
              {product.images.map((img, i) => (
                <button key={i} onClick={() => setActiveImg(i)} className={`aspect-square rounded-2xl overflow-hidden border-2 transition ${i === activeImg ? "border-primary-brand" : "border-transparent opacity-70 hover:opacity-100"}`} data-testid={`product-thumb-${i}`}>
                  <img src={img} alt={`thumb ${i}`} className="w-full h-full object-cover" />
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Details */}
        <div className="lg:col-span-5">
          {product.category_name && <div className="text-xs uppercase tracking-[0.25em] text-primary-brand font-semibold mb-3">{product.category_name}</div>}
          <h1 className="font-display text-4xl lg:text-5xl font-semibold text-heading tracking-tight">{product.title}</h1>

          <div className="mt-6 flex items-baseline gap-3">
            <span className="font-display text-3xl font-semibold text-heading">{formatPrice(finalPrice)}</span>
            {hasDiscount && (
              <>
                <span className="text-lg text-muted-brand line-through">{formatPrice(product.price)}</span>
                <span className="text-xs font-semibold bg-[#E1A140]/20 text-[#C98B30] px-3 py-1 rounded-full">Save {Math.round(((product.price - product.discounted_price) / product.price) * 100)}%</span>
              </>
            )}
          </div>

          <div className="mt-2">
            {inStock ? (
              <div className="inline-flex items-center gap-1.5 text-xs text-[#2C4C3B] font-medium"><Check className="w-3.5 h-3.5" /> In stock · {product.stock} available</div>
            ) : (
              <div className="text-xs text-primary-brand font-medium">Currently sold out</div>
            )}
          </div>

          <p className="mt-6 text-body leading-relaxed">{product.description}</p>

          {inStock && (
            <div className="mt-8 flex items-center gap-4">
              <div className="flex items-center bg-white border border-brand rounded-full">
                <button onClick={() => setQty((q) => Math.max(1, q - 1))} className="p-3 hover:bg-surface-alt rounded-full" data-testid="qty-dec"><Minus className="w-4 h-4 text-heading" /></button>
                <span className="px-4 font-medium text-heading" data-testid="qty-value">{qty}</span>
                <button onClick={() => setQty((q) => Math.min(product.stock, q + 1))} className="p-3 hover:bg-surface-alt rounded-full" data-testid="qty-inc"><Plus className="w-4 h-4 text-heading" /></button>
              </div>
              <button onClick={() => toggle(product)} className="p-3 border border-brand bg-white rounded-full hover:bg-surface-alt transition" data-testid="wishlist-toggle">
                <Heart className={`w-5 h-5 ${has(product.id) ? "fill-current text-[#C85A4F]" : "text-heading"}`} />
              </button>
            </div>
          )}

          <div className="mt-6 flex flex-col sm:flex-row gap-3">
            <button onClick={handleAdd} disabled={!inStock} className="btn-primary flex-1" data-testid="add-to-cart-btn">
              <ShoppingBag className="w-4 h-4" /> Add to Cart
            </button>
            <button onClick={handleBuy} disabled={!inStock} className="btn-outline flex-1" data-testid="buy-now-btn">Buy Now</button>
          </div>

          <div className="mt-4 grid grid-cols-2 gap-3">
            {wa && (
              <a href={buildWhatsAppLink(wa, waMsg)} target="_blank" rel="noreferrer" className="btn-whatsapp w-full" data-testid="product-whatsapp-btn">
                <MessageCircle className="w-4 h-4" /> Enquire on WhatsApp
              </a>
            )}
            {phone && (
              <a href={`tel:${phone}`} className="btn-outline w-full" data-testid="product-call-btn">
                <Phone className="w-4 h-4 mr-1.5" /> Call Now
              </a>
            )}
          </div>

          <div className="mt-10 pt-8 border-t border-brand grid grid-cols-2 gap-4 text-sm">
            <div className="flex items-start gap-2.5"><Truck className="w-4 h-4 text-primary-brand mt-0.5" /><div><div className="font-medium text-heading">Free shipping</div><div className="text-xs text-muted-brand">On orders above ₹2,000</div></div></div>
            <div className="flex items-start gap-2.5"><Shield className="w-4 h-4 text-primary-brand mt-0.5" /><div><div className="font-medium text-heading">Authentic guarantee</div><div className="text-xs text-muted-brand">Curated by our family</div></div></div>
          </div>
        </div>
      </div>
    </div>
  );
}
