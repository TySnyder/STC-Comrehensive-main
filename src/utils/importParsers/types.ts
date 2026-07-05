import { ProgramBlock, VirtualMode, SpecialCode } from '../../types';

export type ParsedStatus = 'Present' | 'Absent' | 'Special';

/** One attendance record extracted from a CSV or XLSX census file. */
export interface ParsedRow {
  raw: Record<string, string>;
  date: string | null;
  block: ProgramBlock | null;
  status: ParsedStatus | null;
  excused: boolean;
  tardy: boolean;
  virtualMode: VirtualMode;
  specialCode: SpecialCode | undefined;
  valid: boolean;
  error?: string;
  xlsxClientName?: string;
}

/** One client row extracted from the Client Contact Sheet workbook. */
export interface ParsedContactClient {
  key: number;
  name: string;
  program: string;
  admitDate: string;
  cellPhone: string;
  homePhone: string;
  email: string;
  homeAddress: string;
  therapist: string;
  autoLocation: 'SF' | 'ABQ' | null;
}

/** Diagnoses for one client, extracted from a diagnosis workbook. */
export interface DxEntry {
  xlsxName: string;
  diagnoses: string[];
}
