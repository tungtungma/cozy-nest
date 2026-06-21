"use client";

import { Suspense } from "react";
import { signIn } from "next-auth/react";
import { useSearchParams } from "next/navigation";
import { useLanguage } from "@/contexts/LanguageContext";

function LoginContent() {
  const searchParams = useSearchParams();
  const callbackUrl = searchParams.get("callbackUrl") || "/";
  const error = searchParams.get("error");
  const { language } = useLanguage();

  const content = {
    en: {
      title: "Sign In",
      subtitle: "Sign in to your Cozy Nest account",
      googleButton: "Continue with Google",
      secureNote: "Your information is secure.",
      errorTitle: "Authentication Error",
      errorMessage: "There was a problem signing you in.",
      features: ["Track your orders", "Save delivery addresses", "View order history"],
    },
    zh: {
      title: "登入",
      subtitle: "登入您的 Cozy Nest 帳戶",
      googleButton: "使用 Google 繼續",
      secureNote: "您的資料是安全的。",
      errorTitle: "認證錯誤",
      errorMessage: "登入時發生問題，請重試。",
      features: ["追蹤您的訂單", "儲存送貨地址", "查看訂單記錄"],
    },
  };

  const t = content[language];

  return (
    <div className="min-h-screen bg-background py-24 px-4">
      <div className="max-w-md mx-auto text-center">
        <h1 className="font-serif text-4xl text-foreground mb-2">Cozy Nest</h1>
        <p className="text-sm text-muted-foreground mb-8">{t.subtitle}</p>

        {error && (
          <div className="mb-6 bg-red-50 border border-red-200 rounded-lg p-4 text-left">
            <p className="text-sm text-red-600">{t.errorMessage}</p>
          </div>
        )}

        <button
          onClick={() => signIn("google", { callbackUrl })}
          className="btn-pill-outline w-full mb-4"
        >
          {t.googleButton}
        </button>

        <p className="text-[10px] text-muted-foreground">{t.secureNote}</p>

        <a href="/" className="inline-block mt-8 text-xs text-accent hover:underline">
          ← {language === "en" ? "Back to Home" : "返回首頁"}
        </a>
      </div>
    </div>
  );
}

export default function LoginPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-background flex items-center justify-center"><p className="text-muted-foreground">Loading...</p></div>}>
      <LoginContent />
    </Suspense>
  );
}
