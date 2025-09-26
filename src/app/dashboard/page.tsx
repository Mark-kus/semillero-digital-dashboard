"use client";

import {useEffect} from "react";
import {useSearchParams, useRouter} from "next/navigation";

import {Dashboard} from "@/domains/dashboard";

export default function DashboardPage() {
  const searchParams = useSearchParams();
  const router = useRouter();

  // Limpiar parámetros de autenticación de la URL
  useEffect(() => {
    const authSuccess = searchParams.get("auth");

    if (authSuccess === "success") {
      router.replace("/dashboard");
    }
  }, [searchParams, router]);

  // ClassroomAuth se encarga de toda la lógica de autenticación
  return <Dashboard />;
}
