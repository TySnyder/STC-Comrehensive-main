# Technology Stack

**Analysis Date:** 2026-06-29

## Languages

**Primary:**
- TypeScript 5.8.2 - Full codebase (src/, components, types)
- JSX/TSX - React components using React 19 syntax

**Secondary:**
- CSS - Tailwind CSS v4 (utility-first styling)
- HTML - index.html entry point

## Runtime

**Environment:**
- Node.js (version not specified in package.json, but required for dev server and build)

**Package Manager:**
- npm - Manages dependencies and scripts
- Lockfile: package-lock.json present

## Frameworks

**Core:**
- React 19.0.1 - UI framework
- Vite 6.2.3 - Build tool and dev server
- @vitejs/plugin-react 5.0.4 - React integration for Vite

**Styling:**
- Tailwind CSS 4.1.14 - Utility-first CSS framework
- @tailwindcss/vite 4.1.14 - Tailwind plugin for Vite
- autoprefixer 10.4.21 - PostCSS plugin for vendor prefixes

**UI Components:**
- lucide-react 0.546.0 - Icon library with React components

**Animation:**
- motion 12.23.24 - Animation library (Framer Motion-like)

**Server/Backend:**
- Express 4.21.2 - Web framework (installed but not actively used in current source code)

## Key Dependencies

**Critical:**
- react-dom 19.0.1 - React rendering to DOM
- @google/genai 2.4.0 - Google Generative AI SDK (Gemini API client) - configured but not actively integrated in current frontend
- dotenv 17.2.3 - Environment variable management

**Build & Development:**
- tsx 4.21.0 - TypeScript executor for Node.js scripts
- esbuild 0.25.0 - JavaScript bundler/transpiler
- typescript ~5.8.2 - TypeScript compiler

**Type Definitions:**
- @types/react 19.2.17 - React type definitions
- @types/react-dom 19.2.3 - React DOM type definitions
- @types/express 4.17.21 - Express type definitions
- @types/node 22.14.0 - Node.js type definitions

## Configuration

**Environment:**
- `.env.example` file present with template variables:
  - `GEMINI_API_KEY` - Required for Gemini AI API calls (injected by AI Studio at runtime)
  - `APP_URL` - Application URL for self-referential links and OAuth callbacks (injected by AI Studio)
- Environment variables managed through dotenv
- Disabled HMR (Hot Module Replacement) controlled via `DISABLE_HMR` env var for AI Studio environments

**Build:**
- `vite.config.ts` - Vite configuration with:
  - React plugin for JSX support
  - Tailwind CSS plugin
  - Path alias: `@/*` maps to project root
  - Configurable HMR and file watching based on `DISABLE_HMR` environment variable

**TypeScript:**
- `tsconfig.json` with:
  - Target: ES2022
  - Module: ESNext
  - JSX: react-jsx
  - Module resolution: bundler
  - Path alias enabled for `@/*` pointing to project root

## Platform Requirements

**Development:**
- Node.js (version unspecified, but modern version required)
- npm (or compatible package manager)
- TypeScript support required

**Production:**
- Deployment target: Google AI Studio Cloud Run environment
- Express server capability for potential backend (Express package present)
- Browser with ES2022+ support for client-side JavaScript

## Build & Dev Scripts

```bash
npm run dev      # Start dev server on port 3000 (Vite with HMR disabled in AI Studio)
npm run build    # Production build to dist/ directory
npm run preview  # Preview production build locally
npm run clean    # Remove dist/ and server.js
npm run lint     # Type checking with tsc --noEmit
```

---

*Stack analysis: 2026-06-29*
