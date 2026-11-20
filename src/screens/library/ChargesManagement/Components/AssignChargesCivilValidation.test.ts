import dayjs from 'dayjs';
import { it, expect, describe } from 'vitest';
import isSameOrAfter from 'dayjs/plugin/isSameOrAfter';
import isSameOrBefore from 'dayjs/plugin/isSameOrBefore';
import customParseFormat from 'dayjs/plugin/customParseFormat';
import { assignLibraryChargeInitialValues } from 'src/screens/library/ChargesManagement/Components/AssignChargeInitialValues';
import { assignLibraryChargeValidationSchema } from 'src/screens/library/ChargesManagement/Components/AssignChargesValidationSchema';

// Configure the real Dayjs plugins used by the existing schema. Missing plugin
// setup must not masquerade as a canonical validation regression.
dayjs.extend(customParseFormat);
dayjs.extend(isSameOrAfter);
dayjs.extend(isSameOrBefore);

const selectedYear = {
  id: '268cd088-b405-4325-8749-365e6778ab33',
  name: 'A selected school year; this label is not a date source',
  startDate: '2026-04-01',
  endDate: '2027-03-31',
};

const valid = () => ({
  // Complete legacy form prerequisites: failures below must concern only the
  // explicitly varied canonical field, not a missing book/category/member.
  memberId: '5c68d95f-73ba-4207-a337-71e6396ffec7',
  role: 'Employee',
  class: '',
  division: '',
  member: '5c68d95f-73ba-4207-a337-71e6396ffec7',
  bookNumber: 'ACC-0001',
  bookTitle: 'Stories from the school library',
  chargeCategory: 'b2469347-174e-4d65-af7e-c08d3bc39021',
  amount: '12.25',
  reason: 'Reviewed damage to the book cover.',
  academicYearId: selectedYear.id,
  chargeDate: dayjs('2026-11-17'),
  dueDate: dayjs('2026-11-24'),
});

describe('canonical Library charge civil validation', () => {
  it('accepts a fully populated legacy-and-canonical baseline', async () => {
    await expect(assignLibraryChargeValidationSchema(selectedYear).isValid(valid())).resolves.toBe(
      true
    );
  });

  it('requires a selected year ID even when labels and year bounds are present', async () => {
    const values = { ...valid(), academicYearId: '' };
    await expect(
      assignLibraryChargeValidationSchema({ ...selectedYear, id: '' }).isValid(values)
    ).resolves.toBe(false);
  });

  it.each([
    { label: 'empty', value: null },
    { label: 'missing', value: undefined },
    { label: 'invalid calendar date', value: dayjs('2026-02-30', 'YYYY-MM-DD', true) },
  ])('rejects an explicit assessment date that is $label', async ({ value }) => {
    await expect(
      assignLibraryChargeValidationSchema(selectedYear).isValid({ ...valid(), chargeDate: value })
    ).resolves.toBe(false);
  });

  it('rejects a due date before the assessment date even inside the selected year', async () => {
    await expect(
      assignLibraryChargeValidationSchema(selectedYear).isValid({
        ...valid(),
        dueDate: dayjs('2026-11-16'),
      })
    ).resolves.toBe(false);
  });

  it('allows a due date on the assessment date', async () => {
    await expect(
      assignLibraryChargeValidationSchema(selectedYear).isValid({
        ...valid(),
        dueDate: dayjs('2026-11-17'),
      })
    ).resolves.toBe(true);
  });

  it('allows a due date after the academic year ends without changing the selected year', async () => {
    await expect(
      assignLibraryChargeValidationSchema(selectedYear).isValid({
        ...valid(),
        dueDate: dayjs('2027-04-03'),
      })
    ).resolves.toBe(true);
  });

  it.each(['0', '-0.01', '12.345'])(
    'rejects invalid positive/two-decimal amount %s',
    async (amount) => {
      await expect(
        assignLibraryChargeValidationSchema(selectedYear).isValid({ ...valid(), amount })
      ).resolves.toBe(false);
    }
  );

  it('accepts the smallest positive paise amount', async () => {
    await expect(
      assignLibraryChargeValidationSchema(selectedYear).isValid({ ...valid(), amount: '0.01' })
    ).resolves.toBe(true);
  });

  it('starts with an explicitly empty assessment date instead of substituting browser now', () => {
    const values = assignLibraryChargeInitialValues() as Record<string, unknown>;
    expect(values.chargeDate).toBeNull();
  });

  it('hydrates saved civil dates instead of unrelated preserved legacy timestamp components', () => {
    const values = assignLibraryChargeInitialValues({
      academicYearId: selectedYear.id,
      schoolChargeDate: '2026-11-17',
      schoolDueDate: '2027-04-03',
      chargeDateProvenance: 1,
      dueDateProvenance: 1,
      chargeDate: '2040-01-01T00:00:00Z',
      dueDate: '2040-02-01T00:00:00Z',
    }) as Record<string, unknown>;
    expect(dayjs.isDayjs(values.chargeDate)).toBe(true);
    expect((values.chargeDate as dayjs.Dayjs).format('YYYY-MM-DD')).toBe('2026-11-17');
    expect(dayjs.isDayjs(values.dueDate)).toBe(true);
    expect((values.dueDate as dayjs.Dayjs).format('YYYY-MM-DD')).toBe('2027-04-03');
  });
});
