# Postly - Plateforme de Publication Sociale "Local-First"

Bienvenue dans le dépôt principal de **Postly**, un outil complet pour créer, planifier et publier automatiquement du contenu sur TikTok, Meta et LinkedIn, avec l'aide de l'Intelligence Artificielle.

## 🌟 Concept "Local-First"
Le concept central de cette architecture est le "0€ de coût d'hébergement". L'ensemble de la base de données (SQLite), des médias et de la logique de planification tourne localement sur la machine de l'utilisateur. Aucune donnée n'est stockée sur le Cloud.

## 🏗️ Architecture & Stack Technique
Postly est développé sous forme de **Monolithe Fullstack** utilisant le framework Next.js :

- **Frontend :** Next.js (App Router), React, Tailwind CSS (Design System "Premium Glassmorphism"), Zustand (State Management), Lucide React (Icônes).
- **Backend :** Next.js API Routes (Serverless functions exécutées localement).
- **Base de Données :** Prisma ORM avec SQLite (base locale).
- **IA :** Intégration flexible (Pollinations AI en natif gratuit, Gemini 1.5, OpenAI GPT-4).
- **Traitement Vidéo :** FFmpeg natif (via `fluent-ffmpeg` et `@ffmpeg-installer/ffmpeg`) pour formater les vidéos TikTok (9:16).
- **Auto-Pilote :** Cron Job (`node-cron`) géré par un `worker.js` en arrière-plan.

## 🎨 Design System
Le design system s'oriente vers un style **SaaS Premium** :
- **Glassmorphism :** Effets de flou (`backdrop-blur`) et bordures semi-transparentes.
- **Typographie :** Polices robustes avec des contrastes forts (Slate-800 vs Slate-400).
- **Couleurs :** Palette dynamique, boutons avec dégradés vibrants et ombres diffuses.
- **Micro-animations :** Effets d'échelle (`scale`) fluides lors du survol et des clics.

## 🚀 Comment lancer le projet

1. **Installation des dépendances :**
   ```bash
   npm install
   ```

2. **Génération de la base de données (Prisma) :**
   ```bash
   npx prisma generate
   npx prisma db push
   ```

3. **Lancement de l'application :**
   ```bash
   npm run dev
   ```
   L'application sera accessible sur `http://localhost:3000`.

## 📁 Documentation détaillée
Consultez le dossier `docs/` pour une vue approfondie de l'infrastructure :
- [Documentation Frontend](docs/frontend.md)
- [Documentation Backend & IA](docs/backend.md)
