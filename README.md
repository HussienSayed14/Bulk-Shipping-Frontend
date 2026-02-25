# 📦 ShipFlow — Frontend

The React frontend for the Bulk Shipping Label Platform. A modern, responsive SPA that guides users through uploading CSV shipments, reviewing/editing records, selecting shipping services, and purchasing labels.

---

## Overview

ShipFlow provides a wizard-style workflow for bulk shipping label creation:

```
Login → Upload CSV → Review & Edit → Select Shipping → Purchase Labels
```

**Key features:**

- Drag-and-drop CSV upload with instant parsing feedback
- Review table with filtering (all/valid/invalid), search, and inline editing
- Bulk actions — apply a saved address or package preset to hundreds of records at once
- Edit modals for individual address and package corrections
- Address verification status badges (verified/failed/unverified)
- Shipping service selection with live cost calculation
- Purchase flow with label size picker, balance check, and confirmation
- Order history page with batch management
- JWT authentication with automatic token refresh
- Responsive layout with persistent sidebar navigation

---

## Tech Stack

| Layer | Technology |
|-------|-----------|
| **Framework** | React 18 + TypeScript |
| **Build Tool** | Vite |
| **Routing** | React Router v6 |
| **State Management** | Zustand |
| **HTTP Client** | Axios |
| **Styling** | Tailwind CSS |
| **UI Components** | shadcn/ui (Button, Input, Label) |
| **Icons** | Lucide React |
| **Notifications** | react-hot-toast |
| **Utilities** | clsx, tailwind-merge |

---

## Project Structure

```
frontend/
├── public/
│   └── Template.csv              # CSV template for download
├── src/
│   ├── api/
│   │   ├── client.ts             # Axios instance, interceptors, JWT refresh
│   │   └── endpoints.ts          # All API endpoint functions
│   ├── components/
│   │   ├── common/
│   │   │   ├── ConfirmDialog.tsx
│   │   │   ├── FileUpload.tsx    # Drag-and-drop CSV uploader
│   │   │   ├── LoadingSpinner.tsx
│   │   │   └── StatusBadge.tsx
│   │   ├── layout/
│   │   │   ├── AppLayout.tsx     # Sidebar + Header + content area
│   │   │   ├── Header.tsx        # Balance display, user info
│   │   │   └── Sidebar.tsx       # Navigation
│   │   ├── shipments/
│   │   │   ├── BulkActionsBar.tsx
│   │   │   ├── EditAddressModal.tsx
│   │   │   └── EditPackageModal.tsx
│   │   └── ui/
│   │       ├── button.tsx        # shadcn/ui
│   │       ├── input.tsx
│   │       └── label.tsx
│   ├── lib/
│   │   └── utils.ts              # cn() helper (clsx + tailwind-merge)
│   ├── pages/
│   │   ├── Login.tsx
│   │   ├── orders/
│   │   │   └── OrderHistory.tsx
│   │   └── wizard/
│   │       ├── Step1Upload.tsx
│   │       ├── Step2Review.tsx
│   │       ├── Step3Shipping.tsx
│   │       └── Purchase.tsx
│   ├── store/
│   │   ├── authStore.ts          # Auth state, JWT tokens, login/logout
│   │   └── batchStore.ts         # Batch/shipment state, filters, selection
│   ├── types/
│   │   └── index.ts              # TypeScript interfaces
│   ├── App.tsx                   # Routes and layout
│   ├── index.css                 # Tailwind + custom animations + design tokens
│   └── main.tsx                  # Entry point
├── index.html
├── tailwind.config.js
├── tsconfig.json
├── vite.config.ts
├── package.json
├── Dockerfile
└── .env
```

---

## Design System

| Token | Value |
|-------|-------|
| **Sidebar** | Deep navy `#0f172a` |
| **Brand** | Blue-teal `#3290fc` |
| **Success** | Emerald green |
| **Error** | Red |
| **Display Font** | Plus Jakarta Sans |
| **Body Font** | DM Sans |
| **Mono Font** | JetBrains Mono |

Custom animations: `fade-in`, `fade-in-up`, `scale-in`, `slide-in-right` — defined in `index.css`.

---

## Setup — Local (Node.js)

### Prerequisites

- Node.js 18+
- npm or yarn

### 1. Clone the repository

```bash
git clone https://github.com/HussienSayed14/Bulk-Shipping-Frontend.git
cd Bulk-Shipping-Frontend/bulk-shipping-frontend
```

### 2. Install dependencies

```bash
npm install
```

### 3. Create the `.env` file

```env
VITE_API_BASE_URL=http://127.0.0.1:8000/api
```

### 4. Add the CSV template

Place your `Template.csv` file in the `public/` directory:

```bash
cp /path/to/Template.csv public/Template.csv
```

This is served at `/Template.csv` and used by the upload page's download link.

### 5. Start the development server

```bash
npm run dev
```

The app is now live at `http://localhost:5173`.

### 6. Build for production

```bash
npm run build
```

Output goes to `dist/` — serve it with any static file server or Nginx.

---

## Setup — Docker

### 1. Create the `.env` file

```env
VITE_API_BASE_URL=http://127.0.0.1:8000/api
```

### 2. Build and run

```bash
docker build -t shipflow-frontend .
docker run -p 3000:80 shipflow-frontend
```

The app is now live at `http://localhost:3000`.

### Or use docker-compose (with the backend)

Add this to the root `docker-compose.yml`:

```yaml
services:
  backend:
    build: ./backend
    ports:
      - "8000:8000"
    env_file:
      - ./backend/.env

  frontend:
    build: ./frontend
    ports:
      - "3000:80"
    depends_on:
      - backend
```

```bash
docker-compose up --build
```

---

## Pages

| Route | Page | Description |
|-------|------|-------------|
| `/login` | Login | Username/password login with JWT |
| `/upload` | Step 1 — Upload | Drag-and-drop CSV upload, template download |
| `/review/:batchId` | Step 2 — Review | Table with filters, search, inline edit, bulk actions |
| `/shipping/:batchId` | Step 3 — Shipping | Service selection, cost calculation |
| `/purchase/:batchId` | Purchase | Label size, balance check, terms, confirmation |
| `/orders` | Order History | List all batches, continue drafts, view purchased |
| `/dashboard` | Dashboard | Coming soon |
| `/billing` | Billing | Coming soon |

---

## Environment Variables

| Variable | Required | Description |
|----------|----------|-------------|
| `VITE_API_BASE_URL` | Yes | Backend API base URL (e.g., `http://127.0.0.1:8000/api`) |

---

## API Connection

The frontend connects to the Django backend REST API. All requests go through the Axios client in `src/api/client.ts`, which handles:

- Attaching the JWT `Authorization: Bearer` header to every request
- Automatic token refresh on 401 responses
- Redirect to `/login` when refresh fails
- Centralized error extraction for toast notifications

Make sure the backend is running and the `VITE_API_BASE_URL` points to it.

---