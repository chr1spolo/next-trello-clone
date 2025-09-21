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
import { GoDotFill } from "react-icons/go";

import TaskModal from "@/components/modals/TaskModal";
import { Task, Comment, Project } from "@/types/index";
import { socket } from "@/socket";
import { twMerge } from "@/utils/twMerge";

export default function ProjectBoard({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id: projectId } = use(params);
  const { data: session, status } = useSession();
  const router = useRouter();
  const [project, setProject] = useState<Project | null>(null);
  const [tasks, setTasks] = useState<Task[]>([]);
  const [newTaskTitle, setNewTaskTitle] = useState("");
  const [selectedTask, setSelectedTask] = useState<Task | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const [isConnected, setIsConnected] = useState<boolean>(false);
  const [transport, setTransport] = useState<string>("N/A");

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
            setTasks(data.tasks || []);
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

  useEffect(() => {
    if (socket.connected) {
      onConnect();
    }

    function onConnect() {
      setIsConnected(true);
      setTransport(socket.io.engine.transport.name);

      socket.io.engine.on("upgrade", (transport) => {
        setTransport(transport.name);
      });

      socket.on("update-task", (updatedTaskString: string) => {
        console.log("Received updated task via WebSocket2:", updatedTaskString);
        if (!project) {
          console.warn("Project is not loaded yet. Cannot update task.");
          return;
        }
        try {
          if (!updatedTaskString) throw new Error("Invalid task data");
          let updatedTask: Task;
          if (typeof updatedTaskString === "string") {
            updatedTask = JSON.parse(updatedTaskString);
          } else {
            updatedTask = updatedTaskString;
          }
          setTasks((prevTasks) =>
            prevTasks.map((t) => (t.id === updatedTask.id ? updatedTask : t))
          );

          if (selectedTask && selectedTask.id === updatedTask.id) {
            setSelectedTask(updatedTask);
          }
        } catch (error) {
          console.error("Error updating task:", error);
        }
      });
    }

    function onDisconnect() {
      setIsConnected(false);
      setTransport("N/A");
    }

    if (!socket.hasListeners("connect")) {
      socket.on("connect", onConnect);
      socket.on("disconnect", onDisconnect);
    }

    return () => {
      socket.off("connect", onConnect);
      socket.off("disconnect", onDisconnect);
    };
  }, [project]);

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
          tasks: [...tasks, newTask],
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
    const updatedTasks = tasks.map((task) =>
      task.id === taskId ? { ...task, status: newStatus } : task
    );
    setTasks(updatedTasks);

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
      } else {
        const updatedTask = await res.json();
        console.log("Task status updated:", updatedTask);
        // Emitimos el cambio a través de WebSocket para notificar a otros clientes
        socket.emit("update-task", JSON.stringify(updatedTask));
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
    setTasks((prevTasks) =>
      prevTasks.map((t) => (t.id === updatedTask.id ? updatedTask : t))
    );
    // Emitimos el cambio a través de WebSocket para notificar a otros clientes
    socket.emit("update-task", JSON.stringify(updatedTask));
  };

  const handleAddComment = (newComment: Comment) => {
    if (!project || !selectedTask) return;
    const updatedTask = {
      ...selectedTask,
      comments: [...(selectedTask.comments || []), newComment],
    };
    setSelectedTask(updatedTask);
    handleUpdateTask(updatedTask);
  };

  if (isLoading || status === "loading") {
    return (
      <div className="flex items-center justify-center w-full bg-white rounded-2xl text-black p-8">
        Cargando tablero...
      </div>
    );
  }

  if (!project) {
    return (
      <div className="flex items-center justify-center w-full bg-white rounded-2xl text-black p-8">
        Proyecto no encontrado o no tienes permiso.
      </div>
    );
  }

  const columns = {
    TO_DO: tasks.filter((t) => t.status === "TO_DO"),
    IN_PROGRESS: tasks.filter((t) => t.status === "IN_PROGRESS"),
    DONE: tasks.filter((t) => t.status === "DONE"),
  };

  return (
    <div className="w-full bg-white rounded-2xl">
      <div className="container mx-auto p-8  text-white min-h-[calc(100vh-64px)] flex gap-4 flex-col">
        <h2 className="text-2xl font-bold text-black">{project.title}</h2>
        {/* <div className="mb-8">
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
        </div> */}
        <DragDropContext onDragEnd={onDragEnd}>
          <div className="flex space-x-4 overflow-x-auto">
            {Object.entries(columns).map(([columnId, tasks]) => (
              <div key={columnId} className="min-w-[300px] flex-shrink-0">
                <h2
                  className={twMerge(
                    "text-md font-semibold mb-4 text-center lowercase p-2 rounded-md",
                    columnId === "TO_DO"
                      ? "text-blue-400"
                      : columnId === "IN_PROGRESS"
                      ? "text-yellow-400"
                      : "text-green-400",
                    columnId === "TO_DO"
                      ? "bg-blue-100"
                      : columnId === "IN_PROGRESS"
                      ? "bg-yellow-100"
                      : "bg-green-100"
                  )}
                >
                  <GoDotFill
                    className={twMerge(
                      "inline-block mr-1",
                      columnId === "TO_DO"
                        ? "text-blue-400"
                        : columnId === "IN_PROGRESS"
                        ? "text-yellow-400"
                        : "text-green-400"
                    )}
                  />
                  {columnId.replace("_", " ")}
                </h2>

                <Droppable droppableId={columnId}>
                  {(provided) => (
                    <div
                      ref={provided.innerRef}
                      {...provided.droppableProps}
                      className="bg-white p-2 rounded-lg space-y-2 min-h-[500px] border-2 border-gray-200"
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
                              className="transition-transform transform hover:scale-[1.009]"
                            >
                              <TaskCard
                                task={task}
                                onClick={handleTaskClick}
                                members={project.team.members}
                              />
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
          members={project.team.members}
          onClose={() => setSelectedTask(null)}
          onUpdate={handleUpdateTask}
          onAddComment={handleAddComment}
        />
      </div>
    </div>
  );
}
