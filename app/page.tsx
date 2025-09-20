"use client";

import Button from "@/components/ui/Buttons/Default";
import { useSession, signIn } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import { BiLogInCircle } from "react-icons/bi";

export default function Home() {
  const { data: session, status } = useSession();
  const router = useRouter();

  useEffect(() => {
    if (status === "authenticated") {
      router.push("/dashboard");
    }
  }, [status, router]);

  if (status === "loading" || status === "authenticated") {
    return (
      <main className="flex min-h-screen flex-col items-center justify-center bg-gray-900 text-white">
        <p>Cargando...</p>
      </main>
    );
  }

 return (
   <main className="flex flex-col items-center justify-center p-4 bg-white text-black rounded-2xl">
     <h1 className="text-4xl font-bold">
       Bienvenido a <span className="font-allan font-normal">TaskKy</span>
     </h1>
   </main>
 );
}
