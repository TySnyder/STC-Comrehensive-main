/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export interface Staff {
  id: string;
  name: string;
  role: string;
  assignedProgram: string[];
  currentCaseload: number;
  maxCaseload: number;
  credentials: string;
  hireDate: string;
  email: string;
  phone: string;
  attendanceStatus: 'Present' | 'Absent' | 'Late';
  status: 'Active' | 'On Leave';
  photo: string;
  // Portal login permission level (see AppRole, AuthContext) — matched
  // against the signed-in Google account's email. Unset = no portal access
  // level assigned yet, treated as 'intern' (least privilege) until an
  // Admin/Master sets this.
  appRole?: AppRole;
}

export interface AttendanceEntry {
  date: string;
  block?: 'A' | 'B'; // A = first block, B = second block (DIOP/EIOP only)
  status: 'Present' | 'Absent';
  tardy?: boolean;
  virtual?: boolean;
  atResidence?: boolean;   // NEW — at primary residence Y/N, independent of virtual/in-person
  excused?: boolean;       // only meaningful when status === 'Absent'
  note?: string;           // brief clinical reason (template text, e.g. "Medical appointment")
  attendanceNotes?: string; // NEW — free-text, client-specific note for this entry
  program?: string;        // NEW — client.program snapshot at time of entry (doc 02: "label each record")
}

export type CallResult = 'Pending' | 'Confirmed' | 'No Answer' | 'Left Voicemail' | 'Rescheduled' | 'Cancelled';

// Global switch every email-producing feature checks before acting: 'draft'
// stops short and leaves a draft for review; 'send' dispatches immediately.
export type EmailDeliveryMode = 'draft' | 'send';

// Shared shape for partial attendance-entry edits, used by App/AttendanceView/ClientsView.
export type AttendanceUpdate = Partial<
  Pick<AttendanceEntry, 'status' | 'tardy' | 'virtual' | 'atResidence' | 'excused' | 'note' | 'attendanceNotes'>
>;

export interface IndSession {
  id: string;
  clientId: string;
  clientName: string;
  phone: string;
  therapist: string;
  time: string;
  location: string;
  date: string;
  attendanceStatus: 'Present' | 'Absent' | 'Unconfirmed';
  tardy?: boolean;
  virtual?: boolean;
  isManual?: boolean;
  callResult?: CallResult; // Daily Reminders call-outcome, distinct from attendanceStatus
}

// Lifecycle: one Client record, status never moves rows. Discharge is reversible
// (reversal voids the episode's discharge fields). Readmission = new Episode.
export type ClientStatus = 'Inquiry' | 'Pending Admit' | 'Active' | 'Discharged';

// Multi-select: combos like ASA/Admin DC occur (doc 08).
export type DcStatus = 'Approved' | 'ASA' | 'Admin DC';

export interface Episode {
  id: string;
  episodeNumber: number;   // 1-based; BestNotes appends " 2", " 3" to the name
  admitDate: string;       // ISO
  iopDcDate?: string;      // left IOP level of care (step-down may continue)
  stcDcDate?: string;      // fully discharged from STC
  dcStatus?: DcStatus[];
  graduated?: boolean;
  note?: string;
  // Discharge paperwork checklist (doc 08). ISO dates; undefined = not yet done.
  // Chasing stops one month after stcDcDate (office-manager rule).
  gradCertSentAt?: string;
  exitInterviewSentAt?: string;
  exitInterviewReturnedAt?: string;
  dcFormSentAt?: string;
  dcFormReturnedAt?: string;
}

export interface Client {
  id: string;
  name: string;
  program: string;
  location: 'SF' | 'ABQ';
  admissionDate: string;
  // Est. DC date is derived (dcDateHelpers), never stored/free-text (doc 02 Q7).
  enrollmentDays?: number;       // planned treatment days; default 85, min 30
  graduationTrack?: 30 | 85;     // TX-day track chosen at admission; default 85 (open question: where staff sets this — see report)
  scheduleDaysPerWeek?: number;  // 1–5; default 5 (SF OP-style schedule exceptions)
  dcDateNote?: string;           // optional context on the predicted date
  status: ClientStatus;
  // Absent/empty = one implicit episode starting at admissionDate.
  episodes?: Episode[];
  followUpNeeded: boolean;
  insurance: string;
  age: number;
  gender: string;
  diagnoses: string[];
  riskFlag?: {
    severity: 'High' | 'Medium' | 'Low';
    reason: string;
    daysPending: number;
  };
  primaryTherapist: string;
  uaFrequency?: UaFrequency;
  uaNote?: string;
  attendanceHistory: AttendanceEntry[];
  cellPhone?: string;
  homePhone?: string;
  email?: string;
  homeAddress?: string;
}

export type UaFrequency = 'twice-weekly' | 'weekly' | 'monthly' | 'external' | 'none';

// Intake call log (doc 03, Sheet type A: "Monthly call log"). Prospective
// clients only — not linked to a Client record. Follow-up status replaces
// the spreadsheet's color-coding convention (doc 03 Q2, unresolved: exact
// color meanings). Values below are a reasonable starting set, not confirmed
// against the live sheet (doc 03 Q4: when does a caller become "pending admit"?).
export type CallFollowUpStatus = 'New' | 'Follow-Up Needed' | 'Scheduled' | 'No Action Needed' | 'Closed';

export interface CallLogEntry {
  id: string;
  date: string;                // ISO date of call
  time?: string;                // free text, e.g. "10:15 AM"
  intakeSpecialist: string;     // staff who took the call
  callerName: string;
  callerRelationship?: string;  // caller's relationship to prospective client
  callerPhone?: string;
  callerEmail?: string;
  clientName: string;           // prospective client
  clientPhone?: string;
  clientEmail?: string;
  location: 'SF' | 'ABQ';
  referralSource?: string;
  referringProvider?: string;   // referring therapist/prescriber
  insurance?: string;
  issuesNotes?: string;
  clinicianNotes?: string;
  followUpStatus: CallFollowUpStatus;
}

// Existing-client request to attend their program block virtually instead of
// in person (distinct from CallLogEntry, which is prospective-client intake
// calls). Logging a request never flips AttendanceEntry.virtual — that's a
// deliberate separate step staff take in Attendance, not automated here.
export interface VirtualRequestEntry {
  id: string;
  clientId: string;
  clientName: string;
  date: string;          // ISO date of the program block being attended virtually
  block?: 'A' | 'B';      // same two-block convention as AttendanceEntry
  reason: string;
  loggedBy: string;       // staff member who logged the call-out
  loggedAt: string;       // ISO timestamp the entry was created
  meetLink?: string;      // pulled from the block's existing recurring GCal event's hangoutLink, if found
}

export interface UaAssignment {
  id: string;
  clientId: string;
  weekStart: string;     // Monday ISO of the assignment week
  assignedDate: string;  // ISO — the randomly assigned day (may roll forward if absent)
  status: 'pending' | 'completed';
  completedDate?: string;
  completedBy?: string;
  billed: boolean;
}

export type ProgramBlock = 'DIOP' | 'DOP' | 'EIOP' | 'EOP' | 'IND';
export type VirtualMode = 'none' | 'residence' | 'away';
export type SpecialCode = 'L' | 'D' | 'H' | 'C';

export interface CensusEntry {
  id: string;
  clientId: string;
  date: string;
  block: ProgramBlock;
  status: 'Present' | 'Absent' | 'Special' | null;
  excused: boolean;
  tardy: boolean;
  virtualMode: VirtualMode;
  specialCode?: SpecialCode;
  autoFilled: boolean;
}

export interface InsuranceBillingNote {
  clientId: string;
  weekStart: string;
  notes: string;
}

// Manual correction on top of the computed running-attendance totals
// (AttendanceTotals' "Fine-Tune" modal) — these fields are normally derived
// from CensusEntry/AttendanceEntry, so there's no single underlying record to
// edit directly; an override is the only honest way to persist a manual fix.
export interface AttendanceTotalOverride {
  clientId: string;
  fullDaysAtt: number;
  excused: number;
  unexcused: number;
  halfDaysAtt: number;
  possible: number;
  virtualCount: number;
  dcProjectionStatus: 'On Track' | 'Extended Care' | 'At Risk';
}

export interface ClinicalNote {
  id: string;
  clientId: string;
  clientName: string;
  authorName: string;
  text: string;
  date: string;
  noteType: 'Clinical Summary' | 'Progress Note' | 'Operational Note' | 'Discharge Summary';
  program: string;
  isDraft: boolean;
  flags: string[];
}

export interface OperationalRisk {
  id: string;
  severity: 'High' | 'Medium' | 'Low';
  clientId?: string;
  entityName: string;
  flagReason: string;
  daysPending: number;
}

export interface SessionType {
  id: string;
  name: string;
  timeRange: string;
}

export interface TimeOffRequest {
  id: string;
  staffId: string;
  startDate: string; // ISO — first day absent
  endDate: string;   // ISO — last day absent (return = endDate + 1)
  note?: string;
}

export interface GridSlot {
  id: string;
  sessionId: string;
  dayId: string;
  weekIndex: number;   // 0-3; 0 = first week shown
  therapistId: string | null;
  programType: string;
  substituteId?: string | null;
}

// Real login now (Google Sign-In restricted to @treatmentconsultants.net —
// see utils/auth.ts, AuthContext.tsx). Role isn't part of the Google
// account — it's resolved by matching the signed-in email against a Staff
// record's `appRole` (see Staff.appRole below); unmatched/unset defaults to
// the least-privileged role ('intern'), never a guess toward more access.
export type AppRole = 'intern' | 'admin' | 'intake' | 'therapist' | 'master';

export interface AuthUser {
  id: string;
  name: string;
  email: string;
  role: AppRole;
}
