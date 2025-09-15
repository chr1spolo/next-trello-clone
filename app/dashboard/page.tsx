// app/dashboard/page.tsx
"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";

interface Team {
  id: string;
  name: string;
}

export default function DashboardPage() {
  const { status } = useSession();
  const router = useRouter();
  const [teams, setTeams] = useState<Team[]>([]);
  const [newTeamName, setNewTeamName] = useState("");
  const [isLoading, setIsLoading] = useState(true);

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
    <div className="container mx-auto p-8">
      <h1 className="text-4xl font-bold mb-8">Mis Equipos</h1>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {teams.map((team) => (
          <div
            key={team.id}
            className="bg-white p-6 rounded-lg shadow-md hover:shadow-lg transition-shadow duration-300 cursor-pointer"
          >
            <h2 className="text-2xl font-semibold">{team.name}</h2>
            {/* Aquí puedes añadir un enlace a la página del proyecto del equipo */}
          </div>
        ))}
        <div className="bg-white p-6 rounded-lg shadow-md">
          <h2 className="text-2xl font-semibold mb-4">Crear Nuevo Equipo</h2>
          <form onSubmit={handleCreateTeam}>
            <input
              type="text"
              value={newTeamName}
              onChange={(e) => setNewTeamName(e.target.value)}
              placeholder="Nombre del equipo"
              className="w-full px-4 py-2 border rounded-md mb-4 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            <button
              type="submit"
              className="w-full px-4 py-2 bg-blue-600 text-white font-bold rounded-md hover:bg-blue-700 transition-colors duration-300"
            >
              Crear Equipo
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
