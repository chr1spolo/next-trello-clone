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
import { twMerge } from "@/utils/twMerge";
import TaskModal from "@/components/modals/TaskModal";
import { Task } from "@/types/Task";
import { Comment } from "@/types/Comment";

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
  const { id: projectId } = use(params);
  const { data: session, status } = useSession();
  const router = useRouter();
  const [project, setProject] = useState<Project | null>(null);
  const [newTaskTitle, setNewTaskTitle] = useState("");
  const [selectedTask, setSelectedTask] = useState<Task | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/");
    }
  }, [status, router]);

  useEffect(() => {
    if (status === "authenticated" && projectId) {
      const fetchProject = async () => {
        try {
          const res = await fetch(`/api/projects/${projectId}`);
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
  }, [status, projectId]);

  const handleCreateTask = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTaskTitle.trim() || !project) return;

    try {
      const res = await fetch("/api/tasks", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ title: newTaskTitle, projectId }),
      });

      if (res.ok) {
        const newTask = await res.json();
        const updatedProject = {
          ...project,
          tasks: [...project.tasks, newTask],
        };
        setProject(updatedProject);
        setNewTaskTitle("");
      }
    } catch (error) {
      console.error("Error creating task:", error);
    }
  };

  const onDragEnd = async (result: DropResult) => {
    const { destination, source, draggableId } = result;

    if (
      !destination ||
      !project ||
      destination.droppableId === source.droppableId
    ) {
      return;
    }

    const newStatus = destination.droppableId;
    const taskId = draggableId;

    // Optimistic update: actualizamos la UI inmediatamente para una mejor UX
    const updatedTasks = project.tasks.map((task) =>
      task.id === taskId ? { ...task, status: newStatus } : task
    );
    setProject({ ...project, tasks: updatedTasks });

    // Llamamos a la API para persistir el cambio en la base de datos
    try {
      const res = await fetch(`/api/tasks/${taskId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: newStatus }),
      });

      if (!res.ok) {
        // Si la actualización falla, revertimos el cambio en la UI
        setProject(project);
        console.error("Failed to update task status in DB.");
      }
    } catch (error) {
      console.error("Error updating task status:", error);
      setProject(project); // Revertir el cambio
    }
  };

  const handleTaskClick = (task: Task) => {
    setSelectedTask(task);
  };

  const handleUpdateTask = (updatedTask: Task) => {
    if (!project) return;
    setProject({
      ...project,
      tasks: project.tasks.map((t) =>
        t.id === updatedTask.id ? updatedTask : t
      ),
    });
  };

  const handleAddComment = (newComment: Comment) => {
    if (!project || !selectedTask) return;
    const updatedTask = {
      ...selectedTask,
      comments: [...(selectedTask.comments || []), newComment],
    };
    setSelectedTask(updatedTask); // Actualiza el modal
    handleUpdateTask(updatedTask); // Actualiza el estado global de la página
  };

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

  return (
    <div className="w-full bg-gray-900">
      <div className="container mx-auto p-8  text-white min-h-[calc(100vh-64px)]">
        <h1 className="text-4xl font-bold mb-8">{project.title}</h1>
        {/* Formulario para crear nuevas tareas */}
        <div className="mb-8">
          <form onSubmit={handleCreateTask} className="flex gap-4">
            <input
              type="text"
              value={newTaskTitle}
              onChange={(e) => setNewTaskTitle(e.target.value)}
              placeholder="Título de la nueva tarea"
              className="flex-grow px-4 py-2 border border-gray-600 rounded-md bg-gray-800 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors"
            />
            <button
              type="submit"
              className="px-6 py-2 bg-green-600 text-white font-bold rounded-md hover:bg-green-700 transition-colors"
            >
              Añadir Tarea
            </button>
          </form>
        </div>
        <DragDropContext onDragEnd={onDragEnd}>
          <div className="flex space-x-4 overflow-x-auto">
            {Object.entries(columns).map(([columnId, tasks]) => (
              <div key={columnId} className="min-w-[300px] flex-shrink-0">
                <h2 className="text-xl font-semibold mb-4 text-center text-gray-200">
                  {columnId.replace("_", " ")}
                </h2>

                <Droppable droppableId={columnId}>
                  {(provided) => (
                    <div
                      ref={provided.innerRef}
                      {...provided.droppableProps}
                      className="bg-gray-800 p-4 rounded-lg space-y-4 min-h-[500px]"
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
                              className="transition-transform transform hover:scale-105"
                            >
                              <TaskCard task={task} onClick={handleTaskClick} />
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

          <TaskModal
            task={selectedTask}
            onClose={() => setSelectedTask(null)}
            onUpdate={handleUpdateTask}
            onAddComment={handleAddComment}
          />
      </div>
    </div>
  );
}
