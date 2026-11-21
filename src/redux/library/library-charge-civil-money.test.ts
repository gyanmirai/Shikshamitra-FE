import { it, expect, describe } from 'vitest';

import {
  mapChargeListItemDto,
  buildCreateChargePayload,
  buildUpdateChargePayload,
} from './library-adapters';

describe('active Library assessment contract', () => {
  it('sends the explicitly selected assessment year and civil dates without fabricated raw instants', () => {
    const body = buildCreateChargePayload({
      memberId: 'canonical-borrower',
      chargeCategory: 'assessment-category',
      amount: '100.75',
      academicYearId: 'assessment-year',
      schoolChargeDate: '2026-11-17',
      schoolDueDate: '2026-11-24',
      reason: 'Reviewed the actual damage assessment and its school dates.',
    });

    expect(body).toEqual({
      memberId: 'canonical-borrower',
      chargeCategoryId: 'assessment-category',
      amount: 100.75,
      academicYearId: 'assessment-year',
      schoolChargeDate: '2026-11-17',
      schoolDueDate: '2026-11-24',
      remarks: 'Reviewed the actual damage assessment and its school dates.',
    });
  });

  it('sends assessment edits without declaring a payment or waiver', () => {
    const body = buildUpdateChargePayload({
      amount: '100.75',
      schoolDueDate: '2026-11-25',
      reason: 'Corrected the reviewed assessment deadline.',
      paymentStatus: 1,
      paidDate: '2026-11-18T08:30:00Z',
    });

    expect(body).toEqual({
      amount: 100.75,
      schoolDueDate: '2026-11-25',
      remarks: 'Corrected the reviewed assessment deadline.',
    });
  });

  it('uses confirmed civil dates for display while preserving exact legacy evidence and source version', () => {
    const source = {
      id: 'assessment-id',
      memberId: 'canonical-borrower',
      role: 1,
      amount: 100.75,
      chargeDate: '2026-11-16T18:30:00Z',
      dueDate: '2026-11-23T18:30:00Z',
      schoolChargeDate: '2026-11-17',
      schoolDueDate: '2026-11-24',
      chargeDateProvenance: 1,
      dueDateProvenance: 1,
      academicYearId: 'assessment-year',
      academicYearProvenance: 3,
      financeSourceLinkId: 'real-source-link',
      sourceVersion: ' exact opaque source version ',
    };

    expect(mapChargeListItemDto(source)).toMatchObject({
      id: source.id,
      memberId: source.memberId,
      assignAt: source.schoolChargeDate,
      dueDate: source.schoolDueDate,
      rawChargeDate: source.chargeDate,
      rawDueDate: source.dueDate,
      chargeDateProvenance: 1,
      dueDateProvenance: 1,
      academicYearId: source.academicYearId,
      academicYearProvenance: 3,
      financeSourceLinkId: source.financeSourceLinkId,
      sourceVersion: source.sourceVersion,
      amount: 100.75,
    });
  });
});
