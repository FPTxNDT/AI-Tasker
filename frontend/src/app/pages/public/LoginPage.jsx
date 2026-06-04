import { useState } from "react";
import { Link, useNavigate } from "react-router";
import { Eye, EyeOff, ArrowLeft, Mail, CheckCircle, X } from "lucide-react";
import { useAuth } from "../../hooks/useAuth.js";

export function LoginPage() {
  const navigate = useNavigate();
  const { login } = useAuth();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  // Forgot-password state
  const [view, setView] = useState("login"); // "login" | "forgotPassword"
  const [resetEmail, setResetEmail] = useState("");
  const [resetSubmitted, setResetSubmitted] = useState(false);
  const [resetError, setResetError] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    if (!email.trim() || !password.trim()) {
      setError("Please enter your email and password.");
      return;
    }

    setSubmitting(true);
    try {
      // Call AuthContext.login() — this stores the JWT token and decodes the role
      const user = await login(email.trim(), password);

      // Redirect based on the role returned from the auth flow (JWT payload)
      const dashboardPath =
        user.role === "expert"
          ? "/expert/dashboard"
          : user.role === "admin"
            ? "/admin/dashboard"
            : "/client/dashboard";

      navigate(dashboardPath, { replace: true });
    } catch (err) {
      setError(err.message || "Login failed. Please check your credentials.");
    } finally {
      setSubmitting(false);
    }
  };

  const handleResetSubmit = (e) => {
    e.preventDefault();
    setResetError("");
    if (!resetEmail.trim()) {
      setResetError("Please enter your email address.");
      return;
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(resetEmail.trim())) {
      setResetError("Please enter a valid email address.");
      return;
    }
    // TODO: POST /api/auth/forgot-password
    setResetSubmitted(true);
  };

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full bg-white rounded-2xl shadow-lg p-8 relative">
        {/* Close button */}
        <button
          type="button"
          onClick={() => navigate("/")}
          className="absolute top-4 right-4 p-1.5 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
          aria-label="Close and return to homepage"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Logo */}
        <div className="text-center mb-8">
          <div className="flex items-center justify-center gap-2 mb-4">
            <div className="w-12 h-12 bg-blue-900 rounded-lg flex items-center justify-center">
              <span className="text-white font-bold text-xl">AI</span>
            </div>
            <span className="text-2xl font-bold text-gray-900">Tasker</span>
          </div>
        </div>

        {view === "forgotPassword" ? (
          /* ====== FORGOT PASSWORD VIEW ====== */
          <div>
            <h2 className="text-3xl font-bold text-gray-900 text-center">
              Forgot Password
            </h2>
            <p className="mt-2 text-gray-600 text-center">
              {resetSubmitted
                ? "Check your email for reset instructions."
                : "Enter your email to receive a password reset link."}
            </p>

            {resetSubmitted ? (
              <div className="text-center mt-8">
                <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <CheckCircle className="w-8 h-8 text-green-600" />
                </div>
                <p className="text-sm text-gray-600 mb-6">
                  If an account with{" "}
                  <span className="font-medium text-gray-900">{resetEmail}</span>{" "}
                  exists, password reset instructions will be sent.
                </p>
                <button
                  type="button"
                  onClick={() => {
                    setView("login");
                    setResetSubmitted(false);
                    setResetEmail("");
                    setResetError("");
                  }}
                  className="inline-flex items-center gap-2 text-sm font-medium text-blue-900 hover:text-blue-800 transition-colors"
                >
                  <ArrowLeft className="w-4 h-4" />
                  Back to Login
                </button>
              </div>
            ) : (
              <form onSubmit={handleResetSubmit} className="space-y-6 mt-8">
                {resetError && (
                  <div className="p-3 bg-red-50 border border-red-200 rounded-lg text-sm text-red-700">
                    {resetError}
                  </div>
                )}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Email Address
                  </label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                    <input
                      type="email"
                      value={resetEmail}
                      onChange={(e) => setResetEmail(e.target.value)}
                      className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-blue-900"
                      placeholder="your@email.com"
                      required
                    />
                  </div>
                </div>
                <button
                  type="submit"
                  className="w-full py-3 bg-blue-900 text-white rounded-lg hover:bg-blue-800 font-medium transition-colors"
                >
                  Send Reset Link
                </button>
                <div className="text-center">
                  <button
                    type="button"
                    onClick={() => {
                      setView("login");
                      setResetError("");
                    }}
                    className="inline-flex items-center gap-2 text-sm text-gray-600 hover:text-gray-900 transition-colors"
                  >
                    <ArrowLeft className="w-4 h-4" />
                    Back to Login
                  </button>
                </div>
              </form>
            )}
          </div>
        ) : (
          /* ====== LOGIN VIEW ====== */
          <div>
            <h2 className="text-3xl font-bold text-gray-900 text-center">
              Welcome Back
            </h2>
            <p className="mt-2 text-gray-600 text-center">
              Sign in to your account
            </p>

            {error && (
              <div className="mt-4 p-3 bg-red-50 border border-red-200 rounded-lg text-sm text-red-700">
                {error}
              </div>
            )}

            <form className="space-y-6 mt-6" onSubmit={handleSubmit}>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Email Address
                </label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => {
                    setEmail(e.target.value);
                    setError("");
                  }}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-blue-900"
                  placeholder="your@email.com"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Password
                </label>
                <div className="relative">
                  <input
                    type={showPassword ? "text" : "password"}
                    value={password}
                    onChange={(e) => {
                      setPassword(e.target.value);
                      setError("");
                    }}
                    className="w-full px-4 py-2 pr-10 border border-gray-300 rounded-lg focus:outline-none focus:border-blue-900"
                    placeholder="••••••••"
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                    aria-label={showPassword ? "Hide password" : "Show password"}
                  >
                    {showPassword ? (
                      <EyeOff className="w-4 h-4" />
                    ) : (
                      <Eye className="w-4 h-4" />
                    )}
                  </button>
                </div>
              </div>
              <div className="flex items-center justify-between">
                <label className="flex items-center">
                  <input type="checkbox" className="mr-2" />
                  <span className="text-sm text-gray-600">Remember me</span>
                </label>
                <button
                  type="button"
                  onClick={() => setView("forgotPassword")}
                  className="text-sm text-blue-900 hover:text-blue-800 bg-transparent border-none p-0 cursor-pointer"
                >
                  Forgot password?
                </button>
              </div>
              <button
                type="submit"
                disabled={submitting}
                className="w-full py-3 bg-blue-900 text-white rounded-lg hover:bg-blue-800 font-medium disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                {submitting ? "Signing in..." : "Sign In"}
              </button>
            </form>

            <div className="mt-6 text-center">
              <p className="text-sm text-gray-600">
                Don&apos;t have an account?{" "}
                <Link
                  to="/signup"
                  className="text-blue-900 hover:text-blue-800 font-medium"
                >
                  Sign up
                </Link>
              </p>
            </div>

            {/* Demo hint — remove in production */}
            <div className="mt-4 p-3 bg-gray-50 border border-gray-200 rounded-lg">
              <p className="text-xs text-gray-500 text-center">
                <span className="font-semibold">Demo:</span> Use any email
                containing &quot;expert&quot; to log in as Expert, or any other
                email for Client. Password: any 3+ characters.
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
