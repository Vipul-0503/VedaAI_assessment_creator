# VedaAI Assessment Creator

> An enterprise-grade, full-stack AI platform that transforms unstructured teacher notes, files (PDFs, DOCX, DOC), and text snippets into highly structured, curriculum-aligned exam papers.

Built with a modern decoupled architecture, this platform leverages asynchronous background workers and real-time distributed events to ensure a seamless, non-blocking user experience — even during complex document parsing and intensive AI inference cycles.

---

## 🔗 Live Deployment

| | Link |
|---|---|
| 🌐 **Production Frontend** | [vedaai-assessment-creator-six.vercel.app](https://vedaai-assessment-creator-six.vercel.app) |
| ☁️ **Frontend Platform** | [Vercel](https://vercel.com) |
| ⚙️ **Backend Platform** | [Render](https://render.com) |

---

## ⚙️ Tech Stack

### Frontend

| Layer | Technology |
|---|---|
| Framework | Next.js (App Router, React 19, TypeScript) |
| Styling | Tailwind CSS |
| Icons | Lucide React |
| Deployment | Vercel |

### Backend

| Layer | Technology |
|---|---|
| Runtime | Node.js with TypeScript (`ts-node-dev`) |
| API Framework | Express.js |
| Database | MongoDB Atlas Cloud Cluster |
| Cache & Message Broker | Redis |
| Task Queue | BullMQ Distributed Workers |
| Generative AI | Google Gemini (`@google/genai`) |
| Real-Time Events | WebSockets |
| File Parsing | `pdf-parse-fork`, `officeparser`, `docx-parser` |
| Deployment | Render |

---

## 🏗️ Architecture Overview

The system is architected around an **Asynchronous Background Task Worker Pattern** to eliminate HTTP blocking and maintain zero latency on the main thread.

```
Client Request
│
▼
┌─────────────────────┐
│   Express API       │  ◄── Validates input, accepts multipart upload
│  (HTTP Thread)      │      Returns 202 Accepted immediately
└────────┬────────────┘
         │ Enqueues job
         ▼
┌─────────────────────┐
│   Redis + BullMQ    │  ◄── Stores job state, decouples processing
│   (Task Queue)      │
└────────┬────────────┘
         │ Worker picks up job
         ▼
┌─────────────────────┐
│   Background Worker │  ◄── Extracts raw text from uploaded files
│  (Text Extraction)  │      (PDF / DOCX / DOC binary parsing)
└────────┬────────────┘
         │
         ▼
┌─────────────────────┐
│   Gemini AI Engine  │  ◄── Receives structured prompt
│  (Inference Layer)  │      Returns deterministic JSON output
└────────┬────────────┘
         │
         ▼
┌─────────────────────┐
│   MongoDB           │  ◄── Persists structured question schemas
│   (Data Layer)      │
└────────┬────────────┘
         │ Job complete
         ▼
┌─────────────────────┐
│   WebSocket Emitter │  ◄── Broadcasts real-time completion event
└────────┬────────────┘
         │
         ▼
┌─────────────────────┐
│   Frontend Dashboard│  ◄── Updates UI instantly, no page refresh
└─────────────────────┘
```

---

## ✨ Features

- **Non-Blocking Execution** — BullMQ + Redis workers offload all AI and file processing off the main HTTP thread.
- **Multi-Format File Ingestion** — Accepts PDFs, DOCX, DOC, and plain text via a multipart form endpoint.
- **Deterministic AI Output** — Gemini is prompted to return strict JSON; responses are mapped directly into validated database schemas.
- **Real-Time UI Updates** — WebSocket events flip dashboard card states from `processing` to `complete` the instant a job finishes.
- **Print-Ready Assessment Layout** — Formatted output includes student info blocks, section dividers, and dynamic marks/difficulty tags, aligned to a Figma-defined print blueprint.
- **Answer Key Isolation** — Answer keys and scoring guidelines are stored server-side and masked from student-facing views.
- **Admin Micro-Tools** — Inline renaming with cursor-focus and overlay confirmation modals for cascade deletions.
- **Safe Creation Gatekeeper** — Multi-step form with intelligent navigation boundaries prevents invalid submissions.

---

## 🗂️ Project Structure

```
VedaAI_assessment_creator/
├── backend/
│   ├── src/
│   │   ├── config/         # Redis, MongoDB, and worker connections
│   │   ├── controllers/    # Route handler logic
│   │   ├── models/         # Mongoose schemas
│   │   ├── queues/         # BullMQ queue configuration
│   │   ├── routes/         # Express API endpoints
│   │   ├── workers/        # AI parsing and generation workers
│   │   └── server.ts       # Application entry point
│   ├── package.json
│   └── tsconfig.json
├── frontend/
│   ├── src/
│   │   └── app/
│   │       ├── assessment/ # Preview pages and export views
│   │       ├── create/     # Multi-step form
│   │       └── page.tsx    # Admin dashboard
│   ├── package.json
│   └── tailwind.config.ts
└── README.md
```

---

## 🔧 Environment Variables

### Backend — Render Dashboard

```env
PORT=5000
MONGODB_URI=your_mongodb_atlas_production_connection_string
REDIS_URL=your_production_cloud_redis_url
GEMINI_API_KEY=your_gemini_api_key_here
FRONTEND_URL=https://vedaai-assessment-creator-six.vercel.app
```

### Frontend — Vercel Dashboard

```env
NEXT_PUBLIC_API_URL=https://vedaai-assessment-creator-cszw.onrender.com
NEXT_PUBLIC_WS_URL=wss://vedaai-assessment-creator-cszw.onrender.com
```

### Local Development

**`/backend/.env`**
```env
PORT=5000
MONGODB_URI=mongodb://localhost:27017/vedaai_creator
REDIS_URL=redis://127.0.0.1:6379
GEMINI_API_KEY=your_gemini_api_key_here
FRONTEND_URL=http://localhost:3000
```

**`/frontend/.env`**
```env
NEXT_PUBLIC_API_URL=http://localhost:5000
NEXT_PUBLIC_WS_URL=ws://localhost:5000
```

---

## 🚀 Local Development

**1. Start the backend**

```bash
cd backend
npm install
npm run dev
```

**2. Start the frontend**

```bash
cd frontend
npm install
npm run dev
```

The application will be available at **http://localhost:3000**  
The backend API will listen on **http://localhost:5000**

---

<div align="center">
  <sub>Built with ❤️ using Next.js, Express, BullMQ, Redis, MongoDB & Google Gemini</sub>
</div>