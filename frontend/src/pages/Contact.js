import React from "react";
import { Phone, MessageCircle, MapPin, Instagram, Youtube } from "lucide-react";

import { useContact, useBranding } from "@/context/AppContexts";

import { buildWhatsAppLink } from "@/lib/api";

export default function Contact() {
  const { contact } = useContact();
  const { branding } = useBranding();

  if (!contact) return <div className="min-h-[60vh] flex items-center justify-center"><div className="spinner" /></div>;

  return (
    <div className="max-w-7xl mx-auto px-5 lg:px-10 py-12 lg:py-20" data-testid="contact-page">
      <div className="max-w-3xl">
        <div className="text-xs uppercase tracking-[0.25em] text-primary-brand font-semibold mb-3">Visit · Call · Chat</div>
        <h1 className="font-display text-5xl lg:text-6xl font-semibold text-heading tracking-tight">Come say hello.</h1>
        <p className="mt-5 text-body text-lg max-w-xl">Walk into our boutique, give us a ring, or message us on WhatsApp. No forms, no waiting — real conversations with our family.</p>
      </div>

      <div className="grid lg:grid-cols-3 gap-6 mt-14">

        <div className="bg-white border border-brand rounded-3xl p-8" data-testid="contact-whatsapp-card">

          <div className="w-12 h-12 rounded-full bg-[#25D366]/10 flex items-center justify-center text-[#25D366]">
            <MessageCircle className="w-5 h-5" />
          </div>
          <h3 className="font-display text-xl font-semibold text-heading mt-5">WhatsApp us</h3>
          <p className="text-sm text-body mt-2">Fastest way to chat. We typically reply within minutes.</p>
          <div className="mt-5 space-y-2">
            {contact.whatsapp_numbers?.map((wa) => (
              <a key={wa} href={buildWhatsAppLink(wa, `Hi ${branding?.brand_name || "team"}, I'd like to know more.`)} target="_blank" rel="noreferrer" className="btn-whatsapp w-full" data-testid={`contact-wa-${wa}`}>
                <MessageCircle className="w-4 h-4" /> {wa}
              </a>
            ))}
          </div>
        </div>

        <div className="bg-white border border-brand rounded-3xl p-8" data-testid="contact-phone-card">
          <div className="w-12 h-12 rounded-full bg-primary-brand/10 flex items-center justify-center text-primary-brand">
            <Phone className="w-5 h-5" />
          </div>
          <h3 className="font-display text-xl font-semibold text-heading mt-5">Call us</h3>
          <p className="text-sm text-body mt-2">Speak to our team for personal recommendations.</p>
          <div className="mt-5 space-y-2">
            {contact.phone_numbers?.map((p) => (
              <a key={p} href={`tel:${p}`} className="btn-outline w-full" data-testid={`contact-phone-${p}`}>
                <Phone className="w-4 h-4 mr-1.5" /> {p}
              </a>
            ))}
          </div>
        </div>

        <div className="bg-white border border-brand rounded-3xl p-8" data-testid="contact-instagram-card">
          <div className="w-12 h-12 rounded-full bg-[#E1306C]/10 flex items-center justify-center text-[#E1306C]">
            <Instagram className="w-5 h-5" />
          </div>
          <h3 className="font-display text-xl font-semibold text-heading mt-5">Instagram</h3>
          <p className="text-sm text-body mt-2">Follow our latest arrivals & reels.</p>
          {contact.instagram_url ? (
            <div className="mt-5">
              <a
                href={contact.instagram_url}
                target="_blank"
                rel="noreferrer"
                className="btn-primary w-full"
                data-testid="contact-instagram-btn"
              >
                <Instagram className="w-4 h-4 mr-1.5" /> Visit Instagram
              </a>
            </div>
          ) : (
            <div className="mt-5 text-sm text-muted-brand">URL not set.</div>
          )}
        </div>

        <div className="bg-white border border-brand rounded-3xl p-8" data-testid="contact-youtube-card">
          <div className="w-12 h-12 rounded-full bg-[#FF0000]/10 flex items-center justify-center text-[#FF0000]">
            <Youtube className="w-5 h-5" />
          </div>
          <h3 className="font-display text-xl font-semibold text-heading mt-5">YouTube</h3>
          <p className="text-sm text-body mt-2">Watch product demos & unboxings.</p>
          {contact.youtube_url ? (
            <div className="mt-5">
              <a
                href={contact.youtube_url}
                target="_blank"
                rel="noreferrer"
                className="btn-outline w-full"
                data-testid="contact-youtube-btn"
              >
                <Youtube className="w-4 h-4 mr-1.5" /> Visit YouTube
              </a>
            </div>
          ) : (
            <div className="mt-5 text-sm text-muted-brand">URL not set.</div>
          )}
        </div>


        <div className="bg-[#2C4C3B] text-[#F9F6F0] rounded-3xl p-8" data-testid="contact-address-card">
          <div className="w-12 h-12 rounded-full bg-white/10 flex items-center justify-center">
            <MapPin className="w-5 h-5" />
          </div>
          <h3 className="font-display text-xl font-semibold mt-5">Visit our boutique</h3>
          <p className="text-sm opacity-85 mt-2">{contact.address}</p>
          <div className="text-xs opacity-60 mt-5 uppercase tracking-[0.2em]">Hours</div>
          <div className="text-sm mt-1 opacity-90">Mon–Sat · 10:00 – 21:00</div>
          <div className="text-sm opacity-90">Sunday · 11:00 – 20:00</div>
        </div>
      </div>

      {contact.show_map && contact.map_embed_url && (
        <div className="mt-12 rounded-3xl overflow-hidden border border-brand bg-white" data-testid="contact-map">
          <iframe
            title="Map"
            src={contact.map_embed_url}
            width="100%"
            height="420"
            style={{ border: 0 }}
            loading="lazy"
            referrerPolicy="no-referrer-when-downgrade"
          />
        </div>
      )}
    </div>
  );
}
