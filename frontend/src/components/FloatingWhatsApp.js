import React from "react";
import { useContact, useBranding } from "@/context/AppContexts";
import { buildWhatsAppLink } from "@/lib/api";

export default function FloatingWhatsApp() {
  const { contact } = useContact();
  const { branding } = useBranding();
  const wa = contact?.whatsapp_numbers?.[0];
  if (!wa) return null;
  const msg = `Hi! I'd like to know more about ${branding?.brand_name || "your toys"}.`;

  return (
    <a
      href={buildWhatsAppLink(wa, msg)}
      target="_blank"
      rel="noreferrer"
      className="fixed bottom-6 right-6 z-50 bg-[#25D366] text-white rounded-full p-4 shadow-2xl wa-pulse hover:scale-110 transition-transform"
      aria-label="Chat on WhatsApp"
      data-testid="floating-whatsapp-btn"
    >
      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-7 h-7">
        <path d="M20.52 3.48A11.93 11.93 0 0 0 12.06 0C5.45 0 .07 5.37.07 11.97c0 2.11.55 4.16 1.6 5.98L0 24l6.2-1.62a11.94 11.94 0 0 0 5.85 1.49h.01c6.6 0 11.98-5.37 11.98-11.97 0-3.2-1.25-6.21-3.52-8.42zM12.07 21.8h-.01a9.84 9.84 0 0 1-5.02-1.38l-.36-.21-3.68.96.98-3.59-.23-.37a9.83 9.83 0 0 1-1.51-5.24c0-5.45 4.45-9.88 9.91-9.88 2.64 0 5.13 1.03 7 2.9a9.79 9.79 0 0 1 2.9 6.98c0 5.46-4.45 9.88-9.92 9.88zm5.43-7.4c-.3-.15-1.77-.87-2.04-.97-.27-.1-.47-.15-.67.15-.2.3-.78.97-.96 1.17-.18.2-.35.22-.65.07-.3-.15-1.27-.47-2.42-1.5-.89-.79-1.5-1.77-1.67-2.07-.18-.3-.02-.46.13-.61.13-.13.3-.35.45-.52.15-.18.2-.3.3-.5.1-.2.05-.37-.02-.52-.07-.15-.67-1.62-.92-2.21-.24-.58-.49-.5-.67-.5h-.57c-.2 0-.52.07-.79.37-.27.3-1.04 1.01-1.04 2.46s1.07 2.85 1.22 3.05c.15.2 2.1 3.2 5.08 4.49.71.31 1.27.49 1.7.62.71.22 1.36.19 1.87.12.57-.08 1.77-.72 2.02-1.42.25-.7.25-1.3.17-1.42-.07-.12-.27-.2-.57-.35z"/>
      </svg>
    </a>
  );
}
