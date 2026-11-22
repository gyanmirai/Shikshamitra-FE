import type { AcademicYear } from 'src/types/school';

import { it, vi, expect, afterEach, beforeEach } from 'vitest';
import { act, renderHook } from '@testing-library/react';

import { useAdmissionCycleForm } from './use-admission-cycle-form';

import type { AdmissionCycleDialogProps } from '../admission-cycle-dialog';

const year: AcademicYear = {
  id: 'year-2026',
  name: '2026-2027',
  startDate: '2026-04-01',
  endDate: '2027-03-31',
  creationTime: '',
  creatorId: '',
  lastModificationTime: '',
  lastModifierId: '',
};
const futureYear = {
  ...year,
  id: 'year-2027',
  name: '2027-2028',
  startDate: '2027-04-01',
  endDate: '2028-03-31',
};
const values = {
  name: 'New period',
  code: '',
  description: '',
  academicYearId: year.id,
  startDate: '2026-01-01',
  endDate: '2026-03-31',
};

beforeEach(() => {
  vi.useFakeTimers({ toFake: ['Date'] });
  vi.setSystemTime(new Date('2026-01-01T06:00:00Z'));
});

afterEach(() => vi.useRealTimers());
function setup(overrides: Partial<AdmissionCycleDialogProps> = {}) {
  const onSave = vi.fn().mockResolvedValue(undefined);
  const props = {
    academicYearId: year.id,
    academicYears: [year, futureYear],
    academicYearsLoading: false,
    academicYearsError: false,
    onClose: vi.fn(),
    onSave,
    ...overrides,
  };
  return { ...renderHook(() => useAdmissionCycleForm(props)), onSave };
}

it('rejects opening and closing dates from earlier calendar years on create', async () => {
  const { result, onSave } = setup();
  await act(async () => {
    await result.current.setValues({ ...values, startDate: '2025-12-01', endDate: '2025-12-31' });
  });
  await act(async () => {
    await result.current.submitForm();
  });
  expect(result.current.errors.startDate).toContain('01/01/2026');
  expect(result.current.errors.endDate).toContain('01/01/2026');
  expect(onSave).not.toHaveBeenCalled();
});

it('permits January 1 and early admission dates before the academic year starts', async () => {
  const { result, onSave } = setup();
  await act(async () => {
    await result.current.setValues(values);
  });
  await act(async () => {
    await result.current.submitForm();
  });
  expect(onSave).toHaveBeenCalledOnce();
  expect(onSave.mock.calls[0][0].startDate).toMatch(/^2026-01-01T/);
  expect(onSave.mock.calls[0][0].endDate).toMatch(/^2026-03-31T/);
});

it('rejects dates before today and permits an application window that opens and closes today', async () => {
  vi.setSystemTime(new Date('2026-11-22T06:00:00Z'));
  const { result, onSave } = setup();
  await act(async () => {
    await result.current.setValues({ ...values, startDate: '2026-11-21', endDate: '2026-11-21' });
  });
  await act(async () => {
    await result.current.submitForm();
  });
  expect(result.current.errors.startDate).toContain('22/11/2026');
  expect(result.current.errors.endDate).toContain('22/11/2026');
  expect(onSave).not.toHaveBeenCalled();

  await act(async () => {
    await result.current.setValues({ ...values, startDate: '2026-11-22', endDate: '2026-11-22' });
  });
  await act(async () => {
    await result.current.submitForm();
  });
  expect(onSave).toHaveBeenCalledOnce();
});

it.each([
  [
    'Admissions.CycleNameAlreadyExists',
    'An admission cycle with this name already exists. Enter a different name.',
  ],
  [
    'Admissions.ArchivedCycleNameAlreadyExists',
    'An archived admission cycle with this name already exists. Enter a different name.',
  ],
])('shows %s inline and preserves the draft', async (code, message) => {
  const onSave = vi.fn().mockRejectedValue({ data: { error: { code } } });
  const onClose = vi.fn();
  const { result } = setup({ onSave, onClose });
  await act(async () => {
    await result.current.setValues({ ...values, name: '  New Period  ', description: 'Keep this' });
  });
  await act(async () => {
    await result.current.submitForm();
  });
  expect(result.current.errors.name).toBe(message);
  expect(result.current.values).toMatchObject({ name: '  New Period  ', description: 'Keep this' });
  expect(onClose).not.toHaveBeenCalled();
});

it('revalidates against a newly selected academic year without clearing the dates', async () => {
  const { result, onSave } = setup();
  await act(async () => {
    await result.current.setValues(values);
  });
  await act(async () => {
    await result.current.setFieldValue('academicYearId', futureYear.id);
  });
  expect(result.current.values.startDate).toBe(values.startDate);
  expect(result.current.errors.startDate).toContain('01/01/2027');
  await act(async () => {
    await result.current.submitForm();
  });
  expect(onSave).not.toHaveBeenCalled();
});

it.each([
  { academicYears: [] },
  { academicYearsLoading: true },
  { academicYearsError: true },
  { academicYears: [{ ...year, startDate: '' }] },
])('does not create without available Institute Setup year dates: %j', async (overrides) => {
  const { result, onSave } = setup(overrides);
  await act(async () => {
    await result.current.setValues(values);
  });
  await act(async () => {
    await result.current.submitForm();
  });
  expect(result.current.errors.academicYearId).toBeTruthy();
  expect(onSave).not.toHaveBeenCalled();
});

it('uses the configured civil start year without shifting it through its timezone offset', async () => {
  const { result, onSave } = setup({
    academicYears: [{ ...year, startDate: '2026-01-01T00:00:00+14:00' }],
  });
  await act(async () => {
    await result.current.setValues({ ...values, startDate: '2025-12-30', endDate: '2026-01-01' });
  });
  await act(async () => {
    await result.current.submitForm();
  });
  expect(result.current.errors.startDate).toContain('01/01/2026');
  expect(onSave).not.toHaveBeenCalled();
});

it('preserves historical dates while editing an existing draft period', async () => {
  const historical = { ...values, startDate: '2025-12-01', endDate: '2025-12-31' };
  const { result, onSave } = setup({
    editingCycle: {
      ...historical,
      id: 'saved-period',
      academicYearName: year.name,
      status: 0,
      windowStatus: 2,
      isAcceptingApplications: false,
      linkedOfferingCount: 0,
      activeOfferingCount: 0,
      applicationCount: 0,
      concurrencyStamp: 'stamp',
    },
  });
  await act(async () => {
    await result.current.setFieldValue('name', 'Updated historical period');
  });
  await act(async () => {
    await result.current.submitForm();
  });
  expect(onSave).toHaveBeenCalledOnce();
  expect(onSave.mock.calls[0][0].startDate).toMatch(/^2025-12-01T/);
});
