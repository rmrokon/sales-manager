"use client"
import { useRouter } from "next/navigation";
import { useDispatch, useSelector } from "react-redux";
import { RootState } from "@/store/store";
import { Spinner } from "@/components/ui/spinner";
import { useEffect } from "react";
import { logout, setAuthUser } from "@/store/reducers/auth.reducer";

export default function HomePage() {
  const { isLoggedIn, initializing } = useSelector((state: RootState) => state.auth);
  const dispatch = useDispatch();
  const router = useRouter();

  useEffect(() => {
    const token = localStorage.getItem('accessToken');
    if (!initializing) {
      if (isLoggedIn) {
        router.replace("/invoices");
      } else {
        router.replace("/login");
      }
    }
    if(!token){
      dispatch(
      setAuthUser({
        user: null,
        roles: [],
        permissions: [],
        company: null,
        initializing: false,
      })
    );
    }
  }, [initializing, isLoggedIn, router]);

  // Show loading spinner while determining where to redirect
  return (
    <div className="flex items-center justify-center min-h-screen">
      <Spinner />
    </div>
  );
}

