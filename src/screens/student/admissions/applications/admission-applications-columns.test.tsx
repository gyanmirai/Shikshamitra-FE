import { vi, it, expect, describe } from 'vitest';
import { getCellValueForExport } from 'src/components/customizabaleTable/table-export';

import { buildAdmissionApplicationsColumns } from './admission-applications-columns';

const columns = buildAdmissionApplicationsColumns({
  applicationUrl: (id) => `/applications/${id}`,
  onOpen: vi.fn(),
});
const cell = (id: string) => columns.find((column) => column.id === id)!;

describe('Applications record presentation', () => {
  it('keeps the lifecycle label visible with supported sorting and filters', () => {
    expect(cell('status')).toMatchObject({ sticky: true, stickyPosition: 'right', isSort: true });
    expect(columns.some((column) => column.id === 'actions')).toBe(false);
    expect(columns.filter((column) => column.isFilter).map((column) => column.id)).toEqual([
      'standardName',
      'lastSavedAt',
      'status',
    ]);
    expect(cell('applicantName').isFilter).toBe(false);
    expect(cell('contactPhone').isFilter).toBe(false);
  });
  it('uses honest missing saved dates', () => {
    expect(columns.some((column) => column.id === 'assignedCounsellorName')).toBe(false);
    expect(getCellValueForExport({ lastSavedAt: null }, cell('lastSavedAt'))).toBe('—');
  });
  it('exports the combined identity and separate contact information without duplicate columns', () => {
    expect(
      getCellValueForExport(
        { id: 'a', applicantName: 'Riya Patel', applicationNumber: 'APP-2026-000001' },
        cell('applicantName')
      )
    ).toBe('Riya Patel APP-2026-000001');
    expect(
      getCellValueForExport(
        { contactPhone: '9876543210', contactEmail: 'parent@example.test' },
        cell('contactPhone')
      )
    ).toBe('9876543210');
    expect(
      getCellValueForExport({ contactEmail: 'parent@example.test' }, cell('contactEmail'))
    ).toBe('parent@example.test');
    expect(
      columns.some((column) =>
        ['applicationNumber', 'offeringCode', 'currentStageName'].includes(column.id)
      )
    ).toBe(false);
  });
});
