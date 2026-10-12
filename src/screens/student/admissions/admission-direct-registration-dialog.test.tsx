import type { AdmissionCycle } from 'src/redux/student/admissions/admission-cycles-api';
import type { AdmissionOfferingListItem } from 'src/redux/student/admissions/admission-offerings-api';

import { vi, it, expect, describe, beforeEach } from 'vitest';
import { useRef, useState, useEffect, useCallback } from 'react';
import { render, screen, waitFor, fireEvent } from '@testing-library/react';

import AdmissionDirectRegistrationDialog from './admission-direct-registration-dialog';

const state = vi.hoisted(() => ({
  loadCycles: vi.fn(),
  loadOfferings: vi.fn(),
  findFamilies: vi.fn(),
  start: vi.fn(),
  push: vi.fn(),
  success: vi.fn(),
  close: vi.fn(),
  cyclesError: false,
  offeringsError: false,
}));
vi.mock('next/navigation', () => ({ useRouter: () => ({ push: state.push }) }));
vi.mock('./use-admission-unsaved-changes', () => ({ useAdmissionUnsavedChanges: vi.fn() }));
vi.mock('src/components/iconify', () => ({ Iconify: () => <span /> }));
vi.mock('src/components/toast', () => ({ shikshaMitraToast: { success: state.success } }));
vi.mock('./admission-dialog-title', () => ({
  AdmissionDialogTitle: ({ title }: { title: string }) => title,
}));
vi.mock('src/redux/student/admissions/admission-cycles-api', () => ({
  useLazyGetAdmissionCyclesQuery: () => [state.loadCycles, { isError: state.cyclesError }],
}));
vi.mock('src/redux/student/admissions/admission-offerings-api', () => ({
  useLazyGetAdmissionOfferingsQuery: () => [state.loadOfferings, { isError: state.offeringsError }],
  useGetAdmissionClassCapacityQuery: () => ({}),
}));
vi.mock('src/redux/student/admissions/admission-applications-api', () => ({
  useLazyFindAdmissionDirectFamiliesQuery: () => [state.findFamilies, { isFetching: false }],
  useStartAdmissionDirectRegistrationMutation: () => [state.start, { isLoading: false }],
  useGetAdmissionApplicationCounsellorsQuery: () => ({ currentData: [] }),
}));
vi.mock('@mui/x-date-pickers', () => ({
  DatePicker: ({
    onChange,
  }: {
    onChange: (value: { isValid: () => boolean; format: () => string }) => void;
  }) => (
    <input
      aria-label="Date of birth"
      onChange={(event) => onChange({ isValid: () => true, format: () => event.target.value })}
    />
  ),
}));
vi.mock('src/components/custom-select', () => ({
  default: ({
    label,
    value,
    options,
    onChange,
    disabled,
  }: {
    label: string;
    value: string | number;
    options: { value: string | number; label: string }[];
    onChange: (value: string) => void;
    disabled?: boolean;
  }) => (
    <select
      aria-label={label}
      value={value}
      disabled={disabled}
      onChange={(event) => onChange(event.target.value)}
    >
      <option value="">Select</option>
      {options.map((option) => (
        <option key={option.value} value={option.value}>
          {option.label}
        </option>
      ))}
    </select>
  ),
}));
type Option = { id: string; name: string };
vi.mock('src/components/paginated-search-select', () => ({
  PaginatedSearchSelect: ({
    label,
    value,
    fetchOptions,
    onChange,
    disabled,
    noOptionsText,
  }: {
    label: string;
    value: Option | null;
    disabled?: boolean;
    noOptionsText?: string;
    fetchOptions: (query: string, page: number) => Promise<{ data: Option[]; hasMore: boolean }>;
    onChange: (event: unknown, option: Option | null) => void;
  }) => {
    const [options, setOptions] = useState<Option[]>([]);
    const [more, setMore] = useState(false);
    const initialFetch = useRef(fetchOptions);
    const load = useCallback(async (page: number) => {
      try {
        const result = await initialFetch.current('', page);
        setOptions((old) => (page === 1 ? result.data : [...old, ...result.data]));
        setMore(result.hasMore);
      } catch {
        setOptions([]);
      }
    }, []);
    useEffect(() => {
      load(1);
    }, [load]);
    return (
      <>
        <select
          aria-label={label}
          value={value?.id ?? ''}
          disabled={disabled}
          onChange={(event) =>
            onChange(null, options.find((option) => option.id === event.target.value) ?? null)
          }
        >
          <option value="">Select</option>
          {options.map((option) => (
            <option key={option.id} value={option.id}>
              {option.name}
            </option>
          ))}
        </select>
        {!options.length && <span>{noOptionsText}</span>}
        {more && (
          <button type="button" onClick={() => load(2)}>
            More {label}
          </button>
        )}
      </>
    );
  },
}));

const cycle = {
  id: 'cycle-1',
  name: 'Admissions 2026',
  academicYearId: 'year-1',
  status: 1,
  windowStatus: 1,
} as AdmissionCycle;
const offering = {
  id: 'rte-1',
  name: 'Class 1 RTE',
  admissionCycleId: cycle.id,
  track: 1,
  entryMode: 1,
  isActive: true,
  availabilityStatus: 2,
  boardName: 'CBSE',
  mediumName: 'English',
  standardName: 'Class 1',
} as AdmissionOfferingListItem;
const renderDrawer = () =>
  render(<AdmissionDirectRegistrationDialog open academicYearId="year-1" onClose={state.close} />);
const selectOffering = async () => {
  await screen.findByRole('option', { name: cycle.name });
  fireEvent.change(screen.getByLabelText('Admission cycle'), { target: { value: cycle.id } });
  await screen.findByRole('option', { name: offering.name });
  fireEvent.change(screen.getByLabelText('Admission offering'), { target: { value: offering.id } });
};
const fillApplicant = () => {
  const firstNames = screen.getAllByLabelText(/First name/);
  fireEvent.change(firstNames[0], { target: { value: 'Riya' } });
  fireEvent.change(firstNames[1], { target: { value: 'Aarti' } });
  fireEvent.change(screen.getByLabelText('Date of birth'), { target: { value: '2018-01-01' } });
  fireEvent.change(screen.getByLabelText('Gender'), { target: { value: 'Female' } });
  fireEvent.change(screen.getByLabelText(/Mobile/), { target: { value: '9876543210' } });
};
beforeEach(() => {
  vi.clearAllMocks();
  state.cyclesError = false;
  state.offeringsError = false;
  state.loadCycles.mockImplementation(() => ({
    unwrap: async () => ({ totalCount: 1, items: [cycle] }),
  }));
  state.loadOfferings.mockImplementation(() => ({
    unwrap: async () => ({ totalCount: 1, items: [offering] }),
  }));
  state.findFamilies.mockImplementation(() => ({ unwrap: async () => [] }));
  state.start.mockImplementation(() => ({ unwrap: async () => ({ id: 'application-1' }) }));
});

describe('Special direct-registration entry', () => {
  it.each([2, 3])(
    'selects a registration-first offering for special admission type %s',
    async (track) => {
      const specialOffering = {
        ...offering,
        id: `special-${track}`,
        name: `Special offering ${track}`,
        track,
      };
      state.loadOfferings.mockImplementation(() => ({
        unwrap: async () => ({ totalCount: 1, items: [specialOffering] }),
      }));
      renderDrawer();
      await screen.findByRole('option', { name: cycle.name });
      fireEvent.change(screen.getByLabelText('Admission cycle'), { target: { value: cycle.id } });
      fireEvent.change(screen.getByLabelText('Admission type'), {
        target: { value: String(track) },
      });
      await screen.findByRole('option', { name: specialOffering.name });
      fireEvent.change(screen.getByLabelText('Admission offering'), {
        target: { value: specialOffering.id },
      });
      expect(screen.getByRole('button', { name: 'Start registration' })).toBeEnabled();
      expect(state.loadOfferings).toHaveBeenLastCalledWith(
        expect.objectContaining({ track, entryMode: undefined })
      );
    }
  );
  it('loads only current-year published/open cycles and selected special-track active/direct/open offerings', async () => {
    state.loadCycles.mockImplementation(() => ({
      unwrap: async () => ({
        totalCount: 2,
        items: [cycle, { ...cycle, id: 'other-year', name: 'Old year', academicYearId: 'year-0' }],
      }),
    }));
    state.loadOfferings.mockImplementation(() => ({
      unwrap: async () => ({
        totalCount: 5,
        items: [
          offering,
          { ...offering, id: 'general', name: 'General', track: 0 },
          { ...offering, id: 'inquiry', name: 'Inquiry', entryMode: 0 },
          { ...offering, id: 'inactive', name: 'Inactive', isActive: false },
          { ...offering, id: 'closed', name: 'Closed', availabilityStatus: 4 },
        ],
      }),
    }));
    renderDrawer();
    await selectOffering();
    expect(state.loadCycles).toHaveBeenCalledWith(
      expect.objectContaining({
        academicYearId: 'year-1',
        status: 1,
        windowStatus: 1,
        maxResultCount: 25,
      })
    );
    expect(state.loadOfferings).toHaveBeenCalledWith(
      expect.objectContaining({
        admissionCycleId: cycle.id,
        track: 1,
        entryMode: 1,
        isActive: true,
        availabilityStatus: 2,
        maxResultCount: 25,
      })
    );
    ['General', 'Inquiry', 'Inactive', 'Closed', 'Old year'].forEach((name) =>
      expect(screen.queryByRole('option', { name })).not.toBeInTheDocument()
    );
    expect(screen.getByRole('dialog', { name: 'Start Special Registration' })).toBeInTheDocument();
  });
  it('pages available offerings and resets the selected offering/family context when admission type changes', async () => {
    state.loadOfferings.mockImplementation((input) => ({
      unwrap: async () => ({
        totalCount: 26,
        items: input.skipCount ? [{ ...offering, id: 'rte-26', name: 'Class 26 RTE' }] : [offering],
      }),
    }));
    renderDrawer();
    await selectOffering();
    fireEvent.click(screen.getByRole('button', { name: 'More Admission offering' }));
    await screen.findByRole('option', { name: 'Class 26 RTE' });
    expect(state.loadOfferings).toHaveBeenCalledWith(
      expect.objectContaining({ skipCount: 25, maxResultCount: 25 })
    );
    fireEvent.change(screen.getByLabelText('Admission type'), { target: { value: '2' } });
    await waitFor(() =>
      expect(state.loadOfferings).toHaveBeenLastCalledWith(expect.objectContaining({ track: 2 }))
    );
    expect(screen.getByLabelText('Admission offering')).toHaveValue('');
    expect(screen.getByRole('button', { name: 'Start registration' })).toBeDisabled();
  });
  it.each([2, 3])(
    'includes legacy Both offerings for type %s and preserves paging when the first page is inquiry-first only',
    async (track) => {
      const inquiryOffering = {
        ...offering,
        id: 'inquiry-first',
        name: 'Inquiry-first special offering',
        track,
        entryMode: 0,
      };
      const legacyOffering = {
        ...offering,
        id: 'legacy-both',
        name: 'Legacy registration offering',
        track,
        entryMode: 2,
      };
      state.loadOfferings.mockImplementation((input) => ({
        unwrap: async () => ({
          totalCount: 26,
          items: input.skipCount ? [legacyOffering] : [inquiryOffering],
        }),
      }));
      renderDrawer();
      await screen.findByRole('option', { name: cycle.name });
      fireEvent.change(screen.getByLabelText('Admission cycle'), { target: { value: cycle.id } });
      fireEvent.change(screen.getByLabelText('Admission type'), {
        target: { value: String(track) },
      });
      await waitFor(() =>
        expect(state.loadOfferings).toHaveBeenLastCalledWith(
          expect.objectContaining({ track, entryMode: undefined })
        )
      );
      expect(screen.queryByRole('option', { name: inquiryOffering.name })).not.toBeInTheDocument();
      fireEvent.click(await screen.findByRole('button', { name: 'More Admission offering' }));
      await screen.findByRole('option', { name: legacyOffering.name });
      fireEvent.change(screen.getByLabelText('Admission offering'), {
        target: { value: legacyOffering.id },
      });
      expect(screen.getByRole('button', { name: 'Start registration' })).toBeEnabled();
      expect(state.loadOfferings).toHaveBeenLastCalledWith(
        expect.objectContaining({ track, skipCount: 25 })
      );
    }
  );
  it('blocks invalid identity and unchecked family submissions; succeeds only after API returns an application', async () => {
    renderDrawer();
    await selectOffering();
    fireEvent.click(screen.getByRole('button', { name: 'Start registration' }));
    await screen.findByText('Applicant first name is required.');
    expect(state.start).not.toHaveBeenCalled();
    fillApplicant();
    fireEvent.click(screen.getByRole('button', { name: 'Start registration' }));
    await screen.findByText(/Check existing families using this guardian mobile/);
    expect(state.start).not.toHaveBeenCalled();
    fireEvent.click(screen.getByRole('button', { name: 'Check existing families' }));
    await screen.findByText(/No family is available to link/);
    fireEvent.click(screen.getByRole('button', { name: 'Start registration' }));
    await waitFor(() => expect(state.close).toHaveBeenCalledOnce());
    expect(state.start).toHaveBeenCalledWith(
      expect.objectContaining({
        admissionOfferingId: offering.id,
        requestId: expect.any(String),
        applicantFirstName: 'Riya',
        guardianFirstName: 'Aarti',
        guardianMobile: '9876543210',
        existingFamilyId: null,
        createSeparateFamily: false,
      })
    );
    expect(state.success).toHaveBeenCalledOnce();
    expect(state.push).toHaveBeenCalledWith('/student/admissions/applications/application-1');
  });
  it('preserves data and RequestId on failed submit; never reports success for a missing application id', async () => {
    state.start.mockImplementation(() => ({ unwrap: async () => ({}) }));
    renderDrawer();
    await selectOffering();
    fillApplicant();
    fireEvent.click(screen.getByRole('button', { name: 'Check existing families' }));
    await screen.findByText(/No family is available to link/);
    fireEvent.click(screen.getByRole('button', { name: 'Start registration' }));
    await screen.findByText(/Registration response did not include/);
    expect(state.success).not.toHaveBeenCalled();
    expect(state.close).not.toHaveBeenCalled();
    expect(screen.getAllByLabelText(/First name/)[0]).toHaveValue('Riya');
    const firstRequestId = state.start.mock.calls[0][0].requestId;
    fireEvent.click(screen.getByRole('button', { name: 'Start registration' }));
    await waitFor(() => expect(state.start).toHaveBeenCalledTimes(2));
    expect(state.start.mock.calls[1][0].requestId).toBe(firstRequestId);
  });
  it('requires an explicit family link or separate-family reason when a matching family exists', async () => {
    state.findFamilies.mockImplementation(() => ({
      unwrap: async () => [
        {
          familyId: 'family-1',
          familyNumber: 'FAM-1',
          primaryGuardianName: 'Aarti',
          applicants: [],
        },
      ],
    }));
    renderDrawer();
    await selectOffering();
    fillApplicant();
    fireEvent.click(screen.getByRole('button', { name: 'Check existing families' }));
    await screen.findByText(/Existing family found/);
    fireEvent.click(screen.getByRole('button', { name: 'Start registration' }));
    await screen.findByText(/Link an existing family or choose/);
    expect(state.start).not.toHaveBeenCalled();
    fireEvent.click(screen.getByRole('button', { name: 'Create a separate family' }));
    fireEvent.click(screen.getByRole('button', { name: 'Start registration' }));
    await screen.findByText('Reason for separate family is required.');
    expect(state.start).not.toHaveBeenCalled();
    fireEvent.click(screen.getByRole('button', { name: /Link FAM-1/ }));
    fireEvent.click(screen.getByRole('button', { name: 'Start registration' }));
    await waitFor(() =>
      expect(state.start).toHaveBeenCalledWith(
        expect.objectContaining({ existingFamilyId: 'family-1', createSeparateFamily: false })
      )
    );
  });
  it('invalidates the family lookup when guardian mobile changes', async () => {
    renderDrawer();
    await selectOffering();
    fillApplicant();
    fireEvent.click(screen.getByRole('button', { name: 'Check existing families' }));
    await screen.findByText(/No family is available to link/);
    fireEvent.change(screen.getByLabelText(/Mobile/), { target: { value: '9876543211' } });
    fireEvent.click(screen.getByRole('button', { name: 'Start registration' }));
    await screen.findByText(/Check existing families using this guardian mobile/);
    expect(state.start).not.toHaveBeenCalled();
  });
  it('locks all conflicting interactions during submit and restores the form after a server rejection', async () => {
    let reject!: (error: unknown) => void;
    state.start.mockImplementation(() => ({
      unwrap: () =>
        new Promise((_resolve, rejectRequest) => {
          reject = rejectRequest;
        }),
    }));
    renderDrawer();
    await selectOffering();
    fillApplicant();
    fireEvent.click(screen.getByRole('button', { name: 'Check existing families' }));
    await screen.findByText(/No family is available to link/);
    fireEvent.click(screen.getByRole('button', { name: 'Start registration' }));
    await waitFor(() => expect(state.start).toHaveBeenCalledOnce());
    expect(screen.getByRole('button', { name: 'Close direct registration' })).toBeDisabled();
    expect(screen.getByRole('button', { name: 'Cancel' })).toBeDisabled();
    expect(screen.getByLabelText('Admission type')).toBeDisabled();
    reject({ data: { detail: 'This offering is no longer open.' } });
    await screen.findByText('This offering is no longer open.');
    expect(screen.getByRole('button', { name: 'Cancel' })).toBeEnabled();
    expect(state.success).not.toHaveBeenCalled();
    expect(state.close).not.toHaveBeenCalled();
  });
  it('shows a recoverable API error rather than treating the request as an empty successful result', async () => {
    state.cyclesError = true;
    state.loadCycles.mockImplementation(() => ({
      unwrap: async () => {
        throw new Error('Unavailable');
      },
    }));
    renderDrawer();
    expect(screen.getByText(/Admission choices could not be loaded/)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Start registration' })).toBeDisabled();
    await waitFor(() => expect(state.loadCycles).toHaveBeenCalledOnce());
    state.cyclesError = false;
    state.loadCycles.mockImplementation(() => ({
      unwrap: async () => ({ totalCount: 1, items: [cycle] }),
    }));
    fireEvent.click(screen.getByRole('button', { name: 'Retry' }));
    await screen.findByRole('option', { name: cycle.name });
  });
  it('protects unsaved applicant data when cancelling', async () => {
    renderDrawer();
    await selectOffering();
    fireEvent.click(screen.getByRole('button', { name: 'Cancel' }));
    expect(screen.getByText('Discard Unsaved Registration?')).toBeInTheDocument();
    expect(state.close).not.toHaveBeenCalled();
    fireEvent.click(screen.getByRole('button', { name: 'Discard changes' }));
    expect(state.close).toHaveBeenCalledOnce();
  });
});
