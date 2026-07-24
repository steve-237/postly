"use client";

import { Bell, Search, UserCircle, Settings, ChevronDown } from "lucide-react";

export function Header() {
  return (
    <header className="h-14 bg-white border-b border-slate-200 flex items-center justify-between px-6 sticky top-0 z-50 shrink-0">
      
      {/* Breadcrumb / Title (Gauche) */}
      <div className="flex items-center gap-3">
        <div className="w-7 h-7 rounded-md bg-slate-900 flex items-center justify-center">
          <div className="w-2 h-2 bg-white rounded-full"></div>
        </div>
        <div className="flex items-center gap-2 text-sm">
          <span className="font-semibold text-slate-800">Postly</span>
          <span className="text-slate-300">/</span>
          <span className="font-medium text-slate-600">Workspace</span>
          <span className="ml-2 px-1.5 py-0.5 rounded-md bg-slate-100 border border-slate-200 text-[10px] font-semibold text-slate-500 leading-none">PRO</span>
        </div>
      </div>

      {/* Barre de recherche (Centre) */}
      <div className="absolute left-1/2 -translate-x-1/2 w-full max-w-[400px] hidden md:flex items-center gap-2 bg-slate-50 hover:bg-slate-100 border border-slate-200 rounded-md px-3 py-1.5 focus-within:bg-white focus-within:border-blue-500 focus-within:ring-1 focus-within:ring-blue-500 transition-colors">
        <Search className="w-4 h-4 text-slate-400" />
        <input 
          type="text" 
          placeholder="Rechercher..." 
          className="bg-transparent border-none outline-none text-[13px] w-full placeholder:text-slate-500 text-slate-900"
        />
        <div className="flex items-center gap-1 shrink-0">
          <span className="px-1.5 py-0.5 bg-white border border-slate-200 rounded text-[10px] font-medium text-slate-500">⌘K</span>
        </div>
      </div>

      {/* Actions & Profil (Droite) */}
      <div className="flex items-center gap-4">
        
        <div className="flex items-center gap-2">
          <button className="text-slate-500 hover:text-slate-800 hover:bg-slate-100 p-1.5 rounded-md transition-colors">
            <Settings className="w-4 h-4" />
          </button>
          <button className="relative text-slate-500 hover:text-slate-800 hover:bg-slate-100 p-1.5 rounded-md transition-colors">
            <Bell className="w-4 h-4" />
            <span className="absolute top-1.5 right-1.5 w-1.5 h-1.5 bg-blue-500 rounded-full"></span>
          </button>
        </div>
        
        <div className="h-4 w-[1px] bg-slate-200"></div>

        <button className="flex items-center gap-2 hover:bg-slate-50 p-1 pr-2 rounded-md transition-colors border border-transparent hover:border-slate-200">
          <div className="w-6 h-6 rounded-full bg-blue-600 flex items-center justify-center text-white text-[11px] font-bold">
            C
          </div>
          <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
        </button>
      </div>
    </header>
  );
}
