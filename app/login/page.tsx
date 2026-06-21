"use client";

import { signIn } from "next-auth/react";
import { useSearchParams } from "next/navigation";
import { useLanguage } from "@/contexts/LanguageContext";

export default function LoginPage() {
  const searchParams = useSearchParams();
  const callbackUrl = searchParams.get("callbackUrl") || "/";
  const error = searchParams.get("error");
  const { language } = useLanguage();

  const content = {
    en: {
      title: "Sign In",
      subtitle: "Sign in to manage your orders and addresses",
      googleButton: "Continue with Google",
      secureNote: "Your information is secure and will only be used for your account.",
      errorTitle: "Authentication Error",
      errorMessage: "There was a problem signing you in. Please try again.",
      features: [
        "Track your orders",
        "Save delivery addresses",
        "View order history",
        "Faster checkout",
      ],
    },
    zh: {
      title: "登入",
      subtitle: "登入以管理您的訂單和地址",
      googleButton: "使用 Google 繼續",
      secureNote: "您的資料是安全的，僅用於您的帳戶。",
      errorTitle: "認證錯誤",
      errorMessage: "登入時發生問題，請重試。",
      features: [
        "追蹤您的訂單",
        "儲存送貨地址",
        "查看訂單記錄",
        "更快結帳",
      ],
    },
  };

  const t = content[language];

  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-50 to-white py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md mx-auto">
        {/* Logo/Brand */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-blue-900 mb-2">
            {language === "en" ? "Tung Ma Soup" : "桐媽靚湯"}
          </h1>
          <p className="text-gray-600">{t.subtitle}</p>
        </div>

        {/* Error Message */}
        {error && (
          <div className="mb-6 bg-red-50 border border-red-200 rounded-lg p-4">
            <h3 className="font-semibold text-red-800 mb-1">{t.errorTitle}</h3>
            <p className="text-sm text-red-600">{t.errorMessage}</p>
          </div>
        )}

        {/* Login Card */}
        <div className="bg-white rounded-2xl shadow-lg p-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-6 text-center">
            {t.title}
          </h2>

          {/* Google Sign In Button */}
          <button
            onClick={() => signIn("google", { callbackUrl })}
            className="w-full flex items-center justify-center gap-3 bg-white border-2 border-gray-300 rounded-lg px-6 py-3 text-gray-700 font-semibold hover:bg-gray-50 hover:border-gray-400 transition-all duration-200 shadow-sm hover:shadow-md"
          >
            <svg className="w-5 h-5" viewBox="0 0 24 24">
              <path
                fill="#4285F4"
                d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
              />
              <path
                fill="#34A853"
                d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
              />
              <path
                fill="#FBBC05"
                d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
              />
              <path
                fill="#EA4335"
                d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
              />
            </svg>
            {t.googleButton}
          </button>

          {/* Security Note */}
          <p className="mt-6 text-xs text-center text-gray-500">
            🔒 {t.secureNote}
          </p>

          {/* Features */}
          <div className="mt-8 pt-6 border-t border-gray-200">
            <h3 className="text-sm font-semibold text-gray-700 mb-3">
              {language === "en" ? "Benefits of signing in:" : "登入的好處："}
            </h3>
            <ul className="space-y-2">
              {t.features.map((feature, index) => (
                <li key={index} className="flex items-center gap-2 text-sm text-gray-600">
                  <svg
                    className="w-4 h-4 text-green-500 flex-shrink-0"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M5 13l4 4L19 7"
                    />
                  </svg>
                  {feature}
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Back to Home */}
        <div className="mt-6 text-center">
          <a
            href="/"
            className="text-sm text-blue-600 hover:text-blue-800 hover:underline"
          >
            ← {language === "en" ? "Back to Home" : "返回首頁"}
          </a>
        </div>
      </div>
    </div>
  );
}
