import { Member } from "./Member";
import { Task } from "./Task";
import { Team as TeamClient, Project as ProjectClient } from "@prisma/client";

export interface Project extends ProjectClient {
  id: string;
  title: string;
  tasks: Task[];
  team: {
    members: Member[];
  };
}


export interface Team extends TeamClient {
  projects?: Project[];
  members?: Member[];
}