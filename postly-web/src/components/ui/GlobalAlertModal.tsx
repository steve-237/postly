"use client";

import { useAlertStore } from "@/store/useAlertStore";
import { AlertTriangle, CheckCircle2, Info, XCircle, X } from "lucide-react";
import { useEffect } from "react";

export function GlobalAlertModal() {
  const { alert, closeAlert } = useAlertStore();

  // Fermeture sur la touche Échap
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape" && alert) {
        closeAlert();
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [alert, closeAlert]);

  if (!alert) return null;

  const isError = alert.type === "error";
  const isSuccess = alert.type === "success";
  const isWarning = alert.type === "warning";
  const isInfo = alert.type === "info";

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 dark:bg-black/60 backdrop-blur-sm p-4 animate-in fade-in duration-200">
      <div className="bg-white dark:bg-slate-900 rounded-[2rem] w-full max-w-md shadow-[0_20px_60px_rgb(0,0,0,0.15)] dark:shadow-black/50 overflow-hidden flex flex-col border border-white/80 dark:border-slate-800 ring-1 ring-black/5 dark:ring-white/5 scale-100 animate-in zoom-in-95 duration-200">
        
        {/* Header avec Icône */}
        <div className="p-6 pb-4 flex items-center justify-between">
          <div className="flex items-center gap-3.5">
            <div
              className={`w-12 h-12 rounded-2xl flex items-center justify-center shrink-0 shadow-sm ${
                isError
                  ? "bg-red-50 dark:bg-red-900/30 text-red-600 dark:text-red-400 border border-red-100 dark:border-red-800"
                  : isSuccess
                  ? "bg-emerald-50 dark:bg-emerald-900/30 text-emerald-600 dark:text-emerald-400 border border-emerald-100 dark:border-emerald-800"
                  : isWarning
                  ? "bg-amber-50 dark:bg-amber-900/30 text-amber-600 dark:text-amber-400 border border-amber-100 dark:border-amber-800"
                  : "bg-indigo-50 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-400 border border-indigo-100 dark:border-indigo-800"
              }`}
            >
              {isError && <XCircle className="w-6 h-6" />}
              {isSuccess && <CheckCircle2 className="w-6 h-6" />}
              {isWarning && <AlertTriangle className="w-6 h-6" />}
              {isInfo && <Info className="w-6 h-6" />}
            </div>
            <div>
              <span
                className={`text-[11px] font-extrabold uppercase tracking-widest block mb-0.5 ${
                  isError
                    ? "text-red-500"
                    : isSuccess
                    ? "text-emerald-500"
                    : isWarning
                    ? "text-amber-500"
                    : "text-indigo-500"
                }`}
              >
                {isError
                  ? "Message d'erreur"
                  : isSuccess
                  ? "Confirmation"
                  : isWarning
                  ? "Attention"
                  : "Information"}
              </span>
              <h3 className="text-lg font-extrabold text-slate-800 dark:text-white leading-tight">
                {alert.title}
              </h3>
            </div>
          </div>
          <button
            onClick={closeAlert}
            className="p-2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-full transition-colors self-start"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Contenu du message */}
        <div className="px-6 py-4">
          <p className="text-slate-600 dark:text-slate-300 text-[15px] leading-relaxed font-medium bg-slate-50/80 dark:bg-slate-800/50 p-4 rounded-2xl border border-slate-100 dark:border-slate-700 whitespace-pre-wrap">
            {alert.message}
          </p>
        </div>

        {/* Bouton de confirmation */}
        <div className="p-6 pt-4 flex justify-end">
          <button
            onClick={closeAlert}
            className={`w-full py-3.5 px-6 rounded-2xl font-bold text-white transition-all duration-200 shadow-lg active:scale-95 hover:shadow-xl ${
              isError
                ? "bg-gradient-to-r from-red-600 to-rose-600 hover:from-red-500 hover:to-rose-500 shadow-red-500/20"
                : isSuccess
                ? "bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 shadow-emerald-500/20"
                : isWarning
                ? "bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-400 hover:to-orange-400 shadow-amber-500/20 text-slate-900 font-extrabold"
                : "bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 shadow-indigo-500/20"
            }`}
          >
            Compris
          </button>
        </div>
      </div>
    </div>
  );
}
