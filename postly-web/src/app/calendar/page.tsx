import { prisma } from "@/lib/prisma";
import { format } from "date-fns";
import { fr } from "date-fns/locale";
import { Clock, CheckCircle2, AlertCircle, Calendar as CalendarIcon, Filter } from "lucide-react";
import { CalendarGrid } from "./CalendarGrid";

export default async function CalendarPage() {
  const posts = await prisma.post.findMany({
    orderBy: { createdAt: "desc" },
    include: { media: true },
  });

  return (
    <div className="max-w-6xl mx-auto space-y-10 pb-10">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
        <div>
          <h1 className="text-4xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-slate-800 to-slate-500 dark:from-white dark:to-slate-400 tracking-tight">Calendrier</h1>
          <p className="text-slate-500 dark:text-slate-400 mt-2 text-lg font-medium">Vue d'ensemble de vos publications du mois.</p>
        </div>
        <button className="flex items-center gap-2 px-5 py-2.5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl text-sm font-bold text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-800 hover:border-slate-300 dark:hover:border-slate-700 transition-all shadow-sm active:scale-95">
          <Filter className="w-4 h-4" />
          Filtrer
        </button>
      </div>

      {/* Grid Calendrier (Client Component avec Drag & Drop) */}
      <CalendarGrid initialPosts={posts} />

      {/* Historique détaillé (Liste) */}
      <div className="pt-6">
        <h2 className="text-2xl font-extrabold text-slate-800 dark:text-white mb-6 flex items-center gap-3">
          <Clock className="w-6 h-6 text-slate-400 dark:text-slate-500" /> Historique détaillé
        </h2>
        
        <div className="bg-white dark:bg-slate-900 rounded-[2rem] shadow-[0_8px_30px_rgb(0,0,0,0.04)] dark:shadow-none border border-slate-100 dark:border-slate-800 p-8">
          {posts.length === 0 ? (
            <div className="text-center py-16">
              <div className="w-16 h-16 mx-auto bg-slate-50 dark:bg-slate-800/50 rounded-full flex items-center justify-center mb-4 border border-slate-100 dark:border-slate-700">
                <CalendarIcon className="w-8 h-8 text-slate-400 dark:text-slate-500" />
              </div>
              <h3 className="text-lg font-bold text-slate-800 dark:text-white">Aucune publication</h3>
              <p className="text-slate-500 dark:text-slate-400 mt-1 max-w-sm mx-auto">Vous n'avez pas encore créé de publication.</p>
            </div>
          ) : (
            <div className="space-y-6">
              {posts.map((post) => {
                const isPublished = post.status === "PUBLISHED";
                const isScheduled = post.status === "SCHEDULED";
                const isFailed = post.status === "FAILED";

                return (
                  <div key={post.id} className="group relative flex gap-6 pb-6 border-b border-slate-100 dark:border-slate-800 last:border-0 last:pb-0">
                    
                    {/* Status Indicator (Left) */}
                    <div className="flex flex-col items-center">
                      <div className={`w-12 h-12 rounded-2xl flex items-center justify-center shrink-0 border-4 border-white dark:border-slate-900 shadow-sm ${
                        isPublished ? "bg-emerald-100 dark:bg-emerald-900/30 text-emerald-600 dark:text-emerald-400" :
                        isScheduled ? "bg-purple-100 dark:bg-purple-900/30 text-purple-600 dark:text-purple-400" :
                        isFailed ? "bg-red-100 dark:bg-red-900/30 text-red-600 dark:text-red-400" :
                        "bg-amber-100 dark:bg-amber-900/30 text-amber-600 dark:text-amber-400"
                      }`}>
                        {isPublished ? <CheckCircle2 className="w-6 h-6" /> : 
                         isScheduled ? <Clock className="w-6 h-6" /> : 
                         isFailed ? <AlertCircle className="w-6 h-6" /> : 
                         <CalendarIcon className="w-6 h-6" />}
                      </div>
                      <div className="w-[2px] h-full bg-slate-100 dark:bg-slate-800 mt-3 group-last:hidden"></div>
                    </div>

                    {/* Content (Right) */}
                    <div className="flex-1 pt-1 pb-4">
                      <div className="flex items-start justify-between gap-4">
                        <div>
                          <div className="flex items-center gap-2 mb-2">
                            <span className="text-sm font-extrabold text-slate-800 dark:text-slate-200">
                              {format(new Date(post.createdAt), "EEEE d MMMM yyyy", { locale: fr })}
                            </span>
                            <span className="text-slate-300 dark:text-slate-600">•</span>
                            <span className="text-sm font-bold text-slate-500 dark:text-slate-400">
                              {format(new Date(post.createdAt), "HH:mm")}
                            </span>
                            <span className={`ml-3 px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest ${
                              isPublished ? "bg-emerald-50 dark:bg-emerald-900/20 text-emerald-700 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800" :
                              isScheduled ? "bg-purple-50 dark:bg-purple-900/20 text-purple-700 dark:text-purple-400 border border-purple-200 dark:border-purple-800" :
                              isFailed ? "bg-red-50 dark:bg-red-900/20 text-red-700 dark:text-red-400 border border-red-200 dark:border-red-800" :
                              "bg-amber-50 dark:bg-amber-900/20 text-amber-700 dark:text-amber-400 border border-amber-200 dark:border-amber-800"
                            }`}>
                              {post.status}
                            </span>
                          </div>
                          <p className="text-slate-700 dark:text-slate-300 text-base leading-relaxed whitespace-pre-wrap font-medium">
                            {post.text || <span className="italic text-slate-400 dark:text-slate-500">Publication sans texte</span>}
                          </p>
                        </div>
                      </div>

                      {/* Médias attachés */}
                      {post.media && post.media.length > 0 && (
                        <div className="mt-5 flex gap-3">
                          {post.media.map((m: any) => (
                            <div key={m.id} className="relative w-32 h-32 rounded-2xl border border-slate-200 dark:border-slate-700 overflow-hidden group/media shadow-sm">
                              {m.type === "IMAGE" ? (
                                <img src={m.url} alt="media" className="w-full h-full object-cover transition-transform duration-500 group-hover/media:scale-110" />
                              ) : (
                                <div className="w-full h-full bg-slate-900 flex items-center justify-center text-white text-xs font-bold">VIDÉO</div>
                              )}
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
