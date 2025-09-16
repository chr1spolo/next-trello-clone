"use client";

import { twMerge } from "@/utils/twMerge";
import { useState } from "react";

interface InviteMemberModalProps {
  teamId: string | undefined;
  teamName: string | undefined;
  onClose: () => void;
}

export default function InviteMemberModal({
  teamId,
  teamName,
  onClose,
}: InviteMemberModalProps) {
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");
  const [isSending, setIsSending] = useState(false);

  const handleSendInvite = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim()) return;

    setIsSending(true);
    setMessage("");

    try {
      const res = await fetch("/api/invitations", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, teamId }),
      });

      const data = await res.json();
      if (res.ok) {
        setMessage(`Invitación enviada a ${email} con éxito.`);
        setEmail("");
        setTimeout(() => {
          onClose();
        }, 2000);
      } else {
        setMessage(`Error: ${data.error}`);
      }
    } catch (error) {
      setMessage("Error al enviar la invitación. Inténtalo de nuevo.");
    } finally {
      setIsSending(false);
    }
  };

  return (
    <div
      className={twMerge(
        "fixed inset-0 bg-black/50",
        "flex items-center justify-center p-4 z-50",
        "transition-all duration-300 ease-in-out",
        teamId && teamName ? "opacity-100" : "opacity-0 pointer-events-none -z-10"
      )}
    >
      <div className="bg-gray-800 p-8 rounded-lg shadow-lg w-full max-w-md relative">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-gray-400 hover:text-white"
        >
          &times;
        </button>
        <h2 className="text-2xl font-bold mb-4 text-white">
          Invitar a {teamName}
        </h2>
        <form onSubmit={handleSendInvite}>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="Correo electrónico del miembro"
            className="w-full px-4 py-2 border border-gray-600 rounded-md mb-4 bg-gray-700 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors"
            required
          />
          <button
            type="submit"
            className="w-full px-4 py-2 bg-blue-600 text-white font-bold rounded-md hover:bg-blue-700 transition-colors"
            disabled={isSending}
          >
            {isSending ? "Enviando..." : "Enviar Invitación"}
          </button>
        </form>
        {message && (
          <p
            className={`mt-4 text-center ${
              message.startsWith("Error") ? "text-red-400" : "text-green-400"
            }`}
          >
            {message}
          </p>
        )}
      </div>
    </div>
  );
}
