import { cva } from "class-variance-authority";
import { IconType } from "react-icons";

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "primary" | "secondary" | "danger" | "error";
  icon?: IconType;
  classIcon?: string;
  sizeIcon?: "sm" | "md" | "lg" | number;
  size?: "sm" | "md" | "lg";
}

const defaultClass =
  "px-4 py-2 rounded-md text-sm font-semibold transition-colors flex items-center cursor-pointer group duration-300 ease-in-out font-main";

const button = cva(defaultClass, {
  variants: {
    variant: {
      primary: "bg-blue-500 text-white hover:bg-blue-600",
      secondary: "bg-neutral-950 text-white hover:bg-neutral-700",
      danger: "bg-yellow-600 text-white hover:bg-yellow-700",
      error: "bg-red-500 text-white hover:bg-red-600",
    },
    size: {
      sm: "text-sm",
      md: "text-base",
      lg: "text-lg",
    },
  },
  defaultVariants: {
    variant: "primary",
    size: "md",
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

export default function Button({
  variant = "primary",
  size = "md",
  className,
  icon: Icon,
  sizeIcon = "md",
  ...props
}: ButtonProps) {
  const iconPropsSize = iconSizes(sizeIcon);
  return (
    <button className={button({ variant, size, className })} {...props}>
      {Icon && (
        <Icon
          className={
            "inline-block mr-2 group-hover:scale-110 transition-transform duration-200 ease-in-out"
          }
          style={{
            width: iconPropsSize.width,
            height: iconPropsSize.height,
          }}
        />
      )}
      {props.children}
    </button>
  );
}
