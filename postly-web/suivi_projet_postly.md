# Suivi du Projet - Postly (MVP)

Ce document trace l'évolution de la plateforme Postly et liste tout ce qui a été achevé dans le Minimum Viable Product (MVP).

## 📊 État Actuel : MVP Terminé à 100%

### ✅ Sprint 1 : Initialisation & Socle Technique
- Création du projet Next.js avec Tailwind CSS.
- Mise en place de la base de données SQLite en local (Prisma ORM).
- Configuration du routeur (App Router) et des pages principales (Dashboard, Compose, Accounts).

### ✅ Sprint 2 : Authentification & Réseaux Sociaux (Mode "Local-First")
- Interface de connexion aux réseaux (TikTok, Meta, LinkedIn).
- Refonte UX "Mock/Simulation" pour la démo : Possibilité de lier des comptes d'un simple clic sans complexité OAuth.
- Les états de connexion sont sauvegardés localement.

### ✅ Sprint 3 : Éditeur de Contenu (Composer) & Intelligence Artificielle
- UI "Premium" (Glassmorphism, animations fluides).
- Intégration de l'IA pour la rédaction des posts.
- **Flexibilité de l'IA :** Modèle gratuit (Pollinations AI) intégré par défaut sans configuration, plus le support optionnel de Google Gemini et OpenAI ChatGPT via clé API stockée en `localStorage`.
- Upload d'images et de vidéos localement (sauvegardées dans `/public/uploads/`).

### ✅ Sprint 4 : Système de Planification & CRON
- UI pour choisir une date/heure de planification.
- API Route `/api/posts` pour sauvegarder en base avec statut `SCHEDULED`.
- Moteur `worker.js` indépendant utilisant `node-cron` pour scanner la DB toutes les minutes et déclencher la publication au bon moment.

### ✅ Sprint 5 : Traitement Vidéo (FFmpeg)
- Binaire FFmpeg embarqué dans l'application (`@ffmpeg-installer`).
- Formatage automatique des vidéos au format TikTok (9:16 - 1080x1920, H.264).
- Indicateurs de chargement (Spinner UI) asynchrones.

---

## 🔮 Idées pour la V2 (Post-MVP)
- Dashboard Analytique complet (Vues, Likes, Partages simulés ou via API réelles).
- Calendrier visuel complet (Drag & Drop des posts planifiés).
- Gestion multi-espaces de travail (Workspaces).
- Implémentation complète des vrais callbacks OAuth pour un déploiement Cloud.
