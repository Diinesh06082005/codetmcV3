import { useState } from "react";
import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import AuthShell from "../components/AuthShell.jsx";
import FloatingInput from "../components/FloatingInput.jsx";
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

  const handleSubmit = async (event) => {
    event.preventDefault();

    const { errors: validationErrors, values } = validateLoginForm(form);

    if (Object.keys(validationErrors).length) {
      setErrors(validationErrors);
      toast.error("Please review the highlighted fields.");
      return;
    }

    try {
      setIsSubmitting(true);
      const response = await login(values);
      toast.success("Welcome back.");
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
      eyebrow="Welcome Back"
      title="Sign in to your collaboration workspace"
      description="Resume your secure coding rooms, reconnect your realtime socket session, and pick up exactly where your team left off."
      accent="Secure Session"
      footerText="Need an account?"
      footerLabel="Create one"
      footerHref="/register"
    >
      <form onSubmit={handleSubmit} className="space-y-2">
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
          autoComplete="current-password"
          error={errors.password}
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
              Signing in...
            </>
          ) : (
            "Sign In"
          )}
        </motion.button>
      </form>
    </AuthShell>
  );
}

export default Login;
