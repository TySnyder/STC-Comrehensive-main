# Coding Conventions

**Analysis Date:** 2026-06-29

## Naming Patterns

**Files:**
- Components: PascalCase (e.g., `DashboardView.tsx`, `NoteModal.tsx`, `ClientsView.tsx`)
- Data/utility files: camelCase (e.g., `data.ts`, `types.ts`)
- CSS files: camelCase (e.g., `index.css`)
- Test files: Not present in codebase currently

**Functions:**
- React components: PascalCase (e.g., `function DashboardView()`, `function NoteModal()`)
- Regular functions: camelCase (e.g., `handleSaveNote`, `toggleChecklist`, `handleSelectClient`)
- Event handlers: camelCase with `handle` prefix (e.g., `handleClearRisk`, `handleAddStaff`, `handleUpdateClientAttendance`)
- Callback props: camelCase with `on` prefix (e.g., `onClose`, `onSaveNote`, `onSelectClient`, `onNavigateToTab`)

**Variables:**
- State variables: camelCase (e.g., `currentTab`, `searchQuery`, `selectedClient`, `noteModalOpen`)
- Constants (exported): UPPER_SNAKE_CASE (e.g., `INITIAL_CLIENTS`, `INITIAL_STAFF`, `INITIAL_RISKS`, `INITIAL_NOTES`, `CLINICAL_AUDIT_LOG_ITEMS`)
- Local constants: camelCase (e.g., `navItems`, `notifications`)

**Types:**
- Interfaces: PascalCase (e.g., `Staff`, `Client`, `ClinicalNote`, `DashboardViewProps`)
- Type literals: PascalCase for unions (e.g., `'Present' | 'Absent'`, `'Active' | 'On Leave'`)

## Code Style

**Formatting:**
- Uses Tailwind CSS via Vite plugin (`@tailwindcss/vite`)
- No explicit formatter configured (no .prettierrc or eslint config found)
- Indentation appears to be 2 spaces based on source files
- Line length: No clear enforced limit observed
- JSX opening tags on same line as variable/return

**Linting:**
- TypeScript type checking enabled in build: `"lint": "tsc --noEmit"` from `package.json`
- No ESLint configuration detected
- TypeScript strict/semi-strict mode via `tsconfig.json` with `noEmit: true`, `skipLibCheck: true`

**Spacing & Structure:**
- Component files have Apache 2.0 license header comment block at top
- Imports grouped: React/third-party first, then local imports
- Props interfaces defined inline within component files, above component definition
- Empty lines between logical sections within components (marked with inline IDs)

## Import Organization

**Order:**
1. React and React-DOM imports (e.g., `import React, { useState } from 'react'`)
2. Third-party icon/UI library imports (e.g., `lucide-react` icons)
3. Local type imports (e.g., `import { Client, ClinicalNote } from '../types'`)
4. Local data imports (e.g., `import { INITIAL_CLIENTS } from './data'`)

**Example from `App.tsx`:**
```typescript
import React, { useState } from 'react';
import Sidebar from './components/Sidebar';
import Header from './components/Header';
// ... more component imports ...
import {
  INITIAL_CLIENTS,
  INITIAL_STAFF,
  INITIAL_RISKS,
  INITIAL_NOTES,
  INITIAL_IND_SESSIONS
} from './data';
import { IndSession } from './types';
import { Client, Staff, ClinicalNote, OperationalRisk } from './types';
```

**Path Aliases:**
- `@/*` alias configured in `tsconfig.json` to resolve to project root
- Used rarely in actual code; most imports use relative paths

## Error Handling

**Patterns:**
- No explicit try-catch blocks found in current code
- Optional chaining used for potential null/undefined access (e.g., `c.riskFlag?.reason`)
- Non-null assertion operator used where TypeScript confidence is high (e.g., `updated.find(c => c.id === clientId)!`)
- Form validation uses simple checks: `if (!noteText.trim()) return;`
- No centralized error boundary or error logging framework detected

**Defensive programming:**
- Empty fallbacks used: `clients[0]?.id || ''` pattern
- Client matching with fallback: `matchingClient ? matchingClient.name : 'Unknown Client'`

## Logging

**Framework:** `console` (no external logging library imported)

**Patterns:**
- No logging statements currently visible in source code
- Comments indicate intended behavior rather than logging for debugging

## Comments

**When to Comment:**
- License headers at top of each component file (Apache 2.0 SPDX identifier)
- Inline section markers using HTML-style IDs: `{/* 1. Quick Stats Metric Cards */}`
- Descriptive comments above complex logic (e.g., `// Let's filter clients for "Needs Attention" & "Upcoming Discharges"`)

**JSDoc/TSDoc:**
- Not used; only Apache license comments present
- Type definitions are self-documenting via TypeScript interfaces

## Function Design

**Size:** 
- Component functions: 150-400 lines including JSX (e.g., `DashboardView`, `AttendanceView`)
- Sub-component functions: 20-100 lines (e.g., `ClientAttendanceCard`, `BlockCell`)
- Handler functions: 5-30 lines

**Parameters:**
- React components receive single `Props` interface argument
- Handler functions use destructured parameters where appropriate (e.g., `{ client, entry, date, block, onSelectClient, onUpdateAttendance }`)
- Multi-parameter functions pass parameters individually, not bundled objects (exception: update handlers which pass update object)

**Return Values:**
- Components return JSX.Element
- Handlers return void or undefined
- Pure functions return computed values (arrays, booleans, objects)

**Example handler pattern from `App.tsx`:**
```typescript
const handleUpdateClientAttendance = (
  clientId: string,
  date: string,
  block: 'A' | 'B' | undefined,
  updates: { status?: 'Present' | 'Absent'; tardy?: boolean; virtual?: boolean; excused?: boolean }
) => {
  const updated = clients.map(c => {
    if (c.id !== clientId) return c;
    const existingIdx = c.attendanceHistory.findIndex(
      e => e.date === date && e.block === block
    );
    let history;
    if (existingIdx >= 0) {
      history = c.attendanceHistory.map((entry, i) =>
        i === existingIdx ? { ...entry, ...updates } : entry
      );
    } else {
      history = [{ date, block, status: 'Present' as const, ...updates }, ...c.attendanceHistory];
    }
    return { ...c, attendanceHistory: history };
  });
  setClients(updated);
  if (selectedClient?.id === clientId) {
    setSelectedClient(updated.find(c => c.id === clientId)!);
  }
};
```

## Module Design

**Exports:**
- Components exported as default: `export default function ComponentName() { ... }`
- Data exports as named: `export const INITIAL_STAFF: Staff[] = [ ... ]`
- Types exported as named: `export interface Staff { ... }`

**Barrel Files:** 
- Not used; imports pull directly from individual files (e.g., `from '../types'`, `from '../data'`)

## State Management

**React Hooks Pattern:**
- Uses `useState` for local component state (no Redux, Zustand, or context API observed)
- Parent component (`App.tsx`) owns critical shared state: `clients`, `staffList`, `risks`, `clinicalNotes`, `indSessions`, `selectedClient`
- State passed down as props; handlers passed up as callbacks
- No custom hooks detected; logic is inline in components

**State Update Pattern:**
```typescript
// Immutable updates with map/filter
setClients(clients.map(c => 
  c.id === targetId ? { ...c, updatedField: newValue } : c
));

// Prepending new items
setClinicalNotes([newNote, ...clinicalNotes]);
```

## Styling

**Framework:** Tailwind CSS v4.1.14 via `@tailwindcss/vite` plugin

**Patterns:**
- Inline class strings with conditional logic:
```typescript
className={`px-2 py-1.5 border rounded-lg font-medium ${
  isActive ? 'bg-indigo-50 text-indigo-600' : 'bg-slate-50 text-slate-500'
}`}
```

- Custom font variables defined in `index.css`:
  - `--font-sans`: "Inter" for body text
  - `--font-display`: "Space Grotesk" for headings
  - `--font-mono`: "JetBrains Mono" for labels/code

- Color palette from `DESIGN.md`:
  - Primary: indigo-600 (`#4f46e5`)
  - Semantic: emerald (success), amber (warning), red (critical), blue (info)
  - Backgrounds: slate-50 to slate-900 grayscale

**ID Attributes:**
- All major layout sections have `id` attributes for easy testing/debugging (e.g., `id="portal-sidebar"`, `id="note-modal-overlay"`, `id="metric-card-active-clients"`)
- Child elements also have IDs (e.g., `id="sidebar-nav"`, `id="header-search-input"`)

## Component Structure

**Organization within file:**
1. License comment block
2. Imports (React, third-party, types, data)
3. Props interface definition
4. Sub-component functions (if any)
5. Main component function with inline state and handlers
6. Return JSX with semantic ID structure
7. Default export

**Example structure (`NoteModal.tsx`):**
```typescript
// License
import React, { useState } from 'react';
import { X, CheckCircle, ... } from 'lucide-react';
import { Client, ClinicalNote } from '../types';

interface NoteModalProps { ... }

export default function NoteModal({ ... }: NoteModalProps) {
  // State variables
  const [clientId, setClientId] = useState(...);
  
  // Handler functions
  const handleFlagChange = (key: string) => { ... };
  const handleSave = (e: React.FormEvent) => { ... };
  
  // Conditional render
  if (!isOpen) return null;
  
  // Return JSX
  return ( ... );
}
```

---

*Convention analysis: 2026-06-29*
