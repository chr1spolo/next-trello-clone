"use client";

import { useState, useEffect, use } from "react";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import TaskCard from "@/components/cards/TaskCard";
import {
  DragDropContext,
  Droppable,
  Draggable,
  DropResult,
} from "@hello-pangea/dnd";

interface Task {
  id: string;
  title: string;
  status: string;
  description?: string;
}

interface Project {
  id: string;
  title: string;
  tasks: Task[];
}

export default function ProjectBoard({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);
  const { data: session, status } = useSession();
  const router = useRouter();
  const [project, setProject] = useState<Project | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/");
    }
  }, [status, router]);

  useEffect(() => {
    if (status === "authenticated" && id) {
      const fetchProject = async () => {
        try {
          const res = await fetch(`/api/projects/${id}`);
          if (res.ok) {
            const data = await res.json();
            setProject(data);
          }
        } catch (error) {
          console.error("Error fetching project:", error);
        } finally {
          setIsLoading(false);
        }
      };
      fetchProject();
    }
  }, [status, id]);

  if (isLoading || status === "loading") {
    return (
      <div className="flex items-center justify-center h-screen">
        Cargando tablero...
      </div>
    );
  }

  if (!project) {
    return (
      <div className="flex items-center justify-center h-screen">
        Proyecto no encontrado o no tienes permiso.
      </div>
    );
  }

  const columns = {
    TO_DO: project.tasks.filter((t) => t.status === "TO_DO"),
    IN_PROGRESS: project.tasks.filter((t) => t.status === "IN_PROGRESS"),
    DONE: project.tasks.filter((t) => t.status === "DONE"),
  };

  const onDragEnd = (result: DropResult<string>) => {
    const { destination, source, draggableId } = result;

    if (!destination) {
      return;
    }

    if (
      destination.droppableId === source.droppableId &&
      destination.index === source.index
    ) {
      return;
    }
  };

  return (
    <div className="container mx-auto p-8">
      <h1 className="text-4xl font-bold mb-8">{project.title}</h1>
      <DragDropContext onDragEnd={onDragEnd}>
        <div className="flex space-x-4 overflow-x-auto">
          {Object.entries(columns).map(([columnId, tasks]) => (
            <div key={columnId} className="min-w-[300px] flex-shrink-0">
              <h2 className="text-xl font-semibold mb-4 text-center">
                {columnId.replace("_", " ")}
              </h2>
              <Droppable droppableId={columnId}>
                {(provided) => (
                  <div
                    ref={provided.innerRef}
                    {...provided.droppableProps}
                    className="bg-gray-200 p-4 rounded-lg space-y-4 min-h-[500px]"
                  >
                    {tasks.map((task, index) => (
                      <Draggable
                        key={task.id}
                        draggableId={task.id}
                        index={index}
                      >
                        {(provided) => (
                          <div
                            ref={provided.innerRef}
                            {...provided.draggableProps}
                            {...provided.dragHandleProps}
                          >
                            <TaskCard task={task} />
                          </div>
                        )}
                      </Draggable>
                    ))}
                    {provided.placeholder}
                  </div>
                )}
              </Droppable>
            </div>
          ))}
        </div>
      </DragDropContext>
    </div>
  );
}
