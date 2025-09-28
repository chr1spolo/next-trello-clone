import { useModalStore } from "@/store/modalStore";
import React, { useEffect, useState } from "react";
import Button from "@/components/ui/Buttons/Default";
import Input from "@/components/ui/Inputs/Default";
import { PiBowlSteam } from "react-icons/pi";
import { RiCloseCircleLine } from "react-icons/ri";
import { useRouter } from "next/navigation";
import { useAppStore } from "@/store/appStore";

const CreateTeamModal = () => {
  const { type, payload, closeModal, openModal } = useModalStore();
  const { sidebarItems, setSidebarItems } = useAppStore();
  const [teamName, setTeamName] = useState("");
  const router = useRouter();

  const { teamId } = payload || { teamId: null };

  const handleCreateTeam = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!teamName.trim()) {
      return alert("El nombre del equipo no puede estar vacío");
    }

    try {
      const res = await fetch("/api/teams", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: teamName }),
      });

      if (res.ok) {
        setTeamName(teamName);
        const newTeam = await res.json();
        const teamsFiltered = sidebarItems.filter(
          (item) => item.name === "Equipos"
        );

        // adding but checking the names to order alphabetically

        const newTeams = [
          ...(teamsFiltered[0].subItems || []),
          {
            name: newTeam.name,
            action: () => openModal("team", { teamId: newTeam.id }),
            id: newTeam.id,
            type: "team",
          },
        ];
        // remove "create new team" from newteams list
        const newTeamsFiltered = newTeams.filter(
          (item) => item.name !== "Crear Equipo"
        );
        newTeamsFiltered.sort((a, b) => a.name.localeCompare(b.name));

        // add to last item
        const newSidebarItems = sidebarItems.map((item) => {
          if (item.name === "Equipos") {
            return {
              ...item,
              subItems: [
                ...newTeamsFiltered,
                {
                  name: "Crear Equipo",
                  action: () => openModal("team", { teamId: null }),
                  id: "new",
                  type: "team",
                },
              ],
            };
          }
          return item;
        });

        setSidebarItems(newSidebarItems);
        setTeamName("");
        closeModal();
      }
    } catch (error) {
      console.error("Error al crear el equipo:", error);
    }
  };

  useEffect(() => {
    setTeamName(teamId || "");
  }, [teamId]);

  if (type !== "team") return null;

  const title = teamId ? "Editar Equipo" : "Crear Equipo";

  return (
    <div className="flex w-full">
      <div className="bg-white rounded-lg w-full flex gap-4 flex-col">
        <div className="flex justify-between items-center gap-4 flex-row">
          <h2 className="text-2xl font-thin text-black/80 font-allan">
            {title}
          </h2>
          <div className="cursor-pointer" onClick={() => closeModal()}>
            <RiCloseCircleLine className="inline-block ml-2 text-black w-6 h-6 hover:text-red-400 transition-colors duration-300 ease-in-out" />
          </div>
        </div>
        <form className="space-y-4" onSubmit={handleCreateTeam}>
          <div className="space-y-1">
            <label className="block text-sm font-medium text-gray-700">
              Nombre del Equipo
            </label>
            <Input
              type="text"
              placeholder="Ingresa el nombre del equipo"
              defaultValue={teamName}
              onChange={(e) => setTeamName(e.target.value)}
              value={teamName}
              icon={PiBowlSteam}
              sizeIcon="sm"
              inputSize="sm"
              maxLength={25}
            />
          </div>
          <div className="flex justify-between space-x-2">
            <Button
              type="button"
              className="bg-gray-400 hover:bg-red-400"
              onClick={() => closeModal()}
            >
              Cancelar
            </Button>
            <Button type="submit">
              {teamId ? "Guardar Cambios" : "Crear Equipo"}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default CreateTeamModal;
