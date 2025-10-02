import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { FaProjectDiagram } from "react-icons/fa";
import { PiBowlSteam } from "react-icons/pi";

import { RiCloseCircleLine } from "react-icons/ri";

import { useModalStore } from "@/store/modalStore";
import Button from "@/components/ui/Buttons/Default";
import Input from "@/components/ui/Inputs/Default";
import { useAppStore } from "@/store/appStore";
import { Team, Project } from "@/types";
import { useSession } from "next-auth/react";
import Select from "../ui/Selects/Default";
import { SidebarItem } from "@/types/Sidebar";

const CreateProjectModal = () => {
  const { type, payload, closeModal, openModal } = useModalStore();
  const { data: session, status } = useSession();
  const { sidebarItems, setSidebarItems } = useAppStore();
  const [projectName, setProjectName] = useState("");
  const router = useRouter();
  const [projectInfo, setProjectInfo] = useState<Project | null>(null);
  const [teamId, setTeamId] = useState<string>("");

  const { projectId } = payload || { projectId: null };

  const handleCreateProject = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!projectName.trim()) {
      return alert("El nombre del proyecto no puede estar vacío");
    }

    if (!projectId) {
      // Create new team
      try {
        const res = await fetch("/api/projects", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            title: projectName,
            teamId: teamId,
          }),
        });
        if (res.ok) {
          const data = await res.json();
          const newProject: Project = data;

          const newSidebarItems: SidebarItem[] = sidebarItems.map((item) => {
            if (item.name === "Proyectos") {
              return {
                ...item,
                subItems: item.subItems && [
                  { name: projectName, href: `/projects/${newProject.id}` },
                  ...item.subItems,
                ],
              };
            }
            return item;
          });

          setSidebarItems(newSidebarItems);

          closeCreateModal();
          router.push(`/projects/${data.id}`);
        } else {
          console.error("Error creating project:", res.statusText);
        }
      } catch (error) {
        console.error("Error creating project:", error);
      }
    } else {
      // Update existing team
    }
  };

  useEffect(() => {
    if (projectId) {
      fetchProjectInfo(projectId);
    } else if (type === "team" && !projectId && status === "authenticated") {
      setProjectInfo(null);
      setProjectName("");
    }
  }, [projectId, type, status]);

  const fetchProjectInfo = async (id: string) => {
    try {
      const res = await fetch(`/api/projects/${id}`);
      if (res.ok) {
        const data = await res.json();
        setProjectInfo(data);
        setProjectName(data.name);
      }
    } catch (error) {
      console.error("Error fetching team info:", error);
    }
  };

  const closeCreateModal = () => {
    setProjectName("");
    setProjectInfo(null);
    closeModal();
  };

  if (type !== "project") return null;

  const title = projectId ? "Editar Proyecto" : "Crear Proyecto";

  const teams = sidebarItems
    .find((item) => item.name === "Equipos")
    ?.subItems?.map((item) => {
      if (item.name !== "Crear Equipo") {
        return { id: item.id, name: item.name };
      }
      return null;
    })
    .filter(Boolean);

  console.log("Teams in CreateProjectModal:", teams);

  return (
    <div className="flex w-full">
      <div className="bg-white rounded-lg w-full flex gap-4 flex-col">
        <div className="flex justify-between items-center gap-4 flex-row">
          <h2 className="text-2xl font-thin text-black/80 font-allan">
            {title}
          </h2>
          <div className="cursor-pointer" onClick={() => closeCreateModal()}>
            <RiCloseCircleLine className="inline-block ml-2 text-black w-6 h-6 hover:text-red-400 transition-colors duration-300 ease-in-out" />
          </div>
        </div>
        <div className="flex flex-col gap-4">
          <div className="space-y-1">
            <label className="block text-sm font-medium text-gray-700">
              Nombre del Proyecto
            </label>
            <Input
              type="text"
              placeholder="Ingresa el nombre del proyecto"
              onChange={(e) => setProjectName(e.target.value)}
              value={projectName}
              icon={FaProjectDiagram}
              sizeIcon="sm"
              inputSize="sm"
              maxLength={25}
            />
          </div>

          <div className="flex flex-col gap-2">
            <label className="block text-sm font-medium text-gray-700">
              Selecciona un Equipo
            </label>
            <Select
              value={teamId}
              onChange={(e) => setTeamId(e.target.value)}
              icon={PiBowlSteam}
              sizeIcon={"sm"}
              inputSize="sm"
              variant="primary"
            >
              <option value="">Selecciona un equipo</option>
              {teams?.map((team) => (
                <option key={team?.id} value={team?.id}>
                  {team?.name} ({team?.id})
                </option>
              ))}
            </Select>
          </div>

          <div className="flex justify-between space-x-2">
            <Button
              type="button"
              className="bg-gray-400 hover:bg-red-400"
              onClick={() => closeCreateModal()}
            >
              Cancelar
            </Button>
            <Button onClick={handleCreateProject}>
              {projectId ? "Guardar Cambios" : "Crear Proyecto"}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CreateProjectModal;
