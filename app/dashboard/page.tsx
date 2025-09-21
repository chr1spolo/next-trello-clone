"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import Link from "next/link";
import InviteMemberModal from "@/components/modals/InviteMemberModal";
import FloatButton from "@/components/ui/Buttons/FloatButton";
import { PiArrowCircleLeftLight } from "react-icons/pi";
import { twMerge } from "@/utils/twMerge";
import ActionHome from "@/components/modals/ActionHome";

interface Project {
  id: string;
  title: string;
}

interface Team {
  id: string;
  name: string;
  projects: Project[];
}

export default function DashboardPage() {
  const { status } = useSession();
  const router = useRouter();
  const [teams, setTeams] = useState<Team[]>([]);
  const [newTeamName, setNewTeamName] = useState("");
  const [newProjectName, setNewProjectName] = useState("");
  const [selectedTeamId, setSelectedTeamId] = useState<string>("");
  const [isLoading, setIsLoading] = useState(true);
  const [selectedTeam, setSelectedTeam] = useState<{
    id: string;
    name: string;
  } | null>(null);

  const [isInviteModalOpen, setIsInviteModalOpen] = useState(false);
  const [isActionsOpen, setIsActionsOpen] = useState(false);

  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/");
    }
  }, [status, router]);

  useEffect(() => {
    if (status === "authenticated") {
      const fetchTeams = async () => {
        try {
          const res = await fetch("/api/teams");
          if (res.ok) {
            const data = await res.json();
            setTeams(data);
          }
        } catch (error) {
          console.error("Error al obtener los equipos:", error);
        } finally {
          setIsLoading(false);
        }
      };
      fetchTeams();
    }
  }, [status]);

  const handleCreateTeam = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTeamName.trim()) return;

    try {
      const res = await fetch("/api/teams", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: newTeamName }),
      });

      if (res.ok) {
        const newTeam = await res.json();
        setTeams([...teams, newTeam]);
        setNewTeamName("");
      }
    } catch (error) {
      console.error("Error al crear el equipo:", error);
    }
  };

  const handleCreateProject = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newProjectName.trim() || !selectedTeamId) return;

    try {
      const res = await fetch("/api/projects", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ title: newProjectName, teamId: selectedTeamId }),
      });

      if (res.ok) {
        const newProject = await res.json();
        const updatedTeams = teams.map((team) =>
          team.id === selectedTeamId
            ? { ...team, projects: [...team.projects, newProject] }
            : team
        );
        setTeams(updatedTeams);
        setNewProjectName("");
        setSelectedTeamId("");
      }
    } catch (error) {
      console.error("Error al crear el proyecto:", error);
    }
  };

  const handleOpenInviteModal = (team: { id: string; name: string }) => {
    setSelectedTeam(team);
    setIsInviteModalOpen(true);
  };

  const handleCloseInviteModal = () => {
    setSelectedTeam(null);
    setIsInviteModalOpen(false);
  };

  const actions = [
    {
      id: "1",
      label: "Crear Equipo",
      icon: <PiArrowCircleLeftLight />,
      onClick: () => console.log("Crear Equipo"),
    },
    {
      id: "2",
      label: "Crear Proyecto",
      icon: <PiArrowCircleLeftLight />,
      onClick: () => console.log("Crear Proyecto"),
    },
  ];

  if (status === "loading" || isLoading) {
    return (
      <div className="min-h-screen rounded-2xl text-black bg-white">Cargando...</div>
    );
  }

  if (status === "unauthenticated") {
    return null;
  }

  return (
    <div className="min-h-screen bg-transparent rounded-2xl relative">
      <div className="container mx-auto p-0 text-white min-h-[calc(100vh-64px)] w-full relative">
        <ActionHome
          isActionsOpen={isActionsOpen}
          setIsActionOpen={setIsActionsOpen}
          actions={actions}
        />

        <FloatButton
          open={isActionsOpen}
          onOpen={() => setIsActionsOpen(true)}
          onClose={() => setIsActionsOpen(false)}
        />
      </div>

      <InviteMemberModal
        teamId={selectedTeam?.id}
        teamName={selectedTeam?.name}
        onClose={handleCloseInviteModal}
      />
    </div>
  );
}
