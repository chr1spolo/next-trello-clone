import { twMerge } from "@/utils/twMerge";
import React, { Dispatch, SetStateAction, useEffect, useRef } from "react";
import { PiArrowCircleLeftLight } from "react-icons/pi";

type Action = {
  id: string;
  label: string;
  icon: React.ReactNode;
  onClick: () => void;
};

interface ActionHomeProps {
  isActionsOpen: boolean;
  setIsActionOpen: Dispatch<SetStateAction<boolean>>;
  actions: Action[];
}

const ActionHome = ({
  isActionsOpen,
  setIsActionOpen = () => {},
  actions,
}: ActionHomeProps) => {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [isActionsOpen]);

  const triggerAction = (action: Action) => {
    action.onClick();
    setIsActionOpen(false);
  };

  const handleClickOutside = (event: MouseEvent) => {
    if (ref.current && !ref.current.contains(event.target as Node)) {
      setIsActionOpen(false);
    }
  };

  return (
    <div
      className={twMerge(
        "absolute bottom-0 right-8 flex flex-col shadow-lg w-44 rounded-lg overflow-hidden bg-white",
        isActionsOpen
          ? "opacity-100 bottom-32 w-48 z-10"
          : "opacity-0 pointer-events-none -z-50",
        "transition-all duration-500 ease-in-out"
      )}
      ref={ref}
    >
      <div className="bg-blue-400 px-4 rounded-t-lg py-2">
        <h3 className="text-white text-md font-semibold m-0">
          Acciones Rápidas
        </h3>
      </div>
      {actions.map((action) => (
        <button
          key={action.id}
          onClick={() => triggerAction(action)}
          className="text-gray-700 px-4 py-3 border-b border-gray-300 text-sm text-center flex items-center gap-2 hover:bg-gray-100 rounded transition-all cursor-pointer active:-translate-x-1 duration-150 ease-in-out"
        >
          <PiArrowCircleLeftLight className="inline-block" />
          {action.label}
        </button>
      ))}
    </div>
  );
};

export default ActionHome;
