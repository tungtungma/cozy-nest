"use client";

import { SessionProvider } from "next-auth/react";
import { LanguageProvider } from "@/contexts/LanguageContext";
import { GlobalCartProvider } from "@/components/GlobalCartProvider";

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <SessionProvider>
      <LanguageProvider>
        <GlobalCartProvider>{children}</GlobalCartProvider>
      </LanguageProvider>
    </SessionProvider>
  );
}
