import { useState } from "react";
import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import { Eye, EyeOff, Lock, Mail, ArrowRight, ShieldCheck, UserCheck, Sparkles } from "lucide-react";
import AuthShell from "../components/AuthShell.jsx";
import { useAuth } from "../context/AuthContext.jsx";
import { getDefaultAuthenticatedRoute } from "../utils/auth.js";
import { normalizeEmailInput, validateLoginForm } from "../utils/validators.js";

function Login() {
  const navigate = useNavigate();
  const { login } = useAuth();

  const [form, setForm] = useState({
    email: "",
    password: "",
  });
  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const handleFieldChange = (field) => (event) => {
    const nextValue =
      field === "email" ? normalizeEmailInput(event.target.value) : event.target.value;

    setForm((previous) => ({
      ...previous,
      [field]: nextValue,
    }));

    setErrors((previous) => ({
      ...previous,
      [field]: "",
      form: "",
    }));
  };

  const handleQuickFill = (email, password) => {
    setForm({ email, password });
    toast.success(`Demo credentials filled for ${email}`);
  };

  const handleSubmit = async (event) => {
    event.preventDefault();

    const { errors: validationErrors, values } = validateLoginForm(form);

    if (Object.keys(validationErrors).length) {
      setErrors(validationErrors);
      toast.error("Please check your credentials.");
      return;
    }

    try {
      setIsSubmitting(true);
      const response = await login(values);
      toast.success(`Welcome back, ${response.user?.username || "Developer"}!`);
      navigate(getDefaultAuthenticatedRoute(response.user), { replace: true });
    } catch (error) {
      const message = error.message || "Unable to sign in right now.";
      setErrors((previous) => ({ ...previous, form: message }));
      toast.error(message);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <AuthShell
      eyebrow="Authentication Center"
      title="Sign in to your collaboration workspace"
      description="Access your live code rooms, HD video calls, screen share stage, and real-time team broadcasts."
      accent="Encrypted JWT Session"
      footerText="Don't have a developer account yet?"
      footerLabel="Register here"
      footerHref="/register"
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Email Field */}
        <div>
          <label className="block text-xs font-medium text-slate-300 mb-1.5 flex items-center gap-1.5">
            <Mail className="h-3.5 w-3.5 text-slate-400" /> Email Address
          </label>
          <div className="relative">
            <input
              id="email"
              type="email"
              placeholder="developer@codetmc.com"
              value={form.email}
              onChange={handleFieldChange("email")}
              disabled={isSubmitting}
              autoComplete="email"
              className={`w-full rounded-xl border bg-white/[0.05] px-4 py-3 text-xs text-white placeholder:text-slate-500 outline-none transition-colors duration-150 ${
                errors.email
                  ? "border-[#FF453A]"
                  : "border-white/10 focus:border-[#007AFF] focus:ring-1 focus:ring-[#007AFF]"
              }`}
            />
          </div>
          {errors.email && <p className="mt-1 text-[11px] text-[#FF453A]">{errors.email}</p>}
        </div>

        {/* Password Field */}
        <div>
          <label className="block text-xs font-medium text-slate-300 mb-1.5 flex items-center gap-1.5">
            <Lock className="h-3.5 w-3.5 text-slate-400" /> Password
          </label>
          <div className="relative">
            <input
              id="password"
              type={showPassword ? "text" : "password"}
              placeholder="••••••••••••"
              value={form.password}
              onChange={handleFieldChange("password")}
              disabled={isSubmitting}
              autoComplete="current-password"
              className={`w-full rounded-xl border bg-white/[0.05] pl-4 pr-10 py-3 text-xs text-white placeholder:text-slate-500 outline-none transition-colors duration-150 ${
                errors.password
                  ? "border-[#FF453A]"
                  : "border-white/10 focus:border-[#007AFF] focus:ring-1 focus:ring-[#007AFF]"
              }`}
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white transition-colors p-1"
            >
              {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
            </button>
          </div>
          {errors.password && <p className="mt-1 text-[11px] text-[#FF453A]">{errors.password}</p>}
        </div>

        {errors.form && (
          <div className="p-3 rounded-xl bg-[#FF453A]/15 border border-[#FF453A]/30 text-xs text-[#FF453A] font-medium">
            {errors.form}
          </div>
        )}

        {/* Quick Fill Demo Credentials */}
        <div className="pt-2">
          <p className="text-[10px] uppercase font-bold text-slate-400 mb-2 flex items-center gap-1">
            <Sparkles className="h-3 w-3 text-[#007AFF]" /> Quick Demo One-Click Fill
          </p>
          <div className="grid grid-cols-2 gap-2">
            <button
              type="button"
              onClick={() => handleQuickFill("admin@codetmc.com", "Admin@123")}
              className="px-3 py-2.5 rounded-xl bg-white/[0.08] hover:bg-white/[0.14] text-slate-200 border border-white/10 text-xs font-medium flex items-center justify-center gap-1.5 transition-colors duration-150"
            >
              <ShieldCheck className="h-3.5 w-3.5 text-amber-400" /> Admin Demo
            </button>
            <button
              type="button"
              onClick={() => handleQuickFill("dev@codetmc.com", "Dev@123456")}
              className="px-3 py-2.5 rounded-xl bg-white/[0.08] hover:bg-white/[0.14] text-slate-200 border border-white/10 text-xs font-medium flex items-center justify-center gap-1.5 transition-colors duration-150"
            >
              <UserCheck className="h-3.5 w-3.5 text-[#007AFF]" /> Developer Demo
            </button>
          </div>
        </div>

        {/* Submit Button */}
        <button
          type="submit"
          disabled={isSubmitting}
          className="w-full mt-3 py-3 rounded-xl bg-[#007AFF] hover:bg-[#0062CC] active:bg-[#004999] font-medium text-white text-xs tracking-wide disabled:opacity-50 flex items-center justify-center gap-2 transition-colors duration-150 border-none shadow-none"
        >
          {isSubmitting ? (
            <>
              <span className="h-4 w-4 animate-spin rounded-full border-2 border-white/30 border-t-white" />
              Verifying Session...
            </>
          ) : (
            <>
              Sign In to Studio <ArrowRight className="h-4 w-4" />
            </>
          )}
        </button>
      </form>
    </AuthShell>
  );
}

export default Login;
