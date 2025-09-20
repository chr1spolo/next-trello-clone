"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import Link from "next/link";
import InviteMemberModal from "@/components/modals/InviteMemberModal";
import FloatButton from "@/components/ui/Buttons/FloatButton";


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
  const [isInviteModalOpen, setIsInviteModalOpen] = useState(false);
  const [selectedTeam, setSelectedTeam] = useState<{
    id: string;
    name: string;
  } | null>(null);



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


  if (status === "loading" || isLoading) {
    return (
      <div className="flex items-center justify-center h-screen">
        Cargando...
      </div>
    );
  }

  if (status === "unauthenticated") {
    return null; // El useEffect se encarga de la redirección
  }

  return (
    <div className="min-h-screen bg-transparent rounded-2xl">
      <div className="container mx-auto p-0 text-white min-h-[calc(100vh-64px)] w-full">
        <FloatButton />
      </div>

      <InviteMemberModal
        teamId={selectedTeam?.id}
        teamName={selectedTeam?.name}
        onClose={handleCloseInviteModal}
      />
    </div>
  );
}
