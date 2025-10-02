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
import Breadcrumb from "@/components/Breadcrumb";
import Image from "next/image";
import { FaPlus, FaRegEye } from "react-icons/fa";
import { BsPersonCheck } from "react-icons/bs";
import { TbCalendarCode } from "react-icons/tb";
import { LiaTagsSolid } from "react-icons/lia";
import Button from "@/components/ui/Buttons/Default";
import { useModalStore } from "@/store/modalStore";

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

  const { openModal } = useModalStore();

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

    socket.on("create-task", (newTaskString: string) => {
      if (!project) {
        console.warn("Project is not loaded yet. Cannot add new task.");
        return;
      }
      try {
        if (!newTaskString) throw new Error("Invalid task data");
        let newTask: Task;
        if (typeof newTaskString === "string") {
          newTask = JSON.parse(newTaskString);
        } else {
          newTask = newTaskString;
        }
        setTasks((prevTasks) => [...prevTasks, newTask]);
      } catch (error) {
        console.error("Error adding new task:", error);
      }
    });

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

    try {
      const res = await fetch(`/api/tasks/${taskId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: newStatus }),
      });

      if (!res.ok) {
        setProject(project);
        console.error("Failed to update task status in DB.");
      } else {
        const updatedTask = await res.json();
        socket.emit("update-task", JSON.stringify(updatedTask));
      }
    } catch (error) {
      console.error("Error updating task status:", error);
      setProject(project);
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
    BACKLOG: {
      title: "Backlog",
      tasks: tasks.filter((t) => t.status === "BACKLOG"),
    },
    TO_DO: {
      title: "To Do",
      tasks: tasks.filter((t) => t.status === "TO_DO"),
    },
    IN_PROGRESS: {
      title: "In Progress",
      tasks: tasks.filter((t) => t.status === "IN_PROGRESS"),
    },
    DONE: {
      title: "Done",
      tasks: tasks.filter((t) => t.status === "DONE"),
    },
  };

  const toggleModalCreateTask = () => {
    openModal("new-task", { projectId: project.id });
  };

  return (
    <div className="w-full bg-white rounded-2xl">
      <div className="container mx-auto p-8  text-white min-h-[calc(100vh-64px)] flex gap-4 flex-col">
        <Breadcrumb>
          <span>Proyectos</span>
          <span>{project.title}</span>
        </Breadcrumb>
        <h2 className="text-2xl font-bold text-black">{project.title}</h2>
        <div className="flex items-center gap-6">
          <div className="flex justify-between flex-col gap-2">
            <div>
              <FaRegEye className="inline-block mr-1 text-gray-400 w-4 h-4" />
              <span className="font-medium text-gray-400 text-xs">
                Visibility
              </span>
            </div>
            <div>
              <BsPersonCheck className="inline-block mr-1 text-gray-400 w-4 h-4" />
              <span className="font-medium text-gray-400 text-xs">
                Assigned to
              </span>
            </div>
            <div>
              <TbCalendarCode className="inline-block mr-1 text-gray-400 w-4 h-4" />
              <span className="font-medium text-gray-400 text-xs">
                Deadline
              </span>
            </div>
            <div>
              <LiaTagsSolid className="inline-block mr-1 text-gray-400 w-4 h-4" />
              <span className="font-medium text-gray-400 text-xs">Tags</span>
            </div>
          </div>
          <div className="flex flex-1 justify-between flex-col gap-2">
            <div className="h-6 items-center text-gray-600">Private</div>
            <div className="h-6 items-center flex space-x-1">
              {/* each only 5 */}
              {project.team.members.slice(0, 5).map((member) => (
                <div
                  key={member.user.id}
                  className={twMerge(
                    "flex items-center space-x-1 border border-blue-300 rounded-full p-1 py-0 hover:bg-blue-50",
                    "transition-colors duration-200 ease-in-out cursor-pointer"
                  )}
                >
                  <Image
                    key={member.user.id}
                    src={member.user.image || "/default-avatar.png"}
                    alt={member.user.name || "User Avatar"}
                    className="w-6 h-6 rounded-full border-2 border-white overflow-hidden"
                    width={32}
                    height={32}
                    priority
                  />
                  <span className="text-xs text-black">{member.user.name}</span>
                </div>
              ))}
              {project.team.members.length > 5 && (
                <span className="text-xs text-gray-500">
                  +{project.team.members.length - 5} more
                </span>
              )}
            </div>
            <div className="h-6 items-center text-gray-600 text-xs flex">
              No deadline
            </div>
            <div className="h-6 items-center flex -space-x-2">
              {project.tags?.split(",").map((tag, index) => (
                <span
                  key={index}
                  className="bg-gray-200 text-gray-800 text-xs font-medium px-2.5 py-0.5 rounded"
                >
                  {tag}
                </span>
              ))}
              {!project.tags && (
                <span className="text-gray-400 text-xs">No tags</span>
              )}
            </div>
          </div>
        </div>
        <div className="flex items-center">
          <Button
            className="bg-blue-500 text-white px-8 text-xs"
            icon={FaPlus}
            sizeIcon={8}
            classIcon="font-tight"
            onClick={toggleModalCreateTask}
          >
            Add Task
          </Button>
        </div>
        <DragDropContext onDragEnd={onDragEnd}>
          <div className="flex space-x-3 overflow-x-auto">
            {Object.entries(columns).map(([columnId, { title, tasks }]) => (
              <div key={columnId} className="min-w-[250px] flex-shrink-0">
                <h2
                  className={twMerge(
                    "text-[13px] font-bold mb-2 text-left p-2 px-4 rounded-md flex flex-row items-center gap-2",
                    columnId === "TO_DO"
                      ? "text-blue-500"
                      : columnId === "IN_PROGRESS"
                      ? "text-yellow-500"
                      : columnId === "BACKLOG"
                      ? "text-black"
                      : "text-green-500",
                    columnId === "TO_DO"
                      ? "bg-blue-100 shadow-sm shadow-blue-500/30"
                      : columnId === "IN_PROGRESS"
                      ? "bg-yellow-100 shadow-sm shadow-yellow-500/30"
                      : columnId === "BACKLOG"
                      ? "bg-gray-100 shadow-sm shadow-gray-500/30"
                      : "bg-green-100 shadow-sm shadow-green-500/30"
                  )}
                >
                  <div
                    className={twMerge(
                      "mr-1 border-3 border-white overflow-hidden rounded-full h-4 w-4 flex items-center justify-center m-0",
                      columnId === "TO_DO"
                        ? "bg-blue-400"
                        : columnId === "IN_PROGRESS"
                        ? "bg-yellow-400"
                        : columnId === "BACKLOG"
                        ? "bg-black"
                        : "bg-green-400"
                    )}
                  ></div>
                  {title}
                </h2>

                <Droppable droppableId={columnId}>
                  {(provided) => (
                    <div
                      ref={provided.innerRef}
                      {...provided.droppableProps}
                      className="bg-white p-2 rounded-sm space-y-2 min-h-[500px] border-0 border-gray-200"
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
