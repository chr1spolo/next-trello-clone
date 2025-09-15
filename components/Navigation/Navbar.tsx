"use client";

import { useSession, signOut } from "next-auth/react";
import Image from "next/image";
import Link from "next/link";

export default function Navbar() {
  const { data: session } = useSession();

  return (
    <nav className="bg-gray-800 text-white p-4 flex justify-between items-center">
      <Link href="/dashboard" className="text-2xl font-bold">
        Trello Clone
      </Link>
      {session && session.user ? (
        <div className="flex items-center space-x-4">
          <div className="flex items-center space-x-2">
            {session.user.image && (
              <Image
                src={session.user.image}
                alt="Foto de perfil"
                width={32}
                height={32}
                className="rounded-full"
              />
            )}
            <span>{session.user.name}</span>
          </div>
          <button
            onClick={() => signOut()}
            className="px-3 py-1 bg-red-600 rounded-md hover:bg-red-700"
          >
            Cerrar Sesión
          </button>
        </div>
      ) : (
        <Link
          href="/"
          className="px-3 py-1 bg-blue-600 rounded-md hover:bg-blue-700"
        >
          Iniciar Sesión
        </Link>
      )}
    </nav>
  );
}
