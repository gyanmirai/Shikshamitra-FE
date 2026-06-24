import { screen } from '@testing-library/react';
import { renderWithProviders } from 'src/test/test-utils';
import { it, vi, expect, describe, beforeEach } from 'vitest';
import {
  useGetTransportDashboardAlertsQuery,
  useGetTransportDashboardSummaryQuery,
} from 'src/redux/transport/vehicle-management/dashboard-report-api';

import TransportAdminDashboard from '.';

vi.mock('src/redux/transport/vehicle-management/dashboard-report-api', () => ({
  useGetTransportDashboardSummaryQuery: vi.fn(),
  useGetTransportDashboardAlertsQuery: vi.fn(),
}));

vi.mock('src/components/iconify', () => ({
  Iconify: ({ icon }: { icon: string }) => <span data-testid={`icon-${icon}`} />,
}));

const mockedSummaryQuery = useGetTransportDashboardSummaryQuery as ReturnType<typeof vi.fn>;
const mockedAlertsQuery = useGetTransportDashboardAlertsQuery as ReturnType<typeof vi.fn>;

describe('TransportAdminDashboard', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockedSummaryQuery.mockReturnValue({
      data: {
        activeStops: 2,
        inactiveStops: 0,
        activeRoutes: 3,
        inactiveRoutes: 1,
        activeVehicles: 4,
        inactiveVehicles: 0,
        maintenanceVehicles: 1,
        activeDrivers: 2,
        activeConductors: 1,
        inactiveStaff: 0,
        activeMembers: 30,
        inactiveMembers: 1,
        studentMembers: 25,
        employeeMembers: 5,
        pendingApplications: 6,
        approvedApplications: 12,
        heldApplications: 1,
        rejectedApplications: 0,
        cancelledApplications: 0,
        pendingFeeDues: 8,
        postedFeeDues: 2,
        pendingStudentDues: 5,
        pendingEmployeeDues: 3,
        pendingDueAmount: 12500,
        assignedRoutes: 2,
        unassignedRoutes: 1,
        routeCapacity: 80,
        occupiedSeats: 30,
        routeCapacityUsagePercent: 37.5,
        missingRequiredDocuments: 2,
        expiringComplianceItems: 1,
        feeRunsPendingFinancePost: 1,
        routeCapacityUsage: [
          {
            routeId: 'route-1',
            routeName: 'North Route',
            routeCode: 'NR-1',
            capacity: 40,
            occupiedSeats: 20,
            remainingSeats: 20,
            usagePercent: 50,
            hasVehicleAssignment: true,
            vehicleRegistrationNo: 'GJ01AB1234',
            driverName: 'Driver One',
          },
        ],
        activeRouteOperations: [
          {
            routeId: 'route-1',
            routeName: 'North Route',
            routeCode: 'NR-1',
            status: 'Active',
            stops: 4,
            members: 20,
            capacity: 40,
            vehicle: 'GJ01AB1234 Bus 1',
            driver: 'Driver One',
            conductor: 'Conductor One',
          },
        ],
      },
      isLoading: false,
    });
    mockedAlertsQuery.mockReturnValue({
      data: {
        data: [
          {
            id: 'alert-1',
            category: 'Assignment',
            severity: 'High',
            title: 'Route has no vehicle/staff assignment',
            message: 'South Route is active but has no assignment.',
          },
        ],
      },
      isLoading: false,
    });
  });

  it('renders backend summary, route capacity, operations, and alerts', () => {
    renderWithProviders(<TransportAdminDashboard />, {
      preloadedState: {
        globalState: {
          currentMedium: { id: 'medium-1' },
          currentYear: { id: 'year-1' },
        },
      },
    });

    expect(mockedSummaryQuery).toHaveBeenCalledWith(
      { academicMediumId: 'medium-1', academicYearId: 'year-1' },
      { skip: false }
    );
    expect(screen.getByText('Active Routes')).toBeInTheDocument();
    expect(screen.getAllByText('North Route').length).toBeGreaterThan(0);
    expect(screen.getByText('GJ01AB1234')).toBeInTheDocument();
    expect(screen.getByText('Route has no vehicle/staff assignment')).toBeInTheDocument();
    expect(screen.getAllByText('Driver One').length).toBeGreaterThan(0);
  });
});
