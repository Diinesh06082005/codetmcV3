import { useState } from "react";
import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import AuthShell from "../components/AuthShell.jsx";
import FloatingInput from "../components/FloatingInput.jsx";
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
      toast.success("Account created. Your studio is ready.");
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
      description="Choose a handle, lock in your session, and start opening authenticated rooms with protected API and socket access."
      accent="JWT + Live Rooms"
      footerText="Already have an account?"
      footerLabel="Sign in"
      footerHref="/login"
    >
      <form onSubmit={handleSubmit} className="space-y-2">
        <FloatingInput
          id="username"
          label="Username"
          value={form.username}
          onChange={handleFieldChange("username")}
          autoComplete="username"
          error={errors.username}
          disabled={isSubmitting}
        />
        <FloatingInput
          id="email"
          label="Email"
          type="email"
          value={form.email}
          onChange={handleFieldChange("email")}
          autoComplete="email"
          error={errors.email}
          disabled={isSubmitting}
        />
        <FloatingInput
          id="password"
          label="Password"
          type="password"
          value={form.password}
          onChange={handleFieldChange("password")}
          autoComplete="new-password"
          error={errors.password}
          disabled={isSubmitting}
        />
        <FloatingInput
          id="confirmPassword"
          label="Confirm Password"
          type="password"
          value={form.confirmPassword}
          onChange={handleFieldChange("confirmPassword")}
          autoComplete="new-password"
          error={errors.confirmPassword}
          disabled={isSubmitting}
        />

        <div className="min-h-5 text-xs text-rose-300">{errors.form || " "}</div>

        <motion.button
          whileHover={{ y: -2 }}
          whileTap={{ scale: 0.99 }}
          type="submit"
          disabled={isSubmitting}
          className="gradient-button mt-2 flex w-full items-center justify-center gap-3 disabled:cursor-not-allowed disabled:opacity-70"
        >
          {isSubmitting ? (
            <>
              <span className="h-4 w-4 animate-spin rounded-full border-2 border-slate-950/35 border-t-slate-950" />
              Creating Account...
            </>
          ) : (
            "Create Account"
          )}
        </motion.button>
      </form>
    </AuthShell>
  );
}

export default Register;
