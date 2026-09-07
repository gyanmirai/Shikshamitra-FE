import { it, expect, describe } from 'vitest';

import {
  type PaymentTermListWireResponse,
  normalizePaymentTermListResponse,
  type PaymentTermDetailWireResponse,
  normalizePaymentTermDetailResponse,
  type PaymentTermVersionHistoryWireResponse,
  normalizePaymentTermVersionHistoryResponse,
} from './paymentTerm';

describe('payment-term response normalization', () => {
  it('maps numeric API enums to the string values used by the form', () => {
    const response: PaymentTermDetailWireResponse = {
      id: 'term-id',
      academicYearId: 'year-id',
      boardId: 'board-id',
      name: 'Quarterly payment term',
      code: 'PT-QUARTERLY',
      status: 0,
      isDefault: false,
      holidayShiftingMethod: 0,
      demandGenerationRule: 0,
      demandOffsetDays: null,
      initialDemandStatus: 1,
      totalInstallments: 1,
      versionCount: 1,
      isUsedInFeeStructures: false,
      canDirectEdit: true,
      versions: [
        {
          id: 'version-id',
          versionNumber: 1,
          status: 0,
          holidayShiftingMethod: 0,
          demandGenerationRule: 0,
          demandOffsetDays: null,
          installments: [
            {
              id: 'installment-id',
              sequence: 1,
              name: 'Installment 1',
              coverageStartDate: '2026-07-01T00:00:00+05:30',
              coverageEndDate: '2026-08-31T00:00:00+05:30',
              demandDate: '2026-07-01T00:00:00+05:30',
              dueDate: '2026-08-31T00:00:00+05:30',
              allocationPercentage: 100,
              demandEnabled: true,
              reminderEnabled: false,
            },
          ],
        },
      ],
    };

    const normalized = normalizePaymentTermDetailResponse(response);

    expect(normalized.demandGenerationRule).toBe('OnInstallmentStartDate');
    expect(normalized.holidayShiftingMethod).toBe('None');
    expect(normalized.status).toBe('Draft');
    expect(normalized.initialDemandStatus).toBe('Published');
    expect(normalized.versions[0].demandGenerationRule).toBe('OnInstallmentStartDate');
    expect(normalized.versions[0].status).toBe('Draft');
  });

  it('normalizes the single Draft, Active, or Archived list status', () => {
    const response: PaymentTermListWireResponse = {
      totalCount: 2,
      items: [
        {
          id: 'draft-term-id',
          name: 'Quarterly payment term',
          code: 'PT-QUARTERLY',
          academicYearId: 'year-id',
          boardId: 'board-id',
          status: 0,
          isDefault: true,
          currentVersionNumber: 1,
          hasDraft: true,
          hasPublishedVersion: false,
          installmentCount: 1,
          referencedStructureCount: 0,
          canDirectEdit: true,
        },
        {
          id: 'empty-term-id',
          name: 'Empty payment term',
          code: 'PT-EMPTY',
          academicYearId: 'year-id',
          boardId: 'board-id',
          status: 2,
          isDefault: false,
          currentVersionNumber: 0,
          hasDraft: false,
          hasPublishedVersion: false,
          installmentCount: 0,
          referencedStructureCount: 0,
          canDirectEdit: false,
        },
      ],
    };

    const normalized = normalizePaymentTermListResponse(response);

    expect(normalized.items[0]).toEqual({
      id: 'draft-term-id',
      name: 'Quarterly payment term',
      code: 'PT-QUARTERLY',
      academicYearId: 'year-id',
      boardId: 'board-id',
      status: 'Draft',
      isDefault: true,
      currentVersionNumber: 1,
      hasDraft: true,
      hasPublishedVersion: false,
      installmentCount: 1,
      referencedStructureCount: 0,
      canDirectEdit: true,
    });
    expect(normalized.items[1].status).toBe('Archived');
  });

  it('normalizes version-history statuses while preserving audit metadata', () => {
    const response: PaymentTermVersionHistoryWireResponse = {
      totalCount: 1,
      items: [
        {
          id: 'version-id',
          versionNumber: 2,
          status: 2,
          changeAction: 'superseded',
          changeReason: 'Changed the quarterly schedule',
          creationTime: '2026-09-01T10:30:00Z',
          creatorId: 'user-id',
          createdByName: 'Finance Admin',
        },
      ],
    };

    expect(normalizePaymentTermVersionHistoryResponse(response).items[0]).toMatchObject({
      versionNumber: 2,
      status: 'Superseded',
      changeAction: 'superseded',
      createdByName: 'Finance Admin',
    });
  });
});
