"use client";

import { Plus, ExternalLink, ShieldCheck, CheckCircle2, Trash2, KeyRound, Save, AlertCircle, X } from "lucide-react";
import { FaFacebook, FaLinkedin, FaTiktok } from "react-icons/fa";
import { useState, useEffect } from "react";

export default function AccountsPage() {
  const [connectedAccounts, setConnectedAccounts] = useState<string[]>([]);
  const [ayrshareKey, setAyrshareKey] = useState("");
  const [isSavingKey, setIsSavingKey] = useState(false);
  const [showSetupModal, setShowSetupModal] = useState<string | null>(null);

  useEffect(() => {
    // Charger la clé Ayrshare ET les comptes natifs depuis la BDD (Workspace)
    fetch("/api/workspace")
      .then(res => res.json())
      .then(data => {
        if (data.workspace) {
          if (data.workspace.ayrshareKey) {
            setAyrshareKey(data.workspace.ayrshareKey);
          }
          if (data.workspace.accounts) {
            // Mappe les comptes de la base (ex: { platform: "tiktok" })
            setConnectedAccounts(data.workspace.accounts.map((acc: any) => acc.platform));
          }
        }
      });
  }, []);

  const saveAyrshareKey = async () => {
    setIsSavingKey(true);
    try {
      await fetch("/api/workspace", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ayrshareKey })
      });
      alert("Clé Ayrshare sauvegardée avec succès !");
    } catch (error) {
      alert("Erreur lors de la sauvegarde.");
    } finally {
      setIsSavingKey(false);
    }
  };

  const handleDisconnectNative = async (platform: string) => {
    // En réalité il faudrait appeler une route DELETE /api/auth/[platform]
    // Pour l'instant on met juste à jour l'UI, la route sera implémentée
    const newAccounts = connectedAccounts.filter(p => p !== platform);
    setConnectedAccounts(newAccounts);
  };

  const handleNativeConnect = async (platform: string) => {
    try {
      const res = await fetch(`/api/auth/check?platform=${platform}`);
      const data = await res.json();
      if (data.configured) {
        window.location.href = `/api/auth/${platform}/login`;
      } else {
        setShowSetupModal(platform);
      }
    } catch (e) {
      alert("Erreur lors de la vérification de la configuration.");
    }
  };

  const isConnected = (platform: string) => connectedAccounts.includes(platform);

  return (
    <div className="max-w-5xl mx-auto space-y-8 h-full">
      <div>
        <h1 className="text-4xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-slate-800 to-slate-500 tracking-tight">Comptes Liés</h1>
        <p className="text-slate-500 mt-2 text-lg font-medium">Connectez la plateforme Ayrshare pour publier réellement sur vos réseaux sociaux (Option B).</p>
      </div>

      {/* Configuration Ayrshare (Vraie Publication) */}
      <div className="bg-gradient-to-br from-indigo-900 to-purple-900 rounded-[2rem] p-8 shadow-xl border border-indigo-700/50 relative overflow-hidden">
        <div className="absolute top-0 right-0 p-8 opacity-10 pointer-events-none">
          <KeyRound className="w-48 h-48 text-white" />
        </div>
        <div className="relative z-10 flex flex-col md:flex-row gap-8 items-start md:items-center justify-between">
          <div className="max-w-xl text-white">
            <h2 className="text-2xl font-bold mb-2 flex items-center gap-3">
              <KeyRound className="w-6 h-6 text-indigo-300" />
              Intégration Ayrshare (API)
            </h2>
            <p className="text-indigo-200 text-sm font-medium leading-relaxed mb-6">
              Créez un compte gratuit sur <a href="https://ayrshare.com" target="_blank" className="text-white underline hover:text-indigo-300">Ayrshare.com</a> et reliez vos réseaux (TikTok, Meta, LinkedIn) sur leur plateforme. Collez ensuite votre "Profile API Key" ici. Postly utilisera cette clé pour envoyer vos publications réelles.
            </p>
            <div className="flex items-center gap-3 w-full">
              <input 
                type="password"
                placeholder="Ex: 5f9e8a..."
                value={ayrshareKey}
                onChange={(e) => setAyrshareKey(e.target.value)}
                className="flex-1 px-4 py-3 bg-black/30 border border-indigo-500/50 rounded-2xl text-white placeholder:text-indigo-300/50 focus:outline-none focus:ring-2 focus:ring-indigo-400"
              />
              <button 
                onClick={saveAyrshareKey}
                disabled={isSavingKey}
                className="flex items-center gap-2 px-6 py-3 bg-white text-indigo-900 rounded-2xl font-bold hover:bg-indigo-50 transition-colors shadow-lg active:scale-95"
              >
                <Save className="w-5 h-5" />
                {isSavingKey ? "Enregistrement..." : "Sauvegarder"}
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Section : Comptes Natifs */}
      <div className="mt-12 mb-6">
        <h2 className="text-2xl font-extrabold text-slate-800 mb-2">Option A : Connexion Native OAuth</h2>
        <p className="text-slate-600 font-medium">En cliquant sur Associer, vous serez redirigé vers la page de connexion sécurisée officielle du réseau social. Nécessite que vos clés Developer (Client ID) soient configurées dans le fichier .env.</p>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        
        {/* TikTok Connection Card */}
        <div className={`bg-white rounded-[2rem] p-7 shadow-[0_8px_30px_rgb(0,0,0,0.04)] border-2 transition-all flex flex-col justify-between relative overflow-hidden ${isConnected('tiktok') ? 'border-emerald-400' : 'border-indigo-100 hover:shadow-xl hover:-translate-y-1'}`}>
          <div className="absolute top-0 right-0 bg-gradient-to-l from-indigo-500 to-purple-500 text-white text-[10px] font-bold px-4 py-1.5 rounded-bl-2xl">PRIORITÉ</div>
          <div>
            <div className="flex items-center gap-4 mb-5 mt-2">
              <div className="w-14 h-14 rounded-2xl bg-black text-white flex items-center justify-center shadow-lg shadow-black/20">
                <FaTiktok className="w-7 h-7" />
              </div>
              <div>
                <h3 className="text-xl font-bold text-slate-800">TikTok</h3>
                <p className="text-sm font-medium text-slate-500">Profils Créateurs</p>
              </div>
            </div>
            <p className="text-sm text-slate-600 mb-8 font-medium">Connectez votre compte TikTok pour publier vos vidéos automatiquement.</p>
          </div>
          {isConnected('tiktok') ? (
            <button onClick={() => handleDisconnectNative('tiktok')} className="w-full flex items-center justify-center gap-2 py-3.5 px-4 rounded-2xl bg-emerald-50 hover:bg-red-50 text-emerald-600 hover:text-red-500 font-bold transition-colors group">
              <CheckCircle2 className="w-5 h-5 group-hover:hidden" /> <span className="group-hover:hidden">Connecté</span>
              <Trash2 className="w-5 h-5 hidden group-hover:block" /> <span className="hidden group-hover:block">Déconnecter</span>
            </button>
          ) : (
            <button onClick={() => handleNativeConnect('tiktok')} className="w-full flex items-center justify-center gap-2 py-3.5 px-4 rounded-2xl bg-slate-900 hover:bg-black text-white font-bold transition-all shadow-lg shadow-slate-900/20 active:scale-95 cursor-pointer">
              <ExternalLink className="w-5 h-5" /> Associer via TikTok
            </button>
          )}
        </div>

        {/* LinkedIn Connection Card */}
        <div className={`bg-white rounded-[2rem] p-7 shadow-[0_8px_30px_rgb(0,0,0,0.04)] border-2 transition-all flex flex-col justify-between ${isConnected('linkedin') ? 'border-emerald-400' : 'border-slate-100 hover:shadow-xl hover:-translate-y-1'}`}>
          <div>
            <div className="flex items-center gap-4 mb-5">
              <div className="w-14 h-14 rounded-2xl bg-sky-50 text-sky-600 flex items-center justify-center shadow-lg shadow-sky-600/10">
                <FaLinkedin className="w-7 h-7" />
              </div>
              <div>
                <h3 className="text-xl font-bold text-slate-800">LinkedIn</h3>
                <p className="text-sm font-medium text-slate-500">Profils & Pages</p>
              </div>
            </div>
            <p className="text-sm text-slate-600 mb-8 font-medium">Connectez votre compte LinkedIn pour publier sur votre réseau professionnel.</p>
          </div>
          {isConnected('linkedin') ? (
            <button onClick={() => handleDisconnectNative('linkedin')} className="w-full flex items-center justify-center gap-2 py-3.5 px-4 rounded-2xl bg-emerald-50 hover:bg-red-50 text-emerald-600 hover:text-red-500 font-bold transition-colors group">
              <CheckCircle2 className="w-5 h-5 group-hover:hidden" /> <span className="group-hover:hidden">Connecté</span>
              <Trash2 className="w-5 h-5 hidden group-hover:block" /> <span className="hidden group-hover:block">Déconnecter</span>
            </button>
          ) : (
            <button onClick={() => handleNativeConnect('linkedin')} className="w-full flex items-center justify-center gap-2 py-3.5 px-4 rounded-2xl bg-sky-600 hover:bg-sky-700 text-white font-bold transition-all shadow-lg shadow-sky-600/20 active:scale-95 cursor-pointer">
              <ExternalLink className="w-5 h-5" /> Associer via LinkedIn
            </button>
          )}
        </div>

        {/* Meta Connection Card */}
        <div className={`bg-white rounded-[2rem] p-7 shadow-[0_8px_30px_rgb(0,0,0,0.04)] border-2 transition-all flex flex-col justify-between ${isConnected('meta') ? 'border-emerald-400' : 'border-slate-100 hover:shadow-xl hover:-translate-y-1'}`}>
          <div>
            <div className="flex items-center gap-4 mb-5">
              <div className="w-14 h-14 rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center shadow-lg shadow-blue-600/10">
                <FaFacebook className="w-7 h-7" />
              </div>
              <div>
                <h3 className="text-xl font-bold text-slate-800">Meta</h3>
                <p className="text-sm font-medium text-slate-500">FB & Insta</p>
              </div>
            </div>
            <p className="text-sm text-slate-600 mb-8 font-medium">Associez vos pages Facebook et comptes professionnels Instagram.</p>
          </div>
          {isConnected('meta') ? (
            <button onClick={() => handleDisconnectNative('meta')} className="w-full flex items-center justify-center gap-2 py-3.5 px-4 rounded-2xl bg-emerald-50 hover:bg-red-50 text-emerald-600 hover:text-red-500 font-bold transition-colors group">
              <CheckCircle2 className="w-5 h-5 group-hover:hidden" /> <span className="group-hover:hidden">Connecté</span>
              <Trash2 className="w-5 h-5 hidden group-hover:block" /> <span className="hidden group-hover:block">Déconnecter</span>
            </button>
          ) : (
            <button onClick={() => handleNativeConnect('meta')} className="w-full flex items-center justify-center gap-2 py-3.5 px-4 rounded-2xl bg-blue-600 hover:bg-blue-700 text-white font-bold transition-all shadow-lg shadow-blue-600/20 active:scale-95 cursor-pointer">
              <ExternalLink className="w-5 h-5" /> Associer via Meta
            </button>
          )}
        </div>
      </div>

      {/* Connected Accounts List */}
      <div className="bg-white rounded-[2rem] shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-slate-100 p-8 mt-10">
        <div className="flex items-center justify-between mb-8">
          <h2 className="text-xl font-extrabold text-slate-800">Comptes Actifs ({connectedAccounts.length})</h2>
          <span className="bg-emerald-100 text-emerald-700 text-xs font-bold px-4 py-1.5 rounded-full flex items-center gap-1.5">
            <ShieldCheck className="w-4 h-4" /> Sécurisé en local
          </span>
        </div>
        
        {connectedAccounts.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {connectedAccounts.map(platform => (
              <div key={platform} className="flex items-center justify-between p-4 bg-slate-50 border border-slate-200 rounded-2xl">
                <div className="flex items-center gap-3">
                  <div className={`w-10 h-10 rounded-xl flex items-center justify-center text-white ${platform === 'tiktok' ? 'bg-black' : platform === 'meta' ? 'bg-blue-600' : 'bg-sky-600'}`}>
                    {platform === 'tiktok' && <FaTiktok className="w-5 h-5" />}
                    {platform === 'meta' && <FaFacebook className="w-5 h-5" />}
                    {platform === 'linkedin' && <FaLinkedin className="w-5 h-5" />}
                  </div>
                  <div>
                    <p className="font-bold text-slate-800 capitalize">{platform}</p>
                    <p className="text-xs font-medium text-emerald-600">Connecté avec succès</p>
                  </div>
                </div>
                <button onClick={() => handleDisconnectNative(platform)} className="text-slate-400 hover:text-red-500 p-2 transition-colors">
                  <Trash2 className="w-5 h-5" />
                </button>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-16 border-2 border-dashed border-slate-200 rounded-3xl bg-slate-50/50">
            <p className="text-slate-500 font-medium">Aucun compte connecté pour le moment.</p>
            <p className="text-sm text-slate-400 mt-2">Cliquez sur "Associer d'un clic" pour simuler une connexion rapide.</p>
          </div>
        )}
      </div>

      {/* Setup Modal */}
      {showSetupModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 backdrop-blur-sm p-4">
          <div className="bg-white rounded-[2rem] w-full max-w-lg shadow-[0_20px_60px_rgb(0,0,0,0.15)] overflow-hidden flex flex-col">
            <div className="p-6 border-b border-slate-100 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-amber-100 flex items-center justify-center text-amber-600">
                  <AlertCircle className="w-5 h-5" />
                </div>
                <h3 className="text-xl font-bold text-slate-800 capitalize">Configuration {showSetupModal} requise</h3>
              </div>
              <button onClick={() => setShowSetupModal(null)} className="p-2 text-slate-400 hover:bg-slate-100 rounded-full transition-colors">
                <X className="w-5 h-5" />
              </button>
            </div>
            
            <div className="p-8 space-y-6">
              <p className="text-slate-600 leading-relaxed font-medium">
                Pour utiliser la connexion Native OAuth avec <strong>{showSetupModal}</strong>, vous devez créer une application dans leur portail développeur et configurer les clés dans votre fichier <code className="bg-slate-100 px-1.5 py-0.5 rounded text-indigo-600">.env</code>.
              </p>
              
              <div className="space-y-4">
                <h4 className="font-bold text-slate-800 text-sm">Comment faire ?</h4>
                <ol className="list-decimal list-inside space-y-3 text-sm text-slate-600">
                  <li>Ouvrez le fichier <code className="bg-slate-100 px-1.5 py-0.5 rounded font-mono">.env.example</code> à la racine du projet.</li>
                  <li>Dupliquez-le pour créer un fichier <code className="bg-slate-100 px-1.5 py-0.5 rounded font-mono">.env</code>.</li>
                  <li>Créez une application développeur sur le portail de <strong>{showSetupModal}</strong>.</li>
                  <li>Copiez le "Client ID" et le "Client Secret" fournis par la plateforme dans votre fichier <code className="bg-slate-100 px-1.5 py-0.5 rounded font-mono">.env</code>.</li>
                  <li>Redémarrez le serveur (<code>npm run dev</code>).</li>
                </ol>
              </div>

              <div className="bg-blue-50 border border-blue-100 rounded-2xl p-4 flex gap-3 mt-4">
                <div className="text-blue-600 shrink-0"><AlertCircle className="w-5 h-5" /></div>
                <p className="text-sm text-blue-800 font-medium">Alternative : Si vous ne voulez pas créer de comptes développeurs, utilisez l'Option B (Ayrshare) en haut de la page, qui ne nécessite qu'une seule clé API !</p>
              </div>
            </div>

            <div className="p-6 border-t border-slate-100 bg-slate-50 flex justify-end">
              <button onClick={() => setShowSetupModal(null)} className="px-6 py-2.5 bg-slate-900 hover:bg-black text-white rounded-xl font-bold transition-all shadow-lg active:scale-95">
                J'ai compris
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
