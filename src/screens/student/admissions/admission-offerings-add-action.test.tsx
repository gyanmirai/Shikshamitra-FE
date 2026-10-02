import type { ReactNode } from 'react';

import { vi, it, expect, describe, beforeEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';

import AdmissionOfferingsScreen from './admission-offerings';

const openBulk = vi.fn();
const useAdmissionOfferingsScreen = vi.fn();

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
vi.mock('./admission-offering-table', () => ({ AdmissionOfferingTable: () => null }));
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
    expect(screen.getByRole('banner').querySelector('button')?.textContent).toBe('Add Offering');
    expect(screen.getByRole('region', { name: 'Offering context filters' })).toHaveTextContent(
      'Filters'
    );
    fireEvent.click(screen.getByRole('button', { name: 'Add Offering' }));
    expect(openBulk).toHaveBeenCalledOnce();
  });

  it('mounts the bulk offering drawer when the action is open', () => {
    useAdmissionOfferingsScreen.mockReturnValue(screenState(true));
    render(<AdmissionOfferingsScreen />);

    expect(screen.getByText('Bulk offering drawer')).toBeVisible();
  });
});
