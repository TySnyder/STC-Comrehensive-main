import { ProgramBlock } from '../../types';

export const BLOCK_TAG: Record<ProgramBlock, string> = {
  DIOP: 'bg-blue-50 text-blue-700',
  DOP:  'bg-violet-50 text-violet-700',
  EIOP: 'bg-amber-50 text-amber-700',
  EOP:  'bg-emerald-50 text-emerald-700',
  IND:  'bg-slate-100 text-slate-600',
};

export const BLOCK_HEADER_BG: Record<ProgramBlock, string> = {
  DIOP: 'bg-blue-50',
  DOP:  'bg-violet-50',
  EIOP: 'bg-amber-50',
  EOP:  'bg-emerald-50',
  IND:  'bg-slate-50',
};

export function clientBlocks(program: string): Exclude<ProgramBlock, 'IND'>[] {
  switch (program) {
    case 'DIOP': return ['DIOP', 'DOP'];
    case 'DOP':  return ['DOP'];
    case 'EIOP': return ['EIOP', 'EOP'];
    case 'EOP':  return ['EOP'];
    default:     return [];
  }
}
