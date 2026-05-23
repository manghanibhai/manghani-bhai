import React from "react";
import { HashRouter, Routes, Route } from "react-router-dom";
import { Toaster } from "sonner";
import { AuthProvider, BrandingProvider, ContactProvider, CartProvider, WishlistProvider } from "@/context/AppContexts";
import Layout from "@/components/Layout";
import ProtectedRoute from "@/components/ProtectedRoute";

import Home from "@/pages/Home";
import Products from "@/pages/Products";
import ProductDetail from "@/pages/ProductDetail";
import Cart from "@/pages/Cart";
import Checkout from "@/pages/Checkout";
import OrderSuccess from "@/pages/OrderSuccess";
import OrderTracking from "@/pages/OrderTracking";
import Wishlist from "@/pages/Wishlist";
import Contact from "@/pages/Contact";
import Login from "@/pages/Login";
import Register from "@/pages/Register";
import MyOrders from "@/pages/MyOrders";

import AdminLayout from "@/pages/admin/AdminLayout";
import Dashboard from "@/pages/admin/Dashboard";
import AdminProducts from "@/pages/admin/AdminProducts";
import AdminOrders from "@/pages/admin/AdminOrders";
import AdminCategories from "@/pages/admin/AdminCategories";
import AdminCustomers from "@/pages/admin/AdminCustomers";
import AdminBranding from "@/pages/admin/AdminBranding";
import AdminContact from "@/pages/admin/AdminContact";

import "@/App.css";

export default function App() {
  return (
    <BrandingProvider>
      <ContactProvider>
        <AuthProvider>
          <CartProvider>
            <WishlistProvider>
              <HashRouter>
                <Toaster richColors position="top-right" />
                <Routes>
                  <Route element={<Layout />}>
                    <Route path="/" element={<Home />} />
                    <Route path="/products" element={<Products />} />
                    <Route path="/products/:id" element={<ProductDetail />} />
                    <Route path="/cart" element={<Cart />} />
                    <Route path="/checkout" element={<ProtectedRoute><Checkout /></ProtectedRoute>} />
                    <Route path="/order-success/:orderNo" element={<OrderSuccess />} />
                    <Route path="/track" element={<OrderTracking />} />
                    <Route path="/track/:orderNo" element={<OrderTracking />} />
                    <Route path="/wishlist" element={<Wishlist />} />
                    <Route path="/contact" element={<Contact />} />
                    <Route path="/login" element={<Login />} />
                    <Route path="/register" element={<Register />} />
                    <Route path="/my-orders" element={<ProtectedRoute><MyOrders /></ProtectedRoute>} />
                  </Route>

                  <Route path="/admin" element={<ProtectedRoute adminOnly><AdminLayout /></ProtectedRoute>}>
                    <Route index element={<Dashboard />} />
                    <Route path="products" element={<AdminProducts />} />
                    <Route path="orders" element={<AdminOrders />} />
                    <Route path="categories" element={<AdminCategories />} />
                    <Route path="customers" element={<AdminCustomers />} />
                    <Route path="branding" element={<AdminBranding />} />
                    <Route path="contact" element={<AdminContact />} />
                  </Route>
                </Routes>
              </HashRouter>
            </WishlistProvider>
          </CartProvider>
        </AuthProvider>
      </ContactProvider>
    </BrandingProvider>
  );
}
