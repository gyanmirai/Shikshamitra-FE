import type { IParams } from 'src/components/customizabaleTable/types';

import { it, expect, describe } from 'vitest';

import {
  buildAdmissionInquiryListFilters,
  normalizeAdmissionInquiryTableFilters,
} from './admission-inquiry-table-filters';

const filter = (
  column: string,
  value: string | number,
  type = 'equals'
): IParams['filters'][number] => ({
  column,
  type,
  value,
  valueType: typeof value === 'number' ? 'number' : 'string',
  label: column,
});

describe('Admission Inquiry shared-table filters', () => {
  it('maps global search and column filters to the server query contract', () => {
    const result = buildAdmissionInquiryListFilters(
      [
        filter('inquiryNumber', 'INQ-26', 'startsWith'),
        filter('applicantName', 'Shah', 'endsWith'),
        filter('normalizedPhone', '98765', 'contains'),
        filter('email', 'family@example.com'),
        filter('admissionOfferingId', 'offering-1'),
        filter('source', 2),
        filter('status', 2),
        filter('assignedCounsellorId', 'counsellor-1'),
      ],
      'riya'
    );

    expect(result).toMatchObject({
      search: 'riya',
      inquiryNumber: 'INQ-26',
      inquiryNumberFilterType: 'startsWith',
      applicantName: 'Shah',
      applicantNameFilterType: 'endsWith',
      phone: '98765',
      phoneFilterType: 'contains',
      email: 'family@example.com',
      admissionOfferingId: 'offering-1',
      source: 2,
      status: 2,
      excludePostApplication: true,
    });
  });

  it('keeps only the latest filter for each column', () => {
    expect(
      normalizeAdmissionInquiryTableFilters([
        filter('status', 0),
        filter('source', 1),
        filter('status', 2),
      ]).map(({ column, value }) => ({ column, value }))
    ).toEqual([
      { column: 'source', value: 1 },
      { column: 'status', value: 2 },
    ]);
  });

  it('supports all capture sources and rejects retired status filters', () => {
    expect(buildAdmissionInquiryListFilters([filter('source', 12)], '').source).toBe(12);
    expect(buildAdmissionInquiryListFilters([filter('status', 3)], '').status).toBeUndefined();
  });

  it('allows the Pipeline table to include post-application statuses', () => {
    expect(
      buildAdmissionInquiryListFilters([], '', undefined, { excludePostApplication: false })
    ).toMatchObject({ excludePostApplication: false });
  });
});

it('filters the displayed class name independently of loaded offering choices', () => {
  expect(
    buildAdmissionInquiryListFilters(
      [{ column: 'standardName', type: 'equals', value: 'Class 6', valueType: 'string' }],
      ''
    )
  ).toMatchObject({
    standardName: 'Class 6',
    standardNameFilterType: 'equals',
    admissionOfferingId: undefined,
  });
});
