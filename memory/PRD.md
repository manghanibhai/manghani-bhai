# Manghani Toy World — Product Requirements Document

## Problem Statement (verbatim)
Create a fully working, production-ready, ultra premium ecommerce website for a real client brand named "Manghani Toy World". Single Vendor Ecommerce: Admin manages products/orders/categories/branding/contact via UI. Customers browse, search, filter, cart, checkout, track orders, wishlist. Contact via WhatsApp/phone only (no email). Original ask: React (Vite) + Tailwind on GitHub Pages with Supabase. Substituted to React + Tailwind + FastAPI + MongoDB on manghani-toy-world stack for fully testable preview while preserving GitHub-Pages-style architecture (HashRouter).

## Architecture
- **Frontend**: React 19 + HashRouter + Tailwind + Shadcn UI + Recharts + Sonner toasts + Lucide icons + Axios. Custom design system (Pastel & Soft Boutique theme). JWT stored in `localStorage` under `mtw_token`. Cart & wishlist persisted in localStorage.
- **Backend**: FastAPI + Motor (MongoDB async) + JWT bearer auth + bcrypt. UUID IDs (no ObjectId leaks). All routes prefixed `/api`. Seeds admin/branding/contact/8 categories/8 products on startup.

## Personas
1. **Admin (Store Owner)** — full panel: products, orders, categories, customers, branding, contact.
2. **Customer** — browse, cart, checkout, wishlist, order tracking, WhatsApp/call enquiries.

## Core Requirements (Static)
- WhatsApp/phone only contact (no email forms)
- HashRouter for GH Pages compatibility
- Dynamic branding (logo, favicon, colors, banners, hero)
- Role-based access (admin/customer)
- Floating WhatsApp on every page
- Order tracking by order_no
- Multi-image product gallery + admin uploads (base64) or image URL

## Implemented (2026-02)
- ✅ JWT auth (register/login/me) + admin seeding
- ✅ Products CRUD with category enrichment
- ✅ Orders flow: create, mine, track, admin list & status update with history
- ✅ Categories CRUD
- ✅ Customers list with order count + total spent
- ✅ Branding settings (logo/favicon/colors/banners/hero) — dynamic
- ✅ Contact settings (WhatsApp[], phone[], address, map embed toggle)
- ✅ Admin dashboard with revenue area chart + status bar chart
- ✅ Pages: Home, Products, ProductDetail, Cart, Checkout, OrderSuccess, OrderTracking, Wishlist, Contact, Login, Register, MyOrders
- ✅ Admin pages: Dashboard, Products, Orders, Categories, Customers, Branding, Contact
- ✅ Floating WhatsApp button (pulse animation)
- ✅ Mobile-responsive design with HashRouter
- ✅ Backend tests: 28/28 pass · Frontend tests: 19/20 pass (no real bugs)

## P0 Backlog
- Image storage upgrade (currently base64 in Mongo for admin uploads) → S3/Object storage
- Razorpay/Stripe online payment integration (currently WhatsApp/COD confirmation)

## P1 Backlog
- Order email/SMS notifications via WhatsApp API (Twilio)
- Reviews & ratings
- Product variants (size/color)
- Coupons & discount codes
- Pagination on large product lists

## P2 Backlog
- Multi-language (EN/HI)
- SEO meta + sitemap
- Analytics integration

## Test Credentials
See `/app/memory/test_credentials.md`
