import { screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';

import { renderWithProviders } from 'src/test/test-utils';
import type { IColumn } from 'src/components/customizabaleTable/types';

import { RoomApprovalQueue } from './RoomApprovalQueue';

import type { RoomReservation } from '../types';

vi.mock('src/components/customizabaleTable', () => ({
  default: ({ data, columns }: { data: RoomReservation[]; columns: IColumn[] }) => {
    const actionsColumn = columns.find((column) => column.id === 'actions');

    return (
      <div>
        {data.map((row) => (
          <div key={row.id}>{actionsColumn?.render?.(undefined, row)}</div>
        ))}
      </div>
    );
  },
}));

vi.mock('src/components/confirm-dialog', () => ({
  ConfirmDialog: () => null,
}));

vi.mock('src/components/customDialog', () => ({
  default: () => null,
  DialogScrollContent: ({ children }: { children: React.ReactNode }) => <>{children}</>,
}));

vi.mock('src/components/custom-tooltip', () => ({
  default: ({ children }: { children: React.ReactNode }) => <>{children}</>,
}));

vi.mock('src/components/iconify', () => ({
  Iconify: () => <span aria-hidden="true" />,
}));

const pendingReservation: RoomReservation = {
  id: 'reservation-1',
  roomId: 'room-1',
  roomName: 'B104',
  buildingName: 'Science and Activity Block',
  date: '2026-08-27',
  startTime: '06:00',
  endTime: '07:00',
  purpose: 'Yoga session',
  reservationType: 'class',
  requestedBy: 'Jinjala',
  status: 'pendingApproval',
  approvalStatus: 'pending',
};

describe('RoomApprovalQueue', () => {
  it('renders approve and reject actions when the API authorizes the reviewer', () => {
    renderWithProviders(
      <RoomApprovalQueue reservations={[{ ...pendingReservation, canReview: true }]} />
    );

    expect(
      screen.getByRole('button', {
        name: 'Approve B104 reservation requested by Jinjala',
      })
    ).toBeInTheDocument();
    expect(
      screen.getByRole('button', {
        name: 'Reject B104 reservation requested by Jinjala',
      })
    ).toBeInTheDocument();
  });

  it('renders no actions when the API does not authorize the reviewer', () => {
    renderWithProviders(
      <RoomApprovalQueue reservations={[{ ...pendingReservation, canReview: false }]} />
    );

    expect(screen.getByText('—')).toBeInTheDocument();
    expect(screen.queryByRole('button', { name: /B104 reservation/ })).not.toBeInTheDocument();
  });
});
