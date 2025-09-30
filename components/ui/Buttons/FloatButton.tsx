import { twMerge } from "@/utils/twMerge";
import { cva } from "class-variance-authority";
import React, { useEffect, useState } from "react";
import { BiPlus } from "react-icons/bi";

interface FloatButtonProps {
  size?: "small" | "medium" | "large";
  color?: "primary" | "secondary";
  open: boolean;
  onOpen?: () => void;
  onClose?: () => void;
}

const variants = cva(
  "fixed bottom-8 right-8 text-white p-4 rounded-full shadow-lg transition group cursor-pointer",
  {
    variants: {
      size: {
        small: "text-sm",
        medium: "text-base",
        large: "text-lg",
      },
      color: {
        primary: "bg-blue-400 hover:bg-blue-700",
        secondary: "bg-gray-400 hover:bg-gray-700",
      },
      action: {
        open: "bg-blue-600 hover:bg-blue-700",
        closed: "bg-blue-400 hover:bg-blue-700",
      },
    },
    defaultVariants: {
      size: "medium",
      color: "primary",
      action: "closed",
    },
  }
);

const FloatButton = ({
  size,
  open = false,
  color,
  onOpen = () => {},
  onClose = () => {},
}: FloatButtonProps) => {
  const [isOpen, setIsOpen] = useState(open);

  useEffect(() => {
    setIsOpen(open);
  }, [open]);

  const triggerAction = (open: boolean) => {
    if (open) {
      onOpen();
    } else {
      onClose();
    }
    setIsOpen(open);
  };
  return (
    <button
      className={variants({ size, color, action: isOpen ? "open" : "closed" })}
      onClick={() => triggerAction(!isOpen)}
    >
      <BiPlus
        size={24}
        className={twMerge(
          "transition-transform group-hover:rotate-90 duration-300 ease-in-out",
          isOpen ? "rotate-45 group-hover:rotate-45" : "rotate-0"
        )}
      />
    </button>
  );
};

export default FloatButton;
