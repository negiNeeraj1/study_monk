import React, { useState } from "react";
import { Eye, EyeOff, Mail, Lock, XCircle, Loader2 } from "lucide-react";
import { useAuth } from "../context/AuthContext";
import { useNavigate, Link } from "react-router-dom";

const Login = () => {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({ email: "", password: "" });
  const [errors, setErrors] = useState({});
  const [formError, setFormError] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const validateEmail = (email) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);

  const handleChange = (field, value) => {
    setForm((prev) => ({ ...prev, [field]: value }));
    setFormError("");
    setErrors((prev) => ({ ...prev, [field]: undefined }));
  };

  const handleLogin = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setFormError("");
    const errs = {};
    if (!validateEmail(form.email))
      errs.email = "Please enter a valid email address";
    if (!form.password) errs.password = "Password is required";
    if (Object.keys(errs).length > 0) {
      setErrors(errs);
      setIsLoading(false);
      return;
    }
    const result = await login(form.email, form.password);
    setIsLoading(false);
    if (result.success) {
      navigate("/dashboard");
    } else {
      setFormError(result.error || "Login failed. Please try again.");
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-500 via-purple-600 to-purple-700 flex items-center justify-center p-4 relative overflow-hidden">
      <div className="bg-white/95 backdrop-blur-sm rounded-2xl shadow-2xl w-full max-w-md p-8 relative transform transition-all duration-300 hover:scale-105 hover:shadow-3xl">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent mb-2">
            Welcome Back
          </h1>
          <p className="text-gray-600">
            Sign in to continue your AI quiz journey
          </p>
        </div>
        <form className="space-y-6" onSubmit={handleLogin}>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Email
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Mail className="h-5 w-5 text-gray-400" />
              </div>
              <input
                type="email"
                value={form.email}
                onChange={(e) => handleChange("email", e.target.value)}
                placeholder="Enter your email"
                className={`w-full pl-10 pr-10 py-3 border-2 rounded-xl transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-blue-500/20 ${
                  errors.email
                    ? "border-red-400 bg-red-50 animate-pulse"
                    : "border-gray-200 focus:border-blue-500 hover:border-gray-300"
                }`}
              />
              {errors.email && (
                <div className="absolute inset-y-0 right-0 pr-3 flex items-center">
                  <XCircle className="h-5 w-5 text-red-400" />
                </div>
              )}
            </div>
            {errors.email && (
              <div className="mt-1 text-sm text-red-600 flex items-center animate-slideDown">
                <XCircle className="h-4 w-4 mr-1" />
                {errors.email}
              </div>
            )}
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Password
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Lock className="h-5 w-5 text-gray-400" />
              </div>
              <input
                type={showPassword ? "text" : "password"}
                value={form.password}
                onChange={(e) => handleChange("password", e.target.value)}
                placeholder="Enter your password"
                className={`w-full pl-10 pr-10 py-3 border-2 rounded-xl transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-blue-500/20 ${
                  errors.password
                    ? "border-red-400 bg-red-50 animate-pulse"
                    : "border-gray-200 focus:border-blue-500 hover:border-gray-300"
                }`}
              />
              <button
                type="button"
                onClick={() => setShowPassword((v) => !v)}
                className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-gray-600 transition-colors"
              >
                {showPassword ? (
                  <EyeOff className="h-5 w-5" />
                ) : (
                  <Eye className="h-5 w-5" />
                )}
              </button>
              {errors.password && (
                <div className="absolute inset-y-0 right-0 pr-10 flex items-center">
                  <XCircle className="h-5 w-5 text-red-400" />
                </div>
              )}
            </div>
            {errors.password && (
              <div className="mt-1 text-sm text-red-600 flex items-center animate-slideDown">
                <XCircle className="h-4 w-4 mr-1" />
                {errors.password}
              </div>
            )}
          </div>
          {formError && (
            <div className="text-red-600 text-sm flex items-center animate-slideDown">
              <XCircle className="h-4 w-4 mr-1" />
              {formError}
            </div>
          )}
          <button
            type="submit"
            disabled={isLoading}
            className="w-full bg-gradient-to-r from-blue-500 to-purple-600 text-white py-3 rounded-xl font-semibold transition-all duration-300 hover:from-blue-600 hover:to-purple-700 hover:shadow-lg hover:-translate-y-1 disabled:opacity-50 disabled:transform-none disabled:cursor-not-allowed flex items-center justify-center"
          >
            {isLoading ? (
              <>
                <Loader2 className="h-5 w-5 animate-spin mr-2" />
                Signing In...
              </>
            ) : (
              "Sign In"
            )}
          </button>
        </form>
        <div className="mt-6 text-center pt-6 border-t border-gray-200">
          <p className="text-gray-600">
            Don't have an account?{" "}
            <Link
              to="/signup"
              className="text-blue-600 hover:text-purple-600 font-semibold transition-colors"
            >
              Sign up here
            </Link>
          </p>
        </div>
        <style>{`
          @keyframes slideDown {
            from { opacity: 0; transform: translateY(-10px); }
            to { opacity: 1; transform: translateY(0); }
          }
          .animate-slideDown { animation: slideDown 0.3s ease-out; }
        `}</style>
      </div>
    </div>
  );
};

export default Login;
