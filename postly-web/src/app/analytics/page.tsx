import { prisma } from "@/lib/prisma";
import { BarChart3, TrendingUp, TrendingDown, Activity, CheckCircle, Clock, AlertCircle, FileEdit } from "lucide-react";

async function getStats() {
  const [total, published, scheduled, draft, failed, last7, last30] = await Promise.all([
    prisma.post.count(),
    prisma.post.count({ where: { status: "PUBLISHED" } }),
    prisma.post.count({ where: { status: "SCHEDULED" } }),
    prisma.post.count({ where: { status: "DRAFT" } }),
    prisma.post.count({ where: { status: "FAILED" } }),
    prisma.post.count({
      where: { createdAt: { gte: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000) } },
    }),
    prisma.post.count({
      where: { createdAt: { gte: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000) } },
    }),
  ]);

  // Posts par jour sur les 7 derniers jours
  const days = Array.from({ length: 7 }, (_, i) => {
    const d = new Date();
    d.setDate(d.getDate() - (6 - i));
    d.setHours(0, 0, 0, 0);
    return d;
  });

  const dailyCounts = await Promise.all(
    days.map(async (dayStart) => {
      const dayEnd = new Date(dayStart);
      dayEnd.setDate(dayEnd.getDate() + 1);
      const count = await prisma.post.count({
        where: { createdAt: { gte: dayStart, lt: dayEnd } },
      });
      return {
        date: dayStart.toLocaleDateString("fr-FR", { weekday: "short", day: "numeric" }),
        count,
      };
    })
  );

  const successRate = total > 0 ? Math.round((published / total) * 100) : 0;

  return { total, published, scheduled, draft, failed, last7, last30, dailyCounts, successRate };
}

export default async function AnalyticsPage() {
  const stats = await getStats();
  const maxCount = Math.max(...stats.dailyCounts.map((d) => d.count), 1);

  const kpis = [
    {
      label: "Publications réussies",
      value: stats.published,
      sub: `${stats.successRate}% de succès`,
      icon: CheckCircle,
      color: "text-emerald-600 dark:text-emerald-400",
      bg: "bg-emerald-50 dark:bg-emerald-900/30",
      border: "border-emerald-100 dark:border-emerald-800",
    },
    {
      label: "En attente",
      value: stats.scheduled,
      sub: "Posts planifiés",
      icon: Clock,
      color: "text-violet-600 dark:text-violet-400",
      bg: "bg-violet-50 dark:bg-violet-900/30",
      border: "border-violet-100 dark:border-violet-800",
    },
    {
      label: "Brouillons",
      value: stats.draft,
      sub: "À finaliser",
      icon: FileEdit,
      color: "text-amber-600 dark:text-amber-400",
      bg: "bg-amber-50 dark:bg-amber-900/30",
      border: "border-amber-100 dark:border-amber-800",
    },
    {
      label: "Échecs",
      value: stats.failed,
      sub: "À retraiter",
      icon: AlertCircle,
      color: "text-red-600 dark:text-red-400",
      bg: "bg-red-50 dark:bg-red-900/30",
      border: "border-red-100 dark:border-red-800",
    },
  ];

  return (
    <div className="max-w-6xl mx-auto space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-slate-800 to-slate-500 dark:from-white dark:to-slate-400 tracking-tight">
          Statistiques
        </h1>
        <p className="text-slate-500 dark:text-slate-400 mt-2 font-medium">
          Analyse de vos performances éditoriales.
        </p>
      </div>

      {/* Volume summary */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-gradient-to-br from-slate-900 to-indigo-900 dark:from-slate-800 dark:to-indigo-950 rounded-3xl p-6 text-white shadow-xl shadow-indigo-900/20 md:col-span-1">
          <p className="text-slate-400 text-sm font-bold uppercase tracking-wider mb-1">Total créés</p>
          <p className="text-6xl font-black">{stats.total}</p>
          <p className="text-slate-400 mt-2 text-sm font-medium">publications au total</p>
          <div className="mt-4 flex gap-4">
            <div>
              <p className="text-xs text-slate-400 font-bold uppercase tracking-wider">7 jours</p>
              <p className="text-2xl font-bold text-indigo-300 dark:text-indigo-400">{stats.last7}</p>
            </div>
            <div>
              <p className="text-xs text-slate-400 font-bold uppercase tracking-wider">30 jours</p>
              <p className="text-2xl font-bold text-indigo-300 dark:text-indigo-400">{stats.last30}</p>
            </div>
          </div>
        </div>

        <div className="md:col-span-2 grid grid-cols-2 gap-4">
          {kpis.map((kpi) => {
            const Icon = kpi.icon;
            return (
              <div
                key={kpi.label}
                className={`bg-white dark:bg-slate-900 rounded-3xl p-5 shadow-[0_4px_20px_rgb(0,0,0,0.04)] dark:shadow-none border ${kpi.border} flex items-center gap-4 hover:shadow-lg hover:-translate-y-0.5 transition-all duration-300`}
              >
                <div className={`w-12 h-12 rounded-2xl ${kpi.bg} flex items-center justify-center shrink-0`}>
                  <Icon className={`w-6 h-6 ${kpi.color}`} />
                </div>
                <div>
                  <p className="text-2xl font-black text-slate-800 dark:text-white">{kpi.value}</p>
                  <p className="text-xs font-bold text-slate-500 dark:text-slate-400">{kpi.label}</p>
                  <p className="text-[10px] text-slate-400 mt-0.5 font-medium">{kpi.sub}</p>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Graphique 7 jours */}
      <div className="bg-white dark:bg-slate-900 rounded-3xl shadow-[0_8px_30px_rgb(0,0,0,0.04)] dark:shadow-none border border-slate-100 dark:border-slate-800 p-8">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-xl font-bold text-slate-800 dark:text-white">Activité des 7 derniers jours</h2>
            <p className="text-sm text-slate-500 dark:text-slate-400 mt-1 font-medium">Nombre de posts créés par jour</p>
          </div>
          <div className="flex items-center gap-2 bg-slate-100 dark:bg-slate-800 px-3 py-1.5 rounded-full">
            <Activity className="w-4 h-4 text-slate-500 dark:text-slate-400" />
            <span className="text-xs font-bold text-slate-600 dark:text-slate-300">7 jours</span>
          </div>
        </div>

        {stats.total === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 text-slate-400">
            <BarChart3 className="w-12 h-12 mb-3 opacity-30" />
            <p className="font-medium text-slate-500 dark:text-slate-400">Aucune donnée disponible</p>
            <p className="text-sm mt-1">Créez votre premier post pour voir les statistiques.</p>
          </div>
        ) : (
          <div className="flex items-end gap-3 h-48">
            {stats.dailyCounts.map((day) => (
              <div key={day.date} className="flex-1 flex flex-col items-center gap-2">
                <span className="text-xs font-bold text-slate-600 dark:text-slate-300">{day.count > 0 ? day.count : ""}</span>
                <div className="w-full relative rounded-xl overflow-hidden bg-slate-100 dark:bg-slate-800" style={{ height: "120px" }}>
                  <div
                    className="absolute bottom-0 w-full bg-gradient-to-t from-indigo-600 to-indigo-400 dark:from-indigo-500 dark:to-indigo-400 rounded-xl transition-all duration-700"
                    style={{ height: `${(day.count / maxCount) * 100}%`, minHeight: day.count > 0 ? "8px" : "0" }}
                  />
                </div>
                <span className="text-[10px] font-bold text-slate-400 text-center leading-tight">{day.date}</span>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Répartition statuts */}
      <div className="bg-white dark:bg-slate-900 rounded-3xl shadow-[0_8px_30px_rgb(0,0,0,0.04)] dark:shadow-none border border-slate-100 dark:border-slate-800 p-8">
        <h2 className="text-xl font-bold text-slate-800 dark:text-white mb-6">Répartition par statut</h2>
        <div className="space-y-4">
          {[
            { label: "Publiés", count: stats.published, color: "bg-emerald-500", text: "text-emerald-700 dark:text-emerald-400" },
            { label: "Planifiés", count: stats.scheduled, color: "bg-violet-500", text: "text-violet-700 dark:text-violet-400" },
            { label: "Brouillons", count: stats.draft, color: "bg-amber-400", text: "text-amber-700 dark:text-amber-400" },
            { label: "Échecs", count: stats.failed, color: "bg-red-500", text: "text-red-700 dark:text-red-400" },
          ].map((item) => (
            <div key={item.label} className="flex items-center gap-4">
              <span className="w-24 text-sm font-bold text-slate-600 dark:text-slate-300 shrink-0">{item.label}</span>
              <div className="flex-1 bg-slate-100 dark:bg-slate-800 rounded-full h-3 overflow-hidden">
                <div
                  className={`h-full rounded-full ${item.color} transition-all duration-700`}
                  style={{ width: stats.total > 0 ? `${(item.count / stats.total) * 100}%` : "0%" }}
                />
              </div>
              <span className={`w-8 text-sm font-black ${item.text}`}>{item.count}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
