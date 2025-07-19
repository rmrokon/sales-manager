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
  const token = localStorage.getItem('accessToken');

  useEffect(() => {
    if(!token){
      console.log("No token found");
      dispatch(
      setAuthUser({
        user: null,
        roles: [],
        permissions: [],
        company: null,
        initializing: false,
      })
    );
    router.replace("/login");
    }else {
       router.replace("/invoices");
    }
  }, [token]);
  console.log("rendering page.tsx")
  // Show loading spinner while determining where to redirect
  return (
    <div className="flex items-center justify-center min-h-screen">
      <Spinner />
    </div>
  );
}

