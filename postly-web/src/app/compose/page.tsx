"use client";

import { useState, useRef, useEffect } from "react";
import { Sparkles, Image as ImageIcon, Video, Send, Clock, X, Settings2 } from "lucide-react";
import { FaFacebook, FaLinkedin, FaTiktok } from "react-icons/fa";
import { useAlertStore } from "@/store/useAlertStore";

export default function ComposePage() {
  const { showAlert } = useAlertStore();
  const [content, setContent] = useState("");
  const [isGenerating, setIsGenerating] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [isProcessingVideo, setIsProcessingVideo] = useState(false);
  const [mediaUrls, setMediaUrls] = useState<string[]>([]);
  const [scheduledAt, setScheduledAt] = useState<string>("");
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [platforms, setPlatforms] = useState({
    tiktok: true,
    meta: false,
    linkedin: false
  });

  // Nouveaux états pour la gestion de l'IA
  const [aiProvider, setAiProvider] = useState("pollinations"); // pollinations, gemini, openai
  const [apiKey, setApiKey] = useState("");
  const [showAiSettings, setShowAiSettings] = useState(false);

  // Charger la clé API au démarrage si existante
  useEffect(() => {
    const savedKey = localStorage.getItem(`postly_api_key_${aiProvider}`);
    if (savedKey) setApiKey(savedKey);
    else setApiKey("");
  }, [aiProvider]);

  const handleApiKeyChange = (val: string) => {
    setApiKey(val);
    localStorage.setItem(`postly_api_key_${aiProvider}`, val);
  };

  const togglePlatform = (key: keyof typeof platforms) => {
    setPlatforms(prev => ({ ...prev, [key]: !prev[key] }));
  };

  const handleGenerate = async () => {
    if (!content) {
      showAlert("Sujet manquant", "Veuillez d'abord taper un sujet ou une idée dans la zone de texte pour guider l'IA !", "warning");
      return;
    }
    
    setIsGenerating(true);
    try {
      const res = await fetch("/api/ai/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ 
          prompt: content,
          provider: aiProvider,
          apiKey: apiKey
        })
      });
      const data = await res.json();
      
      if (data.error) {
        showAlert("Erreur de l'IA", data.error, "error");
      } else if (data.text) {
        setContent(data.text);
      }
    } catch (error) {
      showAlert("Erreur de génération", "Impossible de contacter le service d'intelligence artificielle. Veuillez réessayer dans quelques instants.", "error");
    } finally {
      setIsGenerating(false);
    }
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const formData = new FormData();
    formData.append("file", file);

    try {
      // 1. Upload initial
      const uploadRes = await fetch("/api/upload", {
        method: "POST",
        body: formData,
      });
      const uploadData = await uploadRes.json();
      
      if (!uploadData.success) {
        showAlert("Échec de l'upload", uploadData.error, "error");
        return;
      }

      let finalUrl = uploadData.url;

      // 2. Si c'est une vidéo, on la traite avec FFmpeg
      if (file.type.startsWith('video/')) {
        setIsProcessingVideo(true);
        try {
          const processRes = await fetch("/api/video", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ mediaUrl: finalUrl })
          });
          const processData = await processRes.json();
          if (processData.success) {
            finalUrl = processData.url; // URL de la vidéo formatée
          } else {
            console.error("Erreur de formatage:", processData.error);
          }
        } catch (error) {
          console.error("Video formatting failed", error);
        } finally {
          setIsProcessingVideo(false);
        }
      }

      setMediaUrls(prev => [...prev, finalUrl]);
      
    } catch (error) {
      showAlert("Erreur réseau", "Une erreur est survenue lors de l'envoi de votre fichier.", "error");
      setIsProcessingVideo(false);
    }
  };

  const removeMedia = (urlToRemove: string) => {
    setMediaUrls(prev => prev.filter(url => url !== urlToRemove));
  };

  const handleAction = async (action: "DRAFT" | "SCHEDULED" | "PUBLISHED") => {
    if (!content && mediaUrls.length === 0) {
      showAlert("Publication vide", "Veuillez rédiger un texte ou ajouter un média avant d'enregistrer.", "warning");
      return;
    }

    if (action === "SCHEDULED" && !scheduledAt) {
      showAlert("Date de planification manquante", "Veuillez choisir une date et une heure pour programmer votre publication.", "warning");
      return;
    }

    setIsSaving(true);
    try {
      const res = await fetch("/api/posts", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ 
          content, 
          status: action,
          scheduledAt: action === "SCHEDULED" ? new Date(scheduledAt).toISOString() : null,
          mediaUrls 
        })
      });
      const data = await res.json();
      if (data.success) {
        if (action === "PUBLISHED") showAlert("Publication réussie !", "Votre publication a été envoyée avec succès sur vos réseaux sociaux via Ayrshare !", "success");
        else if (action === "SCHEDULED") showAlert("Publication programmée !", "Votre post a été ajouté à votre calendrier éditorial avec succès !", "success");
        else showAlert("Brouillon sauvegardé", "Votre publication a été enregistrée dans vos brouillons.", "info");
      } else {
        showAlert("Erreur lors de l'enregistrement", data.error, "error");
      }
    } catch (error) {
      showAlert("Erreur serveur", "Impossible de communiquer avec le serveur pour enregistrer votre publication.", "error");
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="max-w-6xl mx-auto flex flex-col lg:flex-row gap-8 h-full">
      {/* Editeur (Gauche) */}
      <div className="flex-1 flex flex-col space-y-6">
        <div>
          <h1 className="text-4xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-slate-800 to-slate-500 dark:from-white dark:to-slate-400 tracking-tight">Créer une Publication</h1>
          <p className="text-slate-500 dark:text-slate-400 mt-2 text-lg font-medium">Générez avec l'IA, ajustez et publiez sur tous vos réseaux en un clic.</p>
        </div>

        {/* Sélection des plateformes */}
        <div className="bg-white/80 dark:bg-slate-900/80 backdrop-blur-xl p-6 rounded-3xl shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-white/50 dark:border-slate-800">
          <p className="text-sm font-bold text-slate-700 dark:text-slate-300 mb-4 uppercase tracking-wider">Sélectionnez les plateformes</p>
          <div className="flex gap-4">
            <button 
              onClick={() => togglePlatform('tiktok')}
              className={`flex items-center gap-3 px-5 py-3 rounded-2xl font-bold transition-all duration-300 hover:scale-[1.02] active:scale-95 ${platforms.tiktok ? 'bg-black text-white shadow-xl shadow-black/20' : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700 hover:text-slate-800 dark:hover:text-white'}`}
            >
              <FaTiktok className="w-5 h-5" /> TikTok
            </button>
            <button 
              onClick={() => togglePlatform('meta')}
              className={`flex items-center gap-3 px-5 py-3 rounded-2xl font-bold transition-all duration-300 hover:scale-[1.02] active:scale-95 ${platforms.meta ? 'bg-gradient-to-br from-blue-600 to-blue-700 text-white shadow-xl shadow-blue-500/30' : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700 hover:text-slate-800 dark:hover:text-white'}`}
            >
              <FaFacebook className="w-5 h-5" /> Meta
            </button>
            <button 
              onClick={() => togglePlatform('linkedin')}
              className={`flex items-center gap-3 px-5 py-3 rounded-2xl font-bold transition-all duration-300 hover:scale-[1.02] active:scale-95 ${platforms.linkedin ? 'bg-gradient-to-br from-sky-600 to-sky-700 text-white shadow-xl shadow-sky-500/30' : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700 hover:text-slate-800 dark:hover:text-white'}`}
            >
              <FaLinkedin className="w-5 h-5" /> LinkedIn
            </button>
          </div>
        </div>

        {/* Zone de texte et IA */}
        <div className="bg-white/90 dark:bg-slate-900 backdrop-blur-2xl rounded-3xl shadow-[0_8px_30px_rgb(0,0,0,0.06)] border border-white dark:border-slate-800 overflow-hidden flex flex-col flex-1">
          <div className="p-5 border-b border-slate-100/50 dark:border-slate-800 flex justify-between items-center bg-gradient-to-r from-slate-50 dark:from-slate-900 to-white dark:to-slate-800/50">
            <span className="text-sm font-bold text-slate-800 dark:text-slate-200 uppercase tracking-wider">Contenu du post</span>
            <div className="flex items-center gap-3">
              <button 
                onClick={() => setShowAiSettings(!showAiSettings)}
                className="p-2.5 text-slate-500 hover:text-indigo-700 dark:hover:text-indigo-400 hover:bg-indigo-100 dark:hover:bg-indigo-900/30 rounded-xl transition-all hover:rotate-90 duration-300"
                title="Paramètres de l'IA"
              >
                <Settings2 className="w-5 h-5" />
              </button>
              <button 
                onClick={handleGenerate}
                disabled={isGenerating}
                className={`flex items-center gap-2 px-6 py-2.5 text-white rounded-2xl text-sm font-bold transition-all duration-300 hover:scale-[1.03] active:scale-95 shadow-lg ${isGenerating ? 'bg-slate-400 dark:bg-slate-700 cursor-not-allowed' : 'bg-gradient-to-r from-violet-600 via-fuchsia-500 to-orange-500 hover:from-violet-500 hover:via-fuchsia-400 hover:to-orange-400 shadow-fuchsia-500/25'}`}
              >
                <Sparkles className={`w-4 h-4 ${isGenerating ? 'animate-spin' : ''}`} /> 
                {isGenerating ? "Création en cours..." : "Générer avec l'IA"}
              </button>
            </div>
          </div>
          
          {showAiSettings && (
            <div className="p-5 bg-gradient-to-br from-indigo-50/50 dark:from-indigo-900/10 to-purple-50/50 dark:to-purple-900/10 border-b border-indigo-100/50 dark:border-indigo-900/30 flex flex-col gap-4 animate-in slide-in-from-top-2 duration-200">
              <div className="flex items-center gap-4">
                <label className="text-sm font-bold text-slate-700 dark:text-slate-300 w-32">Modèle IA :</label>
                <select 
                  value={aiProvider}
                  onChange={(e) => setAiProvider(e.target.value)}
                  className="flex-1 px-4 py-2.5 bg-white dark:bg-slate-800 border border-indigo-100 dark:border-indigo-900/50 rounded-xl text-sm font-bold text-slate-900 dark:text-white outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all shadow-sm"
                >
                  <option value="pollinations">Pollinations AI (Gratuit, Sans clé)</option>
                  <option value="groq">Groq AI (Ultra-rapide)</option>
                  <option value="gemini">Google Gemini (Intelligent)</option>
                  <option value="openai">OpenAI ChatGPT (Performant)</option>
                </select>
              </div>
              
              {aiProvider !== "pollinations" && (
                <div className="flex items-center gap-4">
                  <label className="text-sm font-bold text-slate-700 dark:text-slate-300 w-32">Clé API :</label>
                  <input 
                    type="password"
                    placeholder={`Votre clé API ${aiProvider === 'gemini' ? 'Google' : aiProvider === 'groq' ? 'Groq' : 'OpenAI'}...`}
                    value={apiKey}
                    onChange={(e) => handleApiKeyChange(e.target.value)}
                    className="flex-1 px-4 py-2.5 bg-white dark:bg-slate-800 border border-indigo-100 dark:border-indigo-900/50 rounded-xl text-sm font-bold text-slate-900 dark:text-white placeholder:text-slate-400 outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all shadow-sm"
                  />
                </div>
              )}
            </div>
          )}

          <textarea 
            className="flex-1 w-full p-8 outline-none resize-none text-slate-800 dark:text-white text-lg leading-relaxed placeholder:text-slate-500 dark:placeholder:text-slate-600 bg-transparent font-medium"
            placeholder="Écrivez une idée brillante ici..."
            value={content}
            onChange={(e) => setContent(e.target.value)}
          />

          <div className="p-5 border-t border-slate-100/50 dark:border-slate-800 bg-slate-50/30 dark:bg-slate-800/30 flex justify-between items-center">
            <div className="flex gap-3 relative">
              <input 
                type="file" 
                ref={fileInputRef} 
                onChange={handleFileUpload} 
                className="hidden" 
                accept="image/*,video/*" 
              />
              <button 
                onClick={() => fileInputRef.current?.click()}
                className="flex items-center gap-2 px-5 py-2.5 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:border-indigo-200 dark:hover:border-indigo-500 hover:bg-indigo-50 dark:hover:bg-indigo-900/20 hover:text-indigo-700 dark:hover:text-indigo-400 rounded-2xl font-bold transition-all shadow-sm active:scale-95"
              >
                <ImageIcon className="w-5 h-5" /> Ajouter un Média
              </button>
            </div>
            <div className="text-sm font-bold text-slate-600 dark:text-slate-400 bg-white dark:bg-slate-800 px-4 py-2 rounded-full shadow-sm border border-slate-200 dark:border-slate-700">
              {content.length} caractères
            </div>
          </div>
        </div>

        {/* Planification & Actions */}
        <div className="flex items-center justify-between bg-white/90 dark:bg-slate-900/90 backdrop-blur-xl p-5 rounded-3xl shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-white/50 dark:border-slate-800">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-slate-50 dark:bg-slate-800 rounded-2xl flex items-center justify-center text-indigo-500 dark:text-indigo-400 shadow-inner">
              <Clock className="w-6 h-6" />
            </div>
            <div className="flex flex-col">
              <span className="text-sm font-bold text-slate-600 dark:text-slate-400 uppercase tracking-wider mb-1">Planification</span>
              <input 
                type="datetime-local" 
                value={scheduledAt}
                onChange={(e) => setScheduledAt(e.target.value)}
                className="bg-transparent text-sm font-bold text-slate-800 dark:text-white focus:outline-none color-scheme-dark"
                style={{ colorScheme: 'dark' }} // Pour s'assurer que le calendrier natif est beau en mode sombre
              />
            </div>
          </div>
          
          <div className="flex gap-3">
            <button 
              onClick={() => handleAction("DRAFT")}
              disabled={isSaving}
              className={`px-6 py-3 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 rounded-2xl font-bold transition-all duration-300 active:scale-95 ${isSaving ? 'opacity-50' : ''}`}
            >
              Brouillon
            </button>
            <button 
              onClick={() => handleAction("SCHEDULED")}
              disabled={isSaving || !scheduledAt}
              className={`px-6 py-3 bg-slate-900 dark:bg-indigo-600 hover:bg-black dark:hover:bg-indigo-500 text-white rounded-2xl font-bold transition-all duration-300 shadow-xl shadow-slate-900/20 dark:shadow-indigo-900/20 active:scale-95 ${(!scheduledAt || isSaving) ? 'opacity-50 cursor-not-allowed' : 'hover:scale-[1.02]'}`}
            >
              Planifier
            </button>
            <button 
              onClick={() => handleAction("PUBLISHED")}
              disabled={isSaving}
              className={`flex items-center gap-2 px-8 py-3 bg-gradient-to-r from-indigo-500 to-purple-600 hover:from-indigo-600 hover:to-purple-700 text-white rounded-2xl font-bold transition-all duration-300 shadow-xl shadow-indigo-500/30 active:scale-95 hover:scale-[1.02] ${isSaving ? 'opacity-50 cursor-not-allowed' : ''}`}
            >
              <Send className="w-4 h-4" /> Publier
            </button>
          </div>
        </div>
      </div>

      {/* Aperçu (Droite) */}
      <div className="w-full lg:w-[420px] flex flex-col">
        <h2 className="text-xl font-extrabold text-slate-800 dark:text-white mb-5 pl-2 tracking-tight">Aperçu en direct</h2>
        <div className="bg-white dark:bg-slate-900 rounded-[2.5rem] shadow-[0_20px_50px_rgb(0,0,0,0.1)] dark:shadow-none border-8 border-slate-50/80 dark:border-slate-800/50 p-7 flex-1 flex flex-col relative overflow-hidden ring-1 ring-black/5 dark:ring-white/5">
          <div className="flex items-center gap-4 mb-6">
            <div className="w-12 h-12 rounded-full bg-gradient-to-tr from-indigo-100 to-purple-100 dark:from-indigo-900/40 dark:to-purple-900/40 border border-white dark:border-slate-800 shadow-sm flex items-center justify-center text-indigo-300 dark:text-indigo-400 font-bold text-xl">
              U
            </div>
            <div>
              <div className="h-3.5 w-28 bg-slate-800 dark:bg-slate-300 rounded-full mb-2.5"></div>
              <div className="h-2 w-16 bg-slate-300 dark:bg-slate-600 rounded-full"></div>
            </div>
          </div>
          <div className="flex-1 overflow-y-auto hide-scrollbar">
            {content ? (
              <p className="text-[15px] font-medium text-slate-800 dark:text-slate-200 whitespace-pre-wrap leading-relaxed mb-6">{content}</p>
            ) : (
              <div className="space-y-3 mb-6 opacity-40">
                <div className="h-2.5 w-full bg-slate-200 dark:bg-slate-700 rounded-full"></div>
                <div className="h-2.5 w-5/6 bg-slate-200 dark:bg-slate-700 rounded-full"></div>
                <div className="h-2.5 w-4/6 bg-slate-200 dark:bg-slate-700 rounded-full"></div>
              </div>
            )}
            
            {/* Affichage des médias uploadés */}
            {isProcessingVideo ? (
              <div className="w-full h-48 bg-slate-50 dark:bg-slate-800/50 rounded-xl mt-4 flex flex-col items-center justify-center text-slate-500 border border-slate-200 dark:border-slate-700">
                <Sparkles className="w-8 h-8 text-indigo-500 animate-spin mb-2" />
                <span className="text-sm font-medium text-center px-4">
                  Formatage vidéo pour TikTok...<br/>
                  <span className="text-sm font-bold text-slate-500 dark:text-slate-400">(FFmpeg natif en cours)</span>
                </span>
              </div>
            ) : mediaUrls.length > 0 ? (
              <div className="grid gap-2">
                {mediaUrls.map((url, idx) => (
                  <div key={idx} className="relative rounded-xl overflow-hidden border border-slate-200 dark:border-slate-700">
                    <button 
                      onClick={() => removeMedia(url)}
                      className="absolute top-2 right-2 bg-black/50 text-white rounded-full p-1 hover:bg-black/80 transition"
                    >
                      <X className="w-4 h-4" />
                    </button>
                    {url.match(/\.(mp4|mov|webm)$/i) ? (
                      <video src={url} className="w-full h-auto max-h-[600px] bg-black" controls />
                    ) : (
                      <img src={url} alt="Media" className="w-full h-auto object-cover" />
                    )}
                  </div>
                ))}
              </div>
            ) : (
               <div className="w-full h-48 bg-slate-100 dark:bg-slate-800/50 rounded-xl mt-4 flex items-center justify-center text-slate-400 border border-dashed border-slate-300 dark:border-slate-700">
                 <ImageIcon className="w-8 h-8 opacity-50" />
               </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
