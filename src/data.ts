/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { Staff, Client, ClinicalNote, OperationalRisk, IndSession, CensusEntry, InsuranceBillingNote, ProgramBlock, VirtualMode } from './types';

export const INITIAL_STAFF: Staff[] = [
  {
    id: 'staff-1',
    name: 'Dr. Aris Thorne',
    role: 'Lead Clinical Psychologist',
    assignedProgram: ['EIOP'],
    currentCaseload: 18,
    maxCaseload: 26,
    credentials: 'PhD, LCSW-S',
    hireDate: '2021-03-12',
    email: 'a.thorne@clinicalops.org',
    phone: '(512) 555-0192',
    attendanceStatus: 'Present',
    status: 'Active',
    photo: 'https://images.unsplash.com/photo-1622253692010-333f2da6031d?auto=format&fit=crop&q=80&w=200&h=200'
  },
  {
    id: 'staff-2',
    name: 'Dr. Marcus Vance',
    role: 'Attending Psychiatrist',
    assignedProgram: ['EIOP', 'DIOP'],
    currentCaseload: 12,
    maxCaseload: 15,
    credentials: 'MD',
    hireDate: '2019-08-24',
    email: 'm.vance@clinicalops.org',
    phone: '(512) 555-0241',
    attendanceStatus: 'Present',
    status: 'Active',
    photo: 'https://images.unsplash.com/photo-1537368910025-700350fe46c7?auto=format&fit=crop&q=80&w=200&h=200'
  },
  {
    id: 'staff-3',
    name: 'Elena Rostova',
    role: 'Senior Clinical Therapist',
    assignedProgram: ['DIOP'],
    currentCaseload: 22,
    maxCaseload: 25,
    credentials: 'LCSW',
    hireDate: '2020-11-05',
    email: 'e.rostova@clinicalops.org',
    phone: '(512) 555-0814',
    attendanceStatus: 'Present',
    status: 'Active',
    photo: 'https://images.unsplash.com/photo-1594824813573-246434de83fb?auto=format&fit=crop&q=80&w=200&h=200'
  },
  {
    id: 'staff-4',
    name: 'Sarah Lin',
    role: 'Licensed Family Therapist',
    assignedProgram: ['EIOP'],
    currentCaseload: 14,
    maxCaseload: 20,
    credentials: 'LMFT',
    hireDate: '2022-05-18',
    email: 's.lin@clinicalops.org',
    phone: '(512) 555-0955',
    attendanceStatus: 'Present',
    status: 'Active',
    photo: 'https://images.unsplash.com/photo-1559839734-2b71ea197ec2?auto=format&fit=crop&q=80&w=200&h=200'
  },
  {
    id: 'staff-5',
    name: 'Julian Keller',
    role: 'Clinical Case Counselor',
    assignedProgram: ['DIOP'],
    currentCaseload: 19,
    maxCaseload: 20,
    credentials: 'LPC',
    hireDate: '2021-09-01',
    email: 'j.keller@clinicalops.org',
    phone: '(512) 555-1049',
    attendanceStatus: 'Absent',
    status: 'On Leave',
    photo: 'https://images.unsplash.com/photo-1612349317150-e413f6a5b16d?auto=format&fit=crop&q=80&w=200&h=200'
  },
  {
    id: 'staff-6',
    name: 'Clara Barton',
    role: 'Psychiatric Registered Nurse',
    assignedProgram: ['EIOP', 'DIOP'],
    currentCaseload: 0,
    maxCaseload: 0,
    credentials: 'RN, BSN',
    hireDate: '2018-02-14',
    email: 'c.barton@clinicalops.org',
    phone: '(512) 555-0103',
    attendanceStatus: 'Present',
    status: 'Active',
    photo: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&q=80&w=200&h=200'
  }
];

export const INITIAL_CLIENTS: Client[] = [
  // --- EIOP clients (two blocks per day: A=3:45 PM, B=5:45 PM) ---
  {
    id: 'client-1',
    name: 'Sarah Jenkins',
    program: 'EIOP',
    location: 'SF',
    admissionDate: '2026-05-10',
    expectedDischargeDate: '2026-06-28',
    status: 'Needs Packet',
    followUpNeeded: true,
    insurance: 'Blue Cross Blue Shield',
    age: 34,
    gender: 'Female',
    diagnoses: ['Major Depressive Disorder (MDD)', 'Post-Traumatic Stress Disorder (PTSD)'],
    riskFlag: {
      severity: 'High',
      reason: 'Auth Expires in 2 Days - Awaiting Clinical Summary validation',
      daysPending: 3
    },
    primaryTherapist: 'Dr. Aris Thorne',
    attendanceHistory: [
      { date: '2026-06-15', block: 'A', status: 'Present' },
      { date: '2026-06-15', block: 'B', status: 'Present' },
      { date: '2026-06-14', block: 'A', status: 'Present' },
      { date: '2026-06-14', block: 'B', status: 'Present' },
      { date: '2026-06-13', block: 'A', status: 'Present', tardy: true, note: 'Traffic delays' },
      { date: '2026-06-13', block: 'B', status: 'Present' },
      { date: '2026-06-12', block: 'A', status: 'Present' },
      { date: '2026-06-12', block: 'B', status: 'Present' },
      { date: '2026-06-11', block: 'A', status: 'Present' },
      { date: '2026-06-11', block: 'B', status: 'Present' },
      { date: '2026-06-10', block: 'A', status: 'Absent', note: 'Medical appointment' },
      { date: '2026-06-10', block: 'B', status: 'Absent', note: 'Medical appointment' },
      { date: '2026-06-09', block: 'A', status: 'Present' },
      { date: '2026-06-09', block: 'B', status: 'Present' }
    ]
  },
  {
    id: 'client-5',
    name: 'Isabella Ross',
    program: 'EIOP',
    location: 'SF',
    admissionDate: '2026-05-02',
    expectedDischargeDate: '2026-06-15',
    status: 'Completed',
    followUpNeeded: true,
    insurance: 'Blue Cross Blue Shield',
    age: 22,
    gender: 'Female',
    diagnoses: ['Anorexia Nervosa', 'Major Depression'],
    primaryTherapist: 'Sarah Lin',
    attendanceHistory: [
      { date: '2026-06-15', block: 'A', status: 'Present' },
      { date: '2026-06-15', block: 'B', status: 'Present' },
      { date: '2026-06-14', block: 'A', status: 'Present' },
      { date: '2026-06-14', block: 'B', status: 'Absent', note: 'Left early' },
      { date: '2026-06-13', block: 'A', status: 'Present' },
      { date: '2026-06-13', block: 'B', status: 'Present' },
      { date: '2026-06-12', block: 'A', status: 'Present' },
      { date: '2026-06-12', block: 'B', status: 'Present' },
      { date: '2026-06-11', block: 'A', status: 'Present' },
      { date: '2026-06-11', block: 'B', status: 'Present' }
    ]
  },
  {
    id: 'client-7',
    name: 'Olivia Chen',
    program: 'EIOP',
    location: 'ABQ',
    admissionDate: '2026-05-22',
    expectedDischargeDate: '2026-07-02',
    status: 'Needs Packet',
    followUpNeeded: true,
    insurance: 'Cigna',
    age: 27,
    gender: 'Female',
    diagnoses: ['Obsessive-Compulsive Disorder (OCD)', 'Major Depressive Disorder'],
    riskFlag: {
      severity: 'Low',
      reason: 'Physical Exam copy missing from client electronic intake file',
      daysPending: 8
    },
    primaryTherapist: 'Dr. Aris Thorne',
    attendanceHistory: [
      { date: '2026-06-15', block: 'A', status: 'Present', tardy: true, note: 'Public transit delays' },
      { date: '2026-06-15', block: 'B', status: 'Present' },
      { date: '2026-06-14', block: 'A', status: 'Present' },
      { date: '2026-06-14', block: 'B', status: 'Present' },
      { date: '2026-06-13', block: 'A', status: 'Present' },
      { date: '2026-06-13', block: 'B', status: 'Present' },
      { date: '2026-06-12', block: 'A', status: 'Absent' },
      { date: '2026-06-12', block: 'B', status: 'Absent' },
      { date: '2026-06-11', block: 'A', status: 'Present' },
      { date: '2026-06-11', block: 'B', status: 'Present' }
    ]
  },
  {
    id: 'client-8',
    name: 'Lucas Gray',
    program: 'EIOP',
    location: 'ABQ',
    admissionDate: '2026-05-30',
    expectedDischargeDate: '2026-07-15',
    status: 'Upcoming',
    followUpNeeded: false,
    insurance: 'Aetna',
    age: 50,
    gender: 'Male',
    diagnoses: ['Major Depressive Disorder', 'Chronic Pain Syndrome'],
    primaryTherapist: 'Sarah Lin',
    attendanceHistory: [
      { date: '2026-06-15', block: 'A', status: 'Present' },
      { date: '2026-06-15', block: 'B', status: 'Present' },
      { date: '2026-06-14', block: 'A', status: 'Present' },
      { date: '2026-06-14', block: 'B', status: 'Present' },
      { date: '2026-06-13', block: 'A', status: 'Present' },
      { date: '2026-06-13', block: 'B', status: 'Present' },
      { date: '2026-06-12', block: 'A', status: 'Absent' },
      { date: '2026-06-12', block: 'B', status: 'Absent' },
      { date: '2026-06-11', block: 'A', status: 'Present' },
      { date: '2026-06-11', block: 'B', status: 'Present' }
    ]
  },
  // --- DIOP clients (two blocks per day: A=11:45 AM, B=1:45 PM) ---
  {
    id: 'client-2',
    name: 'Liam Sterling',
    program: 'DIOP',
    location: 'SF',
    admissionDate: '2026-05-15',
    expectedDischargeDate: '2026-06-18',
    status: 'Needs Packet',
    followUpNeeded: true,
    insurance: 'Aetna',
    age: 28,
    gender: 'Male',
    diagnoses: ['Generalized Anxiety Disorder (GAD)', 'Substance Use Disorder (SUD)'],
    riskFlag: {
      severity: 'High',
      reason: 'Missing Guardianship/Representative Signature on Release of Info',
      daysPending: 5
    },
    primaryTherapist: 'Elena Rostova',
    attendanceHistory: [
      { date: '2026-06-15', block: 'A', status: 'Present' },
      { date: '2026-06-15', block: 'B', status: 'Present' },
      { date: '2026-06-14', block: 'A', status: 'Present' },
      { date: '2026-06-14', block: 'B', status: 'Present' },
      { date: '2026-06-13', block: 'A', status: 'Present' },
      { date: '2026-06-13', block: 'B', status: 'Present' },
      { date: '2026-06-12', block: 'A', status: 'Present' },
      { date: '2026-06-12', block: 'B', status: 'Absent', note: 'Left after first block' },
      { date: '2026-06-11', block: 'A', status: 'Absent', note: 'Symptom flare-up' },
      { date: '2026-06-11', block: 'B', status: 'Absent', note: 'Symptom flare-up' }
    ]
  },
  {
    id: 'client-3',
    name: 'Sophia Vance',
    program: 'DIOP',
    location: 'SF',
    admissionDate: '2026-04-20',
    expectedDischargeDate: '2026-06-12',
    status: 'Completed',
    followUpNeeded: false,
    insurance: 'Cigna',
    age: 45,
    gender: 'Female',
    diagnoses: ['Bipolar II Disorder', 'Borderline Personality Traits'],
    primaryTherapist: 'Dr. Aris Thorne',
    attendanceHistory: [
      { date: '2026-06-12', block: 'A', status: 'Present' },
      { date: '2026-06-12', block: 'B', status: 'Present' },
      { date: '2026-06-11', block: 'A', status: 'Present' },
      { date: '2026-06-11', block: 'B', status: 'Present' },
      { date: '2026-06-10', block: 'A', status: 'Present' },
      { date: '2026-06-10', block: 'B', status: 'Present' },
      { date: '2026-06-09', block: 'A', status: 'Present' },
      { date: '2026-06-09', block: 'B', status: 'Present' },
      { date: '2026-06-06', block: 'A', status: 'Present' },
      { date: '2026-06-06', block: 'B', status: 'Present' }
    ]
  },
  {
    id: 'client-4',
    name: 'Ethan Hunt',
    program: 'DIOP',
    location: 'ABQ',
    admissionDate: '2026-03-10',
    expectedDischargeDate: '2026-06-25',
    status: 'Upcoming',
    followUpNeeded: false,
    insurance: 'UnitedHealthcare',
    age: 39,
    gender: 'Male',
    diagnoses: ['Severe PTSD', 'Alcohol Use Disorder'],
    riskFlag: {
      severity: 'Medium',
      reason: 'Incomplete Intake Assessment signatures from secondary therapist',
      daysPending: 2
    },
    primaryTherapist: 'Elena Rostova',
    attendanceHistory: [
      { date: '2026-06-15', block: 'A', status: 'Present' },
      { date: '2026-06-15', block: 'B', status: 'Present' },
      { date: '2026-06-14', block: 'A', status: 'Present' },
      { date: '2026-06-14', block: 'B', status: 'Present' },
      { date: '2026-06-13', block: 'A', status: 'Present' },
      { date: '2026-06-13', block: 'B', status: 'Present' },
      { date: '2026-06-12', block: 'A', status: 'Present' },
      { date: '2026-06-12', block: 'B', status: 'Present' },
      { date: '2026-06-11', block: 'A', status: 'Present' },
      { date: '2026-06-11', block: 'B', status: 'Present' }
    ]
  },
  {
    id: 'client-6',
    name: 'Daniel Kim',
    program: 'DIOP',
    location: 'ABQ',
    admissionDate: '2026-04-18',
    expectedDischargeDate: '2026-06-20',
    status: 'Graduated',
    followUpNeeded: false,
    insurance: 'Humana',
    age: 31,
    gender: 'Male',
    diagnoses: ['Social Anxiety Disorder', 'Panic Disorder'],
    primaryTherapist: 'Julian Keller',
    attendanceHistory: [
      { date: '2026-06-15', block: 'A', status: 'Present' },
      { date: '2026-06-15', block: 'B', status: 'Present' },
      { date: '2026-06-14', block: 'A', status: 'Present' },
      { date: '2026-06-14', block: 'B', status: 'Present' },
      { date: '2026-06-13', block: 'A', status: 'Present' },
      { date: '2026-06-13', block: 'B', status: 'Present' },
      { date: '2026-06-12', block: 'A', status: 'Present' },
      { date: '2026-06-12', block: 'B', status: 'Present' },
      { date: '2026-06-11', block: 'A', status: 'Present' },
      { date: '2026-06-11', block: 'B', status: 'Present' }
    ]
  },
  // --- DOP clients (single block: 1:45 PM – 3:00 PM only) ---
  {
    id: 'client-9',
    name: 'Madison Torres',
    program: 'DOP',
    location: 'SF',
    admissionDate: '2026-05-28',
    expectedDischargeDate: '2026-07-10',
    status: 'Needs Packet',
    followUpNeeded: false,
    insurance: 'Aetna',
    age: 36,
    gender: 'Female',
    diagnoses: ['Adjustment Disorder', 'Generalized Anxiety Disorder'],
    primaryTherapist: 'Sarah Lin',
    attendanceHistory: [
      { date: '2026-06-15', status: 'Present' },
      { date: '2026-06-14', status: 'Present' },
      { date: '2026-06-13', status: 'Absent', note: 'Work conflict' },
      { date: '2026-06-12', status: 'Present' },
      { date: '2026-06-11', status: 'Present' }
    ]
  },
  {
    id: 'client-10',
    name: 'Derek Pham',
    program: 'DOP',
    location: 'ABQ',
    admissionDate: '2026-06-01',
    expectedDischargeDate: '2026-07-15',
    status: 'Upcoming',
    followUpNeeded: false,
    insurance: 'Cigna',
    age: 42,
    gender: 'Male',
    diagnoses: ['Major Depressive Disorder', 'ADHD'],
    primaryTherapist: 'Julian Keller',
    attendanceHistory: [
      { date: '2026-06-15', status: 'Present', tardy: true },
      { date: '2026-06-14', status: 'Present' },
      { date: '2026-06-13', status: 'Present' },
      { date: '2026-06-12', status: 'Present' },
      { date: '2026-06-11', status: 'Absent' }
    ]
  },
  // --- EOP clients (single block: 5:45 PM – 7:00 PM only) ---
  {
    id: 'client-11',
    name: 'Rachel Kim',
    program: 'EOP',
    location: 'SF',
    admissionDate: '2026-06-03',
    expectedDischargeDate: '2026-07-18',
    status: 'Upcoming',
    followUpNeeded: false,
    insurance: 'UnitedHealthcare',
    age: 29,
    gender: 'Female',
    diagnoses: ['Generalized Anxiety Disorder', 'Insomnia Disorder'],
    primaryTherapist: 'Dr. Aris Thorne',
    attendanceHistory: [
      { date: '2026-06-15', status: 'Present' },
      { date: '2026-06-14', status: 'Present' },
      { date: '2026-06-13', status: 'Present' },
      { date: '2026-06-12', status: 'Absent' },
      { date: '2026-06-11', status: 'Present' }
    ]
  },
  {
    id: 'client-12',
    name: 'James Porter',
    program: 'EOP',
    location: 'ABQ',
    admissionDate: '2026-05-30',
    expectedDischargeDate: '2026-07-08',
    status: 'Needs Packet',
    followUpNeeded: true,
    insurance: 'Blue Cross Blue Shield',
    age: 55,
    gender: 'Male',
    diagnoses: ['Alcohol Use Disorder', 'Depression NOS'],
    primaryTherapist: 'Elena Rostova',
    attendanceHistory: [
      { date: '2026-06-15', status: 'Present' },
      { date: '2026-06-14', status: 'Absent', note: 'Transportation issue' },
      { date: '2026-06-13', status: 'Present' },
      { date: '2026-06-12', status: 'Present' },
      { date: '2026-06-11', status: 'Present' }
    ]
  }
];

export const INITIAL_RISKS: OperationalRisk[] = [
  {
    id: 'risk-1',
    severity: 'High',
    entityName: 'Sarah Jenkins',
    flagReason: 'Auth Expires in 2 Days - Awaiting Clinical Summary validation',
    daysPending: 3
  },
  {
    id: 'risk-2',
    severity: 'High',
    entityName: 'Liam Sterling',
    flagReason: 'Missing Guardianship/Representative Signature on Release of Info',
    daysPending: 5
  },
  {
    id: 'risk-3',
    severity: 'Medium',
    entityName: 'Ethan Hunt',
    flagReason: 'Incomplete Intake Assessment signatures from secondary therapist',
    daysPending: 2
  },
  {
    id: 'risk-4',
    severity: 'Low',
    entityName: 'Olivia Chen',
    flagReason: 'Physical Exam copy missing from client electronic intake file',
    daysPending: 8
  }
];

export const INITIAL_NOTES: ClinicalNote[] = [
  {
    id: 'note-1',
    clientId: 'client-1',
    clientName: 'Sarah Jenkins',
    authorName: 'Dr. Aris Thorne',
    date: '2026-06-15 10:30 AM',
    noteType: 'Progress Note',
    program: 'EIOP',
    text: 'Client appeared today with bright affect. Discussed transition plans into the outpatient support network. She expressed nervous anticipation regarding returning to she workplace but has identified strong coping resources. Recommended continuing daily logs.',
    isDraft: false,
    flags: ['Discharge Plan Ready', 'High Attendance Checked']
  },
  {
    id: 'note-2',
    clientId: 'client-1',
    clientName: 'Sarah Jenkins',
    authorName: 'Dr. Aris Thorne',
    date: '2026-06-12 02:00 PM',
    noteType: 'Clinical Summary',
    program: 'EIOP',
    text: 'Weekly review: Sarah has exhibited substantial improvement in her HAM-D scores since intake. Coping strategies for trigger events are being consistently practiced. Case is on track for slated discharge on June 28th.',
    isDraft: false,
    flags: ['Clinical Milestone']
  },
  {
    id: 'note-3',
    clientId: 'client-2',
    clientName: 'Liam Sterling',
    authorName: 'Elena Rostova',
    date: '2026-06-14 11:15 AM',
    noteType: 'Progress Note',
    program: 'DIOP',
    text: 'Client completed group therapy session with moderate participation. Actively avoided talking about home stressors but was helpful during peer reflection exercises. Keep monitoring sign-in status.',
    isDraft: false,
    flags: ['Action Required: Signatures']
  }
];

export const INITIAL_IND_SESSIONS: IndSession[] = [
  {
    id: 'ind-1',
    clientId: 'client-1',
    clientName: 'Sarah Jenkins',
    phone: '(512) 555-0234',
    therapist: 'Dr. Aris Thorne',
    time: '9:00 AM',
    location: 'Room 204',
    date: '2026-06-15',
    attendanceStatus: 'Present'
  },
  {
    id: 'ind-2',
    clientId: 'client-2',
    clientName: 'Liam Sterling',
    phone: '(512) 555-0312',
    therapist: 'Elena Rostova',
    time: '10:30 AM',
    location: 'Room 201',
    date: '2026-06-15',
    attendanceStatus: 'Unconfirmed'
  },
  {
    id: 'ind-3',
    clientId: 'client-7',
    clientName: 'Olivia Chen',
    phone: '(512) 555-0498',
    therapist: 'Dr. Aris Thorne',
    time: '11:00 AM',
    location: 'Telehealth',
    date: '2026-06-15',
    attendanceStatus: 'Unconfirmed',
    virtual: true
  },
  {
    id: 'ind-4',
    clientId: 'client-4',
    clientName: 'Ethan Hunt',
    phone: '(512) 555-0567',
    therapist: 'Elena Rostova',
    time: '2:00 PM',
    location: 'Room 203',
    date: '2026-06-15',
    attendanceStatus: 'Absent',
    isManual: false
  }
];

export const CLINICAL_AUDIT_LOG_ITEMS = [
  { date: '2026-06-15 08:30 AM', action: 'Daily roll-call completed', user: 'Admin Staff Lead', program: 'All Programs' },
  { date: '2026-06-15 09:12 AM', action: 'Client Sarah Jenkins marked PRESENT', user: 'Dr. Aris Thorne', program: 'EIOP' },
  { date: '2026-06-15 10:45 AM', action: 'Created draft Discharge Packet', user: 'Elena Rostova', program: 'DIOP' },
  { date: '2026-06-15 11:30 AM', action: 'Uploaded Background Screening', user: 'HR System Integration', program: 'Staff - Dr. Thorne' }
];

// ─── Census seed data ────────────────────────────────────────────────────────

let _ceId = 0;
function ce(
  clientId: string,
  date: string,
  block: ProgramBlock,
  status: CensusEntry['status'],
  opts: Partial<CensusEntry> = {}
): CensusEntry {
  return {
    id: `ce-${++_ceId}`,
    clientId, date, block,
    status,
    excused: false, tardy: false, virtualMode: 'none' as VirtualMode, autoFilled: false,
    ...opts,
  };
}

const W1 = ['2026-06-23', '2026-06-24', '2026-06-25', '2026-06-26', '2026-06-27']; // prev week
const W2_MON = '2026-06-29'; // current week, Monday only (in progress)

export const INITIAL_CENSUS_ENTRIES: CensusEntry[] = [
  // ── Sarah Jenkins (EIOP, SF) ─────────────────────────────────────────────
  ...W1.map(d => ce('client-1', d, 'EIOP', 'Present', { tardy: d === '2026-06-24' })),
  ...W1.map(d => ce('client-1', d, 'EOP', 'Present', { autoFilled: true, tardy: d === '2026-06-24' })),
  ce('client-1', '2026-06-25', 'IND', 'Present', { virtualMode: 'residence' }),
  ce('client-1', W2_MON, 'EIOP', 'Present'),
  ce('client-1', W2_MON, 'EOP', 'Present', { autoFilled: true }),

  // ── Isabella Ross (EIOP, SF) ──────────────────────────────────────────────
  ...W1.map(d => ce('client-5', d, 'EIOP', 'Present')),
  ...W1.map(d => ce('client-5', d, 'EOP', 'Present', { autoFilled: true })),
  ce('client-5', '2026-06-26', 'EIOP', 'Absent', { excused: true }),
  ce('client-5', '2026-06-26', 'EOP', 'Absent', { excused: true, autoFilled: true }),
  ce('client-5', '2026-06-24', 'IND', 'Present'),

  // ── Olivia Chen (EIOP, ABQ) ───────────────────────────────────────────────
  ...W1.map(d => ce('client-7', d, 'EIOP', d === '2026-06-25' ? 'Absent' : 'Present', {
    virtualMode: d === '2026-06-23' || d === '2026-06-27' ? 'residence' : 'none',
    excused: d === '2026-06-25',
  })),
  ...W1.map(d => ce('client-7', d, 'EOP', d === '2026-06-25' ? 'Absent' : 'Present', {
    autoFilled: true,
    excused: d === '2026-06-25',
    virtualMode: d === '2026-06-23' || d === '2026-06-27' ? 'residence' : 'none',
  })),
  ce('client-7', '2026-06-23', 'IND', 'Present', { virtualMode: 'residence' }),

  // ── Lucas Gray (EIOP, ABQ) ────────────────────────────────────────────────
  ...W1.map(d => ce('client-8', d, 'EIOP', 'Present', { tardy: d === '2026-06-25' })),
  ...W1.map(d => ce('client-8', d, 'EOP', 'Present', { autoFilled: true, tardy: d === '2026-06-25' })),
  ce('client-8', '2026-06-26', 'IND', 'Present'),

  // ── Liam Sterling (DIOP, SF) ─────────────────────────────────────────────
  ...W1.map(d => ce('client-2', d, 'DIOP', d === '2026-06-24' ? 'Absent' : 'Present', {
    excused: false,
  })),
  ...W1.map(d => ce('client-2', d, 'DOP', d === '2026-06-24' ? 'Absent' : 'Present', { autoFilled: true })),
  ce('client-2', '2026-06-25', 'IND', 'Present'),
  ce('client-2', W2_MON, 'DIOP', 'Present'),
  ce('client-2', W2_MON, 'DOP', 'Present', { autoFilled: true }),

  // ── Sophia Vance (DIOP, SF) ──────────────────────────────────────────────
  ...W1.map(d => ce('client-3', d, 'DIOP', 'Present', { tardy: d === '2026-06-23' })),
  ...W1.map(d => ce('client-3', d, 'DOP', 'Present', { autoFilled: true, tardy: d === '2026-06-23' })),
  ce('client-3', '2026-06-27', 'IND', 'Absent', { excused: true }),

  // ── Ethan Hunt (DIOP, ABQ) ───────────────────────────────────────────────
  ...W1.map(d => ce('client-4', d, 'DIOP', 'Present', { virtualMode: d === '2026-06-24' ? 'residence' : 'none' })),
  ...W1.map(d => ce('client-4', d, 'DOP', 'Present', { autoFilled: true, virtualMode: d === '2026-06-24' ? 'residence' : 'none' })),
  ce('client-4', '2026-06-26', 'IND', 'Present'),

  // ── Daniel Kim (DIOP, ABQ) ───────────────────────────────────────────────
  ...W1.map(d => ce('client-6', d, 'DIOP', d === '2026-06-27' ? 'Special' : 'Present', {
    specialCode: d === '2026-06-27' ? 'L' : undefined,
  })),
  ...W1.map(d => ce('client-6', d, 'DOP', d === '2026-06-27' ? 'Special' : 'Present', {
    autoFilled: true,
    specialCode: d === '2026-06-27' ? 'L' : undefined,
  })),
  ce('client-6', '2026-06-23', 'IND', 'Present'),

  // ── Madison Torres (DOP, SF) ─────────────────────────────────────────────
  ...W1.map(d => ce('client-9', d, 'DOP', d === '2026-06-26' || d === '2026-06-27' ? 'Absent' : 'Present', {
    excused: d === '2026-06-26',
  })),
  ce('client-9', '2026-06-24', 'IND', 'Present'),

  // ── Derek Pham (DOP, ABQ) ────────────────────────────────────────────────
  ...W1.map(d => ce('client-10', d, 'DOP', 'Present', { tardy: d === '2026-06-23' })),
  ce('client-10', '2026-06-25', 'IND', 'Present'),

  // ── Rachel Kim (EOP, SF) ─────────────────────────────────────────────────
  ...W1.map(d => ce('client-11', d, 'EOP', d === '2026-06-25' ? 'Absent' : 'Present')),
  ce('client-11', '2026-06-24', 'IND', 'Present', { virtualMode: 'away' }),

  // ── James Porter (EOP, ABQ) ──────────────────────────────────────────────
  ...W1.map(d => ce('client-12', d, 'EOP', 'Present')),
  ce('client-12', '2026-06-26', 'IND', 'Absent', { excused: false }),
];

export const INITIAL_INSURANCE_BILLING_NOTES: InsuranceBillingNote[] = [
  { clientId: 'client-1', weekStart: '2026-06-23', notes: 'Auth renewed 6/23 through 7/31. Confirm claim submission by EOW.' },
  { clientId: 'client-4', weekStart: '2026-06-23', notes: 'UHC pending review — follow up Thursday re: authorization extension.' },
];

export const SYSTEM_CONNECTIONS = [
  { name: 'E-Prescribe Live Sync', status: 'Connected', delay: 'Instant', api: 'SureScripts v10.4' },
  { name: 'Lab Corp Integration', status: 'Connected', delay: '15 min pull', api: 'HL7 Feed v2.5' },
  { name: 'Clearinghouse Gateway', status: 'Idle', delay: 'Daily batch at 8PM', api: 'EDI 837 Server' }
];
