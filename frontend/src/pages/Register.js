import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { useAuth, useBranding } from "@/context/AppContexts";
import { formatApiError } from "@/lib/api";

export default function Register() {
  const { register } = useAuth();
  const { branding } = useBranding();
  const navigate = useNavigate();
  const [form, setForm] = useState({ name: "", email: "", password: "" });
  const [submitting, setSubmitting] = useState(false);

  const submit = async (e) => {
    e.preventDefault();
    if (form.password.length < 6) { toast.error("Password must be at least 6 characters"); return; }
    setSubmitting(true);
    try {
      const user = await register(form.name, form.email, form.password);
      toast.success(`Welcome, ${user.name.split(" ")[0]}!`);
      navigate("/", { replace: true });
    } catch (err) {
      toast.error(formatApiError(err.response?.data?.detail) || "Registration failed");
    } finally { setSubmitting(false); }
  };

  return (
    <div className="min-h-[80vh] flex items-center justify-center px-5 py-16" data-testid="register-page">
      <div className="w-full max-w-md">
        <div className="text-center mb-10">
          {branding?.logo_url && <img src={branding.logo_url} alt="logo" className="h-14 w-14 rounded-full object-cover mx-auto mb-5" />}
          <h1 className="font-display text-4xl font-semibold text-heading tracking-tight">Join the family.</h1>
          <p className="mt-2 text-body">Create an account to save favourites & track orders.</p>
        </div>
        <form onSubmit={submit} className="bg-white border border-brand rounded-3xl p-8 space-y-5">
          <div>
            <label className="text-xs uppercase tracking-wider text-muted-brand">Full name</label>
            <input className="input-brand mt-1.5" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} required autoFocus data-testid="register-name" />
          </div>
          <div>
            <label className="text-xs uppercase tracking-wider text-muted-brand">Email</label>
            <input type="email" className="input-brand mt-1.5" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} required data-testid="register-email" />
          </div>
          <div>
            <label className="text-xs uppercase tracking-wider text-muted-brand">Password</label>
            <input type="password" className="input-brand mt-1.5" value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })} required minLength={6} data-testid="register-password" />
          </div>
          <button type="submit" disabled={submitting} className="btn-primary w-full" data-testid="register-submit-btn">
            {submitting ? "Creating account…" : "Create account"}
          </button>
        </form>
        <p className="text-center text-sm text-body mt-6">
          Already have an account? <Link to="/login" className="text-primary-brand font-medium hover:underline" data-testid="register-to-login">Sign in</Link>
        </p>
      </div>
    </div>
  );
}
