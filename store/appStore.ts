import { create } from "zustand";
import { TbHome2 as HomeIcon } from "react-icons/tb";
import { MdOutlineFolderCopy as ProjectsIcon } from "react-icons/md";
import { AiOutlineTeam as TeamIcon } from "react-icons/ai";
import { CiSettings as SettingsIcon } from "react-icons/ci";

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
  {
    name: "Equipos",
    icon: TeamIcon,
    href: "/teams",
    subItems: [
      {
        name: "Crear equipo",
        id: "new",
        type: "team",
        action: () => {
          alert("Primero debes iniciar sesión");
        },
      },
    ],
  },
  { name: "Configuración", href: "/settings", icon: SettingsIcon },
];

interface SidebarItem {
  name: string;
  href: string;
  icon: React.ComponentType<{
    className?: string;
  }>;
  subItems?: {
    name: string;
    href?: string;
    id?: string;
    type?: string;
    action?: (id: string, type: string) => void;
  }[];
}

interface AppStoreProps {
  sidebarItems: SidebarItem[];
  setSidebarItems: (items: SidebarItem[]) => void;
}

export const useAppStore = create<AppStoreProps>((set) => ({
  sidebarItems: items,
  setSidebarItems: (items) => set({ sidebarItems: items }),
}));
