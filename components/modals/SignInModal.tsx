"use client";

import { twMerge } from "@/utils/twMerge";
import { signIn } from "next-auth/react";
import { useState } from "react";
import { FcGoogle } from "react-icons/fc";

interface SignInModalProps {
  show: boolean;
  onClose: () => void;
}

export default function SignInModal({ show, onClose }: SignInModalProps) {
  const [isLoading, setIsLoading] = useState(false);

  const loginTrigger = (provider: string) => () => {
    setIsLoading(true);
    signIn(provider).catch(() => {
      setIsLoading(false);
      onClose();
    });
  };
  return (
    <div
      className={twMerge(
        "fixed inset-0 bg-black/50",
        "flex items-center justify-center p-4 z-50",
        "transition-all duration-300 ease-in-out",
        show ? "opacity-100" : "opacity-0 pointer-events-none -z-10"
      )}
      onClick={() => show && onClose()}
    >
      <div
        className="bg-white p-8 rounded-lg shadow-lg w-full max-w-md relative"
        onClick={(e) => e.stopPropagation()}
      >
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-gray-400 hover:text-black transition-colors text-2xl font-bold"
        >
          &times;
        </button>
        <div className="container flex p-4 flex-col items-center">
          <h2 className="text-2xl font-semibold mb-4 text-black">
            Iniciar sesión
          </h2>
          <button
            onClick={loginTrigger("google")}
            className="flex items-center px-4 py-2 border border-gray-300 rounded-lg shadow-sm hover:shadow-md transition-shadow bg-white"
            disabled={isLoading}
          >
            <FcGoogle className="mr-2" size={24} />
            <span className="text-black">
              {isLoading ? "Cargando..." : "Iniciar sesión con Google"}
            </span>
          </button>
        </div>
      </div>
    </div>
  );
}
