"use client";

import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useEffect } from "react";

export default function Home() {
  const { status } = useSession();
  const router = useRouter();

  useEffect(() => {
    if (status === "authenticated") {
      router.push("/dashboard");
    }
  }, [status, router]);

  if (status === "loading" || status === "authenticated") {
    return (
      <main className="flex min-h-screen flex-col items-center justify-center bg-white text-black rounded-2xl animated__faster animate__animated animate__fade">
        <p>Cargando...</p>
      </main>
    );
  }

  return (
    <main className="flex flex-col items-center justify-center p-4 bg-transparent text-black rounded-2xl animate__faster animate__animated animate__fadeInUp">
      <h1 className="text-4xl font-bold">
        Bienvenido a <span className="font-allan font-normal">TaskKy</span>{" "}
        <br />
      </h1>
      <h3 className="mt-4 text-center text-lg font-light">
        Tu gestor de tareas simple y eficiente <br />
        <span className="text-sm font-normal">
          Inicia sesión para continuar
        </span>
      </h3>
    </main>
  );
}
