# Documentation Frontend - Postly

Cette application web Next.js contient l'intégralité du code côté client (UI) pour le tableau de bord de Postly.

## 🏗️ Structure des Dossiers (Feature-First)
L'application utilise le **App Router** de Next.js (Dossier `src/app`).

- `src/app/page.tsx` : Page d'accueil (Dashboard) avec les KPI et l'historique des posts.
- `src/app/compose/page.tsx` : Le "Composer", cœur de l'application où l'utilisateur rédige (avec l'IA), uploade ses médias et planifie.
- `src/app/accounts/page.tsx` : Gestion des connexions OAuth simulées avec les plateformes (TikTok, Meta, LinkedIn).
- `src/app/layout.tsx` : Le layout principal contenant la Sidebar globale (Navigation).
- `src/components/` : (À venir pour des composants réutilisables, actuellement gérés directement dans les pages pour accélérer le MVP).
- `src/store/` : Utilisation éventuelle de Zustand pour le state global.

## 🎨 Design System et UI
L'Interface Utilisateur est conçue avec Tailwind CSS.
- **Approche Glassmorphism :** Beaucoup d'utilisation de `bg-white/80` ou `bg-white/90` couplés à `backdrop-blur-xl` pour un effet "verre dépoli" très qualitatif.
- **Boutons & États :** Effets de survol et de clic animés (`hover:scale-[1.02] active:scale-95`).
- **Responsive :** Le layout passe d'une colonne (mobile) à une disposition Sidebar + Contenu sur Desktop (`lg:flex-row`).

## 🔄 Gestion d'État (State)
- **Local State (`useState`)** pour les formulaires.
- **LocalStorage :** Utilisé pour persister la clé API de l'IA et les connexions réseau-sociaux simulées entre les rechargements.

## 🚀 Lancer le Frontend
Puisque le Frontend est couplé au Backend via Next.js, la commande `npm run dev` à la racine suffit pour compiler le frontend et le rendre accessible sur `http://localhost:3000`.
