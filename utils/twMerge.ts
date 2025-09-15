import { twMerge as tw } from "tailwind-merge";

export function twMerge(...classes: (string | false | null | undefined)[]) {
  return tw(classes.filter(Boolean).join(" "));
}
