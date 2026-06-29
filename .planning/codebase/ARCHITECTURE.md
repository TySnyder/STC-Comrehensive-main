# Architecture

**Analysis Date:** 2026-06-29

## Pattern Overview

**Overall:** Component-driven Single Page Application (SPA) with tab-based navigation

**Key Characteristics:**
- React 19 with TypeScript for type-safe UI development
- Client-side state management using React hooks (useState)
- Tab-based navigation pattern (dashboard, clients, attendance, discharge, reports, staff, settings)
- Monolithic component structure with view components corresponding to each tab
- In-memory data state (no backend persistence in current implementation)
- Tailwind CSS for styling with Vite for build/dev server

## Layers

**Presentation Layer:**
- Purpose: Renders UI components and handles user interactions
- Location: `src/components/`
- Contains: View components (DashboardView, ClientsView, AttendanceView, DischargeView, ReportsView, StaffView, SettingsView), layout components (Sidebar, Header), modal components (NoteModal)
- Depends on: types.ts for data shapes, data.ts for initial state
- Used by: App.tsx router

**State Management Layer:**
- Purpose: Maintains application state and provides mutation handlers
- Location: `src/App.tsx`
- Contains: useState hooks for clients, staffList, risks, clinicalNotes, indSessions, selectedClient, currentTab, searchQuery, noteModalOpen
- Depends on: types.ts and data.ts
- Used by: All view components via props

**Data Layer:**
- Purpose: Provides type definitions and initial data
- Location: `src/types.ts`, `src/data.ts`
- Contains: TypeScript interfaces (Client, Staff, ClinicalNote, OperationalRisk, IndSession, AttendanceEntry) and initial dataset constants (INITIAL_CLIENTS, INITIAL_STAFF, INITIAL_RISKS, INITIAL_NOTES, INITIAL_IND_SESSIONS)
- Depends on: Nothing (foundational)
- Used by: App.tsx, all components

**Entry Point:**
- Location: `src/main.tsx`
- Purpose: React DOM initialization, mounts App component to #root element

## Data Flow

**Application Initialization:**

1. `main.tsx` imports React, ReactDOM, and App component
2. React.createRoot finds DOM element with id="root" 
3. App component renders with StrictMode wrapper
4. App initializes state from INITIAL_* constants in data.ts

**Tab Navigation Flow:**

1. User clicks sidebar navigation item
2. Sidebar.setTab() is called with tab ID
3. App.currentTab state updates via setTab()
4. App.handleSelectClient() clears selectedClient if moving away from clients tab
5. Main viewport conditionally renders appropriate View component based on currentTab

**Data Mutation Flow (Example: Update Attendance):**

1. User interacts with attendance cell in ClientsView or AttendanceView
2. Component calls onUpdateAttendance() callback (provided from App)
3. App.handleUpdateClientAttendance() finds matching client by clientId
4. Updates attendanceHistory array with new entry or modifies existing entry
5. setClients() updates clients state, triggering re-render
6. If selectedClient matches the updated client, setSelectedClient() also updates to keep profile in sync

**Modal Flow (Clinical Notes):**

1. User clicks "Add Note" button anywhere in app
2. App.openNoteModalWithContext() called, optionally with preselectedClientId
3. noteModalOpen state becomes true, NoteModal renders with overlay
4. NoteModal displays form with client dropdown, note type selector, program context, flags, text area
5. User submits form → onSaveNote callback invoked
6. App.handleSaveNote() prepends new ClinicalNote to clinicalNotes array
7. NoteModal closes, clinicalNotes re-render in ClientsView

**State Management:**

- All state centralized in App component
- Child components are functional and receive data + callbacks as props
- No global state management (Redux, Zustand, Context API)
- No backend API calls - all data modifications in-memory
- No persistence mechanism (data lost on page refresh)

## Key Abstractions

**View Components:**
- Purpose: Full-page interface for each business domain (Dashboard, Clients, Attendance, etc.)
- Examples: `src/components/DashboardView.tsx`, `src/components/ClientsView.tsx`, `src/components/AttendanceView.tsx`
- Pattern: Each receives domain data + callbacks, renders domain-specific UI, handles local UI state (e.g., checklist toggle in DashboardView)

**Layout Components:**
- Purpose: Persistent structural elements (navigation, header)
- Examples: `src/components/Sidebar.tsx`, `src/components/Header.tsx`
- Pattern: Receive currentTab and setter callbacks, maintain consistent positioning across tabs

**Modal Components:**
- Purpose: Overlay UI for complex forms or workflows
- Examples: `src/components/NoteModal.tsx`
- Pattern: Conditional rendering (return null if !isOpen), form state management, callback-driven submission

**Type System:**
- Core domain types: `Client`, `Staff`, `ClinicalNote`, `OperationalRisk`, `IndSession`
- Sub-types: `AttendanceEntry` (nested in Client), note type enum values: 'Clinical Summary' | 'Progress Note' | 'Operational Note' | 'Discharge Summary'
- Status enums: 'Present' | 'Absent' | 'Unconfirmed' for attendance; 'Active' | 'On Leave' for staff; 'Upcoming' | 'Needs Packet' | 'Completed' | 'Graduated' for clients

## Entry Points

**Application Root:**
- Location: `src/main.tsx`
- Triggers: Page load
- Responsibilities: Initialize React, mount App component to DOM

**App Component:**
- Location: `src/App.tsx`
- Triggers: Mounted by main.tsx
- Responsibilities: 
  - Initialize all application state from data.ts
  - Manage tab navigation
  - Route to appropriate View component
  - Handle all state mutations via callback handlers
  - Render persistent layout (Sidebar, Header) and dynamic viewport
  - Manage modal state and visibility

**View Components:**
- Each View component is the entry point for a business domain
- Triggered by tab selection in App
- Examples: DashboardView (operations overview), ClientsView (client profiles), AttendanceView (census tracking)

## Error Handling

**Strategy:** No explicit error handling implemented

**Current State:**
- No try-catch blocks in components
- No error boundaries
- No validation of user inputs beyond empty string checks in forms (e.g., NoteModal checks `!noteText.trim()`)
- No network error handling (no API calls present)
- No fallback UI for missing data

**Patterns Observed:**
- Optional chaining used for client lookups: `matchingClient?.name`
- Conditional rendering prevents rendering undefined/null states: `selectedClient ? ... : ...`
- Safe array operations: `.filter()`, `.map()`, `.find()` with null coalescing

## Cross-Cutting Concerns

**Logging:** None implemented (no logging library or console statements for audit trail)

**Validation:** Minimal validation
- NoteModal validates note text is not empty before saving
- AttendanceEntry updates use toggles (no external validation)
- No schema validation of data mutations

**Authentication:** Not implemented (no auth provider, role-based access, or permission checks visible)

**Search/Filtering:** 
- Header search input captures searchQuery state but not connected to any filtering logic
- Components receive raw data without search filtering applied

**Styling:**
- Tailwind CSS v4 with Vite plugin
- Utility-first approach
- Semantic color scheme: slate (neutral), indigo (primary), emerald (success), red (danger), orange (warning)
- Font families: 'sans' (default), 'display' (headings), 'mono' (captions/codes)
- Responsive: mobile-first with sm:, lg: breakpoints

**Icons:**
- lucide-react for all UI icons
- Imported as SVG components, composed inline with className styling

---

*Architecture analysis: 2026-06-29*
