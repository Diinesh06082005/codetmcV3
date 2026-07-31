import { useState } from "react";
import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import { Eye, EyeOff, Lock, Mail, User, ArrowRight } from "lucide-react";
import AuthShell from "../components/AuthShell.jsx";
import { useAuth } from "../context/AuthContext.jsx";
import { getDefaultAuthenticatedRoute } from "../utils/auth.js";
import {
  normalizeEmailInput,
  sanitizeUsernameInput,
  validateRegisterForm,
} from "../utils/validators.js";

function Register() {
  const navigate = useNavigate();
  const { register } = useAuth();

  const [form, setForm] = useState({
    username: "",
    email: "",
    password: "",
    confirmPassword: "",
  });
  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const handleFieldChange = (field) => (event) => {
    let nextValue = event.target.value;

    if (field === "username") {
      nextValue = sanitizeUsernameInput(nextValue);
    }

    if (field === "email") {
      nextValue = normalizeEmailInput(nextValue);
    }

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

  const handleSubmit = async (event) => {
    event.preventDefault();

    const { errors: validationErrors, values } = validateRegisterForm(form);

    if (Object.keys(validationErrors).length) {
      setErrors(validationErrors);
      toast.error("Please review the highlighted fields.");
      return;
    }

    try {
      setIsSubmitting(true);
      const response = await register(values);
      toast.success("Account created! Welcome to CodeTMC Studio.");
      navigate(getDefaultAuthenticatedRoute(response.user), { replace: true });
    } catch (error) {
      const message = error.message || "Unable to create your account right now.";
      setErrors((previous) => ({ ...previous, form: message }));
      toast.error(message);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <AuthShell
      eyebrow="Create Account"
      title="Launch your secure realtime coding studio"
      description="Choose a developer handle, lock in your session, and start opening authenticated collaboration rooms."
      accent="JWT + Live Sockets"
      footerText="Already have an account?"
      footerLabel="Sign in"
      footerHref="/login"
    >
      <form onSubmit={handleSubmit} className="space-y-3">
        {/* Username Field */}
        <div>
          <label className="block text-xs font-medium text-slate-300 mb-1 flex items-center gap-1.5">
            <User className="h-3.5 w-3.5 text-slate-400" /> Developer Handle / Username
          </label>
          <input
            id="username"
            type="text"
            placeholder="alex_dev"
            value={form.username}
            onChange={handleFieldChange("username")}
            disabled={isSubmitting}
            autoComplete="username"
            className={`w-full rounded-xl border bg-white/[0.05] px-4 py-2.5 text-xs text-white placeholder:text-slate-500 outline-none transition-colors duration-150 ${
              errors.username ? "border-[#FF453A]" : "border-white/10 focus:border-[#007AFF]"
            }`}
          />
          {errors.username && <p className="mt-1 text-[11px] text-[#FF453A]">{errors.username}</p>}
        </div>

        {/* Email Field */}
        <div>
          <label className="block text-xs font-medium text-slate-300 mb-1 flex items-center gap-1.5">
            <Mail className="h-3.5 w-3.5 text-slate-400" /> Email Address
          </label>
          <input
            id="email"
            type="email"
            placeholder="alex@codetmc.com"
            value={form.email}
            onChange={handleFieldChange("email")}
            disabled={isSubmitting}
            autoComplete="email"
            className={`w-full rounded-xl border bg-white/[0.05] px-4 py-2.5 text-xs text-white placeholder:text-slate-500 outline-none transition-colors duration-150 ${
              errors.email ? "border-[#FF453A]" : "border-white/10 focus:border-[#007AFF]"
            }`}
          />
          {errors.email && <p className="mt-1 text-[11px] text-[#FF453A]">{errors.email}</p>}
        </div>

        {/* Password Field */}
        <div>
          <label className="block text-xs font-medium text-slate-300 mb-1 flex items-center gap-1.5">
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
              autoComplete="new-password"
              className={`w-full rounded-xl border bg-white/[0.05] pl-4 pr-10 py-2.5 text-xs text-white placeholder:text-slate-500 outline-none transition-colors duration-150 ${
                errors.password ? "border-[#FF453A]" : "border-white/10 focus:border-[#007AFF]"
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

        {/* Confirm Password Field */}
        <div>
          <label className="block text-xs font-medium text-slate-300 mb-1 flex items-center gap-1.5">
            <Lock className="h-3.5 w-3.5 text-slate-400" /> Confirm Password
          </label>
          <input
            id="confirmPassword"
            type={showPassword ? "text" : "password"}
            placeholder="••••••••••••"
            value={form.confirmPassword}
            onChange={handleFieldChange("confirmPassword")}
            disabled={isSubmitting}
            autoComplete="new-password"
            className={`w-full rounded-xl border bg-white/[0.05] px-4 py-2.5 text-xs text-white placeholder:text-slate-500 outline-none transition-colors duration-150 ${
              errors.confirmPassword ? "border-[#FF453A]" : "border-white/10 focus:border-[#007AFF]"
            }`}
          />
          {errors.confirmPassword && <p className="mt-1 text-[11px] text-[#FF453A]">{errors.confirmPassword}</p>}
        </div>

        {errors.form && <div className="p-3 rounded-xl bg-[#FF453A]/15 border border-[#FF453A]/30 text-xs text-[#FF453A] font-medium">{errors.form}</div>}

        {/* Submit Button */}
        <button
          type="submit"
          disabled={isSubmitting}
          className="w-full mt-3 py-3 rounded-xl bg-[#007AFF] hover:bg-[#0062CC] active:bg-[#004999] font-medium text-white text-xs tracking-wide disabled:opacity-50 flex items-center justify-center gap-2 transition-colors duration-150 border-none shadow-none"
        >
          {isSubmitting ? (
            <>
              <span className="h-4 w-4 animate-spin rounded-full border-2 border-white/30 border-t-white" />
              Creating Developer Account...
            </>
          ) : (
            <>
              Create Studio Account <ArrowRight className="h-4 w-4" />
            </>
          )}
        </button>
      </form>
    </AuthShell>
  );
}

export default Register;
