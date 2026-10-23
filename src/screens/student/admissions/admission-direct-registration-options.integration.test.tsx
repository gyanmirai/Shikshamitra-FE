import type { AdmissionCycle } from 'src/redux/student/admissions/admission-cycles-api';
import type {
  AdmissionOfferingListItem,
  AdmissionOfferingListInput,
} from 'src/redux/student/admissions/admission-offerings-api';

import { vi, it, expect, beforeEach } from 'vitest';
import { render, screen, waitFor, fireEvent } from '@testing-library/react';

import AdmissionDirectRegistrationDialog from './admission-direct-registration-dialog';

// Keep the real PaginatedSearchSelect/usePaginatedSearch: a fake "More" button
// hides the empty-page failure because the real list cannot scroll with no rows.
const mocks = vi.hoisted(() => ({
  loadCycles: vi.fn(),
  loadOfferings: vi.fn(),
  offeringError: false,
}));
vi.mock('next/navigation', () => ({ useRouter: () => ({ push: vi.fn() }) }));
vi.mock('./use-admission-unsaved-changes', () => ({ useAdmissionUnsavedChanges: vi.fn() }));
vi.mock('src/components/iconify', () => ({ Iconify: () => <span /> }));
vi.mock('src/components/toast', () => ({
  shikshaMitraToast: {
    error: vi.fn(),
    warning: vi.fn(),
    info: vi.fn(),
    dismiss: vi.fn(),
    success: vi.fn(),
  },
}));
vi.mock('@mui/x-date-pickers', () => ({ DatePicker: () => <div>Date picker</div> }));
vi.mock('src/components/custom-select', () => ({
  default: ({ label, value, options, onChange, disabled }: any) => (
    <select
      aria-label={label}
      value={value}
      disabled={disabled}
      onChange={(event) => onChange(event.target.value)}
    >
      <option value="">Select</option>
      {options.map((option: any) => (
        <option key={option.value} value={option.value}>
          {option.label}
        </option>
      ))}
    </select>
  ),
}));
vi.mock('src/redux/student/admissions/admission-cycles-api', () => ({
  useLazyGetAdmissionCyclesQuery: () => [mocks.loadCycles, { isError: false }],
}));
vi.mock('src/redux/student/admissions/admission-offerings-api', () => ({
  useLazyGetAdmissionOfferingsQuery: () => [mocks.loadOfferings, { isError: mocks.offeringError }],
  useGetAdmissionClassCapacityQuery: () => ({}),
}));
vi.mock('src/redux/student/admissions/admission-applications-api', () => ({
  useLazyFindAdmissionDirectFamiliesQuery: () => [vi.fn(), { isFetching: false }],
  useStartAdmissionDirectRegistrationMutation: () => [vi.fn(), { isLoading: false }],
  useGetAdmissionApplicationCounsellorsQuery: () => ({ currentData: [] }),
}));

const cycle = {
  id: 'cycle-1',
  name: 'QA admission period',
  academicYearId: 'year-1',
  status: 1,
  windowStatus: 1,
} as AdmissionCycle;
const eligible = {
  id: 'eligible-26',
  name: 'Class 26 Management',
  admissionCycleId: cycle.id,
  track: 2,
  entryMode: 2,
  isActive: true,
  availabilityStatus: 2,
  boardName: 'CBSE',
  mediumName: 'English',
  standardName: 'Class 26',
} as AdmissionOfferingListItem;

beforeEach(() => {
  vi.clearAllMocks();
  mocks.offeringError = false;
  mocks.loadCycles.mockReturnValue({ unwrap: async () => ({ totalCount: 1, items: [cycle] }) });
});

const openCycle = async () => {
  fireEvent.click(screen.getByRole('combobox', { name: /Admission cycle/ }));
  fireEvent.click(await screen.findByRole('option', { name: cycle.name }));
};

it('shows a server match by class even when the offering name does not contain that search', async () => {
  const rte = {
    ...eligible,
    name: 'RTE Admission 2026',
    standardName: 'Class 1',
    track: 1,
    entryMode: 1,
  };
  mocks.loadOfferings.mockReturnValue({ unwrap: async () => ({ totalCount: 1, items: [rte] }) });
  render(<AdmissionDirectRegistrationDialog open academicYearId="year-1" onClose={vi.fn()} />);
  await openCycle();
  const offeringInput = screen.getByRole('combobox', { name: /Admission offering/ });
  fireEvent.click(offeringInput);
  fireEvent.change(offeringInput, { target: { value: 'Class 1' } });
  await waitFor(() =>
    expect(mocks.loadOfferings).toHaveBeenCalledWith(expect.objectContaining({ search: 'Class 1' }))
  );
  expect(await screen.findByRole('option', { name: /RTE Admission 2026/ })).toBeVisible();
});

it('explains the cycle prerequisite and does not request offerings before a cycle is selected', async () => {
  render(<AdmissionDirectRegistrationDialog open academicYearId="year-1" onClose={vi.fn()} />);
  expect(screen.getByRole('combobox', { name: /Admission offering/ })).toBeDisabled();
  expect(screen.getByText('Select an admission cycle first to load offerings.')).toBeVisible();
  expect(mocks.loadOfferings).not.toHaveBeenCalled();
  expect(screen.getByRole('button', { name: 'Start registration' })).toBeDisabled();
});

it('clears a touched Offering error immediately after choosing a valid result', async () => {
  const rte = { ...eligible, name: 'Class 1 RTE', track: 1, entryMode: 1 };
  mocks.loadOfferings.mockReturnValue({ unwrap: async () => ({ totalCount: 1, items: [rte] }) });
  render(<AdmissionDirectRegistrationDialog open academicYearId="year-1" onClose={vi.fn()} />);
  await openCycle();
  const offeringInput = screen.getByRole('combobox', { name: /Admission offering/ });
  fireEvent.blur(offeringInput);
  await waitFor(() => expect(offeringInput).toHaveAttribute('aria-invalid', 'true'));
  fireEvent.click(offeringInput);
  fireEvent.click(await screen.findByRole('option', { name: /Class 1 RTE/ }));
  await waitFor(() => expect(offeringInput).toHaveAttribute('aria-invalid', 'false'));
  expect(offeringInput).toHaveValue(rte.name);
});

it('refreshes a previously empty RTE lookup after activation without losing entered details', async () => {
  const rte = { ...eligible, name: 'Class 1 RTE', track: 1, entryMode: 1 };
  mocks.loadOfferings.mockReturnValue({ unwrap: async () => ({ totalCount: 0, items: [] }) });
  render(<AdmissionDirectRegistrationDialog open academicYearId="year-1" onClose={vi.fn()} />);
  await openCycle();
  fireEvent.change(screen.getAllByRole('textbox', { name: /First name/ })[0], {
    target: { value: 'QA child' },
  });
  fireEvent.click(screen.getByRole('combobox', { name: /Admission offering/ }));
  expect(await screen.findByText(/No matching active, open RTE offering/)).toBeVisible();
  fireEvent.keyDown(screen.getByRole('combobox', { name: /Admission offering/ }), {
    key: 'Escape',
  });
  mocks.loadOfferings.mockReturnValue({ unwrap: async () => ({ totalCount: 1, items: [rte] }) });
  fireEvent.click(screen.getByRole('button', { name: 'Refresh Choices' }));
  fireEvent.click(screen.getByRole('combobox', { name: /Admission offering/ }));
  fireEvent.click(await screen.findByRole('option', { name: /Class 1 RTE/ }));
  expect(screen.getAllByRole('textbox', { name: /First name/ })[0]).toHaveValue('QA child');
  expect(screen.getByRole('combobox', { name: /Admission cycle/ })).toHaveValue(cycle.name);
  expect(screen.getByRole('button', { name: 'Start registration' })).toBeEnabled();
});

it('shows loading and a recoverable lookup error, then reloads real options on Retry', async () => {
  let rejectLookup!: (error: Error) => void;
  const failedRequest = new Promise((_, reject) => {
    rejectLookup = reject;
  });
  mocks.loadOfferings.mockReturnValue({
    unwrap: () => failedRequest,
  });
  const view = render(
    <AdmissionDirectRegistrationDialog open academicYearId="year-1" onClose={vi.fn()} />
  );
  await openCycle();
  expect(await screen.findByRole('progressbar', { name: 'Loading options' })).toBeVisible();
  expect(screen.getByRole('button', { name: 'Start registration' })).toBeDisabled();
  rejectLookup(new Error('Lookup unavailable'));
  mocks.offeringError = true;
  view.rerender(
    <AdmissionDirectRegistrationDialog open academicYearId="year-1" onClose={vi.fn()} />
  );
  expect(await screen.findByText(/Admission choices could not be loaded/)).toBeVisible();
  await waitFor(() =>
    expect(screen.queryByRole('progressbar', { name: 'Loading options' })).not.toBeInTheDocument()
  );
  mocks.offeringError = false;
  mocks.loadOfferings.mockReturnValue({
    unwrap: async () => ({ totalCount: 1, items: [{ ...eligible, track: 1, entryMode: 1 }] }),
  });
  fireEvent.click(screen.getByRole('button', { name: 'Retry' }));
  fireEvent.click(screen.getByRole('combobox', { name: /Admission offering/ }));
  expect(await screen.findByRole('option', { name: /Class 26 Management/ })).toBeVisible();
});

it('shows eligible Management rows using filtering before pagination with the real dropdown', async () => {
  mocks.loadOfferings.mockImplementation(
    (input: AdmissionOfferingListInput & { forSpecialRegistration?: boolean }) => ({
      unwrap: async () =>
        input.forSpecialRegistration
          ? { totalCount: 1, items: [eligible] }
          : {
              totalCount: 26,
              items: input.skipCount
                ? [eligible]
                : [
                    {
                      ...eligible,
                      id: 'inquiry-1',
                      name: 'Inquiry-first Management',
                      entryMode: 0,
                    },
                  ],
            },
    })
  );
  render(<AdmissionDirectRegistrationDialog open academicYearId="year-1" onClose={vi.fn()} />);
  fireEvent.click(screen.getByRole('combobox', { name: /Admission cycle/ }));
  fireEvent.click(await screen.findByRole('option', { name: cycle.name }));
  fireEvent.change(screen.getByLabelText('Admission type'), { target: { value: '2' } });
  fireEvent.click(screen.getByRole('combobox', { name: /Admission offering/ }));
  expect(await screen.findByRole('option', { name: /Class 26 Management/ })).toBeVisible();
  expect(
    screen.queryByRole('option', { name: 'Inquiry-first Management' })
  ).not.toBeInTheDocument();
  expect(mocks.loadOfferings).toHaveBeenCalledWith(
    expect.objectContaining({
      admissionCycleId: cycle.id,
      track: 2,
      forSpecialRegistration: true,
      skipCount: 0,
      maxResultCount: 25,
    })
  );
});
