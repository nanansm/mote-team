import {
  Award,
  BarChart3,
  Building2,
  CalendarDays,
  LayoutDashboard,
  LayoutTemplate,
  ListChecks,
  ListTodo,
  Settings,
  Target,
  UsersRound,
  type LucideIcon,
} from "lucide-react";

export type NavItem = {
  href: string;
  label: string;
  icon: LucideIcon;
  group: string;
  adminOnly?: boolean;
};

export const navItems: NavItem[] = [
  { href: "/my-tasks", label: "Task Saya", icon: ListTodo, group: "Kerja" },
  { href: "/tasks", label: "Tasks", icon: ListChecks, group: "Kerja" },
  { href: "/calendar", label: "Kalender", icon: CalendarDays, group: "Kerja" },
  { href: "/dashboard", label: "Overview", icon: LayoutDashboard, group: "Insight" },
  { href: "/performance", label: "Performance", icon: BarChart3, group: "Insight" },
  { href: "/okr", label: "OKR", icon: Target, group: "Insight" },
  { href: "/scoring", label: "Skor Bulanan", icon: Award, group: "Insight", adminOnly: true },
  { href: "/clients", label: "Clients", icon: Building2, group: "Kelola" },
  { href: "/templates", label: "Template", icon: LayoutTemplate, group: "Kelola" },
  { href: "/team", label: "Team", icon: UsersRound, group: "Kelola", adminOnly: true },
  { href: "/settings", label: "Settings", icon: Settings, group: "Kelola", adminOnly: true },
];

export function visibleNav(isAdmin: boolean): NavItem[] {
  return navItems.filter((i) => !i.adminOnly || isAdmin);
}

/** Grouped nav for the sidebar (preserves group order, drops empty groups). */
export function navGroups(isAdmin: boolean): { group: string; items: NavItem[] }[] {
  const order = ["Kerja", "Insight", "Kelola"];
  return order
    .map((group) => ({
      group,
      items: visibleNav(isAdmin).filter((i) => i.group === group),
    }))
    .filter((g) => g.items.length > 0);
}
