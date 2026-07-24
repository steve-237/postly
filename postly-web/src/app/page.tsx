import { BarChart3, TrendingUp, CalendarDays, Activity } from "lucide-react";
import { prisma } from "@/lib/prisma";
import Link from "next/link";
import { formatDistanceToNow } from "date-fns";
import { fr } from "date-fns/locale";

export default async function Home() {
  // Récupérer les vraies données de la base
  const totalPosts = await prisma.post.count();
  const publishedPosts = await prisma.post.count({ where: { status: 'PUBLISHED' } });
  const scheduledPosts = await prisma.post.count({ where: { status: 'SCHEDULED' } });
  const totalAccounts = await prisma.account.count();

  const recentPosts = await prisma.post.findMany({
    take: 5,
    orderBy: { createdAt: 'desc' },
    include: { media: true }
  });

  return (
    <div className="max-w-6xl mx-auto space-y-8">
      <div>
        <h1 className="text-3xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-slate-800 to-slate-500 tracking-tight">Vue d'ensemble</h1>
        <p className="text-slate-500 mt-2 font-medium">Voici l'état actuel de votre machine à publier.</p>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {[
          { title: "Posts publiés", value: publishedPosts, trend: "Au total", icon: Activity, color: "text-blue-500", bg: "bg-blue-100" },
          { title: "Posts planifiés", value: scheduledPosts, trend: "En attente", icon: CalendarDays, color: "text-purple-500", bg: "bg-purple-100" },
          { title: "Total rédigés", value: totalPosts, trend: "Brouillons inclus", icon: TrendingUp, color: "text-emerald-500", bg: "bg-emerald-100" },
          { title: "Comptes liés", value: totalAccounts, trend: "Actifs natifs", icon: BarChart3, color: "text-orange-500", bg: "bg-orange-100" },
        ].map((stat, i) => {
          const Icon = stat.icon;
          return (
            <div key={i} className="bg-white rounded-[2rem] p-7 shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-slate-100 flex items-center justify-between group hover:shadow-xl hover:-translate-y-1 transition-all duration-300">
              <div>
                <p className="text-sm font-bold text-slate-500 mb-1">{stat.title}</p>
                <p className="text-3xl font-extrabold text-slate-800">{stat.value}</p>
                <p className="text-xs font-semibold text-slate-400 mt-2 uppercase tracking-wide">{stat.trend}</p>
              </div>
              <div className={`w-14 h-14 rounded-2xl ${stat.bg} flex items-center justify-center shadow-lg shadow-${stat.color.replace('text-', '')}/20`}>
                <Icon className={`w-7 h-7 ${stat.color}`} />
              </div>
            </div>
          );
        })}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Recent Posts */}
        <div className="lg:col-span-2 bg-white rounded-[2rem] shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-slate-100 p-8">
          <h2 className="text-xl font-bold text-slate-800 mb-6">Dernières publications</h2>
          <div className="space-y-4">
            {recentPosts.length === 0 ? (
              <div className="text-center py-12 bg-slate-50 rounded-3xl border border-dashed border-slate-200">
                <p className="text-slate-500 font-medium">Aucun post n'a été créé pour le moment.</p>
              </div>
            ) : (
              recentPosts.map((post) => (
                <div key={post.id} className="flex items-center gap-5 p-5 rounded-2xl border border-slate-100 hover:bg-slate-50 transition-colors group">
                  <div className="w-14 h-14 rounded-xl bg-slate-100 flex-shrink-0 overflow-hidden flex items-center justify-center text-slate-400">
                    {post.media && post.media.length > 0 ? (
                      post.media[0].type === "IMAGE" ? (
                        <img src={post.media[0].url} alt="media" className="w-full h-full object-cover" />
                      ) : (
                        <div className="text-xs font-bold">Vidéo</div>
                      )
                    ) : (
                      <span className="text-sm font-bold uppercase">{post.text?.substring(0, 2) || "TXT"}</span>
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className="text-sm font-bold text-slate-800 truncate">{post.text || "Publication sans texte"}</h3>
                    <p className="text-xs font-medium text-slate-500 mt-1">
                      {formatDistanceToNow(new Date(post.createdAt), { addSuffix: true, locale: fr })}
                    </p>
                  </div>
                  <div className={`px-4 py-1.5 rounded-full text-xs font-bold ${
                    post.status === 'PUBLISHED' ? 'bg-emerald-100 text-emerald-700' :
                    post.status === 'SCHEDULED' ? 'bg-purple-100 text-purple-700' :
                    post.status === 'FAILED' ? 'bg-red-100 text-red-700' :
                    'bg-slate-100 text-slate-600'
                  }`}>
                    {post.status}
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Quick Actions */}
        <div className="bg-white rounded-[2rem] shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-slate-100 p-8">
          <h2 className="text-xl font-bold text-slate-800 mb-6">Actions Rapides</h2>
          <div className="space-y-4">
            <Link href="/compose" className="w-full flex items-center justify-center gap-2 py-4 px-4 rounded-2xl bg-slate-900 hover:bg-black text-white font-bold transition-all shadow-lg shadow-slate-900/20 active:scale-95 hover:-translate-y-1">
              Créer un nouveau post
            </Link>
            <Link href="/compose" className="w-full flex items-center justify-center gap-2 py-4 px-4 rounded-2xl bg-white border-2 border-indigo-100 hover:border-indigo-500 hover:text-indigo-600 text-slate-700 font-bold transition-all hover:-translate-y-1 shadow-sm">
              Générer avec l'IA
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
