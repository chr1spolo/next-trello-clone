import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { PiBowlSteam } from "react-icons/pi";
import { RiCloseCircleLine } from "react-icons/ri";

import { useModalStore } from "@/store/modalStore";
import Button from "@/components/ui/Buttons/Default";
import Input from "@/components/ui/Inputs/Default";
import { useAppStore } from "@/store/appStore";
import ListMembers from "@/components/list/ListMembers";
import { Member, Team } from "@/types";
import { useSession } from "next-auth/react";

const CreateTeamModal = () => {
  const { type, payload, closeModal, openModal } = useModalStore();
  const { data: session, status } = useSession();
  const { sidebarItems, setSidebarItems } = useAppStore();
  const [teamName, setTeamName] = useState("");
  const router = useRouter();
  const [teamInfo, setTeamInfo] = useState<Team | null>(null);
  const [members, setMembers] = useState<Member[]>([]);

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
      }
    } catch (error) {
      console.error("Error al crear el equipo:", error);
    }
  };

  useEffect(() => {
    if (teamId) {
      fetchTeamInfo(teamId);
    } else if (type === "team" && !teamId && status === "authenticated") {
      setTeamInfo(null);
      setTeamName("");
      setMembers([{
        user: {
          id: session?.user.id,
          email: session?.user.email as string,
          name: session?.user.name as string,
          image: session?.user.image as string,
          emailVerified: new Date() || null,
        },
        userId: session?.user.id as string,
        role: "ADMIN",
      }]);
    }
  }, [teamId, type, status]);

  const fetchTeamInfo = async (id: string) => {
    try {
      const res = await fetch(`/api/teams/${id}`);
      if (res.ok) {
        const data = await res.json();
        setTeamInfo(data);
        setTeamName(data.name);
        setMembers(data.members || []);
      }
    } catch (error) {
      console.error("Error fetching team info:", error);
    }
  };

  const closeCreateModal = () => {
    setTeamName("");
    closeModal();

    if (!teamId) {
      setMembers([]);
    }
  };

  const createNewTeam = () => {
    try {
      const res = fetch("/api/teams", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: teamName }),
      });
    } catch (error) {}
  };

  const handleAddMember = (member: Member) => {
    if (members.find((m) => m.user.email === member.user.email)) {
      alert("El miembro ya ha sido invitado");
      return;
    }
    setMembers([...members, member]);
  };

  const handleRemoveMember = (email: string) => {
    if (!teamId) {
      setMembers(members.filter((member) => member.user.email !== email));
    }
  };

  if (type !== "team") return null;

  const title = teamId ? "Editar Equipo" : "Crear Equipo";

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

          {/* member list */}
          <ListMembers
            membersInvited={members || []}
            onRemoveMember={handleRemoveMember}
            onAddMember={handleAddMember}
          />

          <div className="flex justify-between space-x-2">
            <Button
              type="button"
              className="bg-gray-400 hover:bg-red-400"
              onClick={() => closeCreateModal()}
            >
              Cancelar
            </Button>
            <Button onClick={handleCreateTeam}>
              {teamId ? "Guardar Cambios" : "Crear Equipo"}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CreateTeamModal;
