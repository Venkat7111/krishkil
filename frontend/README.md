# KrishiSahay — Frontend

Generative AI Powered Agricultural Query Resolution System — React frontend.

## Stack
React 19 + Vite, JavaScript (no TypeScript), Tailwind CSS v4, React Router,
TanStack Query, React Hook Form + Zod, Framer Motion, Lucide icons, Recharts,
React Dropzone.

## Getting started
npm install
npm run dev       # start local dev server
npm run build     # production build to dist/
npm run preview   # preview the production build

Copy .env.example to .env and point VITE_API_BASE_URL at your FastAPI
backend when it's ready. Every page currently runs on realistic mock data
in src/services/api/* (delayed with mockDelay) — swap the function bodies
for real axiosClient calls and the UI keeps working unchanged.

## What's included
- Full auth flow: Splash to Welcome to Login/Register to Forgot Password to OTP
  to Reset Password, with real-time Zod validation, password-strength meter,
  and a guest mode.
- Dashboard with quick actions, weather, crop health, market snapshot, tasks,
  and scheme highlights.
- AI Chat (ChatGPT-style, suggested prompts, typing indicator, copy/regenerate).
- Disease Detection (drag-and-drop upload, mock AI diagnosis, treatment card).
- Crop Recommendation (soil/climate form to recommended crop, NPK chart, alternatives).
- Weather, Irrigation, Fertilizer, Market, Government Schemes, Reports, Profile,
  and Settings pages, all wired to mock services and fully responsive.
- Dark/light theme, 3-language switcher (English/Telugu/Hindi labels, wire up
  i18n strings when ready), glassmorphism cards, and a signature "growing
  leaf-vein" motif used on the splash screen and card corners.

## Folder structure
src/
  components/   common UI kit, cards, layout, chat
  pages/        auth/ and app/ route screens
  layouts/      AuthLayout, DashboardLayout
  context/      Theme, Language, Auth (React Context)
  services/api/ mock API modules, ready to be swapped for FastAPI calls
  routes/       ProtectedRoute guard
  constants/    sidebar navigation config
  utils/        Zod validation schemas

## Connecting the FastAPI backend
1. Set VITE_API_BASE_URL in .env.
2. In each file under src/services/api/, replace the mockDelay(...) call
   with axiosClient.get/post(...) — the exported function signatures already
   match what the pages call, so no component code needs to change.
