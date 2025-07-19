"use client"
import { useRouter } from "next/navigation";
import { useDispatch } from "react-redux";
import { Spinner } from "@/components/ui/spinner";
import { useEffect } from "react";
import { setAuthUser } from "@/store/reducers/auth.reducer";

export default function HomePage() {
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
  
  return (
    <div className="flex items-center justify-center min-h-screen">
      <Spinner />
    </div>
  );
}

