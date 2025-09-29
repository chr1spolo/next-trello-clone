import { ROLES } from "@/utils/constants";
import { User } from "./index";

export interface Member {
  userId: string;
  user: User;
  role?: keyof typeof ROLES;
}
