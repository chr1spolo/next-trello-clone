import React, { useEffect, useState } from "react";
import { MdOutlineTask } from "react-icons/md";

import { RiCloseCircleLine } from "react-icons/ri";

import { useModalStore } from "@/store/modalStore";
import Button from "@/components/ui/Buttons/Default";
import Input from "@/components/ui/Inputs/Default";
import { useAppStore } from "@/store/appStore";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { socket } from "@/socket";

const CreateTaskModal = () => {
  const { type, payload, closeModal, openModal } = useModalStore();
  const { data: session, status } = useSession();
  const { sidebarItems, setSidebarItems } = useAppStore();
  const [taskTitle, setTaskTitle] = useState("");

  const { projectId } = payload || { projectId: null };
  const router = useRouter();

  const closeCreateModal = () => {
    setTaskTitle("");
    closeModal();
  };

  const handleCreateTask = async () => {
    // Implement task creation logic here

    if (!taskTitle.trim() || !projectId) return;

    try {
      const res = await fetch("/api/tasks", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ title: taskTitle, projectId }),
      });

      if (res.ok) {
        const newTask = await res.json();
        if (socket && socket.connected) {
          console.log("Emitting new task:", newTask);
          socket.emit("create-task", JSON.stringify(newTask));
        }
        setTaskTitle("");
      }
    } catch (error) {
      console.error("Error creating task:", error);
    }
    closeCreateModal();
  };

  if (type !== "new-task") return null;

  console.log(projectId);

  return (
    <div className="flex w-full">
      <div className="bg-white rounded-lg w-full flex gap-4 flex-col">
        <div className="flex justify-between items-center gap-4 flex-row">
          <h2 className="text-2xl font-thin text-black/80 font-allan">
            Nueva Tarea
          </h2>
          <div className="cursor-pointer" onClick={() => closeCreateModal()}>
            <RiCloseCircleLine className="inline-block ml-2 text-black w-6 h-6 hover:text-red-400 transition-colors duration-300 ease-in-out" />
          </div>
        </div>
        <div className="flex flex-col gap-4">
          <div className="space-y-1">
            <label className="block text-sm font-medium text-gray-700">
              Nombre de la Tarea
            </label>
            <Input
              type="text"
              placeholder="Ingresa el nombre de la tarea"
              onChange={(e) => setTaskTitle(e.target.value)}
              value={taskTitle}
              icon={MdOutlineTask}
              sizeIcon="sm"
              inputSize="sm"
              maxLength={25}
            />
          </div>

          <div className="flex justify-between space-x-2">
            <Button
              type="button"
              className="bg-gray-400 hover:bg-red-400"
              onClick={() => closeCreateModal()}
            >
              Cancelar
            </Button>
            <Button onClick={handleCreateTask}>Crear Tarea</Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CreateTaskModal;
