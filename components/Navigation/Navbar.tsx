"use client";

import { useSession, signOut } from "next-auth/react";
import Image from "next/image";
import { pusherClient } from "@/lib/pusher-client";
import { useEffect, useRef, useState } from "react";
import { twMerge } from "@/utils/twMerge";
import { usePathname, useRouter } from "next/navigation";
import SignInModal from "@/components/modals/SignInModal";
import Button from "@/components/ui/Buttons/Default";
import { IoIosNotificationsOutline, IoMdNotifications } from "react-icons/io";

interface Invitation {
  token: string;
  id: string;
  inviter: { id: string; name?: string };
  team: {
    name: string;
  };
}

export default function Navbar() {
  const { data: session } = useSession();

  const [invitations, setInvitations] = useState<Invitation[]>([]);
  const [isInvitationsOpen, setIsInvitationsOpen] = useState(false);
  const [isSignInModalOpen, setIsSignInModalOpen] = useState(false);

  const router = useRouter();
  const pathName = usePathname();
  const modalRef = useRef<HTMLDivElement>(null);

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

      channel.bind(
        "new-invitation",
        (data: {
          id: string;
          token: string;
          inviterId: string;
          inviterName: string;
          teamName: string;
        }) => {
          setInvitations((prev) => [
            ...prev,
            {
              id: data.id,
              token: data.token,
              inviter: { id: data.inviterId, name: data.inviterName },
              team: { name: data.teamName },
            },
          ]);
        }
      );

      return () => {
        pusherClient.unsubscribe(`user-${session.user.email}`);
      };
    }
  }, [session]);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        modalRef.current &&
        !modalRef.current.contains(event.target as Node)
      ) {
        setIsInvitationsOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [modalRef]);

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

  const IconNotification =
    invitations.length > 0 ? IoMdNotifications : IoIosNotificationsOutline;

  return (
    <>
      <nav className="bg-white text-black p-4 px-6 flex items-center rounded-2xl justify-between shadow-md">
        <h2 className="text-lg font-semibold">Dashboard</h2>
        {session && session.user ? (
          <div className="flex items-center space-x-4">
            <div className="relative">
              <div
                className="relative rounded-full p-2 flex items-center cursor-pointer group hover:bg-gray-300 transition-colors duration-300 ease-in-out"
                onClick={() => setIsInvitationsOpen(!isInvitationsOpen)}
              >
                <IconNotification className="inline-block transition-all group-hover:text-white group-hover:scale-110 ease-in-out" />
                <span
                  className={twMerge(
                    "absolute -top-1 -right-1 text-black rounded-full px-1 text-[8px] font-semibold duration-300 ease-in-out",
                    invitations.length > 0
                      ? "bg-red-600 group-hover:bg-red-500 text-white"
                      : "hidden"
                  )}
                >
                  {invitations.length}
                </span>
              </div>
              <div
                className={twMerge(
                  "absolute right-0 mt-2 w-80 bg-white rounded-md shadow-[5px_5px_25px_rgba(0,0,0,0.25)] py-2 z-20 transition-all duration-700 ease-in-out shadow-black/30",
                  isInvitationsOpen
                    ? "opacity-100 top-10"
                    : "opacity-0 -z-50 -top-2"
                )}
                ref={modalRef}
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
                      <span className="font-semibold underline">
                        {inv.team.name}
                      </span>{" "}
                      por{" "}
                      <span className="font-semibold underline">
                        {inv.inviter.name}
                      </span>
                    </p>
                  </div>
                ))}
              </div>
            </div>
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
            <Button onClick={() => signOut()} variant="danger">
              Cerrar Sesión
            </Button>
          </div>
        ) : (
          <Button onClick={() => setIsSignInModalOpen(true)} variant="primary">
            Iniciar Sesión
          </Button>
        )}
      </nav>
      <SignInModal
        show={isSignInModalOpen}
        onClose={() => setIsSignInModalOpen(false)}
      />
    </>
  );
}
