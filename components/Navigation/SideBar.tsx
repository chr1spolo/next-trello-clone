"use client";

import React, { useEffect, useState } from "react";
import { TbHome2 as HomeIcon } from "react-icons/tb";
import { MdOutlineFolderCopy as ProjectsIcon } from "react-icons/md";
import { AiOutlineTeam as TeamIcon } from "react-icons/ai";
import { CiSettings as SettingsIcon } from "react-icons/ci";
import Link from "next/link";
import { useSession } from "next-auth/react";
import { usePathname, useRouter } from "next/navigation";
import { twMerge } from "@/utils/twMerge";
import { Team } from "@/types";
import { GoDot } from "react-icons/go";

const items: {
  name: string;
  href: string;
  icon: React.ComponentType<{ className?: string }>;
  subItems?: {
    name: string;
    href?: string;
    id?: string;
    type?: string;
    action?: (id: string, type: string) => void;
  }[];
}[] = [
  { name: "Inicio", href: "/dashboard", icon: HomeIcon },
  { name: "Proyectos", href: "/projects", icon: ProjectsIcon },
  { name: "Equipos", href: "/teams", icon: TeamIcon },
  { name: "Configuración", href: "/settings", icon: SettingsIcon },
];

export default function SideBar() {
  const { data: session, status } = useSession();
  const [isMounted, setIsMounted] = useState(false);
  const [sidebarItems, setSidebarItems] = useState(items);
  const [teams, setTeams] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const path = usePathname();
  const router = useRouter();

  const isLogged = status === "authenticated";

  useEffect(() => {
    setIsMounted(true);
  }, []);

  useEffect(() => {
    if (status === "authenticated") {
      const fetchTeams = async () => {
        try {
          const res = await fetch("/api/teams");
          if (res.ok) {
            const data = await res.json();
            setTeams(data);
            const projects = data
              .map((team: Team) => {
                const projectByTeam = team.projects?.map((project) => ({
                  name: project.title,
                  href: `/projects/${project.id}`,
                }));

                return projectByTeam;
              })
              .flat();

            const newSidebarItems = [
              ...sidebarItems.map((item) =>
                item.name === "Proyectos"
                  ? { ...item, subItems: projects }
                  : item.name === "Equipos"
                  ? {
                      ...item,
                      subItems: data?.map((team: Team) => ({
                        name: team.name,
                        action: handleModal,
                        id: team.id,
                        type: "team",
                      })),
                    }
                  : item
              ),
            ];
            setSidebarItems(newSidebarItems);
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

  if (!isMounted) {
    return null;
  }

  const handleModal = (id: string, type: string) => {
    // Aquí puedes implementar la lógica para abrir el modal
    console.log(`Abrir modal para ${type} con ID: ${id}`);
  };

  return (
    <div className="bg-white text-black w-64 p-4 rounded-2xl">
      <h2 className="text-2xl font-bold mb-4 text-center">
        <span className="font-allan font-normal">TaskKy</span>
      </h2>

      <nav>
        <ul className="space-y-2">
          {sidebarItems.map((item) => {
            const Icon = item.icon;
            const isActive =
              path === item.href ||
              (item.subItems && item.subItems.some((sub) => sub.href === path));
            const haveSubItems = item.subItems && item.subItems.length > 0;
            console.log(haveSubItems);

            return (
              <li key={item.name}>
                <div
                  className={twMerge(
                    isActive ? "bg-gray-200/70" : "bg-transparent",
                    "rounded",
                    "flex rounded hover:bg-gray-200/90 font-normal text-gray-600 text-sm",
                    haveSubItems ? "flex-col justify-start items-baseline" : ""
                  )}
                >
                  <Link
                    href={item.href}
                    className={twMerge(
                      "px-4 py-2",
                      "transition-colors duration-300 ease-in-out",
                      "items-center"
                    )}
                  >
                    <div className="inline">
                      <Icon className="inline-block w-6 h-6 font-thin mr-1" />
                      {item.name}
                    </div>
                  </Link>
                  {haveSubItems && (
                    <div className="w-full mb-2">
                      {item.subItems?.map((subItem, key) => (
                        <div
                          key={`${key}-subitem-`}
                          className="ml-3 transition-all duration-300 ease-in-out hover:pl-1 hover:bg-gray-300 rounded z-10"
                        >
                          <button
                            onClick={() =>
                              subItem.href
                                ? router.push(subItem.href)
                                : subItem.action && subItem.id
                                ? subItem.action(
                                    subItem.id,
                                    subItem.type || "team"
                                  )
                                : null
                            }
                            name={subItem.href}
                            className={twMerge(
                              "flex px-4 py-1 rounded hover:bg-gray-300 font-normal text-gray-600 text-sm",
                              path === subItem.href ? "font-bold" : "",
                              "transition-colors duration-300 ease-in-out",
                              "items-center cursor-pointer w-full"
                            )}
                          >
                            <GoDot
                              className={twMerge(
                                "inline-block w-3 h-3 font-thin mr-1",
                                path === subItem.href
                                  ? "text-black font-bold"
                                  : "text-gray-400"
                              )}
                            />
                            {subItem.name}
                          </button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </li>
            );
          })}
          {isLogged && (
            <li>
              <Link
                href="/logout"
                className="flex px-4 py-2 rounded hover:bg-gray-200/90 font-normal text-red-400 text-sm"
              >
                Salir
              </Link>
            </li>
          )}
        </ul>
      </nav>
    </div>
  );
}
