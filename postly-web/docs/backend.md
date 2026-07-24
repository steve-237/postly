# Documentation Backend & API - Postly

Le Backend de Postly est conçu avec les **Next.js API Routes** (`src/app/api/...`), ce qui permet d'avoir des fonctions Serverless locales directement couplées au projet.

## 💾 Base de Données (SQLite & Prisma)
Le projet utilise une base de données **SQLite** locale (`prisma/dev.db`) pour un setup instantané "Local-First". 
L'ORM **Prisma** est utilisé pour interagir avec la base.

- **Schéma (`prisma/schema.prisma`) :** Définit les modèles `Workspace`, `SocialAccount`, `Post` et `Media`.
- **Génération du Client :** 
  En cas de changement de dépendances, il faut regénérer le client : 
  `npx prisma generate`

## 🌐 Routes API
Toutes les requêtes côté serveur passent par le dossier `src/app/api` :

1. **`/api/ai/generate` :** 
   - Reçoit un prompt et un modèle (Pollinations, Gemini, OpenAI).
   - Construit un System Prompt de Social Media Management.
   - Appelle l'API externe (en GET ou POST selon le fournisseur) et renvoie le texte.

2. **`/api/upload` :**
   - Intercepte les fichiers via `FormData`.
   - Écrit les fichiers localement dans le dossier `public/uploads/`.
   - Renvoie l'URL d'accès public du fichier.

3. **`/api/video` :**
   - Route gérant FFmpeg via `fluent-ffmpeg`.
   - Transforme les vidéos uploadées au format 9:16 (TikTok), résolution 1080x1920 avec encodage H.264.

4. **`/api/posts` :**
   - Crée un brouillon ou planifie un post dans la base de données SQLite.

## ⚙️ Cron Job (Auto-Publication)
Le mécanisme de publication automatique est découplé du serveur Next.js pour éviter les crashs de HMR (Hot Module Replacement) :
- **Fichier :** `worker.js` (à la racine)
- **Rôle :** Scanne la base Prisma toutes les minutes. Si un post a un statut `SCHEDULED` et que son `scheduledAt` est dépassé, il simule la publication sur les réseaux sociaux (appels API TikTok/Meta à implémenter) et passe le statut à `PUBLISHED`.
- **Exécution :** À exécuter via `node worker.js` en parallèle du serveur web.
