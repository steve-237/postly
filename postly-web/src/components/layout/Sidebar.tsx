"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { 
  LayoutDashboard, 
  PenSquare, 
  Calendar, 
  Settings, 
  BarChart3,
  Users
} from "lucide-react";

const navigation = [
  { name: "Tableau de bord", href: "/", icon: LayoutDashboard },
  { name: "Créer un post", href: "/compose", icon: PenSquare },
  { name: "Calendrier", href: "/calendar", icon: Calendar },
  { name: "Comptes liés", href: "/accounts", icon: Users },
  { name: "Statistiques", href: "/analytics", icon: BarChart3 },
];

export function Sidebar() {
  const pathname = usePathname();

  return (
    <div className="flex flex-col w-64 h-screen px-4 py-8 bg-[#0F172A] border-r border-slate-800 text-slate-300">
      <div className="flex items-center gap-3 px-2 mb-10">
        <div className="w-8 h-8 rounded-lg bg-gradient-to-tr from-indigo-500 to-purple-500 flex items-center justify-center shadow-lg shadow-purple-500/20">
          <span className="text-white font-bold text-xl leading-none">P</span>
        </div>
        <span className="text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-white to-slate-400 tracking-tight">
          Postly
        </span>
      </div>

      <nav className="flex-1 space-y-2">
        {navigation.map((item) => {
          const isActive = pathname === item.href;
          const Icon = item.icon;
          return (
            <Link
              key={item.name}
              href={item.href}
              className={`flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all duration-200 group ${
                isActive 
                  ? "bg-slate-800/80 text-white shadow-sm ring-1 ring-slate-700" 
                  : "hover:bg-slate-800/50 hover:text-white"
              }`}
            >
              <Icon 
                className={`w-5 h-5 transition-colors ${
                  isActive ? "text-indigo-400" : "text-slate-500 group-hover:text-indigo-400"
                }`} 
              />
              <span className="font-medium text-sm">{item.name}</span>
            </Link>
          );
        })}
      </nav>

      <div className="mt-auto">
        <Link
          href="/settings"
          className="flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all hover:bg-slate-800/50 hover:text-white group"
        >
          <Settings className="w-5 h-5 text-slate-500 group-hover:text-slate-300" />
          <span className="font-medium text-sm">Paramètres</span>
        </Link>
      </div>
    </div>
  );
}
