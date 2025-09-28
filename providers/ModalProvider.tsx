"use client";

import CreateTeamModal from "@/components/modals/CreateTeamModal";
import { twMerge } from "@/utils/twMerge";
import { useModalStore } from "@/store/modalStore";
import { useEffect, useRef } from "react";

export default function ModalProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const { isOpen, closeModal } = useModalStore();
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (ref.current && !ref.current.contains(event.target as Node)) {
        // Aquí puedes implementar la lógica para cerrar el modal si es necesario
        closeModal();
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [ref]);

  return (
    <>
      {children}
      <div
        className={twMerge(
          "absolute inset-0 bg-black/40",
          "flex items-center justify-center p-4 z-50",
          "transition-all duration-300 ease-in-out",
          isOpen ? "opacity-100 z-10" : "-z-10 pointer-events-none opacity-0"
        )}
      >
        <div className="bg-white rounded-lg w-full max-w-xl p-6" ref={ref}>
          <CreateTeamModal />
        </div>
      </div>
    </>
  );
}
