"use client";

import { useState, useEffect } from "react";
import { Settings, Key, Zap, Globe, Save, CheckCircle, Eye, EyeOff, Trash2, AlertTriangle } from "lucide-react";

const PROVIDERS = [
  {
    id: "pollinations",
    name: "Pollinations AI",
    description: "Gratuit, aucune clé requise. Idéal pour démarrer.",
    badge: "GRATUIT",
    badgeColor: "bg-emerald-100 text-emerald-700",
    needsKey: false,
    docsUrl: "https://text.pollinations.ai",
  },
  {
    id: "gemini",
    name: "Google Gemini",
    description: "Très rapide et précis. Clé gratuite disponible.",
    badge: "RECOMMANDÉ",
    badgeColor: "bg-blue-100 text-blue-700",
    needsKey: true,
    placeholder: "AIzaSy...",
    docsUrl: "https://aistudio.google.com/app/apikey",
  },
  {
    id: "openai",
    name: "OpenAI ChatGPT",
    description: "Le plus performant. GPT-4o-mini utilisé (économique).",
    badge: "PREMIUM",
    badgeColor: "bg-purple-100 text-purple-700",
    needsKey: true,
    placeholder: "sk-...",
    docsUrl: "https://platform.openai.com/api-keys",
  },
];

const SOCIAL_CONFIGS = [
  {
    id: "meta",
    name: "Meta (Facebook & Instagram)",
    envVars: ["META_APP_ID", "META_APP_SECRET"],
    color: "bg-blue-500",
    labels: ["App ID", "App Secret"],
  },
  {
    id: "tiktok",
    name: "TikTok",
    envVars: ["TIKTOK_CLIENT_KEY", "TIKTOK_CLIENT_SECRET"],
    color: "bg-black",
    labels: ["Client Key", "Client Secret"],
  },
  {
    id: "linkedin",
    name: "LinkedIn",
    envVars: ["LINKEDIN_CLIENT_ID", "LINKEDIN_CLIENT_SECRET"],
    color: "bg-sky-600",
    labels: ["Client ID", "Client Secret"],
  },
  {
    id: "ayrshare",
    name: "Ayrshare (Agrégateur)",
    envVars: ["AYRSHARE_API_KEY"],
    color: "bg-indigo-500",
    labels: ["API Key"],
  },
];

export default function SettingsPage() {
  const [apiKeys, setApiKeys] = useState<Record<string, string>>({});
  const [savedKeys, setSavedKeys] = useState<Record<string, boolean>>({});
  const [showKeys, setShowKeys] = useState<Record<string, boolean>>({});
  const [activeTab, setActiveTab] = useState<"ai" | "social" | "workspace">("ai");
  const [workspaceName, setWorkspaceName] = useState("");
  const [saveSuccess, setSaveSuccess] = useState(false);

  useEffect(() => {
    // Charger les clés depuis localStorage
    const loaded: Record<string, string> = {};
    PROVIDERS.forEach((p) => {
      if (p.needsKey) {
        const k = localStorage.getItem(`postly_api_key_${p.id}`);
        if (k) loaded[p.id] = k;
      }
    });
    const wn = localStorage.getItem("postly_workspace_name");
    if (wn) setWorkspaceName(wn);
    setApiKeys(loaded);
  }, []);

  const handleSaveKey = (providerId: string, value: string) => {
    const updated = { ...apiKeys, [providerId]: value };
    setApiKeys(updated);
    localStorage.setItem(`postly_api_key_${providerId}`, value);
    setSavedKeys((prev) => ({ ...prev, [providerId]: true }));
    setTimeout(() => setSavedKeys((prev) => ({ ...prev, [providerId]: false })), 2000);
  };

  const handleDeleteKey = (providerId: string) => {
    const updated = { ...apiKeys };
    delete updated[providerId];
    setApiKeys(updated);
    localStorage.removeItem(`postly_api_key_${providerId}`);
  };

  const handleSaveWorkspace = () => {
    localStorage.setItem("postly_workspace_name", workspaceName);
    setSaveSuccess(true);
    setTimeout(() => setSaveSuccess(false), 2000);
  };

  const toggleShow = (key: string) => {
    setShowKeys((prev) => ({ ...prev, [key]: !prev[key] }));
  };

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-slate-800 to-slate-500 tracking-tight">
          Paramètres
        </h1>
        <p className="text-slate-500 mt-2 font-medium">
          Configurez vos clés API et personnalisez votre espace de travail.
        </p>
      </div>

      {/* Tabs */}
      <div className="flex gap-2 bg-slate-100 p-1.5 rounded-2xl w-fit">
        {[
          { id: "ai", label: "Modèles IA", icon: Zap },
          { id: "social", label: "Réseaux sociaux", icon: Globe },
          { id: "workspace", label: "Espace de travail", icon: Settings },
        ].map((tab) => {
          const Icon = tab.icon;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-bold transition-all duration-200 ${
                activeTab === tab.id
                  ? "bg-white text-slate-900 shadow-md shadow-slate-200/60"
                  : "text-slate-500 hover:text-slate-700"
              }`}
            >
              <Icon className="w-4 h-4" />
              {tab.label}
            </button>
          );
        })}
      </div>

      {/* ───── ONGLET IA ───── */}
      {activeTab === "ai" && (
        <div className="space-y-4">
          <div className="bg-amber-50 border border-amber-200 rounded-2xl p-4 flex gap-3 items-start">
            <AlertTriangle className="w-5 h-5 text-amber-500 shrink-0 mt-0.5" />
            <div>
              <p className="text-sm font-bold text-amber-800">Stockage local uniquement</p>
              <p className="text-xs text-amber-700 mt-0.5">
                Vos clés API sont sauvegardées dans le navigateur (localStorage), jamais envoyées à nos serveurs.
              </p>
            </div>
          </div>

          {PROVIDERS.map((provider) => (
            <div
              key={provider.id}
              className="bg-white rounded-3xl border border-slate-100 shadow-[0_4px_20px_rgb(0,0,0,0.04)] overflow-hidden"
            >
              <div className="p-6">
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-2xl bg-slate-900 flex items-center justify-center">
                      <Key className="w-5 h-5 text-white" />
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <h3 className="font-bold text-slate-900">{provider.name}</h3>
                        <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${provider.badgeColor}`}>
                          {provider.badge}
                        </span>
                      </div>
                      <p className="text-xs text-slate-500 mt-0.5">{provider.description}</p>
                    </div>
                  </div>
                  {!provider.needsKey && (
                    <div className="flex items-center gap-1.5 bg-emerald-50 text-emerald-700 text-xs font-bold px-3 py-1.5 rounded-full border border-emerald-200">
                      <CheckCircle className="w-3.5 h-3.5" />
                      Prêt à l'emploi
                    </div>
                  )}
                </div>

                {provider.needsKey && (
                  <div className="space-y-3">
                    <div className="relative flex items-center gap-2">
                      <div className="relative flex-1">
                        <input
                          type={showKeys[provider.id] ? "text" : "password"}
                          placeholder={provider.placeholder}
                          value={apiKeys[provider.id] || ""}
                          onChange={(e) =>
                            setApiKeys((prev) => ({ ...prev, [provider.id]: e.target.value }))
                          }
                          className="w-full px-4 py-3 pr-10 bg-slate-50 border border-slate-200 rounded-xl text-sm font-mono text-slate-800 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-400 transition-all"
                        />
                        <button
                          onClick={() => toggleShow(provider.id)}
                          className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-700"
                        >
                          {showKeys[provider.id] ? (
                            <EyeOff className="w-4 h-4" />
                          ) : (
                            <Eye className="w-4 h-4" />
                          )}
                        </button>
                      </div>
                      <button
                        onClick={() => handleSaveKey(provider.id, apiKeys[provider.id] || "")}
                        disabled={!apiKeys[provider.id]}
                        className={`flex items-center gap-2 px-4 py-3 rounded-xl text-sm font-bold transition-all ${
                          savedKeys[provider.id]
                            ? "bg-emerald-500 text-white"
                            : "bg-slate-900 hover:bg-black text-white disabled:bg-slate-200 disabled:text-slate-400 disabled:cursor-not-allowed"
                        }`}
                      >
                        {savedKeys[provider.id] ? (
                          <><CheckCircle className="w-4 h-4" /> Sauvegardé</>
                        ) : (
                          <><Save className="w-4 h-4" /> Sauvegarder</>
                        )}
                      </button>
                      {apiKeys[provider.id] && (
                        <button
                          onClick={() => handleDeleteKey(provider.id)}
                          className="p-3 text-red-400 hover:text-red-600 hover:bg-red-50 rounded-xl transition-all"
                          title="Supprimer la clé"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      )}
                    </div>
                    <a
                      href={provider.docsUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-xs text-indigo-500 hover:text-indigo-700 hover:underline font-medium"
                    >
                      → Obtenir une clé API {provider.name} (gratuit)
                    </a>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* ───── ONGLET RÉSEAUX SOCIAUX ───── */}
      {activeTab === "social" && (
        <div className="space-y-4">
          <div className="bg-blue-50 border border-blue-200 rounded-2xl p-4 flex gap-3 items-start">
            <AlertTriangle className="w-5 h-5 text-blue-500 shrink-0 mt-0.5" />
            <div>
              <p className="text-sm font-bold text-blue-800">Configuration via le fichier .env</p>
              <p className="text-xs text-blue-700 mt-0.5">
                Ces clés doivent être définies dans le fichier <code className="bg-blue-100 px-1 rounded">.env</code> à la racine du projet. Redémarrez le serveur après modification.
              </p>
            </div>
          </div>

          {SOCIAL_CONFIGS.map((config) => (
            <div
              key={config.id}
              className="bg-white rounded-3xl border border-slate-100 shadow-[0_4px_20px_rgb(0,0,0,0.04)] p-6"
            >
              <div className="flex items-center gap-3 mb-5">
                <div className={`w-10 h-10 rounded-2xl ${config.color} flex items-center justify-center`}>
                  <Globe className="w-5 h-5 text-white" />
                </div>
                <h3 className="font-bold text-slate-900 text-lg">{config.name}</h3>
              </div>
              <div className="space-y-3">
                {config.envVars.map((envVar, idx) => (
                  <div key={envVar} className="flex flex-col gap-1.5">
                    <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">
                      {config.labels[idx]}
                    </label>
                    <div className="bg-slate-900 text-emerald-400 font-mono text-sm px-4 py-2.5 rounded-xl flex items-center justify-between">
                      <span>{envVar}=<span className="text-slate-500">votre_clé_ici</span></span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* ───── ONGLET WORKSPACE ───── */}
      {activeTab === "workspace" && (
        <div className="space-y-4">
          <div className="bg-white rounded-3xl border border-slate-100 shadow-[0_4px_20px_rgb(0,0,0,0.04)] p-6">
            <h3 className="font-bold text-slate-900 text-lg mb-5 flex items-center gap-2">
              <Settings className="w-5 h-5 text-slate-500" />
              Espace de travail
            </h3>
            <div className="space-y-4">
              <div>
                <label className="text-sm font-bold text-slate-700 mb-2 block">
                  Nom de l'espace de travail
                </label>
                <input
                  type="text"
                  placeholder="Mon entreprise"
                  value={workspaceName}
                  onChange={(e) => setWorkspaceName(e.target.value)}
                  className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm font-medium text-slate-800 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-400 transition-all"
                />
              </div>
              <button
                onClick={handleSaveWorkspace}
                className={`flex items-center gap-2 px-6 py-3 rounded-xl text-sm font-bold transition-all ${
                  saveSuccess
                    ? "bg-emerald-500 text-white"
                    : "bg-slate-900 hover:bg-black text-white"
                }`}
              >
                {saveSuccess ? (
                  <><CheckCircle className="w-4 h-4" /> Sauvegardé !</>
                ) : (
                  <><Save className="w-4 h-4" /> Enregistrer</>
                )}
              </button>
            </div>
          </div>

          {/* Danger Zone */}
          <div className="bg-white rounded-3xl border border-red-100 shadow-[0_4px_20px_rgb(0,0,0,0.04)] p-6">
            <h3 className="font-bold text-red-700 text-lg mb-2 flex items-center gap-2">
              <AlertTriangle className="w-5 h-5" />
              Zone dangereuse
            </h3>
            <p className="text-sm text-slate-500 mb-4">
              Ces actions sont irréversibles. Procédez avec précaution.
            </p>
            <button
              onClick={() => {
                if (confirm("Êtes-vous sûr de vouloir effacer toutes les clés API stockées ?")) {
                  PROVIDERS.forEach((p) => {
                    if (p.needsKey) localStorage.removeItem(`postly_api_key_${p.id}`);
                  });
                  setApiKeys({});
                }
              }}
              className="flex items-center gap-2 px-5 py-2.5 bg-red-50 hover:bg-red-100 text-red-700 border border-red-200 rounded-xl text-sm font-bold transition-all"
            >
              <Trash2 className="w-4 h-4" />
              Effacer toutes les clés API
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
