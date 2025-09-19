import { Member } from "./Member";
import { Task } from "./Task";

export interface Project {
  id: string;
  title: string;
  tasks: Task[];
  team: {
    members: Member[];
  };
}
