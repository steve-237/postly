# Postly 🚀 — Advanced Local-First Social Media Automation & AI Publisher

<div align="center">

![Postly Banner](https://img.shields.io/badge/Postly-Local--First%20Social%20Publisher-6366f1?style=for-the-badge&logo=next.dot.js&logoColor=white)
![Next.js](https://img.shields.io/badge/Next.js-16%20Turbopack-black?style=for-the-badge&logo=next.dot.js)
![TypeScript](https://img.shields.io/badge/TypeScript-5.0+-3178C6?style=for-the-badge&logo=typescript&logoColor=white)
![Prisma](https://img.shields.io/badge/Prisma_7-ORM_%2B_SQLite-2D3748?style=for-the-badge&logo=prisma&logoColor=white)
![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-3.4+-38B2AC?style=for-the-badge&logo=tailwind-css&logoColor=white)
![Zustand](https://img.shields.io/badge/State-Zustand-orange?style=for-the-badge)

**An autonomous, local-first social media publishing platform powered by Artificial Intelligence.**  
Create, schedule, format, and auto-publish content across **TikTok, LinkedIn, Facebook, and Instagram** with zero monthly cloud database or hosting costs.

</div>

---

## 📖 Table of Contents
- [🌟 Concept & Local-First Philosophy](#-concept--local-first-philosophy)
- [✨ Key Features](#-key-features)
- [🏗️ Technology Stack](#-technology-stack)
- [📂 Project Architecture & File Structure](#-project-architecture--file-structure)
- [⚡ Getting Started & Installation](#-getting-started--installation)
- [⚙️ Configuration & Environment Variables](#️-configuration--environment-variables)
- [🚀 User Guide & Workflows](#-user-guide--workflows)
- [⏰ Background Auto-Pilot (Worker)](#-background-auto-pilot-worker)
- [🎨 UI & Design System](#-ui--design-system)
- [📚 Additional Documentation](#-additional-documentation)

---

## 🌟 Concept & Local-First Philosophy

In a world dominated by expensive SaaS subscriptions and cloud vendor lock-in, **Postly** introduces a **100% Local-First** architecture for community management and social media automation:
1. **Zero Hosting & Database Costs**: Your entire database (`dev.db` via SQLite), user preferences, and uploaded media files reside locally on your own machine.
2. **Maximum Data Privacy**: Your API keys and social tokens are never stored on external third-party servers. API keys for AI models are securely stored in your browser's local storage or your local `.env` file.
3. **Full Ownership & Portability**: You own your content pipeline from end to end. Backing up your workspace is as simple as copying your SQLite database file.

---

## ✨ Key Features

### 🤖 Multi-Provider AI Content Generation
Write captivating, viral social media posts in seconds with an intelligent prompt engine. Postly integrates a **resilient 3-tier fallback generator**:
- **Pollinations AI (Free & No Key Required)**: Automatically used as a zero-config default. Features advanced retry logic and 3-step fallbacks (GET endpoint -> OpenAI-compatible POST -> Legacy POST) to seamlessly bypass rate limits (HTTP 429).
- **Google Gemini 1.5 Flash**: Lightning-fast generation with high precision and low latency.
- **OpenAI ChatGPT (GPT-4o-mini)**: Highly optimized for creative copywriting, hashtag generation, and audience engagement.

### 📅 Visual Grid Calendar & Chronological Timeline
Never lose track of your content pipeline:
- **Interactive Monthly Grid**: A full-screen calendar view displaying daily post volumes, publication times, and color-coded statuses (*Published*, *Scheduled*, *Draft*, *Failed*).
- **Detailed Chronological Timeline**: Deep-dive into individual posts with previews of attached images and videos directly from the calendar interface.

### 📱 Multi-Platform Social Connectivity (Dual Options)
Connect to your favorite social networks using two flexible strategies:
- **Option A (Native OAuth Integration)**: Connect directly to **TikTok Creators**, **LinkedIn Profiles/Pages**, and **Meta (Facebook & Instagram)** via official OAuth flows. Includes interactive, step-by-step UI guidance modals when local developer credentials are missing.
- **Option B (Ayrshare Unified API)**: Don't want to manage multiple developer apps? Link an **Ayrshare** aggregator API key to broadcast real publications to all connected platforms simultaneously with a single key.

### 🎬 Native FFmpeg Video Formatting
Uploading videos for TikTok or Shorts? Postly includes a built-in background media processor powered by **FFmpeg** (`fluent-ffmpeg` + `@ffmpeg-installer/ffmpeg`) that automatically scales, crops, and pads videos into the vertical **9:16 aspect ratio** (1080x1920) required by modern short-form video algorithms.

### 📊 Real-Time Analytics Dashboard
Track your editorial productivity and publishing success rates with a dedicated analytics suite:
- Total volume KPIs, success rate percentages, and failure monitoring.
- Interactive 7-day activity bar charts showing daily creation output.
- Visual status distribution bars (*Published vs. Scheduled vs. Drafts*).

### 🔔 Global Alert & Pop-up Modal System
Goodbye ugly browser `alert()` pop-ups! Postly uses a custom, centralized **Zustand Alert Store** combined with a sleek **Glassmorphism Modal Notification System** that overlays smoothly on any screen to provide clear feedback on errors, network requests, and confirmations.

---

## 🏗️ Technology Stack

| Layer | Technology | Description |
| :--- | :--- | :--- |
| **Framework** | **Next.js 16 (App Router + Turbopack)** | Fullstack React 19 framework providing Server Components, Client Components, and serverless API routes. |
| **Language** | **TypeScript 5.0+** | Strict type safety across frontend components and backend API endpoints. |
| **Database / ORM** | **Prisma ORM 7 + SQLite (`@libsql/client`)** | Ultra-fast local SQLite database management using modern Prisma 7 adapter patterns. |
| **State Management** | **Zustand (with Persistence)** | Lightweight, reactive client-side state for workspace settings and global alert modals. |
| **Styling & UI** | **Tailwind CSS + Vanilla CSS Tokens** | Custom SaaS design system featuring Glassmorphism, gradients, and micro-animations. |
| **Icons & Dates** | **Lucide React + Date-fns (French Locale)** | Consistent, scalable iconography and human-readable relative date formatting. |
| **Media Engine** | **Fluent-FFmpeg** | Native Node.js wrapper for FFmpeg video processing and transcoding. |
| **Scheduler** | **Node-Cron** | Autonomous background cron daemon (`worker.js`) for timed publication delivery. |

---

## 📂 Project Architecture & File Structure

```text
postly-web/
├── docs/                      # Deep-dive technical documentation
│   ├── backend.md             # Backend architecture, API routes & AI logic
│   └── frontend.md            # Frontend UI tokens, design decisions & Zustand
├── prisma/
│   ├── migrations/            # SQL migration history
│   ├── schema.prisma          # Database schema (Posts, Accounts, Workspace, Media)
│   └── prisma.config.ts       # Prisma 7 configuration file (datasource url mapping)
├── src/
│   ├── app/
│   │   ├── accounts/          # Social accounts management & OAuth binding page
│   │   ├── analytics/         # Editorial performance & statistics dashboard
│   │   ├── api/               # Next.js Backend API Routes
│   │   │   ├── ai/generate/   # Multi-provider AI prompt execution route
│   │   │   ├── auth/          # OAuth callback & login check routes
│   │   │   ├── posts/         # CRUD operations & publishing dispatch for posts
│   │   │   ├── upload/        # Local disk file upload handler
│   │   │   ├── video/         # FFmpeg video transcoding endpoint
│   │   │   └── workspace/     # Workspace config & Ayrshare key storage
│   │   ├── calendar/          # Monthly grid calendar & timeline view page
│   │   ├── compose/           # Rich AI editor & post creation page
│   │   ├── settings/          # AI models, social keys & workspace configuration
│   │   ├── layout.tsx         # Root layout featuring Sidebar, Header & GlobalAlertModal
│   │   └── page.tsx           # Overview dashboard with KPI cards & recent activity
│   ├── components/
│   │   ├── layout/            # Navigation Sidebar & top Glassmorphism Header
│   │   └── ui/                # Reusable UI components (GlobalAlertModal)
│   ├── lib/
│   │   └── prisma.ts          # Singleton Prisma 7 Client initialized with LibSql adapter
│   └── store/
│       ├── useAlertStore.ts   # Zustand store for global pop-up notifications
│       └── useWorkspaceStore.ts # Zustand store for workspace persistence
├── dev.db                     # Local SQLite database file (created automatically)
├── worker.js                  # Standalone background cron daemon for scheduled posts
├── next.config.ts             # Next.js configuration & environment mappings
├── tailwind.config.ts         # Tailwind CSS design tokens and theme overrides
└── package.json               # Project dependencies and NPM scripts
```

---

## ⚡ Getting Started & Installation

### Prerequisites
Ensure you have the following installed on your local machine:
- **Node.js** (v20.0.0 or higher recommended)
- **NPM** (v9+ or equivalent package manager)
- **Git**

### Step-by-Step Installation

1. **Clone the Repository:**
   ```bash
   git clone https://github.com/YourUsername/postly-web.git
   cd postly-web
   ```

2. **Install Node Dependencies:**
   ```bash
   npm install
   ```

3. **Initialize the SQLite Database:**
   Generate the Prisma client and push the database schema to create your local `dev.db` file:
   ```bash
   npx prisma generate
   npx prisma db push
   ```

4. **Start the Development Server:**
   Launch the Next.js application with Turbopack enabled for instant hot-reloading:
   ```bash
   npm run dev
   ```
   🎉 Open your browser and navigate to **`http://localhost:3000`**.

---

## ⚙️ Configuration & Environment Variables

Postly works out-of-the-box without any mandatory environment variables thanks to its local-first SQLite setup and free Pollinations AI integration. 

However, to unlock **Native OAuth Social Publishing** (Option A) and external AI providers, create a `.env` file at the root of the project:

```env
# ─── DATABASE (Auto-configured by Prisma 7) ───
DATABASE_URL="file:./dev.db"

# ─── OPTIONAL: AI PROVIDERS API KEYS ───
# You can also configure these directly in the UI under Settings -> AI Models
GEMINI_API_KEY="your_google_gemini_api_key_here"
OPENAI_API_KEY="your_openai_api_key_here"

# ─── OPTIONAL: OPTION A - NATIVE SOCIAL OAUTH KEYS ───
# Create developer applications on respective developer portals to obtain these:
TIKTOK_CLIENT_KEY="your_tiktok_client_key"
TIKTOK_CLIENT_SECRET="your_tiktok_client_secret"

META_APP_ID="your_meta_facebook_app_id"
META_APP_SECRET="your_meta_facebook_app_secret"

LINKEDIN_CLIENT_ID="your_linkedin_client_id"
LINKEDIN_CLIENT_SECRET="your_linkedin_client_secret"

# ─── OPTIONAL: OPTION B - AYRSHARE AGGREGATOR ───
# Can also be saved directly in the UI under Accounts -> Ayrshare
AYRSHARE_API_KEY="your_ayrshare_profile_api_key"
```

> **Tip:** Whenever you modify `.env` variables, remember to restart your development server (`Ctrl + C` then `npm run dev`) for the changes to take effect.

---

## 🚀 User Guide & Workflows

### 1. Initial Setup & AI Configuration
- Navigate to **Settings** (`/settings`) from the left sidebar.
- Under the **AI Models** tab, choose your default provider. If using Gemini or OpenAI, paste your API key and click **Save**. Keys are safely encrypted in your browser's `localStorage`.
- Customize your company or brand name under the **Workspace** tab.

### 2. Linking Social Media Accounts
- Go to **Linked Accounts** (`/accounts`).
- **For Quick & Unified Publishing (Recommended):** Enter your Ayrshare Profile API Key in the top purple banner and click **Save**.
- **For Native OAuth:** Click **Associate** under TikTok, LinkedIn, or Meta. If developer keys are not found in `.env`, a helpful pop-up modal will appear guiding you on how to configure them.

### 3. Creating & Generating Content with AI
- Navigate to **Create Post** (`/compose`).
- Select the target platforms at the top (TikTok, Meta, LinkedIn).
- Type a rough idea or topic in the text area (e.g., *"Top 5 tips to increase productivity working from home"*).
- Click **Generate with AI** (✨). The AI will craft an engaging post complete with emojis and trending hashtags.
- Click **Add Media** to upload images or videos. If you upload a video, Postly will automatically format and optimize it for TikTok/Reels in the background!

### 4. Publishing, Scheduling & Monitoring
- **Save as Draft:** Save your work-in-progress without publishing.
- **Schedule:** Pick a date and time using the date picker and click **Schedule**. The post will be added to your calendar queue.
- **Publish Immediately:** Click **Publish** to broadcast the post immediately to your connected networks.
- View your content timeline in the **Calendar** (`/calendar`) and inspect your growth metrics in **Analytics** (`/analytics`).

---

## ⏰ Background Auto-Pilot (Worker)

To automatically publish posts that have been scheduled for a future date/time, Postly includes a standalone background worker script (`worker.js`) powered by `node-cron`.

### How to Run the Worker
Open a second terminal window (keep `npm run dev` running in the first) and execute:
```bash
node worker.js
```

### How It Works
- The worker runs an automated cron job every minute (`* * * * *`).
- It queries the local SQLite database for posts where `status === 'SCHEDULED'` and `scheduledAt <= CURRENT_TIMESTAMP`.
- It securely dispatches the post content and attached media to the appropriate publishing APIs (Ayrshare or Native OAuth).
- Upon success, the post status is automatically updated to `PUBLISHED` in your database. If an error occurs, it is marked as `FAILED` so you can review it in the Analytics dashboard.

---

## 🎨 UI & Design System

Postly is built with a strong focus on visual aesthetics and user experience:
- **Glassmorphism:** The sticky top header and content cards utilize translucent backgrounds with subtle backdrop blurring (`bg-white/80 backdrop-blur-xl`) for a sleek, modern depth effect.
- **Curated Color Palettes:** Vibrant gradient buttons (`from-violet-600 via-fuchsia-500 to-orange-500`) paired with clean, dark-mode navigation sidebars (`#0F172A`).
- **Interactive Micro-Animations:** Buttons and cards respond naturally to user interactions with smooth scaling (`hover:scale-[1.02] active:scale-95`) and shadow transitions.
- **Responsive Layouts:** Designed to work seamlessly across desktops, laptops, and tablets.

---

## 📚 Additional Documentation

For developers looking to contribute, extend the database schema, or customize the AI prompt engineering, please consult our detailed internal documentation:
- 📖 **[Frontend Architecture & Zustand Stores](docs/frontend.md)**: Deep dive into UI tokens, component hierarchies, and state management.
- 📖 **[Backend Architecture & AI Integration](docs/backend.md)**: Explanations of Next.js serverless API routes, Prisma 7 LibSql adapter setup, Pollinations AI fallback logic, and FFmpeg transcoding pipelines.

---

<div align="center">
  <p className="text-sm font-semibold text-slate-500">
    Built with ❤️ by the Postly Team. Powered by Local-First Architecture & Advanced AI.
  </p>
</div>
