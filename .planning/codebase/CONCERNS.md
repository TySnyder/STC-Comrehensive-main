# Codebase Concerns

**Analysis Date:** 2026-06-29

## Tech Debt

**Component Size & Complexity:**
- Issue: Multiple components exceed 500+ lines with large conditional rendering blocks
- Files: 
  - `src/components/StaffView.tsx` (695 lines) - Contains 3 complete view modes with hardcoded data and complex state management
  - `src/components/AttendanceView.tsx` (554 lines) - Large conditional rendering and tab management
  - `src/components/ClientsView.tsx` (531 lines) - Multi-view component with calendar grid logic
  - `src/data.ts` (554 lines) - All hardcoded mock data for entire application
- Impact: Difficult to test, maintain, and modify. Risk of introducing bugs when changing view logic. No separation of concerns between views.
- Fix approach: Extract each view mode into separate sub-components. Move hardcoded mock data to separate file and consider factory patterns for generating test data.

**No State Persistence:**
- Issue: Application state (clients, staff, attendance, notes) only exists in React component state - all data is lost on page refresh
- Files: `src/App.tsx` (lines 34-38), all view components
- Impact: Users cannot leave the application and return to find their work. Clinical operations cannot rely on this for daily workflows. All changes are ephemeral.
- Fix approach: Implement localStorage persistence or connect to a backend database. Create state persistence layer to handle hydration on app startup.

**Type Safety Issues:**
- Issue: Use of `as any` casts bypassing TypeScript safety
- Files:
  - `src/components/SettingsView.tsx` (line 78) - `setActiveSegment(item.id as any)`
  - `src/components/NoteModal.tsx` (line 150) - `setNoteType(e.target.value as any)`
- Impact: Potential for type errors at runtime. No compile-time safety for these operations. Creates confusion about actual types.
- Fix approach: Properly type discriminated unions (use `as const` for literal types). Create proper type guards or use Type<T> patterns instead of `any`.

**Hardcoded Compliance Data:**
- Issue: Compliance checklists, compliance statuses, and audit logs are hardcoded
- Files: `src/components/StaffView.tsx` (lines 94-98), `src/data.ts` contains SYSTEM_CONNECTIONS and CLINICAL_AUDIT_LOG_ITEMS
- Impact: Cannot add new staff or update compliance without code changes. Compliance tracking is not dynamic or auditable.
- Fix approach: Move all compliance data to a configuration or database. Create dynamic compliance checklist builder based on staff type/credentials.

**Hardcoded Weekly Schedule:**
- Issue: Dr. Aris Thorne's weekly clinical schedule is hardcoded in component
- Files: `src/components/StaffView.tsx` (lines 101-107)
- Impact: Schedule is static and cannot reflect actual staff availability or program requirements. No system for multi-therapist scheduling.
- Fix approach: Create dynamic schedule management system that can store and retrieve schedule templates per therapist and program.

## Known Bugs

**Caseload Calculation Accuracy:**
- Issue: Caseload percentage displayed in StaffView metric cards may be inaccurate due to filtering/calculation logic
- Files: `src/components/StaffView.tsx` (lines 133-135)
- Trigger: View renders when staff list changes; complex calculation with reduce over array
- Workaround: Values are display-only and do not affect operations
- Root cause: Inline calculation in render without memoization or verification logic

**Risk Flag Clearing Logic:**
- Issue: Clearing a risk flag attempts to match client by name, which is fragile
- Files: `src/App.tsx` (lines 54-60) in `handleClearRisk`
- Trigger: When admin clicks clear risk on DischargeView
- Symptoms: May not clear risk from correct client if multiple clients share names
- Workaround: None - assumes unique names
- Root cause: Using `entityName` string instead of clientId for cross-entity matching

**Missing Default Image Handling:**
- Issue: Staff photos use external Unsplash URLs that could fail or become unavailable
- Files: `src/data.ts` (all INITIAL_STAFF items use unsplash.com URLs)
- Trigger: Network failure or Unsplash API rate limiting
- Symptoms: Broken image placeholders in staff directory and profiles
- Workaround: None - application will display broken images

## Security Considerations

**Hardcoded Sensitive Data:**
- Risk: Facility information (NPI, Tax ID, Address) and HIPAA claims are hardcoded in component state defaults
- Files: `src/components/SettingsView.tsx` (lines 27-30)
- Current mitigation: Only affects UI demonstration - NPI `1894029104` and Tax ID `XX-XXXXXXX` appear to be fake, but pattern exists
- Recommendations: 
  - Never hardcode real NPI, Tax IDs, or facility addresses
  - Load all facility configuration from environment variables or secure backend
  - Implement configuration validation to ensure sensitive data is not exposed

**No Authentication or Authorization:**
- Risk: No login system, no role-based access control, no audit trail of who made changes
- Files: Entire application
- Current mitigation: Clinical staff assumes honest users (development only)
- Recommendations:
  - Implement user authentication (OAuth, OIDC, or credential-based)
  - Add role-based access control (Staff vs Admin vs Clinical roles)
  - Create audit log of all state mutations with timestamps and user attribution
  - Restrict sensitive operations (discharge planning, compliance clearance) to authorized roles

**Clinical Data Exposure:**
- Risk: HIPAA-protected health information (diagnoses, attendance, risk flags) is transmitted and stored with no encryption
- Files: Entire `src/App.tsx` state and all components displaying it
- Current mitigation: Development/demo only
- Recommendations:
  - Implement HTTPS requirement
  - Use encrypted database with access controls
  - Implement row-level security to ensure staff only see their own patients
  - Add data masking for audit scenarios
  - Implement consent logging for who accessed which patient records

**Environment Variables Not Enforced:**
- Risk: `.env.example` documents expected env vars but application doesn't validate presence
- Files: `src/main.tsx`, App.tsx don't check for GEMINI_API_KEY or APP_URL
- Current mitigation: Application still loads without env vars (no Gemini integration currently used)
- Recommendations:
  - Add startup validation to ensure all required env vars are present
  - Throw error on missing critical configs before rendering application
  - Document which env vars are required vs optional

## Performance Bottlenecks

**Large List Rendering Without Virtualization:**
- Problem: Attendance calendar renders all past attendance entries with no pagination or virtual scrolling
- Files: `src/components/ClientsView.tsx` and `src/components/AttendanceView.tsx`
- Cause: Building full DOM for every attendance record. With 50+ clients × 20+ attendance entries = 1000+ DOM nodes
- Improvement path: 
  - Implement react-window or react-virtual for virtualized lists
  - Add pagination with "Load More" pattern
  - Memoize attendance cell components to prevent unnecessary re-renders

**Inefficient State Updates:**
- Problem: Entire client array is recreated on every attendance update
- Files: `src/App.tsx` (lines 76-91) in `handleUpdateClientAttendance`
- Cause: Using `.map()` on all clients to update one client's attendance. No key-based lookup.
- Improvement path:
  - Use Map or indexed lookup for O(1) client retrieval
  - Use immer.js for immutable updates
  - Implement optimistic updates with request debouncing

**Re-render Cascades:**
- Problem: Updating attendance on one client triggers re-render of entire StaffView with all staff and clients
- Files: All child components of App.tsx
- Cause: No memoization, no context splitting, no component isolation
- Improvement path:
  - Wrap expensive components with React.memo()
  - Split state into multiple context providers (staff, clients, notes, etc.)
  - Use useCallback for event handlers to maintain referential equality

**Inline Style Calculations:**
- Problem: Caseload percentage calculated on every render: `(staffList.reduce(...) / staffList.reduce(...) * 100)`
- Files: `src/components/StaffView.tsx` (line 134)
- Cause: No memoization of calculation
- Improvement path: Use useMemo for derived calculations

## Fragile Areas

**Multi-Block Attendance Logic:**
- Files: `src/components/ClientsView.tsx` (lines 135-150)
- Why fragile: Complex mapping of attendance entries to date/block combinations. Different programs have different block structures (DIOP=2 blocks, DOP=1 block, EOP=1 block). Easy to introduce off-by-one errors or lose data.
- Safe modification: 
  - Extract into separate utility function with comprehensive unit tests
  - Add invariant checks: block A must come before block B
  - Create dedicated AttendanceDateBlockMap class instead of inline Map
- Test coverage: No tests currently exist for this logic

**Attendance Status Filtering Logic:**
- Files: `src/components/AttendanceView.tsx` (not yet fully reviewed but mentioned in structure)
- Why fragile: Filter logic for determining which clients to show based on date/block/status is scattered across multiple components
- Safe modification: Create single source of truth for attendance queries
- Test coverage: None

**Risk Flag Sync Between Entities:**
- Files: `src/App.tsx` (lines 54-60)
- Why fragile: Assumes risk flag removal from OperationalRisk list automatically removes it from Client's riskFlag property by matching names. If this logic changes, data could desynchronize.
- Safe modification: Create transaction-like updates that handle both entities atomically. Use clientId as primary key.
- Test coverage: No tests

**Form Reset Logic:**
- Files: `src/components/StaffView.tsx` (lines 80-88)
- Why fragile: Manual reset of 7 separate form fields. Easy to miss one when adding new fields. No automated reset mechanism.
- Safe modification: Use React Hook Form or Formik for form state management with automatic reset
- Test coverage: None

## Scaling Limits

**Client-Side State as Database:**
- Current capacity: Successfully handles ~11 clients, ~6 staff, ~100 attendance records
- Limit: Browser memory becomes problematic at 1000+ records. No pagination or lazy loading.
- Scaling path: Migrate to backend database with REST/GraphQL API. Implement pagination, filtering, and lazy loading.

**Re-render Performance:**
- Current capacity: Renders smoothly with current data volume (~11 components with ~100 total props)
- Limit: Would slow significantly at 100+ clients due to full component tree re-renders
- Scaling path: Implement virtualization, memoization, state splitting with multiple contexts, and possibly Redux/Jotai for state management

**Mock Data Initialization:**
- Current capacity: data.ts loads all mock data upfront (~554 lines)
- Limit: 10+ more programs or 100+ more clients would make this file unmaintainable
- Scaling path: Generate mock data dynamically, move to JSON seed files, or connect to backend

## Dependencies at Risk

**@google/genai Integration Unused:**
- Risk: Gemini API SDK is listed in package.json but never imported or used in application
- Impact: Dead dependency consuming space and potentially introducing security vulnerabilities
- Files: `package.json` (line 14)
- Migration plan: Either implement Gemini integration for AI-powered clinical features (note summarization, risk prediction) or remove entirely

**Unsplash External Image Dependencies:**
- Risk: Staff photos hardcoded to unsplash.com URLs. Service could be unavailable or rate-limited.
- Impact: Application displays broken images if Unsplash is down
- Files: All INITIAL_STAFF entries in `src/data.ts`
- Migration plan: Host images internally or use placeholder service with guaranteed availability. Consider avatar generation (initials/colors) as fallback.

**lucide-react Icons:**
- Risk: Version pinned at 0.546.0. No icon assets are bundled - fetched from npm at build time
- Impact: Build could fail if npm package becomes unavailable
- Files: Imported in every component
- Migration plan: Acceptable risk for current project. Monitor for major version updates and test before upgrading.

## Missing Critical Features

**No Audit Trail:**
- Problem: Cannot track who changed what, when, or why. No record of state mutations for compliance/legal purposes.
- Blocks: Regulatory compliance audit, incident investigation, accountability
- Priority: High - Clinical operations and HIPAA compliance require complete audit trails

**No Offline Capability:**
- Problem: Application requires constant network connectivity (though currently client-side only)
- Blocks: Using system at clinics with intermittent connectivity
- Priority: Medium - Depends on backend implementation strategy

**No Conflict Resolution:**
- Problem: If two staff members update the same client's attendance simultaneously, last write wins
- Blocks: Multi-user concurrent editing scenarios
- Priority: Medium - Could occur during shift handoffs

**No Backup/Recovery:**
- Problem: No way to backup clinical data or recover from accidental deletion
- Blocks: Data loss scenarios
- Priority: High - Patient data loss is unacceptable

## Test Coverage Gaps

**No Automated Tests:**
- What's not tested: Entire application has zero test files (only node_modules tests exist)
- Files: No test files in `src/`
- Risk: High - Any refactoring risks breaking functionality. No safety net for changes.
- Priority: High - Recommend implementing tests starting with:
  1. `src/data.ts` generators for mock data consistency
  2. Attendance update logic in App.tsx
  3. Risk flag clearing logic
  4. State synchronization between components

**No Integration Tests:**
- What's not tested: Navigation between views, multi-step workflows (add staff → assign to program → verify in caseload)
- Files: No test infrastructure
- Risk: Medium - UI flows could break silently
- Priority: Medium - After unit tests

**No E2E Tests:**
- What's not tested: Full user workflows like discharge planning or attendance marking
- Files: No test infrastructure
- Risk: High - Cannot catch regression in critical clinical workflows
- Priority: High - Recommend Playwright or Cypress for E2E coverage

**Component Behavior Not Tested:**
- What's not tested: Modal interactions, form submissions, conditional rendering paths
- Files: `src/components/NoteModal.tsx`, `src/components/StaffView.tsx`, all form components
- Risk: Medium - UI bugs could go undetected
- Priority: Medium

---

*Concerns audit: 2026-06-29*
