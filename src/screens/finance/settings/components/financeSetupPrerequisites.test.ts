import { it, expect, describe } from 'vitest';

import {
  setupOptionsMissing,
  paymentTermCalendarMissing,
  structurePublicationPrerequisites,
} from './financeSetupPrerequisites';

const ready = (currentData: unknown) => ({ currentData, isSuccess: true });
describe('Finance settings prerequisites', () => {
  it('requires a successful current-scope empty result, with no saved pin', () => {
    expect(setupOptionsMissing(ready({ items: [] }))).toBe(true);
    expect(setupOptionsMissing({ data: { items: [] } })).toBe(false);
    expect(setupOptionsMissing(ready({ items: [] }), false)).toBe(false);
    expect(setupOptionsMissing(ready({ items: [] }), true, 'historical')).toBe(false);
    expect(setupOptionsMissing(ready({ items: [{ id: 'none', name: 'None' }] }))).toBe(false);
  });
  it.each(['isLoading', 'isFetching', 'isError', 'isUninitialized'])(
    'does not call %s missing setup',
    (state) => {
      expect(setupOptionsMissing({ ...ready({ items: [] }), [state]: true })).toBe(false);
    }
  );
  it('only requires a calendar after the academic context has resolved', () => {
    expect(paymentTermCalendarMissing(ready({ items: [] }), '', '')).toBe(false);
    expect(paymentTermCalendarMissing({}, 'year', '')).toBe(false);
    expect(paymentTermCalendarMissing(ready({ items: [] }), 'year', '')).toBe(true);
    const boards = ready({
      items: [{ id: 'board', academicYearId: 'year', startDate: '', endDate: '' }],
    });
    expect(paymentTermCalendarMissing(boards, 'year', '')).toBe(false);
    expect(paymentTermCalendarMissing(boards, 'year', 'board')).toBe(true);
    expect(paymentTermCalendarMissing({ ...boards, isError: true }, 'year', 'board')).toBe(false);
    expect(
      paymentTermCalendarMissing(
        ready({
          items: [
            { id: 'board', academicYearId: 'year', startDate: '2026-04-01', endDate: '2027-03-31' },
          ],
        }),
        'year',
        'board'
      )
    ).toBe(false);
  });
  it('limits publication prerequisites to ready catalogs and preserves pinned versions', () => {
    const input = {
      heads: { currentData: [] },
      terms: { ready: true },
      collection: { ready: true },
      settings: { heads: [], terms: [], policies: [] },
      candidate: { feeHeads: [] },
    };
    expect(structurePublicationPrerequisites(input)).toEqual([
      'fee-head',
      'payment-term',
      'collection-policy',
    ]);
    expect(structurePublicationPrerequisites({ ...input, locked: true })).toEqual([]);
    expect(
      structurePublicationPrerequisites({
        ...input,
        terms: { ready: false },
        collection: { ready: false },
        heads: { isError: true },
      })
    ).toEqual([]);
    expect(
      structurePublicationPrerequisites({
        ...input,
        candidate: {
          feeHeads: [{ feeHeadId: 'old', paymentTermVersionId: 'term-version' }],
          collectionPolicyVersionId: 'collection-version',
        },
      })
    ).toEqual([]);
  });
});
