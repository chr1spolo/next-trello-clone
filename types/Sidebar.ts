export interface SidebarItem {
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
