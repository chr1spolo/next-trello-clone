import { Comment } from "@/types/Comment";
import { Task as DBTask } from "@prisma/client";

export interface Task extends DBTask {
  comments?: Comment[];
}
