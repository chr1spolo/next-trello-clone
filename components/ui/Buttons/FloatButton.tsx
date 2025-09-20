import { twMerge } from "@/utils/twMerge";
import { cva } from "class-variance-authority";
import React, { useState } from "react";
import { BiPlus } from "react-icons/bi";

interface FloatButtonProps {
  size?: "small" | "medium" | "large";
  color?: "primary" | "secondary";
}

const variants = cva(
  "fixed bottom-8 right-8 text-white p-4 rounded-full shadow-lg transition group",
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
        open: "bg-red-500 hover:bg-red-700",
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

const FloatButton = ({ size, color }: FloatButtonProps) => {
  const [isOpen, setIsOpen] = useState(false);
  return (
    <button
      className={variants({ size, color, action: isOpen ? "open" : "closed" })}
      onClick={() => setIsOpen(!isOpen)}
    >
      <BiPlus
        size={24}
        className={twMerge(
          "transition-transform group-hover:rotate-180 duration-300 ease-in-out",
          isOpen ? "rotate-45" : "rotate-0"
        )}
      />
    </button>
  );
};

export default FloatButton;
