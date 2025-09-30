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

    if (!teamId) {
      // Create new team
      try {
        const res = await fetch("/api/teams", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            name: teamName,
            members: members.map((member) => ({
              email: member.user.email,
              role: member.role,
            })),
          }),
        });

        if (res.ok) {
          const newTeam = await res.json();

          if (newTeam.message && newTeam.message.length > 0) {
            alert(newTeam.message);
          }

          const sidebarTeams = sidebarItems.filter(
            (item) => item.name === "Equipos"
          );
          const newSidebarTeams = [
            ...(sidebarTeams[0].subItems?.filter(
              (item) => item.name !== "Crear Equipo"
            ) || []),
            {
              id: newTeam.id,
              name: newTeam.name,
              action: () => openModal("team", { teamId: newTeam.id }),
            },
          ];

          newSidebarTeams.sort((a, b) =>
            a.name.localeCompare(b.name, "es", { sensitivity: "base" })
          );

          newSidebarTeams.push({
            id: "new",
            name: "Crear Equipo",
            action: () => openModal("team", { teamId: null }),
          });

          const newSidebarItems = [
            ...sidebarItems.map((item) => {
              if (item.name === "Equipos") {
                return {
                  ...item,
                  subItems: newSidebarTeams,
                };
              }
              return item;
            }),
          ];

          setSidebarItems(newSidebarItems);
          alert("Equipo creado con éxito");
          closeCreateModal();
        } else {
          const errorData = await res.json();
          alert(errorData.message || "Error al crear el equipo");
        }
      } catch (error) {
        console.error("Error creating team:", error);
        alert("Error al crear el equipo");
      }
    } else {
      // Update existing team
      try {
        const res = await fetch(`/api/teams/${teamId}`, {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            name: teamName,
            members: members.map((member) => ({
              userId: member.userId,
              role: member.role,
            })),
          }),
        });

        if (res.ok) {
          const updatedTeam = await res.json();

          const newSidebarItems = sidebarItems.map((item) => {
            if (item.name === "Equipos") {
              return {
                ...item,
                subItems: item.subItems?.map((subItem) => {
                  if (subItem.id === teamId) {
                    return {
                      ...subItem,
                      name: updatedTeam.name,
                    };
                  }
                  return subItem;
                }),
              };
            }
            return item;
          });

          setSidebarItems(newSidebarItems);
          alert("Equipo actualizado con éxito");
          closeCreateModal();
        } else {
          const errorData = await res.json();
          alert(errorData.message || "Error al actualizar el equipo");
        }
      } catch (error) {
        console.error("Error updating team:", error);
        alert("Error al actualizar el equipo");
      }
    }
  };

  useEffect(() => {
    if (teamId) {
      fetchTeamInfo(teamId);
    } else if (type === "team" && !teamId && status === "authenticated") {
      setTeamInfo(null);
      setTeamName("");
      setMembers([
        {
          user: {
            id: session?.user.id,
            email: session?.user.email as string,
            name: session?.user.name as string,
            image: session?.user.image as string,
            emailVerified: new Date() || null,
          },
          userId: session?.user.id as string,
          role: "OWNER",
        },
      ]);
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

  const handleAddMember = (member: Member) => {
    const checkMember = members.find((m) => m.user.email === member.user.email);
    if (checkMember) {

      if (checkMember.role !== member.role) {
        // Update role
        setMembers(members.map((m) => (m.user.email === member.user.email ? member : m)));
        return;
      }
      alert("El miembro ya ha sido invitado");
      return;
    }
    setMembers([...members, member]);
  };

  const handleRemoveMember = (email: string) => {
    
    setMembers(members.filter((member) => member.user.email !== email));
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
