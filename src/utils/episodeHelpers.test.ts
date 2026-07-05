import { describe, it, expect } from 'vitest';
import {
  getEpisodes,
  getCurrentEpisode,
  applyDischarge,
  reverseDischarge,
  updateEpisode,
  readmitClient,
  getPaperworkItems,
  countOutstanding,
  chaseDeadline,
  isChaseClosed,
} from './episodeHelpers';
import { Client, Episode } from '../types';

const baseClient = (overrides: Partial<Client> = {}): Client => ({
  id: 'c1',
  name: 'Test Client',
  program: 'DIOP',
  location: 'SF',
  admissionDate: '2026-04-01',
  status: 'Active',
  followUpNeeded: false,
  insurance: 'BCBS',
  age: 30,
  gender: 'M',
  diagnoses: [],
  primaryTherapist: 'Dr. T',
  attendanceHistory: [],
  ...overrides,
});

describe('episode materialization', () => {
  it('derives one implicit episode from admissionDate when episodes absent', () => {
    const eps = getEpisodes(baseClient());
    expect(eps).toHaveLength(1);
    expect(eps[0].episodeNumber).toBe(1);
    expect(eps[0].admitDate).toBe('2026-04-01');
  });

  it('returns explicit episodes untouched', () => {
    const episodes: Episode[] = [
      { id: 'e1', episodeNumber: 1, admitDate: '2025-01-01', stcDcDate: '2025-04-01' },
      { id: 'e2', episodeNumber: 2, admitDate: '2026-04-01' },
    ];
    expect(getEpisodes(baseClient({ episodes }))).toBe(episodes);
    expect(getCurrentEpisode(baseClient({ episodes })).id).toBe('e2');
  });
});

describe('readmitClient', () => {
  it('appends a new episode and returns the client to Active', () => {
    const discharged = baseClient({
      status: 'Discharged',
      episodes: [{ id: 'c1-ep1', episodeNumber: 1, admitDate: '2026-01-05', stcDcDate: '2026-04-01' }],
    });
    const c = readmitClient(discharged, '2026-07-06');
    expect(c.status).toBe('Active');
    expect(c.episodes).toHaveLength(2);
    expect(c.episodes![1]).toMatchObject({ episodeNumber: 2, admitDate: '2026-07-06' });
    expect(getCurrentEpisode(c).id).toBe('c1-ep2');
  });

  it('materializes the implicit discharged episode before appending', () => {
    // discharge first so stcDcDate is set, then readmit
    const dc = applyDischarge(baseClient(), { stcDcDate: '2026-06-01', dcStatus: ['Approved'] });
    const c = readmitClient(dc, '2026-07-06');
    expect(c.episodes).toHaveLength(2);
    expect(c.episodes![0].stcDcDate).toBe('2026-06-01');
  });

  it('is a no-op when the current episode is not fully discharged', () => {
    const active = baseClient();
    expect(readmitClient(active, '2026-07-06')).toBe(active);
    const stepDown = applyDischarge(baseClient(), { iopDcDate: '2026-06-01' });
    expect(readmitClient(stepDown, '2026-07-06')).toBe(stepDown);
  });
});

describe('applyDischarge', () => {
  it('materializes the implicit episode and writes discharge fields', () => {
    const c = applyDischarge(baseClient(), {
      stcDcDate: '2026-06-15',
      dcStatus: ['Approved'],
      graduated: true,
    });
    expect(c.status).toBe('Discharged');
    expect(c.episodes).toHaveLength(1);
    expect(c.episodes![0].stcDcDate).toBe('2026-06-15');
    expect(c.episodes![0].dcStatus).toEqual(['Approved']);
    expect(c.episodes![0].graduated).toBe(true);
  });

  it('IOP-only step-down keeps the client Active', () => {
    const c = applyDischarge(baseClient(), { iopDcDate: '2026-06-01' });
    expect(c.status).toBe('Active');
    expect(c.episodes![0].iopDcDate).toBe('2026-06-01');
    expect(c.episodes![0].stcDcDate).toBeUndefined();
  });

  it('writes to the current (highest-numbered) episode only', () => {
    const episodes: Episode[] = [
      { id: 'e1', episodeNumber: 1, admitDate: '2025-01-01', stcDcDate: '2025-04-01' },
      { id: 'e2', episodeNumber: 2, admitDate: '2026-04-01' },
    ];
    const c = applyDischarge(baseClient({ episodes }), { stcDcDate: '2026-06-20', dcStatus: ['ASA'] });
    expect(c.episodes![0].stcDcDate).toBe('2025-04-01');
    expect(c.episodes![1].stcDcDate).toBe('2026-06-20');
  });

  it('supports multi-select DC status combos', () => {
    const c = applyDischarge(baseClient(), { stcDcDate: '2026-06-15', dcStatus: ['ASA', 'Admin DC'] });
    expect(c.episodes![0].dcStatus).toEqual(['ASA', 'Admin DC']);
  });
});

describe('reverseDischarge', () => {
  it('voids discharge + paperwork fields, keeps note, reactivates client', () => {
    let c = applyDischarge(baseClient(), {
      iopDcDate: '2026-06-01',
      stcDcDate: '2026-06-15',
      dcStatus: ['Approved'],
      graduated: true,
      note: 'vacation + insurance gap',
    });
    c = updateEpisode(c, c.episodes![0].id, { dcFormSentAt: '2026-06-16' });
    c = reverseDischarge(c);
    const ep = c.episodes![0];
    expect(c.status).toBe('Active');
    expect(ep.iopDcDate).toBeUndefined();
    expect(ep.stcDcDate).toBeUndefined();
    expect(ep.dcStatus).toBeUndefined();
    expect(ep.graduated).toBeUndefined();
    expect(ep.dcFormSentAt).toBeUndefined();
    expect(ep.note).toBe('vacation + insurance gap');
    expect(ep.admitDate).toBe('2026-04-01');
  });
});

describe('paperwork checklist', () => {
  const dischargedEp = (overrides: Partial<Episode> = {}): Episode => ({
    id: 'e1',
    episodeNumber: 1,
    admitDate: '2026-04-01',
    stcDcDate: '2026-06-15',
    dcStatus: ['Approved'],
    ...overrides,
  });

  it('is empty until fully discharged', () => {
    expect(getPaperworkItems({ id: 'e1', episodeNumber: 1, admitDate: '2026-04-01' }, '2026-06-20')).toEqual([]);
  });

  it('grad cert is n/a unless graduated', () => {
    const items = getPaperworkItems(dischargedEp(), '2026-06-20');
    expect(items.find(i => i.key === 'gradCert')!.state).toBe('n/a');
    const grad = getPaperworkItems(dischargedEp({ graduated: true }), '2026-06-20');
    expect(grad.find(i => i.key === 'gradCert')!.state).toBe('not-sent');
  });

  it('tracks sent → chasing → returned', () => {
    let items = getPaperworkItems(dischargedEp(), '2026-06-20');
    expect(items.find(i => i.key === 'exitInterview')!.state).toBe('not-sent');

    items = getPaperworkItems(dischargedEp({ exitInterviewSentAt: '2026-06-16' }), '2026-06-20');
    expect(items.find(i => i.key === 'exitInterview')!.state).toBe('chasing');

    items = getPaperworkItems(
      dischargedEp({ exitInterviewSentAt: '2026-06-16', exitInterviewReturnedAt: '2026-06-25' }),
      '2026-06-30'
    );
    expect(items.find(i => i.key === 'exitInterview')!.state).toBe('returned');
  });

  it('closes the chase one month after STC DC date', () => {
    expect(chaseDeadline('2026-06-15')).toBe('2026-07-15');
    expect(isChaseClosed('2026-06-15', '2026-07-15')).toBe(false);
    expect(isChaseClosed('2026-06-15', '2026-07-16')).toBe(true);

    const items = getPaperworkItems(dischargedEp({ dcFormSentAt: '2026-06-16' }), '2026-07-20');
    expect(items.find(i => i.key === 'dcForm')!.state).toBe('closed');
    // returned items stay returned even after the window
    const done = getPaperworkItems(
      dischargedEp({ dcFormSentAt: '2026-06-16', dcFormReturnedAt: '2026-06-20' }),
      '2026-07-20'
    );
    expect(done.find(i => i.key === 'dcForm')!.state).toBe('returned');
  });

  it('counts outstanding items within the chase window only', () => {
    expect(countOutstanding(dischargedEp({ graduated: true }), '2026-06-20')).toBe(3);
    expect(countOutstanding(dischargedEp(), '2026-06-20')).toBe(2); // grad cert n/a
    expect(countOutstanding(dischargedEp(), '2026-08-01')).toBe(0); // window closed
  });
});
