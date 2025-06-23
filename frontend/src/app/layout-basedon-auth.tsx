"use client";

import { useRouter, usePathname } from "next/navigation";
import { PropsWithChildren } from "react";
import { useSelector } from "react-redux";
import { RootState } from "@/store/store";
import { Spinner } from "@/components/ui/spinner";

export default function LayoutBasedOnAuth({ children }: PropsWithChildren) {
  const { isLoggedIn, initializing } = useSelector((state: RootState) => state.auth);
  // const [loading, setLoading] = useState(false);
  const router = useRouter();
  const pathname = usePathname();

  if (initializing) {
    return <Spinner />; 
  }

  if (!isLoggedIn && pathname !== "/login" && pathname !== "/register") {
    console.log(" hitting redirecting");
    router.replace("/login");
  }

  console.log("passed all", isLoggedIn, pathname, initializing);
  return <>{children}</>;
}
