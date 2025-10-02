import { twMerge } from "@/utils/twMerge";
import { cva } from "class-variance-authority";
import { IconType } from "react-icons";

export interface SelectProps
  extends React.InputHTMLAttributes<HTMLSelectElement> {
  variant?: "primary" | "secondary" | "danger" | "error";
  icon?: IconType;
  classIcon?: string;
  sizeIcon?: "sm" | "md" | "lg" | number;
  inputSize?: "sm" | "md" | "lg";
  value?: string;
}

const defaultClass =
  "p-2 px-4 rounded-md text-sm font-semibold transition-all flex items-center cursor-pointer group duration-300 ease-in-out font-main w-full bg-white text-black focus-visible:outline-none";

const defaultClassIconDiv =
  "flex flex-row items-center border border-gray-300 rounded-md shadow-sm p-1 hover:border-gray-400 focus-within:border-blue-500 focus-within:ring-1 focus-within:ring-blue-500 transition-all duration-300 ease-in-out bg-white justify-center px-2 w-full";

const select = cva(defaultClass, {
  variants: {
    variant: {
      primary:
        "border border-gray-300 rounded-md shadow-sm p-2 hover:border-blue-500 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-all duration-300 ease-in-out focus-within:border-blue-500 focus-within:ring-1 focus-within:ring-blue-500 active:border-blue-700 active:ring-blue-700",
      secondary:
        "border border-gray-300 rounded-md shadow-sm p-2 hover:border-neutral-500 focus:border-neutral-500 focus:ring-1 focus:ring-neutral-500 transition-all duration-300 ease-in-out focus-within:border-neutral-500 focus-within:ring-1 focus-within:ring-neutral-500 active:border-blue-700 active:ring-neutral-700",
      danger:
        "border border-gray-300 rounded-md shadow-sm p-2 hover:border-yellow-600 focus:border-yellow-600 focus:ring-1 focus:ring-yellow-600 transition-all duration-300 ease-in-out focus-within:border-yellow-600 focus-within:ring-1 focus-within:ring-yellow-600 active:border-blue-700 active:ring-yellow-700",
      error:
        "border border-gray-300 rounded-md shadow-sm p-2 hover:border-red-500 focus:border-red-500 focus:ring-1 focus:ring-red-500 transition-all duration-300 ease-in-out focus-within:border-red-500 focus-within:ring-1 focus-within:ring-red-500 active:border-blue-700 active:ring-red-700",
    },
    inputSize: {
      sm: "text-xs",
      md: "text-md",
      lg: "text-lg",
    },
    hasIcon: {
      yes: "!border-none !focus:ring-0 !focus:border-none !outline-none !shadow-none pl-0 !mt-0 !ring-0",
      no: "",
    },
  },
  defaultVariants: {
    variant: "primary",
    inputSize: "md",
    hasIcon: "no",
  },
});

const iconSizes = (size: "sm" | "md" | "lg" | number) =>
  ({
    [size]: { width: size, height: size },
    sm: {
      width: "1.2rem",
      height: "1.2rem",
    },
    md: {
      width: "1.8rem",
      height: "1.8rem",
    },
    lg: {
      width: "2.5rem",
      height: "2.5rem",
    },
  }[size]);

export default function Select({
  variant = "primary",
  inputSize = "md",
  icon: Icon,
  sizeIcon = "md",
  classIcon = "",
  className = "",
  value,
  ...props
}: SelectProps) {

    console.log(value);
  return (
    <>
      {Icon ? (
        <div className={twMerge(defaultClassIconDiv, className)}>
          <div
            className={twMerge(
              "mr-2",
              classIcon,
              value && value.length > 0 ? "text-black" : "text-gray-400"
            )}
          >
            <Icon style={iconSizes(sizeIcon)} />
          </div>
          <select
            className={twMerge(
              select({
                variant,
                inputSize,
                hasIcon: "yes",
              }),
              className,
              value && value.length > 0 ? "!text-black" : "!text-gray-400"
            )}
            value={value}
            {...props}
          >
            {props.children}
          </select>
        </div>
      ) : (
        <select
          className={twMerge(
            select({
              variant,
              inputSize,
              hasIcon: "no",
            }),
            className,
            value && value.length > 0 ? "!text-black" : "!text-gray-400"
          )}
          {...props}
        >
          {props.children}
        </select>
      )}
    </>
  );
}
