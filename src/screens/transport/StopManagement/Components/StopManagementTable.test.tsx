import { screen } from '@testing-library/react';
import { renderWithProviders } from 'src/test/test-utils';
import { it, vi, expect, describe, beforeEach } from 'vitest';
import useQueryAndMutation from 'src/redux/customQueryAndMutation';

import StopManagementTable from './StopManagementTable';

vi.mock('src/redux/customQueryAndMutation', () => ({
  default: vi.fn(),
}));

vi.mock('src/components/customizabaleTable', () => ({
  default: ({ data, isLoading }: { data: any[]; isLoading: boolean }) => (
    <div data-testid="stop-table" data-loading={String(isLoading)}>
      {(data ?? []).map((row) => (
        <div key={row.id} data-testid="stop-row">
          {row.stopName}
        </div>
      ))}
    </div>
  ),
}));

vi.mock('src/components/customDialog', () => ({
  default: ({ children }: { children: React.ReactNode }) => <div>{children}</div>,
}));

vi.mock('src/components/three-dots-actions', () => ({
  default: () => <button type="button">actions</button>,
}));

vi.mock('src/components/iconify', () => ({
  Iconify: ({ icon }: { icon: string }) => <span data-testid={`icon-${icon}`} />,
}));

vi.mock('./ChangeStopStatusForm', () => ({
  default: () => null,
}));

const mockedUseQueryAndMutation = useQueryAndMutation as ReturnType<typeof vi.fn>;

describe('StopManagementTable', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockedUseQueryAndMutation.mockReturnValue({
      data: {
        data: [
          {
            id: 'stop-1',
            stopName: 'Central Stop',
            status: 0,
          },
        ],
      },
      isLoading: false,
    });
  });

  it('renders fetched stop rows instead of an empty table', () => {
    renderWithProviders(
      <StopManagementTable addStop={vi.fn()} setEditData={vi.fn()} onEdit={vi.fn()} />
    );

    expect(screen.getByTestId('stop-table')).toHaveAttribute('data-loading', 'false');
    expect(screen.getByText('Central Stop')).toBeInTheDocument();
    expect(screen.getAllByTestId('stop-row')).toHaveLength(1);
  });

  it('queries stops with the current academic medium and default table page size', () => {
    renderWithProviders(
      <StopManagementTable addStop={vi.fn()} setEditData={vi.fn()} onEdit={vi.fn()} />
    );

    expect(mockedUseQueryAndMutation).toHaveBeenCalledWith(
      expect.objectContaining({
        type: 'query',
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
