import { screen, waitFor } from '@testing-library/react';
import { renderWithProviders } from 'src/test/test-utils';
import { it, vi, expect, describe, beforeEach } from 'vitest';
import {
  useGetTransportReportQuery,
  useLazyExportTransportReportQuery,
  useGetTransportReportCatalogQuery,
} from 'src/redux/transport/vehicle-management/dashboard-report-api';

import TransportReportList from './TransportReportList';

vi.mock('src/redux/transport/vehicle-management/dashboard-report-api', () => ({
  useGetTransportReportCatalogQuery: vi.fn(),
  useGetTransportReportQuery: vi.fn(),
  useLazyExportTransportReportQuery: vi.fn(),
}));

vi.mock('src/components/iconify', () => ({
  Iconify: ({ icon }: { icon: string }) => <span data-testid={`icon-${icon}`} />,
}));

vi.mock('src/components/custom-breadcrumbs', () => ({
  CustomBreadcrumbs: ({ heading }: { heading: string }) => <h1>{heading}</h1>,
}));

const mockedCatalogQuery = useGetTransportReportCatalogQuery as ReturnType<typeof vi.fn>;
const mockedReportQuery = useGetTransportReportQuery as ReturnType<typeof vi.fn>;
const mockedLazyExportQuery = useLazyExportTransportReportQuery as ReturnType<typeof vi.fn>;

const renderReports = () =>
  renderWithProviders(<TransportReportList />, {
    preloadedState: {
      globalState: {
        currentMedium: { id: 'medium-1' },
        currentYear: { id: 'year-1' },
      },
    },
  });

describe('TransportReportList', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockedLazyExportQuery.mockReturnValue([vi.fn(), { isFetching: false }]);
  });

  it('renders backend catalog and report rows', async () => {
    mockedCatalogQuery.mockReturnValue({
      data: [
        {
          key: 'route-master',
          title: 'Route Master Report',
          category: 'Route & Stop Reports',
          description: 'Route setup and assignment coverage.',
          isSupported: true,
        },
        {
          key: 'gps-tracking',
          title: 'GPS Tracking Report',
          category: 'Attendance & Trip Reports',
          description: 'This report depends on a future transport phase.',
          isSupported: false,
        },
      ],
      isLoading: false,
    });
    mockedReportQuery.mockReturnValue({
      data: {
        key: 'route-master',
        title: 'Route Master Report',
        category: 'Route & Stop Reports',
        isSupported: true,
        totalCount: 1,
        columns: [
          { key: 'routeCode', label: 'Route Code' },
          { key: 'routeName', label: 'Route' },
        ],
        items: [{ routeCode: 'NR-1', routeName: 'North Route' }],
      },
      isFetching: false,
    });

    renderReports();

    await waitFor(() => expect(screen.getByText('North Route')).toBeInTheDocument());
    expect(screen.getAllByText('Route Master Report').length).toBeGreaterThan(0);
    expect(screen.getByText('Route Code')).toBeInTheDocument();
    expect(screen.getByText('NR-1')).toBeInTheDocument();
    expect(mockedReportQuery).toHaveBeenCalledWith(
      expect.objectContaining({
        academicMediumId: 'medium-1',
        academicYearId: 'year-1',
      }),
      expect.any(Object)
    );
  });

  it('renders backend unsupported-report state without mock rows', async () => {
    mockedCatalogQuery.mockReturnValue({
      data: [
        {
          key: 'gps-tracking',
          title: 'GPS Tracking Report',
          category: 'Attendance & Trip Reports',
          description: 'This report depends on a future transport phase.',
          isSupported: false,
        },
      ],
      isLoading: false,
    });
    mockedReportQuery.mockReturnValue({
      data: {
        key: 'gps-tracking',
        title: 'GPS Tracking Report',
        category: 'Attendance & Trip Reports',
        isSupported: false,
        message: 'This report depends on a future transport phase.',
        totalCount: 0,
        columns: [],
        items: [],
      },
      isFetching: false,
    });

    renderReports();

    await waitFor(() => expect(screen.getByText('Report unavailable')).toBeInTheDocument());
    expect(
      screen.getAllByText('This report depends on a future transport phase.').length
    ).toBeGreaterThan(0);
  });
});
