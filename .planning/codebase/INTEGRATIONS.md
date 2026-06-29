# External Integrations

**Analysis Date:** 2026-06-29

## APIs & External Services

**Google Generative AI:**
- Gemini API - Configured for potential AI integration
  - SDK: @google/genai 2.4.0
  - Auth: `GEMINI_API_KEY` environment variable
  - Status: Package installed but not actively integrated in current frontend code
  - Use case: Server-side Gemini API capability declared in metadata.json (majorCapabilities: "MAJOR_CAPABILITY_SERVER_SIDE_GEMINI_API")

**Google Fonts:**
- Google Fonts API - CSS import for typography
  - Fonts: Inter, Space Grotesk, JetBrains Mono
  - Endpoint: https://fonts.googleapis.com/css2
  - Scope: `src/index.css`
  - Purpose: Typography for UI

**External Images:**
- Unsplash - Placeholder/sample images for staff and user avatars
  - URLs: https://images.unsplash.com (staff photos in demo data)
  - Scope: `src/data.ts` (sample staff data only)
  - Purpose: UI demonstration (not production data)

## Data Storage

**Databases:**
- None configured - Application uses in-memory state only
- Client: Not applicable
- ORM: Not applicable

**File Storage:**
- Local filesystem only - No external file storage service
- All data (clients, staff, notes, attendance) persists in React component state only
- Data loss on browser refresh

**Caching:**
- None configured - Vite HMR caching controlled by `DISABLE_HMR` env var
- No Redis or caching layer

## Authentication & Identity

**Auth Provider:**
- Custom (basic demo state) - No OAuth or external identity provider
- Implementation: Demo mode with hardcoded staff and client data in `src/data.ts`
- Credentials: Not applicable - No authentication system implemented
- User identification: Ad-hoc (not part of current feature set)

## Monitoring & Observability

**Error Tracking:**
- None detected - No Sentry, Rollbar, or similar

**Logs:**
- Browser console only - Standard console.log (no centralized logging)
- Vite dev server logs

## CI/CD & Deployment

**Hosting:**
- Google AI Studio Cloud Run environment
- Vite dev server on port 3000 (configurable, defaults to 3000 but uses 3004+ on dev machine due to port availability)

**CI Pipeline:**
- None detected - No GitHub Actions, GitLab CI, or similar
- Manual deployment through AI Studio UI (https://ai.studio/apps/ffac3efb-8308-4073-9075-9e5fbb73e342)

**Build Artifacts:**
- `npm run build` produces static SPA in `dist/` directory
- No server-side rendering or separate backend bundle

## Environment Configuration

**Required env vars:**
- `GEMINI_API_KEY` - Gemini API authentication (required if server-side AI features are used)
- `APP_URL` - Application URL for self-referential links and OAuth callbacks (injected by AI Studio)

**Optional env vars:**
- `DISABLE_HMR` - When "true", disables Vite HMR and file watching (used in AI Studio agent edit mode)

**Secrets location:**
- Secrets stored in AI Studio Secrets panel (not in repo)
- Template/example: `.env.example` (never read .env or .env.local files for actual secrets)

## Webhooks & Callbacks

**Incoming:**
- None detected - No webhook endpoints implemented

**Outgoing:**
- None detected - No external API calls to trigger webhooks

## Data Flow Architecture

**Current state (client-side only):**
1. `App.tsx` maintains all state in React hooks
2. Initial data loaded from `src/data.ts` (hardcoded demo data)
3. UI components trigger state updates through callback handlers
4. No persistence layer - all changes lost on refresh
5. No network calls except:
   - Google Fonts CSS import
   - Unsplash image loading (demo data only)
   - Vite HMR websocket (dev server only)

**Configured but unused:**
- `@google/genai` SDK present for future Gemini integration
- Express.js installed but not actively used in frontend

## Future Integration Points

**Identified but not implemented:**
- Calendar parsing feature (mentioned in HANDOFF.md but not found in current codebase)
- Backend API endpoints (Express installed, suggesting potential server implementation)
- Database for persistent storage (currently missing)
- Authentication system (credentials mentioned in Staff interface but not validated)

---

*Integration audit: 2026-06-29*
