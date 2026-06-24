import { screen } from '@testing-library/react';
import { renderWithProviders } from 'src/test/test-utils';
import { it, vi, expect, describe, beforeEach } from 'vitest';
import useQueryAndMutation from 'src/redux/customQueryAndMutation';
import { useGetDriverConductorDataQuery } from 'src/redux/transport/vehicle-management/driver-conductor-api';

import DriverConductorTable from './DriverManagementTable';

vi.mock('src/redux/customQueryAndMutation', () => ({
  default: vi.fn(),
}));

vi.mock('src/redux/transport/vehicle-management/driver-conductor-api', () => ({
  useGetDriverConductorDataQuery: vi.fn(),
  useChangeDriverConductorStatusMutation: vi.fn(() => [vi.fn()]),
}));

vi.mock('src/components/customizabaleTable', () => ({
  default: ({ data, isLoading }: { data: any[]; isLoading: boolean }) => (
    <div data-testid="driver-table" data-loading={String(isLoading)}>
      {(data ?? []).map((row) => (
        <div key={row.id} data-testid="driver-row">
          <span>{row.name}</span>
          <span>{row.employeeId}</span>
          <span>{row.role}</span>
          <span>{row.assignedRoute || '-'}</span>
        </div>
      ))}
    </div>
  ),
}));

vi.mock('src/components/customDialog', () => ({
  default: ({ open, children }: { open: boolean; children: React.ReactNode }) =>
    open ? <div>{children}</div> : null,
}));

vi.mock('src/components/three-dots-actions', () => ({
  default: () => <button type="button">actions</button>,
}));

vi.mock('src/components/iconify', () => ({
  Iconify: ({ icon }: { icon: string }) => <span data-testid={`icon-${icon}`} />,
}));

vi.mock('src/components/custom-tooltip', () => ({
  default: ({ children }: { children: React.ReactNode }) => <>{children}</>,
}));

vi.mock('./AssignRouteForm', () => ({
  default: () => null,
}));

vi.mock('./DriverProfile', () => ({
  default: () => null,
}));

const mockedUseQueryAndMutation = useQueryAndMutation as ReturnType<typeof vi.fn>;
const mockedUseGetDriverConductorDataQuery = useGetDriverConductorDataQuery as ReturnType<
  typeof vi.fn
>;

const tableProps = () => ({
  onAddDriverConductor: { onTrue: vi.fn() },
  editData: null,
  open: false,
  setOpenDialog: vi.fn(),
  setEditData: vi.fn(),
});

describe('DriverConductorTable', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockedUseQueryAndMutation.mockReturnValue({
      data: {
        data: [
          {
            id: 'staff-1',
            employeeId: 'employee-guid-1',
            employeeCode: 'EMP-001',
            name: 'Ravi Driver',
            roleId: 0,
            licenseNo: 'DL-001',
            licenseExpiryDate: '2027-05-01T00:00:00.000Z',
            experienceYears: 4,
            phoneNo: '9999999999',
            assignedRoute: 'North Route',
            status: 0,
          },
        ],
      },
      isLoading: false,
    });
  });

  it('renders fetched transport staff rows', () => {
    renderWithProviders(<DriverConductorTable {...tableProps()} />);

    expect(screen.getByTestId('driver-table')).toHaveAttribute('data-loading', 'false');
    expect(screen.getByText('Ravi Driver')).toBeInTheDocument();
    expect(screen.getByText('EMP-001')).toBeInTheDocument();
    expect(screen.getByText('Driver')).toBeInTheDocument();
    expect(screen.getByText('North Route')).toBeInTheDocument();
    expect(screen.getAllByTestId('driver-row')).toHaveLength(1);
  });

  it('queries staff with the current academic medium and default table page size', () => {
    renderWithProviders(<DriverConductorTable {...tableProps()} />);

    expect(mockedUseQueryAndMutation).toHaveBeenCalledWith(
      expect.objectContaining({
        type: 'query',
        currentQueryAndMutation: mockedUseGetDriverConductorDataQuery,
        params: {
          academicMediumId: 'medium-1',
          pageNumber: 1,
          pageSize: 100,
        },
        options: { skip: false },
      })
    );
  });
});
