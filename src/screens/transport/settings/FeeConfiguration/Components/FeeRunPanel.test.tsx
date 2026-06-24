import { renderWithProviders } from 'src/test/test-utils';
import { it, vi, expect, describe, beforeEach } from 'vitest';
import { screen, waitFor, fireEvent } from '@testing-library/react';
import {
  useGetFeeRunsQuery,
  useCreateFeeRunMutation,
  usePreviewFeeRunMutation,
  usePostFeeRunToFinanceMutation,
} from 'src/redux/transport/vehicle-management/vehicleSettingsApi';

import FeeRunPanel from './FeeRunPanel';

vi.mock('src/redux/transport/vehicle-management/vehicleSettingsApi', () => ({
  useGetFeeRunsQuery: vi.fn(),
  useCreateFeeRunMutation: vi.fn(),
  usePreviewFeeRunMutation: vi.fn(),
  usePostFeeRunToFinanceMutation: vi.fn(),
}));

vi.mock('src/components/toast', () => ({
  shikshaMitraToast: {
    success: vi.fn(),
    error: vi.fn(),
  },
}));

const mockedUseGetFeeRunsQuery = useGetFeeRunsQuery as ReturnType<typeof vi.fn>;
const mockedUsePreviewFeeRunMutation = usePreviewFeeRunMutation as ReturnType<typeof vi.fn>;
const mockedUseCreateFeeRunMutation = useCreateFeeRunMutation as ReturnType<typeof vi.fn>;
const mockedUsePostFeeRunToFinanceMutation = usePostFeeRunToFinanceMutation as ReturnType<
  typeof vi.fn
>;

describe('FeeRunPanel', () => {
  let previewFeeRun: ReturnType<typeof vi.fn>;
  let createFeeRun: ReturnType<typeof vi.fn>;
  let postFeeRunToFinance: ReturnType<typeof vi.fn>;

  beforeEach(() => {
    vi.clearAllMocks();

    previewFeeRun = vi.fn(() => ({
      unwrap: () =>
        Promise.resolve({
          generatedDueCount: 2,
          studentDueCount: 1,
          employeeDueCount: 1,
          totalAmount: 500,
          items: [
            {
              memberId: 'member-1',
              assignmentId: 'assignment-1',
              memberName: 'Student One',
              routeName: 'North Route',
              stopName: 'Central Stop',
              amount: 250,
            },
          ],
        }),
    }));
    createFeeRun = vi.fn(() => ({
      unwrap: () =>
        Promise.resolve({
          id: 'run-2',
          generatedDueCount: 2,
          studentDueCount: 1,
          employeeDueCount: 1,
          totalAmount: 500,
          dues: [],
        }),
    }));
    postFeeRunToFinance = vi.fn(() => ({
      unwrap: () =>
        Promise.resolve({
          postedStudentDueCount: 1,
          skippedEmployeeDueCount: 1,
          chargeRequestCount: 1,
        }),
    }));

    mockedUsePreviewFeeRunMutation.mockReturnValue([previewFeeRun, { isLoading: false }]);
    mockedUseCreateFeeRunMutation.mockReturnValue([createFeeRun, { isLoading: false }]);
    mockedUsePostFeeRunToFinanceMutation.mockReturnValue([
      postFeeRunToFinance,
      { isLoading: false },
    ]);
    mockedUseGetFeeRunsQuery.mockReturnValue({
      data: {
        items: [
          {
            id: 'run-1',
            periodFrom: '2026-06-01',
            periodTo: '2026-06-30',
            status: 0,
            statusName: 'Generated',
            generatedDueCount: 2,
            totalAmount: 500,
          },
        ],
      },
      isFetching: false,
    });
  });

  it('previews, generates, and posts a transport fee run', async () => {
    renderWithProviders(<FeeRunPanel academicMediumId="medium-1" academicYearId="year-1" />);

    fireEvent.click(screen.getByRole('button', { name: /preview/i }));

    await waitFor(() =>
      expect(previewFeeRun).toHaveBeenCalledWith({
        academicMediumId: 'medium-1',
        body: expect.objectContaining({ academicYearId: 'year-1' }),
      })
    );
    expect(await screen.findByText('Dues: 2')).toBeInTheDocument();

    fireEvent.click(screen.getByRole('button', { name: /generate/i }));

    await waitFor(() =>
      expect(createFeeRun).toHaveBeenCalledWith({
        academicMediumId: 'medium-1',
        body: expect.objectContaining({ academicYearId: 'year-1' }),
      })
    );

    fireEvent.click(screen.getByRole('button', { name: /post/i }));

    await waitFor(() =>
      expect(postFeeRunToFinance).toHaveBeenCalledWith({
        runId: 'run-1',
        academicMediumId: 'medium-1',
      })
    );
  });
});
