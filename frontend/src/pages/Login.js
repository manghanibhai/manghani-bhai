import React, { useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { useAuth, useBranding } from "@/context/AppContexts";
import { formatApiError } from "@/lib/api";

export default function Login() {
  const { login } = useAuth();
  const { branding } = useBranding();
  const navigate = useNavigate();
  const location = useLocation();
  const [form, setForm] = useState({ email: "", password: "" });
  const [submitting, setSubmitting] = useState(false);
  const redirect = location.state?.from?.pathname || "/";

  const submit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      const user = await login(form.email, form.password);
      toast.success(`Welcome back, ${user.name.split(" ")[0]}!`);
      navigate(user.role === "admin" ? "/admin" : redirect, { replace: true });
    } catch (err) {
      toast.error(formatApiError(err.response?.data?.detail) || "Login failed");
    } finally { setSubmitting(false); }
  };

  return (
    <div className="min-h-[80vh] flex items-center justify-center px-5 py-16" data-testid="login-page">
      <div className="w-full max-w-md">
        <div className="text-center mb-10">
          {branding?.logo_url && <img src={branding.logo_url} alt="logo" className="h-14 w-14 rounded-full object-cover mx-auto mb-5" />}
          <h1 className="font-display text-4xl font-semibold text-heading tracking-tight">Welcome back.</h1>
          <p className="mt-2 text-body">Sign in to continue your wonder.</p>
        </div>
        <form onSubmit={submit} className="bg-white border border-brand rounded-3xl p-8 space-y-5">
          <div>
            <label className="text-xs uppercase tracking-wider text-muted-brand">Email</label>
            <input type="email" className="input-brand mt-1.5" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} required autoFocus data-testid="login-email" />
          </div>
          <div>
            <label className="text-xs uppercase tracking-wider text-muted-brand">Password</label>
            <input type="password" className="input-brand mt-1.5" value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })} required data-testid="login-password" />
          </div>
          <button type="submit" disabled={submitting} className="btn-primary w-full" data-testid="login-submit-btn">
            {submitting ? "Signing in…" : "Sign in"}
          </button>
        </form>
        <p className="text-center text-sm text-body mt-6">
          New here? <Link to="/register" className="text-primary-brand font-medium hover:underline" data-testid="login-to-register">Create an account</Link>
        </p>
      </div>
    </div>
  );
}
