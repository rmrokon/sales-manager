"use client"
import { useRouter } from "next/navigation";
import { useSelector } from "react-redux";
import { RootState } from "@/store/store";
import { Spinner } from "@/components/ui/spinner";
import { useEffect } from "react";

export default function HomePage() {
  const { isLoggedIn, initializing } = useSelector((state: RootState) => state.auth);
  const router = useRouter();

  useEffect(() => {
    if (!initializing) {
      if (isLoggedIn) {
        router.replace("/invoices");
      } else {
        router.replace("/login");
      }
    }
  }, [initializing, isLoggedIn, router]);

  // Show loading spinner while determining where to redirect
  return (
    <div className="flex items-center justify-center min-h-screen">
      <Spinner />
    </div>
  );
}

