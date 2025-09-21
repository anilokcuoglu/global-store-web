"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useTranslation } from "@/hooks/useTranslation";
import { useAuth } from "@/contexts/AuthContext";
// import { DEMO_USERS } from "@/services/authService";
import LanguageSwitcher from "@/components/LanguageSwitcher";

export default function LoginPage() {
  const { t } = useTranslation();
  const { login, register, mockLogin, isAuthenticated, isLoading } = useAuth();
  const router = useRouter();

  const [isLoginMode, setIsLoginMode] = useState(true);
  const [formData, setFormData] = useState({
    email: "",
    password: "",
    confirmPassword: "",
    firstName: "",
    lastName: "",
  });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Redirect if already authenticated
  useEffect(() => {
    if (isAuthenticated && !isLoading) {
      router.push("/");
    }
  }, [isAuthenticated, isLoading, router]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));

    // Clear error when user starts typing
    if (errors[name]) {
      setErrors((prev) => ({
        ...prev,
        [name]: "",
      }));
    }
  };

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (!formData.email) {
      newErrors.email = t("auth.errors.emailRequired");
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = t("auth.errors.emailInvalid");
    }

    if (!formData.password) {
      newErrors.password = t("auth.errors.passwordRequired");
    } else if (formData.password.length < 6) {
      newErrors.password = t("auth.errors.passwordMinLength");
    }

    if (!isLoginMode) {
      if (!formData.firstName) {
        newErrors.firstName = t("auth.errors.firstNameRequired");
      }

      if (!formData.lastName) {
        newErrors.lastName = t("auth.errors.lastNameRequired");
      }

      if (!formData.confirmPassword) {
        newErrors.confirmPassword = t("auth.errors.confirmPasswordRequired");
      } else if (formData.password !== formData.confirmPassword) {
        newErrors.confirmPassword = t("auth.errors.passwordsNotMatch");
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) return;

    setIsSubmitting(true);

    try {
      let success = false;

      if (isLoginMode) {
        success = await login(formData.email, formData.password);
      } else {
        success = await register(
          formData.email,
          formData.password,
          formData.firstName,
          formData.lastName
        );
      }

      if (success) {
        router.push("/");
      } else {
        setErrors({
          general: isLoginMode
            ? t("auth.errors.loginFailed")
            : t("auth.errors.registerFailed"),
        });
      }
    } catch {
      setErrors({
        general: t("auth.errors.networkError"),
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleMockLogin = async () => {
    setIsSubmitting(true);

    try {
      const success = await mockLogin();
      if (success) {
        router.push("/");
      } else {
        setErrors({
          general: t("auth.errors.networkError"),
        });
      }
    } catch {
      setErrors({
        general: t("auth.errors.networkError"),
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-900 dark:to-slate-800 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-900 dark:to-slate-800 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        {/* Header */}
        <div className="text-center">
          <div className="flex justify-center items-center space-x-2 mb-6">
            <div className="w-12 h-12 bg-gradient-to-r from-blue-600 to-purple-600 rounded-xl flex items-center justify-center">
              <span className="text-white font-bold text-2xl">G</span>
            </div>
            <span className="text-3xl font-bold text-slate-900 dark:text-white">
              Global Store
            </span>
          </div>

          <h2 className="text-3xl font-bold text-slate-900 dark:text-white mb-2">
            {isLoginMode ? t("auth.loginTitle") : t("auth.registerTitle")}
          </h2>
          <p className="text-slate-600 dark:text-slate-400">
            {isLoginMode ? t("auth.loginSubtitle") : t("auth.registerSubtitle")}
          </p>
        </div>

        {/* Language Switcher */}
        <div className="flex justify-center">
          <LanguageSwitcher />
        </div>

        {/* Form */}
        <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
          <div className="space-y-4">
            {!isLoginMode && (
              <>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label
                      htmlFor="firstName"
                      className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1"
                    >
                      {t("auth.firstName")}
                    </label>
                    <input
                      id="firstName"
                      name="firstName"
                      type="text"
                      value={formData.firstName}
                      onChange={handleInputChange}
                      placeholder={t("auth.firstNamePlaceholder")}
                      className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 ${
                        errors.firstName
                          ? "border-red-500 bg-red-50 dark:bg-red-900/20"
                          : "border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-800 text-slate-900 dark:text-white"
                      }`}
                    />
                    {errors.firstName && (
                      <p className="mt-1 text-sm text-red-600 dark:text-red-400">
                        {errors.firstName}
                      </p>
                    )}
                  </div>

                  <div>
                    <label
                      htmlFor="lastName"
                      className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1"
                    >
                      {t("auth.lastName")}
                    </label>
                    <input
                      id="lastName"
                      name="lastName"
                      type="text"
                      value={formData.lastName}
                      onChange={handleInputChange}
                      placeholder={t("auth.lastNamePlaceholder")}
                      className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 ${
                        errors.lastName
                          ? "border-red-500 bg-red-50 dark:bg-red-900/20"
                          : "border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-800 text-slate-900 dark:text-white"
                      }`}
                    />
                    {errors.lastName && (
                      <p className="mt-1 text-sm text-red-600 dark:text-red-400">
                        {errors.lastName}
                      </p>
                    )}
                  </div>
                </div>
              </>
            )}

            <div>
              <label
                htmlFor="email"
                className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1"
              >
                {t("auth.email")}
              </label>
              <input
                id="email"
                name="email"
                type="email"
                value={formData.email}
                onChange={handleInputChange}
                placeholder={t("auth.emailPlaceholder")}
                className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 ${
                  errors.email
                    ? "border-red-500 bg-red-50 dark:bg-red-900/20"
                    : "border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-800 text-slate-900 dark:text-white"
                }`}
              />
              {errors.email && (
                <p className="mt-1 text-sm text-red-600 dark:text-red-400">
                  {errors.email}
                </p>
              )}
            </div>

            <div>
              <label
                htmlFor="password"
                className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1"
              >
                {t("auth.password")}
              </label>
              <input
                id="password"
                name="password"
                type="password"
                value={formData.password}
                onChange={handleInputChange}
                placeholder={t("auth.passwordPlaceholder")}
                className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 ${
                  errors.password
                    ? "border-red-500 bg-red-50 dark:bg-red-900/20"
                    : "border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-800 text-slate-900 dark:text-white"
                }`}
              />
              {errors.password && (
                <p className="mt-1 text-sm text-red-600 dark:text-red-400">
                  {errors.password}
                </p>
              )}
            </div>

            {!isLoginMode && (
              <div>
                <label
                  htmlFor="confirmPassword"
                  className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1"
                >
                  {t("auth.confirmPassword")}
                </label>
                <input
                  id="confirmPassword"
                  name="confirmPassword"
                  type="password"
                  value={formData.confirmPassword}
                  onChange={handleInputChange}
                  placeholder={t("auth.confirmPasswordPlaceholder")}
                  className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 ${
                    errors.confirmPassword
                      ? "border-red-500 bg-red-50 dark:bg-red-900/20"
                      : "border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-800 text-slate-900 dark:text-white"
                  }`}
                />
                {errors.confirmPassword && (
                  <p className="mt-1 text-sm text-red-600 dark:text-red-400">
                    {errors.confirmPassword}
                  </p>
                )}
              </div>
            )}
          </div>

          {errors.general && (
            <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-3">
              <p className="text-sm text-red-600 dark:text-red-400">
                {errors.general}
              </p>
            </div>
          )}

          <div className="space-y-4">
            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full flex justify-center py-3 px-4 border border-transparent rounded-lg shadow-sm text-sm font-medium text-white bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200"
            >
              {isSubmitting ? (
                <div className="flex items-center">
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                  {isLoginMode ? t("auth.signIn") : t("auth.createAccount")}
                </div>
              ) : isLoginMode ? (
                t("auth.signIn")
              ) : (
                t("auth.createAccount")
              )}
            </button>

            {/* Mock Login Button */}
            <button
              type="button"
              onClick={handleMockLogin}
              disabled={isSubmitting}
              className="w-full flex justify-center py-3 px-4 border border-slate-300 dark:border-slate-600 rounded-lg shadow-sm text-sm font-medium text-slate-700 dark:text-slate-300 bg-white dark:bg-slate-800 hover:bg-slate-50 dark:hover:bg-slate-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200"
            >
              {isSubmitting ? (
                <div className="flex items-center">
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-slate-600 mr-2"></div>
                  {t("auth.mockLogin")}
                </div>
              ) : (
                <div className="flex items-center">
                  <svg
                    className="w-4 h-4 mr-2"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M13 10V3L4 14h7v7l9-11h-7z"
                    />
                  </svg>
                  {t("auth.mockLogin")} (Real API)
                </div>
              )}
            </button>
            <p className="text-xs text-center text-slate-500 dark:text-slate-400">
              {t("auth.mockLoginDescription")}
            </p>
          </div>

          <div className="text-center">
            <button
              type="button"
              onClick={() => {
                setIsLoginMode(!isLoginMode);
                setErrors({});
                setFormData({
                  email: "",
                  password: "",
                  confirmPassword: "",
                  firstName: "",
                  lastName: "",
                });
              }}
              className="text-sm text-blue-600 dark:text-blue-400 hover:text-blue-500 dark:hover:text-blue-300 font-medium transition-colors duration-200"
            >
              {isLoginMode ? t("auth.noAccount") : t("auth.haveAccount")}
              <span className="ml-1 underline">
                {isLoginMode ? t("auth.createAccount") : t("auth.signIn")}
              </span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
