import { it, vi, expect, afterEach, beforeEach } from 'vitest';
import { render, screen, waitFor, fireEvent } from '@testing-library/react';

import { studentOnboardingTestData } from './student-onboarding-test-fixtures';
import StudentOnboardingOperationDialog from './student-onboarding-operation-dialog';

const operationMocks = vi.hoisted(() => ({
  place: vi.fn(),
  allocate: vi.fn(),
  preview: vi.fn(),
  permissions: [] as any[],
  previewData: {} as any,
}));

beforeEach(() => {
  operationMocks.permissions = [{ name: 'Students.Onboarding.Add', isGranted: true }];
  operationMocks.previewData = {
    schoolAssignmentMode: 'manual',
    rollAssignmentMode: 'manual',
    proposedRollNumber: 11,
    concurrencyStamp: 'case-stamp',
  };
  operationMocks.preview.mockImplementation(() => ({
    unwrap: () => Promise.resolve(operationMocks.previewData),
  }));
});

vi.mock('react-redux', () => ({
  useSelector: (select: any) => select({ auth: { permissions: operationMocks.permissions } }),
}));

afterEach(() => {
  operationMocks.place.mockReset();
  operationMocks.allocate.mockReset();
  operationMocks.preview.mockReset();
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
  default: ({
    label,
    value,
    options,
    onChange,
  }: {
    label: string;
    value: string;
    options: Array<{ value: string; label: string }>;
    onChange: (value: string) => void;
  }) => (
    <select aria-label={label} value={value} onChange={(event) => onChange(event.target.value)}>
      <option value="">Select</option>
      {options.map((option) => (
        <option key={option.value} value={option.value}>
          {option.label}
        </option>
      ))}
    </select>
  ),
}));

vi.mock('src/components/custom-numeric-format', () => ({
  default: ({
    label,
    value,
    onValueChange,
  }: {
    label: string;
    value: string;
    onValueChange: (value: { value: string }) => void;
  }) => (
    <input
      aria-label={label}
      value={value}
      onChange={(event) => onValueChange({ value: event.target.value })}
    />
  ),
}));

vi.mock('src/redux/student/onboarding/student-onboarding-api', () => ({
  useGetStudentOnboardingPlacementOptionsQuery: () => ({
    data: [{ id: 'division-b', name: 'B', capacity: 30, availableSeats: 4, isFull: false }],
    isFetching: false,
    isError: false,
  }),
  useGetAvailableStudentIdentifierSeriesQuery: () => ({
    data: [{ id: 'series-1', name: 'GR 2026', nextPreview: 'GR-2026-001' }],
    isFetching: false,
    isError: false,
  }),
  useSetStudentOnboardingPlacementMutation: () => [operationMocks.place, { isLoading: false }],
  useAllocateStudentOnboardingIdentifierMutation: () => [
    operationMocks.allocate,
    { isLoading: false },
  ],
  usePreviewStudentOnboardingRollMutation: () => [operationMocks.preview, { isLoading: false }],
}));

const student = {
  ...studentOnboardingTestData[0],
  id: 'case-1',
  source: 'onboarding-case' as const,
  divisionId: 'division-a',
  concurrencyStamp: 'case-stamp',
};

it('saves a division through the onboarding API instead of confirming a preview', async () => {
  operationMocks.place.mockReturnValue({ unwrap: () => Promise.resolve({}) });
  const onClose = vi.fn();
  render(
    <StudentOnboardingOperationDialog
      assignmentType="division"
      student={{ ...student, divisionId: null }}
      onClose={onClose}
    />
  );

  expect(screen.getByText(student.studentName)).toBeInTheDocument();
  expect(screen.getByRole('option', { name: 'B · 4 of 30 seats available' })).toBeInTheDocument();
  expect(screen.getByRole('button', { name: 'Reserve division' })).toBeDisabled();
  fireEvent.change(screen.getByRole('combobox', { name: 'Division' }), {
    target: { value: 'division-b' },
  });
  expect(screen.getByText('Available seats')).toBeVisible();
  expect(screen.getByText('4 of 30')).toBeVisible();
  expect(screen.getByRole('button', { name: 'Reserve division' })).toBeEnabled();
  fireEvent.click(screen.getByRole('button', { name: 'Reserve division' }));

  await waitFor(() =>
    expect(operationMocks.place).toHaveBeenCalledWith({
      id: 'case-1',
      concurrencyStamp: 'case-stamp',
      divisionId: 'division-b',
      reason: undefined,
    })
  );
  await waitFor(() => expect(onClose).toHaveBeenCalledOnce());
});

it('saves GR and roll allocation through the onboarding API', async () => {
  operationMocks.allocate.mockReturnValue({ unwrap: () => Promise.resolve({}) });
  render(
    <StudentOnboardingOperationDialog
      assignmentType="gr-number"
      student={student}
      onClose={vi.fn()}
    />
  );

  fireEvent.change(screen.getByRole('combobox', { name: 'Identifier series' }), {
    target: { value: 'series-1' },
  });
  fireEvent.change(screen.getByRole('textbox', { name: 'Roll number' }), {
    target: { value: '11' },
  });
  expect(screen.getByRole('button', { name: 'Prepare identifiers' })).toBeDisabled();
  fireEvent.click(screen.getByRole('button', { name: 'Preview roll number' }));
  await waitFor(() =>
    expect(screen.getByRole('button', { name: 'Prepare identifiers' })).toBeEnabled()
  );
  expect(screen.getByText('Roll number preview ready')).toBeInTheDocument();
  expect(screen.getByText('GR 2026')).toBeInTheDocument();
  fireEvent.click(screen.getByRole('button', { name: 'Prepare identifiers' }));

  await waitFor(() =>
    expect(operationMocks.allocate).toHaveBeenCalledWith({
      id: 'case-1',
      concurrencyStamp: 'case-stamp',
      numberSeriesId: 'series-1',
      rollNumber: 11,
      rollAssignmentMode: 'manual',
      manualValue: undefined,
      overrideReason: undefined,
    })
  );
});

it('uses a read-only automatic proposal and sends the accepted owner number', async () => {
  operationMocks.previewData = {
    ...operationMocks.previewData,
    schoolAssignmentMode: 'automatic',
    rollAssignmentMode: 'automatic',
    proposedRollNumber: 28,
  };
  operationMocks.allocate.mockReturnValue({ unwrap: () => Promise.resolve({}) });
  render(
    <StudentOnboardingOperationDialog
      assignmentType="roll-number"
      student={{ ...student, rollAssignmentMode: 'automatic' }}
      onClose={vi.fn()}
    />
  );
  expect(screen.queryByRole('textbox', { name: 'Roll number' })).not.toBeInTheDocument();
  expect(screen.queryByRole('textbox', { name: 'Proposed roll number' })).not.toBeInTheDocument();
  expect(screen.getByRole('button', { name: 'Preview roll number' })).toBeDisabled();
  fireEvent.change(screen.getByLabelText('Identifier series'), { target: { value: 'series-1' } });
  expect(screen.getByRole('button', { name: 'Preview roll number' })).toBeEnabled();
  fireEvent.click(screen.getByRole('button', { name: 'Preview roll number' }));
  await waitFor(() =>
    expect(screen.getByRole('button', { name: 'Prepare identifiers' })).toBeEnabled()
  );
  expect(screen.getByText('28')).toBeInTheDocument();
  expect(operationMocks.preview).toHaveBeenCalledWith({
    id: 'case-1',
    rollAssignmentMode: 'automatic',
    rollNumber: undefined,
    reason: undefined,
  });
  fireEvent.click(screen.getByRole('button', { name: 'Prepare identifiers' }));
  await waitFor(() =>
    expect(operationMocks.allocate).toHaveBeenCalledWith(
      expect.objectContaining({
        rollNumber: 28,
        rollAssignmentMode: 'automatic',
        concurrencyStamp: 'case-stamp',
      })
    )
  );
});

it('requires an explicit numbering choice when the school allows both', async () => {
  operationMocks.previewData = {
    ...operationMocks.previewData,
    schoolAssignmentMode: 'both',
    rollAssignmentMode: 'automatic',
  };
  render(
    <StudentOnboardingOperationDialog
      assignmentType="gr-number"
      student={{ ...student, rollAssignmentMode: 'both' }}
      onClose={vi.fn()}
    />
  );
  expect(screen.getByRole('radiogroup', { name: 'Roll number assignment' })).toHaveAttribute(
    'aria-required',
    'true'
  );
  expect(screen.getByRole('radio', { name: /Automatic/ })).not.toBeChecked();
  expect(screen.getByRole('button', { name: 'Preview roll number' })).toBeDisabled();
  fireEvent.click(screen.getByRole('radio', { name: /Automatic/ }));
  expect(screen.getByRole('radio', { name: /Automatic/ })).toBeChecked();
  expect(screen.getByRole('button', { name: 'Preview roll number' })).toBeDisabled();
  fireEvent.change(screen.getByLabelText('Identifier series'), {
    target: { value: 'series-1' },
  });
  fireEvent.click(screen.getByRole('button', { name: 'Preview roll number' }));
  await waitFor(() => expect(operationMocks.preview).toHaveBeenCalledOnce());
  expect(operationMocks.preview.mock.calls[0][0].rollAssignmentMode).toBe('automatic');
});

it('requires an audit reason before previewing a replacement roll number', async () => {
  render(
    <StudentOnboardingOperationDialog
      assignmentType="roll-number"
      student={{ ...student, rollNo: 7 }}
      onClose={vi.fn()}
    />
  );

  expect(screen.queryByText('Replacing an existing assignment')).not.toBeInTheDocument();
  fireEvent.change(screen.getByLabelText('Identifier series'), {
    target: { value: 'series-1' },
  });
  fireEvent.change(screen.getByLabelText('Roll number'), {
    target: { value: '11' },
  });
  expect(screen.getByText('Replacing an existing assignment')).toBeVisible();
  expect(screen.getByText('Current roll: 7')).toBeVisible();
  expect(
    screen.queryByRole('textbox', { name: 'Manual identifier override' })
  ).not.toBeInTheDocument();
  expect(screen.getByRole('button', { name: 'Preview roll number' })).toBeDisabled();
  fireEvent.change(screen.getByRole('textbox', { name: /Override reason/ }), {
    target: { value: 'Correcting the prior assignment' },
  });
  expect(screen.getByRole('button', { name: 'Preview roll number' })).toBeEnabled();
  fireEvent.click(screen.getByRole('button', { name: 'Preview roll number' }));
  await waitFor(() =>
    expect(operationMocks.preview).toHaveBeenCalledWith({
      id: 'case-1',
      rollAssignmentMode: 'manual',
      rollNumber: 11,
      reason: 'Correcting the prior assignment',
    })
  );
  expect(await screen.findByText('Roll number preview ready')).toBeVisible();
});

it('keeps an identifier override in the final preview and requires a reason', async () => {
  render(
    <StudentOnboardingOperationDialog
      assignmentType="gr-number"
      student={student}
      onClose={vi.fn()}
    />
  );

  fireEvent.change(screen.getByLabelText('Identifier series'), {
    target: { value: 'series-1' },
  });
  fireEvent.change(screen.getByLabelText('Roll number'), {
    target: { value: '11' },
  });
  expect(
    screen.queryByRole('textbox', { name: 'Manual identifier override' })
  ).not.toBeInTheDocument();
  fireEvent.click(screen.getByRole('button', { name: 'Add manual identifier override' }));
  fireEvent.change(screen.getByRole('textbox', { name: 'Manual identifier override' }), {
    target: { value: 'GR-CUSTOM-11' },
  });
  expect(screen.getByRole('button', { name: 'Preview roll number' })).toBeDisabled();
  fireEvent.change(screen.getByRole('textbox', { name: /Override reason/ }), {
    target: { value: 'Correcting the series value' },
  });
  fireEvent.click(screen.getByRole('button', { name: 'Preview roll number' }));
  expect(await screen.findByText('Roll number preview ready')).toBeVisible();
  expect(screen.getByText('GR-CUSTOM-11')).toBeInTheDocument();

  fireEvent.change(screen.getByRole('textbox', { name: 'Manual identifier override' }), {
    target: { value: 'GR-CUSTOM-12' },
  });
  expect(screen.getByText(/Preview the roll number again before preparing/)).toBeVisible();
  expect(screen.getByRole('button', { name: 'Prepare identifiers' })).toBeDisabled();
});

it('does not silently rebase the preview onto a newer case stamp', async () => {
  operationMocks.previewData = { ...operationMocks.previewData, concurrencyStamp: 'newer-stamp' };
  render(
    <StudentOnboardingOperationDialog
      assignmentType="gr-number"
      student={student}
      onClose={vi.fn()}
    />
  );
  fireEvent.change(screen.getByLabelText('Identifier series'), { target: { value: 'series-1' } });
  fireEvent.change(screen.getByLabelText('Roll number'), { target: { value: '11' } });
  fireEvent.click(screen.getByRole('button', { name: 'Preview roll number' }));
  expect(await screen.findByText(/Close this dialog, refresh the case/)).toBeVisible();
  expect(screen.getByRole('button', { name: 'Prepare identifiers' })).toBeDisabled();
  expect(screen.getByLabelText('Roll number')).toHaveValue('11');
});

it('requires the exact registered owner grant instead of the navigation parent', () => {
  operationMocks.permissions = [{ name: 'Students.Onboarding', isGranted: true }];
  render(
    <StudentOnboardingOperationDialog
      assignmentType="gr-number"
      student={student}
      onClose={vi.fn()}
    />
  );
  expect(screen.getByRole('button', { name: 'Preview roll number' })).toBeDisabled();
  expect(screen.getByRole('button', { name: 'Prepare identifiers' })).toBeDisabled();
  expect(operationMocks.preview).not.toHaveBeenCalled();
});

it('keeps identifier preparation blocked until the case has a reserved division', () => {
  render(
    <StudentOnboardingOperationDialog
      assignmentType="gr-number"
      student={{ ...student, divisionId: null, rollAssignmentMode: 'automatic' }}
      onClose={vi.fn()}
    />
  );
  expect(
    screen.getByText('Reserve a division before previewing and preparing identifiers.')
  ).toBeVisible();
  expect(screen.getByRole('button', { name: 'Preview roll number' })).toBeDisabled();
  expect(screen.getByRole('button', { name: 'Prepare identifiers' })).toBeDisabled();
  expect(operationMocks.preview).not.toHaveBeenCalled();
});

it('discards a changed automatic proposal while keeping the entered series', async () => {
  operationMocks.previewData = {
    ...operationMocks.previewData,
    schoolAssignmentMode: 'automatic',
    rollAssignmentMode: 'automatic',
  };
  operationMocks.allocate.mockReturnValue({
    unwrap: () =>
      Promise.reject(
        Object.assign(new Error('Changed proposal'), {
          data: { error: { code: 'Students:Records:RollProposalChanged' } },
        })
      ),
  });
  render(
    <StudentOnboardingOperationDialog
      assignmentType="gr-number"
      student={{ ...student, rollAssignmentMode: 'automatic' }}
      onClose={vi.fn()}
    />
  );
  fireEvent.change(screen.getByLabelText('Identifier series'), { target: { value: 'series-1' } });
  fireEvent.click(screen.getByRole('button', { name: 'Preview roll number' }));
  await waitFor(() =>
    expect(screen.getByRole('button', { name: 'Prepare identifiers' })).toBeEnabled()
  );
  fireEvent.click(screen.getByRole('button', { name: 'Prepare identifiers' }));
  expect(await screen.findByText(/proposed roll number changed/)).toBeVisible();
  expect(screen.getByRole('button', { name: 'Prepare identifiers' })).toBeDisabled();
  expect(screen.getByLabelText('Identifier series')).toHaveValue('series-1');
});
