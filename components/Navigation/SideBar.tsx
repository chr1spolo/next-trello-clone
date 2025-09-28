"use client";

import React, { useEffect, useState } from "react";

import Link from "next/link";
import { useSession } from "next-auth/react";
import { usePathname, useRouter } from "next/navigation";
import { GoDot, GoDotFill } from "react-icons/go";
import { MdOutlineKeyboardArrowDown as Down } from "react-icons/md";
import { RiLogoutCircleLine as LogOut } from "react-icons/ri";

import * as Accordion from "@radix-ui/react-accordion";

import { twMerge } from "@/utils/twMerge";
import { Team } from "@/types";
import { useModalStore } from "@/store/modalStore";
import { useAppStore } from "@/store/appStore";

export default function SideBar() {
  const { sidebarItems, setSidebarItems } = useAppStore();

  const { data: session, status } = useSession();
  const [isMounted, setIsMounted] = useState(false);
  const [teams, setTeams] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const path = usePathname();
  const router = useRouter();

  const isLogged = status === "authenticated";
  const { openModal } = useModalStore();

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
                      subItems: [
                        ...data?.map((team: Team) => ({
                          name: team.name,
                          action: handleModal,
                          id: team.id,
                          type: "team",
                        })),
                        {
                          name: "Crear Equipo",
                          action: handleModal,
                          id: "new",
                          type: "team",
                        },
                      ],
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

  const handleModal = (id: string, type: string) => {
    // Aquí puedes implementar la lógica para abrir el modal
    console.log(`Abrir modal para ${type} con ID: ${id}`);
    switch (type) {
      case "team":
        teamTrigger(id);
        break;
      default:
        break;
    }
  };

  const teamTrigger = (id: string) => {
    const teamId = id === "new" ? null : id;
    openModal("team", { teamId });
    // Aquí puedes implementar la lógica para abrir el modal de equipo
    console.log("Abrir modal de equipo con ID2:", teamId);
  };

  if (!isMounted) {
    return null;
  }

  return (
    <div className="bg-white text-black w-64 p-4 rounded-2xl shadow-md">
      <h2 className="text-2xl font-bold mb-4 text-center">
        <span className="font-allan font-normal">TaskKy</span>
      </h2>

      <nav>
        <Accordion.Root type="multiple" className="space-y-1">
          {sidebarItems.map((item) => {
            const Icon = item.icon;
            const isActive =
              path === item.href ||
              (item.subItems && item.subItems.some((sub) => sub.href === path));
            const haveSubItems = item.subItems && item.subItems.length > 0;

            const Dot =
              item.subItems && item.subItems.some((sub) => sub.href === path)
                ? GoDotFill
                : GoDot;
            return (
              <Accordion.Item
                value={item.name}
                key={item.name}
                className={twMerge(
                  isActive ? "bg-gray-200/70" : "bg-transparent",
                  "rounded",
                  "flex rounded hover:bg-gray-200/90 font-normal text-gray-600 text-sm",
                  haveSubItems ? "flex-col justify-start items-baseline" : "",
                  "transition-colors duration-300 ease-in-out"
                )}
              >
                {haveSubItems ? (
                  <Accordion.Header className="w-full">
                    <Accordion.Trigger
                      className={twMerge(
                        "px-4 py-2",
                        "transition-colors duration-300 ease-in-out",
                        "items-center cursor-pointer",
                        "flex justify-between w-full"
                      )}
                    >
                      <div className="inline">
                        <Icon className="inline-block w-6 h-6 font-thin mr-1" />
                        {item.name}
                      </div>
                      <Down className="mr-2" />
                    </Accordion.Trigger>
                    <Accordion.Content>
                      <div className="space-y-1 pl-1 mb-2">
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
                              <Dot
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
                    </Accordion.Content>
                  </Accordion.Header>
                ) : (
                  <Link
                    href={item.href}
                    className={twMerge(
                      "px-4 py-2",
                      "transition-colors duration-300 ease-in-out",
                      "items-center w-full"
                    )}
                  >
                    <div className="inline">
                      <Icon className="inline-block w-6 h-6 font-thin mr-1" />
                      {item.name}
                    </div>
                  </Link>
                )}
              </Accordion.Item>
            );
          })}

          {isLogged && (
            <button
              className={twMerge(
                "px-4 py-2",
                "transition-colors duration-300 ease-in-out",
                "items-center w-full cursor-pointer",
                "flex rounded hover:bg-gray-200/90 font-normal text-red-400 text-sm",
                "transition-colors duration-300 ease-in-out"
              )}
            >
              <div className="inline">
                <LogOut className="inline-block w-5 h-5 font-thin mr-2" />
                Salir
              </div>
            </button>
          )}
        </Accordion.Root>
      </nav>
    </div>
  );
}
