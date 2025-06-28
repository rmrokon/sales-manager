"use client";

import { ReactNode } from "react";
import { Toaster } from "@/components/ui/toaster";

export default function ZonesLayout({ children }: { children: ReactNode }) {
  return (
    <div className="min-h-screen">
      {children}
      <Toaster />
    </div>
  );
}