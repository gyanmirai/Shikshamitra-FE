import { renderWithProviders } from 'src/test/test-utils';
import { it, vi, expect, describe, beforeEach } from 'vitest';
import useQueryAndMutation from 'src/redux/customQueryAndMutation';
import { screen, waitFor, fireEvent } from '@testing-library/react';
import {
  useCreateRouteMutation,
  useUpdateRouteMutation,
  useAssignStopsToRouteMutation,
  useAssignVehicleToRouteMutation,
} from 'src/redux/transport/vehicle-management/route-management-api';

import RouteFormStepper from './RouteForm';

vi.mock('src/redux/customQueryAndMutation', () => ({
  default: vi.fn(),
}));

vi.mock('src/redux/transport/vehicle-management/route-management-api', () => ({
  useCreateRouteMutation: vi.fn(),
  useUpdateRouteMutation: vi.fn(),
  useAssignStopsToRouteMutation: vi.fn(),
  useAssignVehicleToRouteMutation: vi.fn(),
}));

vi.mock('src/components/toast', () => ({
  shikshaMitraToast: {
    success: vi.fn(),
    error: vi.fn(),
  },
}));

vi.mock('src/components/back-popup-check/BackPopUpCheck', () => ({
  BackPopUpChecked: ({ children }: { children: React.ReactNode }) => <>{children}</>,
}));

vi.mock('./RouteInformationStep', () => ({
  default: () => <div />,
}));

vi.mock('./StopsStep', () => ({
  default: () => <div />,
}));

vi.mock('./VehicleAssignmentStep', () => ({
  default: () => <div />,
}));

vi.mock('src/components/custom-stepper', () => ({
  CustomStepperWithFormik: ({ activeStep, handleNext }: any) => {
    const values = {
      routeName: 'North Route',
      routeCode: 'NR-1',
      routeType: 'pickup',
      distance: '12',
      duration: '35 min',
      description: 'Morning north route',
      startPoint: 'School',
      endPoint: 'Central Stop',
      pickupSchedule: {
        startTime: '2026-01-01T08:00:00.000Z',
        endTime: '2026-01-01T08:30:00.000Z',
      },
      dropoffSchedule: {
        startTime: '2026-01-01T14:00:00.000Z',
        endTime: '2026-01-01T14:30:00.000Z',
      },
      stops: [
        {
          id: 'stop-1',
          stopName: 'Central Stop',
          expectedArrivalTime: '2026-01-01T08:10:00.000Z',
          expectedDepartureTime: '2026-01-01T08:15:00.000Z',
          distanceFromPrevious: '3',
        },
      ],
      vehicleAssignment: {
        vehicleId: 'vehicle-1',
        driverId: 'driver-1',
        conductorId: 'conductor-1',
      },
    };

    const label =
      activeStep === 0 ? 'Save Route Info' : activeStep === 1 ? 'Save Stops' : 'Assign Vehicle';

    return (
      <button type="button" onClick={() => handleNext(activeStep === 2, values, {}, vi.fn())}>
        {label}
      </button>
    );
  },
}));

const mockedUseQueryAndMutation = useQueryAndMutation as ReturnType<typeof vi.fn>;
const mockedUseCreateRouteMutation = useCreateRouteMutation as ReturnType<typeof vi.fn>;
const mockedUseUpdateRouteMutation = useUpdateRouteMutation as ReturnType<typeof vi.fn>;
const mockedUseAssignStopsToRouteMutation = useAssignStopsToRouteMutation as ReturnType<
  typeof vi.fn
>;
const mockedUseAssignVehicleToRouteMutation = useAssignVehicleToRouteMutation as ReturnType<
  typeof vi.fn
>;

describe('RouteFormStepper', () => {
  let createRoute: ReturnType<typeof vi.fn>;
  let updateRoute: ReturnType<typeof vi.fn>;
  let assignStopsToRoute: ReturnType<typeof vi.fn>;
  let assignVehicleToRoute: ReturnType<typeof vi.fn>;

  beforeEach(() => {
    vi.clearAllMocks();

    createRoute = vi.fn(() => ({
      unwrap: () => Promise.resolve({ id: 'route-1' }),
    }));
    updateRoute = vi.fn(() => ({
      unwrap: () => Promise.resolve({ id: 'route-2' }),
    }));
    assignStopsToRoute = vi.fn(() => ({
      unwrap: () => Promise.resolve([]),
    }));
    assignVehicleToRoute = vi.fn(() => ({
      unwrap: () => Promise.resolve({ id: 'assignment-1' }),
    }));

    mockedUseQueryAndMutation.mockImplementation(({ currentQueryAndMutation }: any) => {
      if (currentQueryAndMutation === mockedUseCreateRouteMutation) {
        return [createRoute];
      }
      if (currentQueryAndMutation === mockedUseUpdateRouteMutation) {
        return [updateRoute];
      }
      if (currentQueryAndMutation === mockedUseAssignStopsToRouteMutation) {
        return [assignStopsToRoute];
      }
      if (currentQueryAndMutation === mockedUseAssignVehicleToRouteMutation) {
        return [assignVehicleToRoute];
      }
      return [vi.fn()];
    });
  });

  it('creates a route, assigns selected stops, and assigns a vehicle on the final step', async () => {
    const onClose = vi.fn();

    renderWithProviders(<RouteFormStepper onClose={onClose} />);

    fireEvent.click(screen.getByRole('button', { name: /save route info/i }));

    await waitFor(() =>
      expect(createRoute).toHaveBeenCalledWith({
        academicMediumId: 'medium-1',
        body: expect.objectContaining({
          routeName: 'North Route',
          routeCode: 'NR-1',
          distance: 12,
        }),
      })
    );
    expect(updateRoute).not.toHaveBeenCalled();

    await waitFor(() =>
      expect(screen.getByRole('button', { name: /save stops/i })).toBeInTheDocument()
    );

    fireEvent.click(screen.getByRole('button', { name: /save stops/i }));

    await waitFor(() =>
      expect(assignStopsToRoute).toHaveBeenCalledWith({
        routeId: 'route-1',
        academicMediumId: 'medium-1',
        stops: [
          expect.objectContaining({
            stopId: 'stop-1',
            distanceFromPrevious: 3,
            order: 1,
          }),
        ],
      })
    );

    await waitFor(() =>
      expect(screen.getByRole('button', { name: /assign vehicle/i })).toBeInTheDocument()
    );

    fireEvent.click(screen.getByRole('button', { name: /assign vehicle/i }));

    await waitFor(() =>
      expect(assignVehicleToRoute).toHaveBeenCalledWith({
        routeId: 'route-1',
        academicMediumId: 'medium-1',
        body: {
          vehicleId: 'vehicle-1',
          driverStaffId: 'driver-1',
          conductorStaffId: 'conductor-1',
        },
      })
    );
    expect(onClose).toHaveBeenCalledWith(null, true);
  });

  it('updates an existing route before stop assignment', async () => {
    renderWithProviders(
      <RouteFormStepper onClose={vi.fn()} selectedRoute={{ id: 'route-2' } as any} />
    );

    fireEvent.click(screen.getByRole('button', { name: /save route info/i }));

    await waitFor(() =>
      expect(updateRoute).toHaveBeenCalledWith({
        routeId: 'route-2',
        academicMediumId: 'medium-1',
        body: expect.objectContaining({
          routeName: 'North Route',
          routeCode: 'NR-1',
          distance: 12,
        }),
      })
    );
    expect(createRoute).not.toHaveBeenCalled();
  });
});
