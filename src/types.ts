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
}

export interface AttendanceEntry {
  date: string;
  block?: 'A' | 'B'; // A = first block, B = second block (DIOP/EIOP only)
  status: 'Present' | 'Absent';
  tardy?: boolean;
  virtual?: boolean;
  excused?: boolean;
  note?: string;
}

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
}

export interface Client {
  id: string;
  name: string;
  program: string;
  location: 'SF' | 'ABQ';
  admissionDate: string;
  expectedDischargeDate: string;
  status: 'Upcoming' | 'Needs Packet' | 'Completed' | 'Graduated';
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
  attendanceHistory: AttendanceEntry[];
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
  entityName: string;
  flagReason: string;
  daysPending: number;
}
