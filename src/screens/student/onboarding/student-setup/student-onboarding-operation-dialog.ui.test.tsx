import { it, vi, expect, afterEach } from 'vitest';
import { render, screen, waitFor, fireEvent } from '@testing-library/react';

import { studentOnboardingTestData } from './student-onboarding-test-fixtures';
import StudentOnboardingOperationDialog from './student-onboarding-operation-dialog';

const operationMocks = vi.hoisted(() => ({
  place: vi.fn(),
  allocate: vi.fn(),
}));

afterEach(() => {
  operationMocks.place.mockReset();
  operationMocks.allocate.mockReset();
});

vi.mock('src/components/iconify', () => ({
  Iconify: () => <span />,
}));

vi.mock('src/components/customDialog', () => ({
  default: ({ open, children }: { open: boolean; children: React.ReactNode }) =>
    open ? <div role="dialog">{children}</div> : null,
  DialogScrollContent: ({ children }: { children: React.ReactNode }) => <div>{children}</div>,
}));

vi.mock('src/components/custom-select', () => ({
  default: ({ label, value, options, onChange }: {
    label: string; value: string; options: Array<{ value: string; label: string }>;
    onChange: (value: string) => void;
  }) => (
    <select aria-label={label} value={value} onChange={(event) => onChange(event.target.value)}>
      <option value="">Select</option>
      {options.map((option) => <option key={option.value} value={option.value}>{option.label}</option>)}
    </select>
  ),
}));

vi.mock('src/components/custom-numeric-format', () => ({
  default: ({ label, value, onValueChange }: {
    label: string; value: string; onValueChange: (value: { value: string }) => void;
  }) => <input aria-label={label} value={value} onChange={(event) => onValueChange({ value: event.target.value })} />,
}));

vi.mock('src/redux/student/onboarding/student-onboarding-api', () => ({
  useGetStudentOnboardingPlacementOptionsQuery: () => ({
    data: [{ id: 'division-b', name: 'B', capacity: 30, availableSeats: 4, isFull: false }],
    isFetching: false, isError: false,
  }),
  useGetAvailableStudentIdentifierSeriesQuery: () => ({
    data: [{ id: 'series-1', name: 'GR 2026', nextPreview: 'GR-2026-001' }],
    isFetching: false, isError: false,
  }),
  useSetStudentOnboardingPlacementMutation: () => [operationMocks.place, { isLoading: false }],
  useAllocateStudentOnboardingIdentifierMutation: () => [operationMocks.allocate, { isLoading: false }],
}));

const student = {
  ...studentOnboardingTestData[0],
  id: 'case-1',
  source: 'onboarding-case' as const,
  divisionId: null,
  concurrencyStamp: 'case-stamp',
};

it('saves a division through the onboarding API instead of confirming a preview', async () => {
  operationMocks.place.mockReturnValue({ unwrap: () => Promise.resolve({}) });
  const onClose = vi.fn();
  render(<StudentOnboardingOperationDialog assignmentType="division" student={student} onClose={onClose} />);

  fireEvent.change(screen.getByRole('combobox', { name: 'Division' }), { target: { value: 'division-b' } });
  fireEvent.click(screen.getByRole('button', { name: 'Reserve division' }));

  await waitFor(() => expect(operationMocks.place).toHaveBeenCalledWith({
    id: 'case-1', concurrencyStamp: 'case-stamp', divisionId: 'division-b', reason: undefined,
  }));
  await waitFor(() => expect(onClose).toHaveBeenCalledOnce());
});

it('saves GR and roll allocation through the onboarding API', async () => {
  operationMocks.allocate.mockReturnValue({ unwrap: () => Promise.resolve({}) });
  render(<StudentOnboardingOperationDialog assignmentType="gr-number" student={student} onClose={vi.fn()} />);

  fireEvent.change(screen.getByRole('combobox', { name: 'Identifier series' }), { target: { value: 'series-1' } });
  fireEvent.change(screen.getByRole('textbox', { name: 'Roll number' }), { target: { value: '11' } });
  fireEvent.click(screen.getByRole('button', { name: 'Prepare identifiers' }));

  await waitFor(() => expect(operationMocks.allocate).toHaveBeenCalledWith({
    id: 'case-1', concurrencyStamp: 'case-stamp', numberSeriesId: 'series-1', rollNumber: 11,
    manualValue: undefined, overrideReason: undefined,
  }));
});
