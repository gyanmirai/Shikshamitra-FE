import type { ReactNode } from 'react';

import { vi, it, expect, describe, beforeEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';

import AdmissionOfferingsScreen from './admission-offerings';

const openBulk = vi.fn();
const useAdmissionOfferingsScreen = vi.fn();

vi.mock('src/components/iconify', () => ({ Iconify: () => <span aria-hidden="true" /> }));

vi.mock('./use-admission-offerings-screen', () => ({
  useAdmissionOfferingsScreen: () => useAdmissionOfferingsScreen(),
}));
vi.mock('src/components/custom-breadcrumbs', () => ({
  CustomBreadcrumbs: ({ action }: { action: ReactNode }) => <header>{action}</header>,
}));
vi.mock('./admission-offering-filters', () => ({
  AdmissionOfferingFilters: ({ filterAction }: { filterAction: ReactNode }) => (
    <section aria-label="Offering context filters">{filterAction}</section>
  ),
}));
vi.mock('./admission-offering-more-filters', () => ({
  AdmissionOfferingMoreFilters: () => <button type="button">Filters</button>,
}));
vi.mock('./admission-offering-table', () => ({
  AdmissionOfferingTable: ({ loading, filteredEmpty }: { loading: boolean; filteredEmpty?: boolean }) => (
    <div data-testid="offering-table-loading" data-filtered-empty={filteredEmpty}>{String(loading)}</div>
  ),
}));
vi.mock('./admission-offering-dialog', () => ({
  AdmissionOfferingDialog: () => <div>Edit offering drawer</div>,
}));
vi.mock('./admission-offering-details-drawer', () => ({
  AdmissionOfferingDetailsDrawer: () => null,
}));
vi.mock('./bulk-admission-offering-dialog', () => ({
  BulkAdmissionOfferingDialog: () => <div>Bulk offering drawer</div>,
}));

const cycle = {
  id: 'cycle-1',
  name: 'Admissions 2027-28',
  code: 'ADM-2728',
  academicYearId: 'year-1',
  academicYearName: '2027-28',
  startDate: '2027-10-01T00:00:00Z',
  endDate: '2028-03-31T00:00:00Z',
  status: 1,
};

const screenState = (bulkOpen = false) => ({
  cycle,
  cycles: [cycle],
  bulkOpen,
  dialogMode: null,
  selected: null,
  detailsOpen: false,
  pendingAction: null,
  loadingDetail: false,
  saving: false,
  commanding: false,
  bulkActivationDisabled: false,
  bulkActivation: {
    busy: false,
    selectedRows: [],
    selectedIds: [],
    eligibleRows: [],
    failures: [],
    confirmationOpen: false,
    progress: null,
    toggleSelection: vi.fn(),
    toggleAll: vi.fn(),
    clearSelection: vi.fn(),
    requestActivation: vi.fn(),
    cancelActivation: vi.fn(),
    confirmActivation: vi.fn(),
  },
  permissions: {
    view: true,
    create: true,
    bulkCreate: true,
    edit: true,
    clone: true,
    activate: true,
    deactivate: true,
    delete: true,
  },
  filters: {
    admissionCycleId: '',
    campusId: '',
    boardId: '',
    mediumId: '',
    stageId: '',
    standardId: '',
    isActive: '',
    availabilityStatus: '',
    configurationStatus: '',
    search: '',
    sorting: '',
    page: 0,
    rowsPerPage: 10,
  },
  cyclesQuery: { isLoading: false, isFetching: false, isError: false },
  currentData: { totalCount: 0, items: [] },
  rows: [],
  offeringsQuery: {
    isFetching: false,
    isError: false,
    data: { totalCount: 0, items: [] },
    refetch: vi.fn(),
  },
  openBulk,
  openCreate: vi.fn(),
  closeBulk: vi.fn(),
  closeDialog: vi.fn(),
  closeDetails: vi.fn(),
  openDetailed: vi.fn(),
  requestAction: vi.fn(),
  requestDelete: vi.fn(),
  cancelAction: vi.fn(),
  confirmAction: vi.fn(),
  save: vi.fn(),
  update: vi.fn(),
  clearFilters: vi.fn(),
});

describe('Admission Offerings add action', () => {
  beforeEach(() => {
    openBulk.mockReset();
    useAdmissionOfferingsScreen.mockReturnValue(screenState());
  });

  it('uses one Add offering action to open the bulk workflow', () => {
    render(<AdmissionOfferingsScreen />);

    expect(screen.queryByRole('button', { name: 'Bulk create' })).not.toBeInTheDocument();
    expect(screen.getByRole('banner').querySelector('button')?.textContent).toBe('Add offering');
    expect(screen.getByRole('region', { name: 'Offering context filters' })).toHaveTextContent(
      'Filters'
    );
    fireEvent.click(screen.getByRole('button', { name: 'Add offering' }));
    expect(openBulk).toHaveBeenCalledOnce();
  });

  it('mounts the bulk offering drawer when the action is open', () => {
    useAdmissionOfferingsScreen.mockReturnValue(screenState(true));
    render(<AdmissionOfferingsScreen />);

    expect(screen.getByText('Bulk offering drawer')).toBeVisible();
  });
  it('uses the table empty state for filtered results without a repeated information banner', () => {
    const state = screenState();
    state.filters.boardId = 'board-1';
    useAdmissionOfferingsScreen.mockReturnValue(state);
    render(<AdmissionOfferingsScreen />);
    expect(screen.queryByRole('alert')).not.toBeInTheDocument();
    expect(screen.getByTestId('offering-table-loading')).toHaveAttribute('data-filtered-empty', 'true');
  });
  it('leaves table rows intact when only the edit detail request is loading', () => {
    useAdmissionOfferingsScreen.mockReturnValue({
      ...screenState(),
      dialogMode: 'edit',
      loadingDetail: true,
    });
    render(<AdmissionOfferingsScreen />);
    expect(screen.getByTestId('offering-table-loading')).toHaveTextContent('false');
    expect(screen.getByText('Edit offering drawer')).toBeVisible();
  });
  it('shows a simple single-offering activation popup with the actual action label', () => {
    useAdmissionOfferingsScreen.mockReturnValue({
      ...screenState(),
      pendingAction: { type: 'activate', row: { id: 'offering-1', name: 'Class 1 General' } },
    });
    render(<AdmissionOfferingsScreen />);
    expect(screen.getByRole('dialog', { name: 'Activate Admission Offering?' })).toBeVisible();
    expect(screen.getByText('“Class 1 General” will become active.')).toBeVisible();
    expect(screen.getByRole('button', { name: 'Activate' })).toBeVisible();
    expect(screen.queryByRole('alert')).not.toBeInTheDocument();
    expect(screen.queryByText(/Current usage|server will recheck/)).not.toBeInTheDocument();
  });
  it('disables cancel and activation while the single-offering command is running', () => {
    useAdmissionOfferingsScreen.mockReturnValue({
      ...screenState(),
      pendingAction: { type: 'activate', row: { id: 'offering-1', name: 'Class 1 General' } },
      commanding: true,
    });
    render(<AdmissionOfferingsScreen />);
    expect(screen.getByRole('button', { name: 'Cancel' })).toBeDisabled();
    expect(screen.getByRole('button', { name: 'Activate' })).toBeDisabled();
  });
});
