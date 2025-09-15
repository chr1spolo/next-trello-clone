// app/page.tsx
"use client";

import { signIn, signOut, useSession } from "next-auth/react";

export default function Home() {
  const { data: session } = useSession();

  return (
    <main className="flex min-h-screen flex-col items-center justify-center p-24">
      {session ? (
        <>
          <p className="text-xl mb-4">¡Hola, {session.user?.name}!</p>
          <button
            onClick={() => signOut()}
            className="px-4 py-2 bg-red-500 text-white rounded hover:bg-red-600 hover:cursor-pointer"
          >
            Cerrar Sesión
          </button>
        </>
      ) : (
        <>
          <p className="text-xl mb-4">No has iniciado sesión</p>
          <button
            onClick={() => signIn("google")}
            className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 hover:cursor-pointer"
          >
            Iniciar Sesión con Google
          </button>
        </>
      )}
    </main>
  );
}
