"use client";

import { useEffect } from "react";
import { useApp } from "@/store/app-store";
import { Toaster } from "@/components/ui/toaster";

export function Providers({ children }: { children: React.ReactNode }) {
  const init = useApp((s) => s.init);

  useEffect(() => {
    void init();
  }, [init]);

  return (
    <>
      {children}
      <Toaster />
    </>
  );
}
