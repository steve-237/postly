"use client";

import { useState } from "react";
import { format, isSameDay, isToday, startOfMonth, endOfMonth, eachDayOfInterval, getDay } from "date-fns";
import { fr } from "date-fns/locale";
import { DndContext, useDraggable, useDroppable, DragEndEvent, MouseSensor, TouchSensor, useSensor, useSensors } from "@dnd-kit/core";
import { useAlertStore } from "@/store/useAlertStore";

type Post = any;

function DraggablePost({ post }: { post: Post }) {
  const { attributes, listeners, setNodeRef, transform, isDragging } = useDraggable({
    id: post.id,
    data: { post },
  });

  const style = transform ? {
    transform: `translate3d(${transform.x}px, ${transform.y}px, 0)`,
    zIndex: isDragging ? 50 : 1,
    opacity: isDragging ? 0.8 : 1,
    boxShadow: isDragging ? "0 20px 25px -5px rgb(0 0 0 / 0.1), 0 8px 10px -6px rgb(0 0 0 / 0.1)" : "none",
  } : undefined;

  const isPublished = post.status === "PUBLISHED";
  const isScheduled = post.status === "SCHEDULED";
  const isFailed = post.status === "FAILED";

  return (
    <div
      ref={setNodeRef}
      style={style}
      {...listeners}
      {...attributes}
      className={`px-2 py-1.5 rounded-lg text-[11px] font-bold truncate border shadow-sm transition-transform hover:scale-[1.02] cursor-grab active:cursor-grabbing relative ${
        isPublished ? "bg-emerald-50 text-emerald-700 border-emerald-200/60" :
        isScheduled ? "bg-purple-50 text-purple-700 border-purple-200/60" :
        isFailed ? "bg-red-50 text-red-700 border-red-200/60" :
        "bg-amber-50 text-amber-700 border-amber-200/60"
      }`}
      title={post.text || "Post sans texte"}
    >
      {format(new Date(post.createdAt), "HH:mm")} • {post.text?.substring(0, 15) || "Média..."}
    </div>
  );
}

function DroppableDay({ day, posts }: { day: Date; posts: Post[] }) {
  const isCurrentDay = isToday(day);
  const { setNodeRef, isOver } = useDroppable({
    id: day.toISOString(),
    data: { day },
  });

  return (
    <div 
      ref={setNodeRef}
      className={`border-b border-r border-slate-100 p-2.5 min-h-[130px] transition-colors group relative ${
        isOver ? "bg-indigo-50/60 ring-2 ring-indigo-400 ring-inset" : 
        isCurrentDay ? "bg-indigo-50/30 hover:bg-slate-50" : "hover:bg-slate-50"
      }`}
    >
      <div className="flex justify-between items-start mb-2">
        <span className={`w-8 h-8 flex items-center justify-center rounded-full text-sm font-bold ${
          isCurrentDay ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/30' : 
          'text-slate-600 group-hover:bg-slate-200 transition-colors'
        }`}>
          {format(day, "d")}
        </span>
        {posts.length > 0 && (
          <span className="text-[10px] font-bold text-slate-500 px-2 py-0.5 bg-white border border-slate-200 rounded-md shadow-sm pointer-events-none">
            {posts.length} post{posts.length > 1 ? 's' : ''}
          </span>
        )}
      </div>
      
      <div className="space-y-1.5 mt-3">
        {posts.slice(0, 3).map(post => (
          <DraggablePost key={post.id} post={post} />
        ))}
        {posts.length > 3 && (
          <div className="text-xs text-center font-bold text-slate-400 mt-2 bg-slate-100 rounded-md py-1 pointer-events-none">
            +{posts.length - 3} autres
          </div>
        )}
      </div>
    </div>
  );
}

export function CalendarGrid({ initialPosts }: { initialPosts: Post[] }) {
  const [posts, setPosts] = useState<Post[]>(initialPosts);
  const { showAlert } = useAlertStore();
  
  const today = new Date();
  const firstDay = startOfMonth(today);
  const lastDay = endOfMonth(today);
  const daysInMonth = eachDayOfInterval({ start: firstDay, end: lastDay });
  
  const startOffset = (getDay(firstDay) + 6) % 7;
  const blanks = Array.from({ length: startOffset });

  // Capteurs configurés pour éviter de bloquer le scroll
  const mouseSensor = useSensor(MouseSensor, {
    activationConstraint: { distance: 5 },
  });
  const touchSensor = useSensor(TouchSensor, {
    activationConstraint: { delay: 250, tolerance: 5 },
  });
  const sensors = useSensors(mouseSensor, touchSensor);

  const handleDragEnd = async (event: DragEndEvent) => {
    const { active, over } = event;
    if (!over) return;

    const postId = active.id as string;
    const targetDateIso = over.id as string;
    
    const postToMove = posts.find(p => p.id === postId);
    if (!postToMove) return;

    const originalDate = postToMove.createdAt;
    const targetD = new Date(targetDateIso);
    
    // Si déposé sur le même jour, on ne fait rien
    if (isSameDay(new Date(originalDate), targetD)) return;

    // Optimistic Update
    setPosts(prevPosts => prevPosts.map(p => {
      if (p.id === postId) {
        const newD = new Date(p.createdAt);
        newD.setFullYear(targetD.getFullYear(), targetD.getMonth(), targetD.getDate());
        return { ...p, createdAt: newD };
      }
      return p;
    }));

    try {
      const res = await fetch(`/api/posts/${postId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ newDate: targetDateIso })
      });
      
      const data = await res.json();
      if (!data.success) {
        throw new Error(data.error || "Erreur de sauvegarde");
      }
      // Re-fetch des posts optionnel ici si la liste en bas devait être synchronisée par le serveur
    } catch (error) {
      console.error(error);
      showAlert("Erreur de déplacement", "Impossible de déplacer ce post. Veuillez réessayer.", "error");
      
      // Rollback
      setPosts(prevPosts => prevPosts.map(p => {
        if (p.id === postId) return { ...p, createdAt: originalDate };
        return p;
      }));
    }
  };

  return (
    <div className="bg-white rounded-3xl shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-slate-100 overflow-hidden ring-1 ring-black/[0.02]">
      {/* Mois en cours */}
      <div className="px-6 py-5 border-b border-slate-100 bg-gradient-to-r from-slate-50 to-white flex items-center justify-between">
        <h2 className="text-xl font-extrabold text-slate-800 capitalize">
          {format(today, "MMMM yyyy", { locale: fr })}
        </h2>
        <div className="flex items-center gap-3">
          <span className="flex items-center gap-1.5 text-xs font-bold text-slate-500"><div className="w-2.5 h-2.5 rounded-full bg-emerald-400"></div> Publié</span>
          <span className="flex items-center gap-1.5 text-xs font-bold text-slate-500"><div className="w-2.5 h-2.5 rounded-full bg-purple-400"></div> Planifié</span>
          <span className="flex items-center gap-1.5 text-xs font-bold text-slate-500"><div className="w-2.5 h-2.5 rounded-full bg-amber-400"></div> Brouillon</span>
        </div>
      </div>

      {/* Jours de la semaine */}
      <div className="grid grid-cols-7 border-b border-slate-100 bg-slate-50/80">
        {["Lun", "Mar", "Mer", "Jeu", "Ven", "Sam", "Dim"].map(d => (
          <div key={d} className="py-3 text-center text-xs font-extrabold text-slate-500 uppercase tracking-widest">
            {d}
          </div>
        ))}
      </div>
      
      {/* Grille des jours (Drag & Drop Context) */}
      <DndContext sensors={sensors} onDragEnd={handleDragEnd}>
        <div className="grid grid-cols-7 auto-rows-[minmax(130px,auto)]">
          {blanks.map((_, i) => (
            <div key={`blank-${i}`} className="border-b border-r border-slate-100 bg-slate-50/50 p-2 min-h-[130px]"></div>
          ))}
          
          {daysInMonth.map((day) => {
            const dayPosts = posts.filter(p => isSameDay(new Date(p.createdAt), day));
            return <DroppableDay key={day.toString()} day={day} posts={dayPosts} />;
          })}
        </div>
      </DndContext>
    </div>
  );
}
