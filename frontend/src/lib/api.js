import axios from "axios";

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL || "https://manghani-bhai.onrender.com";
export const api = axios.create({ baseURL: `${BACKEND_URL}/api` });

api.interceptors.request.use((config) => {
  const token = localStorage.getItem("mtw_token");
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

export function formatApiError(detail) {
  if (detail == null) return "Something went wrong";
  if (typeof detail === "string") return detail;
  if (Array.isArray(detail)) {
    return detail.map((e) => (e && typeof e.msg === "string" ? e.msg : JSON.stringify(e))).join(", ");
  }
  if (detail && typeof detail.msg === "string") return detail.msg;
  return String(detail);
}

// Central place to surface API failures in production.
export function notifyApiError(err, context) {
  const detail = err?.response?.data?.detail ?? err?.message ?? err;
  const msg = formatApiError(detail);
  // eslint-disable-next-line no-console
  console.error(`[API][${context}]`, msg, err);
  return msg;
}

export const formatPrice = (n) =>
  new Intl.NumberFormat("en-IN", { style: "currency", currency: "INR", maximumFractionDigits: 0 }).format(n || 0);

export const buildWhatsAppLink = (phone, message) => {
  const clean = (phone || "").replace(/[^\d]/g, "");
  return `https://wa.me/${clean}?text=${encodeURIComponent(message || "")}`;
};
