"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import Link from "next/link";
import InviteMemberModal from "@/components/modals/InviteMemberModal";


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
    <div className="min-h-screen bg-gray-900">
      <div className="container mx-auto p-8 text-white min-h-[calc(100vh-64px)] w-full">
        <h1 className="text-4xl font-bold mb-8">Dashboard</h1>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {teams.map((team) => (
            <div
              key={team.id}
              className="bg-gray-800 p-6 rounded-lg shadow-lg hover:shadow-xl transition-shadow duration-300"
            >
              <h2 className="text-2xl font-semibold mb-4">{team.name}</h2>
              <button
                onClick={() => handleOpenInviteModal(team)}
                className="text-blue-400 hover:underline text-sm mb-4 cursor-pointer"
              >
                Invitar Miembro
              </button>
              <div className="space-y-2">
                <h3 className="text-lg font-medium text-gray-400">
                  Proyectos:
                </h3>
                {team.projects.length > 0 ? (
                  <ul>
                    {team.projects.map((project) => (
                      <li
                        key={project.id}
                        className="text-blue-500 hover:text-blue-300 hover:underline transition-colors"
                      >
                        <Link href={`/projects/${project.id}`}>
                          {project.title}
                        </Link>
                      </li>
                    ))}
                  </ul>
                ) : (
                  <p className="text-gray-500 text-sm">
                    No hay proyectos en este equipo.
                  </p>
                )}
              </div>
            </div>
          ))}

          <div className="bg-gray-800 p-6 rounded-lg shadow-lg">
            <h2 className="text-xl font-semibold mb-4 text-gray-200">
              Crear Nuevo Equipo
            </h2>

            <form onSubmit={handleCreateTeam}>
              <input
                type="text"
                value={newTeamName}
                onChange={(e) => setNewTeamName(e.target.value)}
                placeholder="Nombre del equipo"
                className="w-full px-4 py-2 border border-gray-600 rounded-md mb-4 bg-gray-700 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors"
              />
              <button
                type="submit"
                className="w-full px-4 py-2 bg-blue-600 text-white font-bold rounded-md hover:bg-blue-700 transition-colors cursor-pointer"
              >
                Crear
              </button>
            </form>
          </div>

          <div className="bg-gray-800 p-6 rounded-lg shadow-lg">
            <h2 className="text-xl font-semibold mb-4 text-gray-200">
              Crear Nuevo Proyecto
            </h2>

            <form onSubmit={handleCreateProject}>
              <input
                type="text"
                value={newProjectName}
                onChange={(e) => setNewProjectName(e.target.value)}
                placeholder="Nombre del proyecto"
                className="w-full px-4 py-2 border border-gray-600 rounded-md mb-4 bg-gray-700 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors"
              />
              <select
                value={selectedTeamId}
                onChange={(e) => setSelectedTeamId(e.target.value)}
                className="w-full px-4 py-2 border border-gray-600 rounded-md mb-4 bg-gray-700 text-white focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors"
              >
                <option value="">Selecciona un equipo</option>
                {teams.map((team) => (
                  <option key={team.id} value={team.id}>
                    {team.name}
                  </option>
                ))}
              </select>
              <button
                type="submit"
                className="w-full px-4 py-2 bg-blue-600 text-white font-bold rounded-md hover:bg-blue-700 transition-colors cursor-pointer"
              >
                Crear
              </button>
            </form>
          </div>
        </div>
      </div>

      
      <InviteMemberModal
        teamId={selectedTeam?.id}
        teamName={selectedTeam?.name}
        onClose={handleCloseInviteModal}
      />
      
    </div>
  );
}
