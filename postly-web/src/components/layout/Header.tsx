"use client";

import { Bell, Search, Settings, ChevronDown, Command, Sparkles, HelpCircle, Moon, Sun } from "lucide-react";
import { useState, useEffect } from "react";
import Link from "next/link";
import { useTheme } from "next-themes";

export function Header() {
  const [scrolled, setScrolled] = useState(false);
  const [workspaceName, setWorkspaceName] = useState("Mon Espace");
  const { theme, setTheme, systemTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    const handleScroll = () => {
      setScrolled(window.scrollY > 10);
    };
    window.addEventListener("scroll", handleScroll);
    
    const wn = localStorage.getItem("postly_workspace_name");
    if (wn) setWorkspaceName(wn);

    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const currentTheme = theme === "system" ? systemTheme : theme;

  return (
    <header 
      className={`h-20 sticky top-0 z-50 flex items-center justify-between px-8 transition-all duration-300 ${
        scrolled 
          ? "bg-white/80 dark:bg-slate-950/80 backdrop-blur-xl border-b border-slate-200/60 dark:border-slate-800/60 shadow-sm" 
          : "bg-transparent border-b border-transparent"
      }`}
    >
      
      {/* Partie Gauche : Contexte / Breadcrumb */}
      <div className="flex items-center gap-4">
        {/* Workspace Dropdown */}
        <button className="flex items-center gap-3 px-3 py-2 rounded-2xl hover:bg-white dark:hover:bg-slate-900 hover:shadow-sm transition-all border border-transparent hover:border-slate-200 dark:hover:border-slate-800 group">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-indigo-600 to-purple-600 flex items-center justify-center text-white shadow-md shadow-indigo-500/20 group-hover:scale-105 transition-transform">
            <span className="font-extrabold text-lg">W</span>
          </div>
          <div className="flex flex-col items-start">
            <span className="text-[10px] font-extrabold text-slate-400 dark:text-slate-500 uppercase tracking-widest leading-none mb-1">Espace de travail</span>
            <div className="flex items-center gap-1.5">
              <span className="font-extrabold text-slate-800 dark:text-slate-100 text-[15px] leading-none">{workspaceName}</span>
              <ChevronDown className="w-4 h-4 text-slate-400 group-hover:text-slate-700 dark:group-hover:text-slate-300 transition-colors" />
            </div>
          </div>
        </button>
        
        <div className="hidden md:flex items-center">
           <span className="text-slate-300 dark:text-slate-700 mx-2">/</span>
           <span className="px-2.5 py-1 rounded-md bg-indigo-50 dark:bg-indigo-900/30 border border-indigo-100 dark:border-indigo-800 text-[10px] font-black text-indigo-600 dark:text-indigo-400 tracking-wider shadow-sm">
             PRO PLAN
           </span>
        </div>
      </div>

      {/* Barre de recherche Centrale */}
      <div className="hidden lg:flex flex-1 max-w-lg mx-8">
        <div className="relative w-full flex items-center group">
          <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
            <Search className="h-4 w-4 text-slate-400 group-focus-within:text-indigo-500 transition-colors" />
          </div>
          <input
            type="text"
            className="block w-full pl-11 pr-16 py-3 border-transparent bg-white/50 dark:bg-slate-900/50 backdrop-blur-sm rounded-2xl text-sm font-medium text-slate-800 dark:text-slate-100 placeholder-slate-400 dark:placeholder-slate-500 focus:bg-white dark:focus:bg-slate-900 focus:border-indigo-300 dark:focus:border-indigo-500/50 focus:ring-4 focus:ring-indigo-500/10 transition-all duration-300 outline-none shadow-[0_2px_10px_rgb(0,0,0,0.02)] hover:shadow-[0_4px_15px_rgb(0,0,0,0.04)] border border-slate-200/60 dark:border-slate-800"
            placeholder="Rechercher des publications, médias..."
          />
          <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
            <span className="text-slate-400 dark:text-slate-500 text-xs font-bold bg-white dark:bg-slate-800 px-2 py-1 rounded-lg border border-slate-200 dark:border-slate-700 shadow-sm flex items-center gap-1">
              <Command className="w-3 h-3" /> K
            </span>
          </div>
        </div>
      </div>

      {/* Partie Droite : Actions et Profil */}
      <div className="flex items-center gap-6">
        
        {/* IA Button */}
        <Link href="/compose" className="hidden md:flex items-center gap-2 px-5 py-2.5 bg-gradient-to-r from-indigo-50 to-purple-50 dark:from-indigo-900/20 dark:to-purple-900/20 hover:from-indigo-100 hover:to-purple-100 dark:hover:from-indigo-900/40 dark:hover:to-purple-900/40 text-indigo-700 dark:text-indigo-300 rounded-xl font-bold text-sm transition-all shadow-sm border border-indigo-200/50 dark:border-indigo-500/30 hover:border-indigo-300 dark:hover:border-indigo-400/50 active:scale-95">
          <Sparkles className="w-4 h-4 text-purple-500 dark:text-purple-400" />
          Créer
        </Link>

        <div className="flex items-center gap-2">
          {mounted && (
            <button 
              onClick={() => setTheme(currentTheme === "dark" ? "light" : "dark")}
              className="p-2.5 text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 hover:bg-white dark:hover:bg-slate-800 hover:shadow-sm rounded-xl transition-all border border-transparent hover:border-slate-200 dark:hover:border-slate-700 relative group"
            >
              {currentTheme === "dark" ? (
                <Sun className="w-5 h-5 group-hover:rotate-45 transition-transform duration-300 text-amber-500" />
              ) : (
                <Moon className="w-5 h-5 group-hover:-rotate-12 transition-transform duration-300 text-indigo-500" />
              )}
            </button>
          )}

          <button className="p-2.5 text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 hover:bg-white dark:hover:bg-slate-800 hover:shadow-sm rounded-xl transition-all border border-transparent hover:border-slate-200 dark:hover:border-slate-700 relative group">
            <HelpCircle className="w-5 h-5 group-hover:scale-110 transition-transform" />
          </button>
          
          <Link href="/settings" className="p-2.5 text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 hover:bg-white dark:hover:bg-slate-800 hover:shadow-sm rounded-xl transition-all border border-transparent hover:border-slate-200 dark:hover:border-slate-700 relative group">
            <Settings className="w-5 h-5 group-hover:rotate-45 transition-transform duration-300" />
          </Link>

          <button className="p-2.5 text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 hover:bg-white dark:hover:bg-slate-800 hover:shadow-sm rounded-xl transition-all border border-transparent hover:border-slate-200 dark:hover:border-slate-700 relative group">
            <Bell className="w-5 h-5 group-hover:scale-110 transition-transform" />
            <span className="absolute top-2.5 right-2.5 w-2 h-2 bg-red-500 border-2 border-white dark:border-slate-900 rounded-full"></span>
          </button>
        </div>

        {/* Séparateur */}
        <div className="h-8 w-px bg-slate-200 dark:bg-slate-800"></div>

        {/* Profil Utilisateur */}
        <button className="flex items-center gap-3 p-1.5 pr-4 rounded-2xl hover:bg-white dark:hover:bg-slate-900 hover:shadow-sm transition-all border border-transparent hover:border-slate-200 dark:hover:border-slate-800">
          <div className="w-10 h-10 rounded-xl bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 flex items-center justify-center overflow-hidden shadow-sm">
            <img src="https://api.dicebear.com/7.x/avataaars/svg?seed=Postly&backgroundColor=f8fafc" alt="Avatar" className="w-full h-full object-cover" />
          </div>
          <div className="hidden md:flex flex-col items-start">
            <span className="text-sm font-extrabold text-slate-800 dark:text-slate-100 leading-none mb-1">Cyrax</span>
            <span className="text-xs font-bold text-slate-400 dark:text-slate-500 leading-none">Administrateur</span>
          </div>
          <ChevronDown className="w-4 h-4 text-slate-400 ml-1" />
        </button>

      </div>
    </header>
  );
}
