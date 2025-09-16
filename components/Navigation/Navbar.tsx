"use client";

import { useSession, signOut } from "next-auth/react";
import Image from "next/image";
import Link from "next/link";
import { pusherClient } from "@/lib/pusher-client";
import { useEffect, useState } from "react";
import { twMerge } from "@/utils/twMerge";
import { usePathname, useRouter } from "next/navigation";



interface Invitation {
  token: string;
  id: string;
  inviter: { id: string, name?: string };
  team: {
    name: string;
  };
}

export default function Navbar() {
  const { data: session } = useSession();

  const [invitations, setInvitations] = useState<Invitation[]>([]);
  const [isInvitationsOpen, setIsInvitationsOpen] = useState(false);

  const router = useRouter();
  const pathName = usePathname();

  // Obtener invitaciones iniciales
  useEffect(() => {
    if (session?.user?.email) {
      const fetchInvitations = async () => {
        const res = await fetch("/api/invitations");
        if (res.ok) {
          const data = await res.json();
          setInvitations(data);
        }
      };
      fetchInvitations();
    }
  }, [session]);

  useEffect(() => {
    if (session?.user?.email) {
      const channel = pusherClient.subscribe(`user-${session.user.email}`);
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      channel.bind("new-invitation", (data: any) => {
        console.log("Nueva invitación recibida:", data);
        setInvitations((prev) => [
          ...prev,
          {
            id: data.id,
            token: data.token,
            inviter: { id: data.inviterId, name: data.inviterName },
            team: { name: data.teamName },
          },
        ]);
      });

      return () => {
        pusherClient.unsubscribe(`user-${session.user.email}`);
      };
    }
  }, [session]);


   const handleAcceptInvitation = async (invitationId: string) => {
     try {
       const invitationToAccept = invitations.find(
         (inv) => inv.id === invitationId
       );
       if (!invitationToAccept) return;

       const res = await fetch(`/api/invitations/${invitationToAccept.token}`, {
         method: "POST",
         headers: { "Content-Type": "application/json" },
       });

       if (res.ok) {
         setInvitations(invitations.filter((inv) => inv.id !== invitationId));
         alert("¡Invitación aceptada! Actualizando su dashboard.");
         if (pathName === "/dashboard") router.push("/dashboard");

         window.location.reload();
         setIsInvitationsOpen(false);
       } else {
         alert("No se pudo aceptar la invitación.");
       }
     } catch (error) {
       console.error("Error al aceptar la invitación:", error);
       alert("Ocurrió un error. Inténtalo de nuevo.");
     }
   };


  return (
    <nav className="bg-gray-900 text-white p-4 flex justify-between items-center shadow-lg">
      <Link
        href="/dashboard"
        className="text-2xl font-bold hover:text-gray-300 transition-colors"
      >
        Trello Clone
      </Link>
      {session && session.user ? (
        <div className="flex items-center space-x-4">
          {invitations.length > 0 && (
            <div className="relative">
              <span
                className="text-yellow-400 cursor-pointer"
                onClick={() => setIsInvitationsOpen(!isInvitationsOpen)}
              >
                📩 ({invitations.length})
              </span>
              <div
                className={twMerge(
                  "absolute right-0 mt-2 w-80 bg-gray-800 rounded-md shadow-lg py-2 z-20 transition-all duration-500 ease-in-out",
                  isInvitationsOpen ? "opacity-100" : "opacity-0 pointer-events-none -z-10"
                )}
              >
                <p className="px-4 py-2 text-sm text-gray-400">
                  Invitaciones pendientes:
                </p>
                {invitations.map((inv) => (
                  <div
                    key={inv.id}
                    className="px-4 py-2 hover:bg-gray-700 transition-colors cursor-pointer"
                    onClick={() => handleAcceptInvitation(inv.id)}
                  >
                    <p className="text-white">
                      Has sido invitado a{" "}
                      <span className="font-semibold underline">{inv.team.name}</span>
                      {" "}by <span className="font-semibold underline">{inv.inviter.name}</span>
                    </p>
                  </div>
                ))}
              </div>
            </div>
          )}
          <div className="flex items-center space-x-2">
            {session.user.image && (
              <Image
                src={session.user.image}
                alt="Foto de perfil"
                width={32}
                height={32}
                className="rounded-full ring-2 ring-white"
              />
            )}
            <span>{session.user.name}</span>
          </div>
          <button
            onClick={() => signOut()}
            className="px-3 py-1 bg-red-600 rounded-md hover:bg-red-700 transition-colors"
          >
            Cerrar Sesión
          </button>
        </div>
      ) : (
        <Link
          href="/"
          className="px-3 py-1 bg-blue-600 rounded-md hover:bg-blue-700 transition-colors"
        >
          Iniciar Sesión
        </Link>
      )}
    </nav>
  );
}
